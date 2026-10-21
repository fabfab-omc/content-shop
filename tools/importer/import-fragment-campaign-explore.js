/* eslint-disable */
/* global WebImporter */

import cardsLinksParser from './parsers/cards-links.js';
import cleanupTransformer from './transformers/content-shop-cleanup.js';
import sectionsTransformer from './transformers/content-shop-sections.js';

const PAGE_TEMPLATE = {
  "name": "fragment-campaign-explore",
  "urls": [
    "http://localhost:8765/fragments/campaign-explore.html"
  ],
  "representativeUrl": "http://localhost:8765/fragments/campaign-explore.html",
  "description": "Shared \"Explore more in the Content Shop\" section appended to every page under /campaigns/",
  "blocks": [
    {
      "name": "cards-links",
      "instances": [
        "section.explore .link-cards"
      ]
    }
  ],
  "urlPattern": "/fragments/campaign-explore",
  "sections": [
    {
      "id": "f1",
      "name": "Explore more",
      "selector": [
        "section.explore"
      ],
      "style": null,
      "blocks": [
        "cards-links"
      ],
      "defaultContent": [
        "section.explore .section-heading",
        "section.explore .section-links"
      ]
    }
  ]
};

const parsers = {
  'cards-links': cardsLinksParser,
};

const transformers = [cleanupTransformer, sectionsTransformer];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    // Fragment: no page metadata, it is inserted into other pages
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // Source-origin images are only reachable locally; point them at the
    // copies hosted alongside the content in /media-da/.
    const sourceOrigin = new URL(params.originalURL).origin;
    main.querySelectorAll('img[src]').forEach((img) => {
      const src = new URL(img.getAttribute('src'), params.originalURL);
      if (src.origin !== sourceOrigin) return;
      img.setAttribute('src', `/media-da/${src.pathname.split('/').pop()}`);
    });

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
