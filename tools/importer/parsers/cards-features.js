/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-features variant. Base: cards.
 * Selector: section.highlights .features
 * Model: container with cards-features-card items (image + imageAlt, text richtext).
 * Each article.feature -> row [empty image cell, text: metric/number + h3 + p].
 */
export default function parse(element, { document }) {
  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();
  const items = Array.from(element.querySelectorAll(':scope > article.feature'));

  const cells = [];

  items.forEach((item) => {
    const label = item.querySelector(':scope > .metric, :scope > .feature-number');
    const heading = item.querySelector('h3, h2, h4');
    const desc = item.querySelector(':scope > p');

    const textFrag = document.createDocumentFragment();
    const nodes = [];
    if (label) {
      const p = document.createElement('p');
      p.textContent = clean(label.textContent);
      nodes.push(p);
    }
    if (heading) nodes.push(heading);
    if (desc) nodes.push(desc);
    if (nodes.length) {
      textFrag.appendChild(document.createComment(' field:text '));
      nodes.forEach((n) => textFrag.appendChild(n));
    }

    // No images in source: keep the empty image cell (no field hint)
    cells.push(['', textFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-features', cells });
  element.replaceWith(block);
}
