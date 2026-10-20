import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * cards-features: one list item per authored row (image cell + text cell).
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
        div.className = 'cards-features-card-image';
      } else if (!div.textContent.trim() && !div.querySelector('picture')) {
        div.remove();
      } else {
        div.className = 'cards-features-card-body';
        // lead paragraph ahead of the title: a numeric index ("03") or a metric ("585 km")
        const lead = div.firstElementChild;
        if (lead?.tagName === 'P' && lead.nextElementSibling?.matches('h2, h3, h4, h5, h6')) {
          const isNumber = /^\d+$/.test(lead.textContent.trim());
          lead.classList.add(isNumber ? 'cards-features-card-number' : 'cards-features-card-metric');
        }
      }
    });
    if (li.children.length) ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.replaceChildren(ul);
}
