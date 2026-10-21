/* eslint-disable */
/* global WebImporter */

import heroCampaignParser from './parsers/hero-campaign.js';
import cardsFeaturesParser from './parsers/cards-features.js';
import cardsCampaignsParser from './parsers/cards-campaigns.js';
import cardsLinksParser from './parsers/cards-links.js';
import tabsParser from './parsers/tabs.js';
import cleanupTransformer from './transformers/content-shop-cleanup.js';
import sectionsTransformer from './transformers/content-shop-sections.js';

const PAGE_TEMPLATE = {
  "name": "home",
  "urls": [
    "http://localhost:8765/index.html"
  ],
  "representativeUrl": "http://localhost:8765/index.html",
  "description": "Content Shop landing page (hero, service tiles, how it works, campaign cards, support, Insider tabs). Source built from Content_Shop_Landing_Page_Wireframe_Brief.docx",
  "blocks": [
    {
      "name": "hero-campaign",
      "instances": [
        "section.hero-section"
      ]
    },
    {
      "name": "cards-features",
      "instances": [
        "section.services .features",
        "section.how .features"
      ]
    },
    {
      "name": "cards-campaigns",
      "instances": [
        "section.campaigns .campaign-cards"
      ]
    },
    {
      "name": "cards-links",
      "instances": [
        "section.support .link-cards"
      ]
    },
    {
      "name": "tabs",
      "instances": [
        "section.insider .tabs"
      ]
    }
  ],
  "urlPattern": "/",
  "sections": [
    {
      "id": "h1",
      "name": "Hero",
      "selector": [
        "section.hero-section"
      ],
      "style": null,
      "blocks": [
        "hero-campaign"
      ],
      "defaultContent": []
    },
    {
      "id": "h2",
      "name": "What you can do",
      "selector": [
        "section.services"
      ],
      "style": null,
      "blocks": [
        "cards-features"
      ],
      "defaultContent": [
        "section.services .section-heading"
      ]
    },
    {
      "id": "h3",
      "name": "How it works",
      "selector": [
        "section.how"
      ],
      "style": "white",
      "blocks": [
        "cards-features"
      ],
      "defaultContent": [
        "section.how .section-heading"
      ]
    },
    {
      "id": "h4",
      "name": "Campaigns",
      "selector": [
        "section.campaigns"
      ],
      "style": null,
      "blocks": [
        "cards-campaigns"
      ],
      "defaultContent": [
        "section.campaigns .section-heading",
        "section.campaigns .section-links"
      ]
    },
    {
      "id": "h5",
      "name": "Need support?",
      "selector": [
        "section.support"
      ],
      "style": "white",
      "blocks": [
        "cards-links"
      ],
      "defaultContent": [
        "section.support .section-heading"
      ]
    },
    {
      "id": "h6",
      "name": "Content Shop Insider",
      "selector": [
        "section.insider"
      ],
      "style": null,
      "blocks": [
        "tabs"
      ],
      "defaultContent": [
        "section.insider .section-heading"
      ]
    }
  ]
};

const parsers = {
  'hero-campaign': heroCampaignParser,
  'cards-features': cardsFeaturesParser,
  'cards-campaigns': cardsCampaignsParser,
  'cards-links': cardsLinksParser,
  'tabs': tabsParser,
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

    main.appendChild(document.createElement('hr'));
    WebImporter.rules.createMetadata(main, document);
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
