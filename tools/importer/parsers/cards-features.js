/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-features variant. Base: cards.
 * Selectors: section.highlights .features, section.services .features,
 *            section.how .features, section.inside .features, section.phases .features
 * Model: container with cards-features-card items (image + imageAlt, text richtext).
 *
 * Cards convention: one row per card, 2 cells per row.
 *   Cell 1: image or icon (no images in source, so the empty cell is kept)
 *   Cell 2: richtext - optional lead (metric / number / phase status), title (h3), description
 * A .features.phases list becomes the "phases" variant (lead = phase status, e.g. Covered / Preview).
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

    // Cell 1 (image) stays empty but present; cell 2 holds the text
    cells.push(['', textFrag]);
  });

  const name = element.classList.contains('phases') ? 'cards-features (phases)' : 'cards-features';
  const block = WebImporter.Blocks.createBlock(document, { name, cells });
  element.replaceWith(block);
}
