/* eslint-disable */
/* global WebImporter */

import heroCampaignParser from './parsers/hero-campaign.js';
import columnsInfoParser from './parsers/columns-info.js';
import columnsChapterParser from './parsers/columns-chapter.js';
import columnsMediaSplitParser from './parsers/columns-media-split.js';
import cardsFeaturesParser from './parsers/cards-features.js';
import cardsGalleryParser from './parsers/cards-gallery.js';
import cleanupTransformer from './transformers/content-shop-cleanup.js';
import sectionsTransformer from './transformers/content-shop-sections.js';

const PAGE_TEMPLATE = {
  "name": "campaigns",
  "urls": [
    "http://localhost:8765/campaigns/id-tiguan.html"
  ],
  "representativeUrl": "http://localhost:8765/campaigns/id-tiguan.html",
  "description": "Single-page campaign overviews (hero, info columns, feature highlights, image gallery, closing statement)",
  "blocks": [
    {
      "name": "hero-campaign",
      "instances": [
        "section.hero-section"
      ]
    },
    {
      "name": "columns-info",
      "instances": [
        "section.general"
      ]
    },
    {
      "name": "columns-chapter",
      "instances": [
        "section.strategy"
      ]
    },
    {
      "name": "columns-media-split",
      "instances": [
        "section.creative"
      ]
    },
    {
      "name": "cards-features",
      "instances": [
        "section.highlights .features"
      ]
    },
    {
      "name": "cards-gallery",
      "instances": [
        "section.visual-story"
      ]
    }
  ],
  "urlPattern": "/campaigns/*",
  "sections": [
    {
      "id": "rc1",
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
      "id": "rc2",
      "name": "General info",
      "selector": [
        "section.general",
        "#general"
      ],
      "style": null,
      "blocks": [
        "columns-info"
      ],
      "defaultContent": []
    },
    {
      "id": "rc3",
      "name": "Campaign strategy",
      "selector": [
        "section.strategy",
        "#strategy"
      ],
      "style": "white",
      "blocks": [
        "columns-chapter"
      ],
      "defaultContent": []
    },
    {
      "id": "rc4",
      "name": "Creative platform",
      "selector": [
        "section.creative",
        "#creative"
      ],
      "style": "dark",
      "blocks": [
        "columns-media-split"
      ],
      "defaultContent": []
    },
    {
      "id": "rc5",
      "name": "Product highlights",
      "selector": [
        "section.highlights",
        "#highlights"
      ],
      "style": null,
      "blocks": [
        "cards-features"
      ],
      "defaultContent": [
        "section.highlights .section-heading",
        "section.highlights .claims-note"
      ]
    },
    {
      "id": "rc6",
      "name": "Visual story",
      "selector": [
        "section.visual-story"
      ],
      "style": null,
      "blocks": [
        "cards-gallery"
      ],
      "defaultContent": []
    },
    {
      "id": "rc7",
      "name": "Closing",
      "selector": [
        "section.closing"
      ],
      "style": "dark, centered",
      "blocks": [],
      "defaultContent": [
        "section.closing"
      ]
    }
  ]
};

const parsers = {
  'hero-campaign': heroCampaignParser,
  'columns-info': columnsInfoParser,
  'columns-chapter': columnsChapterParser,
  'columns-media-split': columnsMediaSplitParser,
  'cards-features': cardsFeaturesParser,
  'cards-gallery': cardsGalleryParser,
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
