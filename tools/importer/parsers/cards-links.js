/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-links variant. Base: cards.
 * Selectors: section.support .link-cards, section.explore .link-cards
 * Model: container with cards-links-card items (image + imageAlt, text richtext).
 *
 * Cards convention: one row per card, 2 cells per row.
 *   Cell 1: icon (image + imageAlt); kept empty until icons are supplied
 *   Cell 2: richtext - title (h3), description, call-to-action link at the bottom
 */
export default function parse(element, { document }) {
  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();
  const items = Array.from(element.querySelectorAll(':scope > article.link-card'));

  const cells = [];

  items.forEach((item) => {
    const icon = item.querySelector('img');
    const heading = item.querySelector('h3, h2, h4');
    const desc = item.querySelector(':scope > p');
    const link = item.querySelector(':scope > a');

    const imageFrag = document.createDocumentFragment();
    if (icon) {
      imageFrag.appendChild(document.createComment(' field:image '));
      imageFrag.appendChild(icon);
    }

    const textFrag = document.createDocumentFragment();
    const nodes = [];
    if (heading) {
      const h3 = document.createElement('h3');
      h3.textContent = clean(heading.textContent);
      nodes.push(h3);
    }
    if (desc) {
      const p = document.createElement('p');
      p.textContent = clean(desc.textContent);
      nodes.push(p);
    }
    if (link) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.setAttribute('href', link.getAttribute('href') || '');
      a.textContent = clean(link.textContent);
      p.appendChild(a);
      nodes.push(p);
    }
    if (nodes.length) {
      textFrag.appendChild(document.createComment(' field:text '));
      nodes.forEach((n) => textFrag.appendChild(n));
    }

    cells.push([imageFrag, textFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-links', cells });
  element.replaceWith(block);
}
