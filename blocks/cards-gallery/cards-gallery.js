import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * cards-gallery: one list item per authored row (image cell + text cell).
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-gallery-card-image';
      } else if (!div.textContent.trim() && !div.querySelector('picture')) {
        div.remove();
      } else {
        div.className = 'cards-gallery-card-body';
      }
    });
    if (li.children.length) ul.append(li);
  });
  // split a leading index ("01 Campaign imagery") into number + label spans
  ul.querySelectorAll('.cards-gallery-card-body p').forEach((p) => {
    if (p.children.length) return;
    const match = p.textContent.trim().match(/^(\d+)\s+(.+)$/);
    if (!match) return;
    const [, num, text] = match;
    const index = document.createElement('span');
    index.className = 'cards-gallery-card-index';
    index.textContent = num;
    const label = document.createElement('span');
    label.className = 'cards-gallery-card-label';
    label.textContent = text;
    p.replaceChildren(index, label);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '900' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.replaceChildren(ul);
}
