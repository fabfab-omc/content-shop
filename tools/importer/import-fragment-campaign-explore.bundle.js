/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-fragment-campaign-explore.js
  var import_fragment_campaign_explore_exports = {};
  __export(import_fragment_campaign_explore_exports, {
    default: () => import_fragment_campaign_explore_default
  });

  // tools/importer/parsers/cards-links.js
  function parse(element, { document }) {
    const clean = (t) => (t || "").replace(/\s+/g, " ").trim();
    const items = Array.from(element.querySelectorAll(":scope > article.link-card"));
    const cells = [];
    items.forEach((item) => {
      const icon = item.querySelector("img");
      const heading = item.querySelector("h3, h2, h4");
      const desc = item.querySelector(":scope > p");
      const link = item.querySelector(":scope > a");
      const imageFrag = document.createDocumentFragment();
      if (icon) {
        imageFrag.appendChild(document.createComment(" field:image "));
        imageFrag.appendChild(icon);
      }
      const textFrag = document.createDocumentFragment();
      const nodes = [];
      if (heading) {
        const h3 = document.createElement("h3");
        h3.textContent = clean(heading.textContent);
        nodes.push(h3);
      }
      if (desc) {
        const p = document.createElement("p");
        p.textContent = clean(desc.textContent);
        nodes.push(p);
      }
      if (link) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.setAttribute("href", link.getAttribute("href") || "");
        a.textContent = clean(link.textContent);
        p.appendChild(a);
        nodes.push(p);
      }
      if (nodes.length) {
        textFrag.appendChild(document.createComment(" field:text "));
        nodes.forEach((n) => textFrag.appendChild(n));
      }
      cells.push([imageFrag, textFrag]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-links", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/content-shop-cleanup.js
  function transform(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      WebImporter.DOMUtils.remove(element, [
        "a.skip-link",
        "header.site-header",
        "footer.site-footer"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".hero-gradient",
        ".hero-topline",
        ".creative-rule",
        ".mini-rule",
        ".draft-dot"
      ]);
    }
    if (hookName === "afterTransform") {
      WebImporter.DOMUtils.remove(element, [
        "script",
        "style",
        "noscript",
        "link",
        "iframe"
      ]);
    }
  }

  // tools/importer/transformers/content-shop-sections.js
  var MARKER = "data-excat-section-id";
  function findSectionElement(root, section) {
    const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
    for (const sel of selectors) {
      if (!sel) continue;
      try {
        const el = root.querySelector(sel);
        if (el) return el;
      } catch (e) {
      }
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;
    const document = element.ownerDocument || payload.document;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const sectionEl = findSectionElement(element, section);
        if (!sectionEl || !sectionEl.parentNode) continue;
        if (i > 0 || section.style) {
          const hr = document.createElement("hr");
          if (section.style) hr.setAttribute(MARKER, section.id);
          if (i === 0) hr.setAttribute("data-excat-first-section", "true");
          sectionEl.parentNode.insertBefore(hr, sectionEl);
        }
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
        const anchor = marker || findSectionElement(element, section);
        if (!anchor || !anchor.parentNode) continue;
        const metadata = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.parentNode.insertBefore(metadata, anchor.nextSibling);
        if (marker) {
          marker.removeAttribute(MARKER);
          if (marker.hasAttribute("data-excat-first-section")) {
            marker.remove();
          }
        }
      }
      element.querySelectorAll("hr[data-excat-first-section]").forEach((hr) => hr.remove());
    }
  }

  // tools/importer/import-fragment-campaign-explore.js
  var PAGE_TEMPLATE = {
    "name": "fragment-campaign-explore",
    "urls": [
      "http://localhost:8765/fragments/campaign-explore.html"
    ],
    "representativeUrl": "http://localhost:8765/fragments/campaign-explore.html",
    "description": 'Shared "Explore more in the Content Shop" section appended to every page under /campaigns/',
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
  var parsers = {
    "cards-links": parse
  };
  var transformers = [transform, transform2];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
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
  var import_fragment_campaign_explore_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const sourceOrigin = new URL(params.originalURL).origin;
      main.querySelectorAll("img[src]").forEach((img) => {
        const src = new URL(img.getAttribute("src"), params.originalURL);
        if (src.origin !== sourceOrigin) return;
        img.setAttribute("src", `/media-da/${src.pathname.split("/").pop()}`);
      });
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_fragment_campaign_explore_exports);
})();
