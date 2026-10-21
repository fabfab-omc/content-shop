/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-campaigns variant. Base: cards.
 * Selector: section.campaigns .campaign-cards
 * Model: container with cards-campaigns-card items (image + imageAlt, text richtext).
 *
 * Cards convention: one row per card, 2 cells per row.
 *   Cell 1: campaign key visual (image + imageAlt); kept empty when a campaign has no visual yet
 *   Cell 2: richtext - title (h3) and call-to-action link at the bottom
 */
export default function parse(element, { document }) {
  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();
  const items = Array.from(element.querySelectorAll(':scope > article.campaign-card'));

  const cells = [];

  items.forEach((item) => {
    const img = item.querySelector('img');
    const heading = item.querySelector('h3, h2, h4');
    const link = item.querySelector('a');

    const imageFrag = document.createDocumentFragment();
    if (img) {
      imageFrag.appendChild(document.createComment(' field:image '));
      imageFrag.appendChild(img);
    }

    const textFrag = document.createDocumentFragment();
    const nodes = [];
    if (heading) {
      const h3 = document.createElement('h3');
      h3.textContent = clean(heading.textContent);
      nodes.push(h3);
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

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-campaigns', cells });
  element.replaceWith(block);
}
