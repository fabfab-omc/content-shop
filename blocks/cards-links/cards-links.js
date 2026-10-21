import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Moves a trailing arrow out of the link text, or creates one, as a decorative span.
 * @param {Element} link The CTA link
 * @returns {HTMLSpanElement} The arrow span
 */
function decorateArrow(link) {
  const walker = document.createTreeWalker(link, NodeFilter.SHOW_TEXT);
  let last = null;
  while (walker.nextNode()) {
    if (walker.currentNode.textContent.trim()) last = walker.currentNode;
  }
  const arrow = document.createElement('span');
  arrow.className = 'cards-links-card-arrow';
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '→';
  if (last) {
    const text = last.textContent.replace(/\s+$/, '');
    const match = text.match(/\s*[→↗›]$/);
    if (match) {
      arrow.textContent = match[0].trim();
      last.textContent = text.slice(0, match.index);
    }
  }
  const label = document.createElement('span');
  label.className = 'cards-links-card-label';
  label.append(...link.childNodes);
  link.replaceChildren(label, arrow);
  return arrow;
}

/**
 * cards-links: onward/support link tiles, one per authored row (icon cell + text cell).
 * The column count follows the number of tiles.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.querySelector('picture') && !div.textContent.trim()) {
        div.className = 'cards-links-card-icon';
      } else if (!div.textContent.trim()) {
        div.remove();
      } else {
        div.className = 'cards-links-card-body';
        const cta = [...div.querySelectorAll('p')].reverse().find((p) => {
          const link = p.querySelector('a[href]');
          return link && link.textContent.trim() === p.textContent.trim();
        });
        if (cta) {
          cta.classList.add('cards-links-card-cta');
          decorateArrow(cta.querySelector('a[href]'));
          li.classList.add('cards-links-card-linked');
        }
      }
    });
    if (li.children.length) ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '160' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  const count = ul.children.length;
  let columns = Math.min(count, 3);
  if (count % 4 === 0) columns = 4;
  block.classList.add(`cards-links-cols-${columns}`);
  block.replaceChildren(ul);
}
