/* eslint-disable */
/* global WebImporter */

import heroCampaignParser from './parsers/hero-campaign.js';
import columnsInfoParser from './parsers/columns-info.js';
import cardsFeaturesParser from './parsers/cards-features.js';
import cardsLinksParser from './parsers/cards-links.js';
import cleanupTransformer from './transformers/content-shop-cleanup.js';
import sectionsTransformer from './transformers/content-shop-sections.js';

const PAGE_TEMPLATE = {
  "name": "campaign-handbook",
  "urls": [
    "http://localhost:8765/campaigns/id-cross.html"
  ],
  "representativeUrl": "http://localhost:8765/campaigns/id-cross.html",
  "description": "Reusable campaign handbook page (hero, at a glance, what is inside, phases covered, closing CTA, campaign assets from Content Hub). Source built from ID_Cross_Handbook_Landing_Page_Wireframe_Brief.docx",
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
      "name": "cards-features",
      "instances": [
        "section.inside .features",
        "section.phases .features"
      ]
    },
    {
      "name": "cards-links",
      "instances": [
        "section.assets .link-cards"
      ]
    }
  ],
  "urlPattern": "/campaigns/*",
  "sections": [
    {
      "id": "c1",
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
      "id": "c2",
      "name": "The campaign at a glance",
      "selector": [
        "section.general"
      ],
      "style": null,
      "blocks": [
        "columns-info"
      ],
      "defaultContent": []
    },
    {
      "id": "c3",
      "name": "What's inside the handbook?",
      "selector": [
        "section.inside"
      ],
      "style": "white",
      "blocks": [
        "cards-features"
      ],
      "defaultContent": [
        "section.inside .section-heading"
      ]
    },
    {
      "id": "c4",
      "name": "Campaign phases covered",
      "selector": [
        "section.phases"
      ],
      "style": null,
      "blocks": [
        "cards-features"
      ],
      "defaultContent": [
        "section.phases .section-heading",
        "section.phases .note"
      ]
    },
    {
      "id": "c5",
      "name": "Closing call to action",
      "selector": [
        "section.closing"
      ],
      "style": "dark, centered",
      "blocks": [],
      "defaultContent": [
        "section.closing"
      ]
    },
    {
      "id": "c6",
      "name": "View campaign assets",
      "selector": [
        "section.assets"
      ],
      "style": "white",
      "blocks": [
        "cards-links"
      ],
      "defaultContent": [
        "section.assets .section-heading"
      ]
    }
  ]
};

const parsers = {
  'hero-campaign': heroCampaignParser,
  'columns-info': columnsInfoParser,
  'cards-features': cardsFeaturesParser,
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
