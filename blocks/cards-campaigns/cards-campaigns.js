import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Wraps a trailing arrow of a link's last text node in a span.
 * @param {Element} link The link element
 * @param {string} className Class for the created span
 * @returns {HTMLSpanElement|null} The created span
 */
function wrapTrailingArrow(link, className) {
  const walker = document.createTreeWalker(link, NodeFilter.SHOW_TEXT);
  let last = null;
  while (walker.nextNode()) {
    if (walker.currentNode.textContent.trim()) last = walker.currentNode;
  }
  if (!last) return null;
  const text = last.textContent.replace(/\s+$/, '');
  const match = text.match(/\s*[→↗›]$/);
  if (!match) return null;
  const span = document.createElement('span');
  span.className = className;
  span.setAttribute('aria-hidden', 'true');
  span.textContent = match[0].trim();
  last.textContent = text.slice(0, match.index);
  last.after(span);
  return span;
}

/**
 * cards-campaigns: one campaign card per authored row (key visual cell + text cell).
 * An empty key visual cell renders a navy placeholder panel so cards stay aligned.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    const cells = [...row.children];
    const bodyCell = cells.find((cell) => cell.textContent.trim() && !cell.querySelector('picture'));
    const imageCell = cells.find((cell) => cell !== bodyCell);
    if (!imageCell && !bodyCell) return;

    // key visual (or placeholder when the image cell is empty)
    const media = imageCell || document.createElement('div');
    media.className = 'cards-campaigns-card-image';
    const pic = media.querySelector('picture');
    if (!pic) {
      media.classList.add('cards-campaigns-card-placeholder');
      // keep any authoring instrumentation on the cell, only drop empty markup
      [...media.children].forEach((child) => {
        if (!child.textContent.trim()) child.remove();
      });
    }
    li.append(media);

    if (bodyCell) {
      bodyCell.className = 'cards-campaigns-card-body';
      li.append(bodyCell);
      const cta = [...bodyCell.querySelectorAll('p')].find((p) => {
        const link = p.querySelector('a[href]');
        return link && link.textContent.trim() === p.textContent.trim();
      });
      if (cta) {
        cta.classList.add('cards-campaigns-card-cta');
        const link = cta.querySelector('a[href]');
        wrapTrailingArrow(link, 'cards-campaigns-card-arrow');
        li.classList.add('cards-campaigns-card-linked');
      }
    }
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [
      { media: '(min-width: 600px)', width: '750' },
      { width: '600' },
    ]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.replaceChildren(ul);
}
