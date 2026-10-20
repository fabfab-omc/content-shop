/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-gallery variant. Base: cards.
 * Selector: section.visual-story
 * Model: container with cards-gallery-card items (image + imageAlt, text richtext).
 * Each figure -> row [image, figcaption as paragraph e.g. "01 Campaign imagery"].
 */
export default function parse(element, { document }) {
  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();
  const figures = Array.from(element.querySelectorAll(':scope > figure'));

  const cells = [];

  figures.forEach((figure) => {
    const img = figure.querySelector('img');
    const caption = figure.querySelector('figcaption');

    const imageFrag = document.createDocumentFragment();
    if (img) {
      imageFrag.appendChild(document.createComment(' field:image '));
      imageFrag.appendChild(img);
    }

    const textFrag = document.createDocumentFragment();
    if (caption && clean(caption.textContent)) {
      const p = document.createElement('p');
      p.textContent = clean(caption.textContent);
      textFrag.appendChild(document.createComment(' field:text '));
      textFrag.appendChild(p);
    }

    cells.push([imageFrag, textFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-gallery', cells });
  element.replaceWith(block);
}
