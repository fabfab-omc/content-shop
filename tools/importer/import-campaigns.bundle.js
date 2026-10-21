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

  // tools/importer/import-campaigns.js
  var import_campaigns_exports = {};
  __export(import_campaigns_exports, {
    default: () => import_campaigns_default
  });

  // tools/importer/parsers/hero-campaign.js
  function parse(element, { document }) {
    const clean = (t) => (t || "").replace(/\s+/g, " ").trim();
    const toParagraph = (el) => {
      const p = document.createElement("p");
      p.textContent = clean(el.textContent);
      return p;
    };
    const toHeading = (el) => {
      const h1 = document.createElement("h1");
      el.childNodes.forEach((n) => {
        if (n.nodeType === 1 && n.tagName === "BR") {
          h1.appendChild(document.createElement("br"));
        } else if (n.textContent.trim()) {
          h1.appendChild(document.createTextNode(clean(n.textContent)));
        }
      });
      return h1;
    };
    const toLink = (el) => {
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.setAttribute("href", el.getAttribute("href") || "");
      a.textContent = clean(el.textContent);
      p.appendChild(a);
      return p;
    };
    const img = element.querySelector("img.hero-photo") || element.querySelector("img");
    const copy = element.querySelector(".hero-copy") || element;
    const caption = element.querySelector(":scope > .hero-caption");
    const imageFrag = document.createDocumentFragment();
    if (img) {
      imageFrag.appendChild(document.createComment(" field:image "));
      imageFrag.appendChild(img);
    }
    const textNodes = [];
    [...copy.children].forEach((child) => {
      if (child.matches("h1, h2")) textNodes.push(toHeading(child));
      else if (child.matches("a")) textNodes.push(toLink(child));
      else if (child.matches("p, span, div") && clean(child.textContent)) textNodes.push(toParagraph(child));
    });
    if (caption) textNodes.push(toParagraph(caption));
    const textFrag = document.createDocumentFragment();
    if (textNodes.length) {
      textFrag.appendChild(document.createComment(" field:text "));
      textNodes.forEach((n) => textFrag.appendChild(n));
    }
    const cells = [[imageFrag], [textFrag]];
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-campaign", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-info.js
  function parse2(element, { document }) {
    const clean = (t) => (t || "").replace(/\s+/g, " ").trim();
    const toParagraph = (el) => {
      const p = document.createElement("p");
      p.textContent = clean(el.textContent);
      return p;
    };
    const left = [];
    const eyebrow = element.querySelector(".section-heading .eyebrow");
    const heading = element.querySelector(".section-heading h2, h2");
    if (eyebrow) left.push(toParagraph(eyebrow));
    if (heading) {
      const h2 = document.createElement("h2");
      h2.textContent = clean(heading.textContent).replace(/\s+\./g, ".");
      left.push(h2);
    }
    const right = [];
    const lead = element.querySelector(".general-body p.lead, .general-body > p");
    if (lead) right.push(lead);
    element.querySelectorAll("dl.metadata > div").forEach((row) => {
      const dt = row.querySelector("dt");
      const dd = row.querySelector("dd");
      if (!dt && !dd) return;
      const p = document.createElement("p");
      const label = clean(dt ? dt.textContent : "");
      const value = clean(dd ? dd.textContent : "");
      p.textContent = label && value ? `${label}: ${value}` : label || value;
      right.push(p);
    });
    const cells = [[left, right]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-info", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-chapter.js
  function parse3(element, { document }) {
    const clean = (t) => (t || "").replace(/\s+/g, " ").trim();
    const toParagraph = (el, keepBreaks = false) => {
      const p = document.createElement("p");
      if (keepBreaks) {
        el.childNodes.forEach((n) => {
          if (n.nodeType === 1 && n.tagName === "BR") {
            p.appendChild(document.createElement("br"));
          } else if (clean(n.textContent)) {
            p.appendChild(document.createTextNode(clean(n.textContent)));
          }
        });
      } else {
        p.textContent = clean(el.textContent);
      }
      return p;
    };
    const left = [];
    const eyebrow = element.querySelector(".section-heading .eyebrow");
    const caption = element.querySelector(".section-heading .chapter-caption");
    if (eyebrow) left.push(toParagraph(eyebrow));
    if (caption) left.push(toParagraph(caption, true));
    const right = [];
    const body = element.querySelector(".strategy-body") || element;
    const heading = body.querySelector("h2");
    const img = body.querySelector("img.strategy-photo") || body.querySelector("img");
    const annotation = body.querySelector(".strategy-annotation p");
    const label = body.querySelector(".strategy-annotation .eyebrow");
    if (heading) right.push(heading);
    if (img) right.push(img);
    if (annotation) right.push(annotation);
    if (label) right.push(toParagraph(label));
    const cells = [[left, right]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-chapter", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-media-split.js
  function parse4(element, { document }) {
    const clean = (t) => (t || "").replace(/\s+/g, " ").trim();
    const toParagraph = (el) => {
      const p = document.createElement("p");
      p.textContent = clean(el.textContent);
      return p;
    };
    const left = [];
    const content = element.querySelector(".creative-content") || element;
    const eyebrow = content.querySelector(".eyebrow");
    const heading = content.querySelector("h2");
    const body = content.querySelector("p");
    const label = content.querySelector(".creative-label");
    if (eyebrow) left.push(toParagraph(eyebrow));
    if (heading) {
      const h2 = document.createElement("h2");
      heading.childNodes.forEach((n) => {
        if (n.nodeType === 1 && n.tagName === "BR") {
          h2.appendChild(document.createElement("br"));
        } else if (clean(n.textContent)) {
          h2.appendChild(document.createTextNode(clean(n.textContent)));
        }
      });
      left.push(h2);
    }
    if (body) left.push(body);
    if (label) left.push(toParagraph(label));
    const right = [];
    const visual = element.querySelector(".creative-visual");
    if (visual) {
      const img = visual.querySelector("img");
      const caption = visual.querySelector(":scope > span");
      if (img) right.push(img);
      if (caption) right.push(toParagraph(caption));
    }
    const cells = [[left, right]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-media-split", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-features.js
  function parse5(element, { document }) {
    const clean = (t) => (t || "").replace(/\s+/g, " ").trim();
    const items = Array.from(element.querySelectorAll(":scope > article.feature"));
    const cells = [];
    items.forEach((item) => {
      const label = item.querySelector(":scope > .metric, :scope > .feature-number");
      const heading = item.querySelector("h3, h2, h4");
      const desc = item.querySelector(":scope > p");
      const textFrag = document.createDocumentFragment();
      const nodes = [];
      if (label) {
        const p = document.createElement("p");
        p.textContent = clean(label.textContent);
        nodes.push(p);
      }
      if (heading) nodes.push(heading);
      if (desc) nodes.push(desc);
      if (nodes.length) {
        textFrag.appendChild(document.createComment(" field:text "));
        nodes.forEach((n) => textFrag.appendChild(n));
      }
      cells.push(["", textFrag]);
    });
    const name = element.classList.contains("phases") ? "cards-features (phases)" : "cards-features";
    const block = WebImporter.Blocks.createBlock(document, { name, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-gallery.js
  function parse6(element, { document }) {
    const clean = (t) => (t || "").replace(/\s+/g, " ").trim();
    const figures = Array.from(element.querySelectorAll(":scope > figure"));
    const cells = [];
    figures.forEach((figure) => {
      const img = figure.querySelector("img");
      const caption = figure.querySelector("figcaption");
      const imageFrag = document.createDocumentFragment();
      if (img) {
        imageFrag.appendChild(document.createComment(" field:image "));
        imageFrag.appendChild(img);
      }
      const textFrag = document.createDocumentFragment();
      if (caption && clean(caption.textContent)) {
        const p = document.createElement("p");
        p.textContent = clean(caption.textContent);
        textFrag.appendChild(document.createComment(" field:text "));
        textFrag.appendChild(p);
      }
      cells.push([imageFrag, textFrag]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-gallery", cells });
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

  // tools/importer/import-campaigns.js
  var PAGE_TEMPLATE = {
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
  var parsers = {
    "hero-campaign": parse,
    "columns-info": parse2,
    "columns-chapter": parse3,
    "columns-media-split": parse4,
    "cards-features": parse5,
    "cards-gallery": parse6
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
  var import_campaigns_default = {
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
      main.appendChild(document.createElement("hr"));
      WebImporter.rules.createMetadata(main, document);
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
  return __toCommonJS(import_campaigns_exports);
})();
