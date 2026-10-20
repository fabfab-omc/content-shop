import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Hero campaign: full-bleed background image row + overlaid text row.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const pic = row.querySelector('picture');
    const hasText = row.textContent.trim().length > 0;
    if (pic && !hasText) {
      row.classList.add('hero-campaign-media');
      const img = pic.querySelector('img');
      if (img) {
        const optimized = createOptimizedPicture(img.src, img.alt, true, [
          { media: '(min-width: 900px)', width: '2000' },
          { width: '900' },
        ]);
        moveInstrumentation(img, optimized.querySelector('img'));
        pic.replaceWith(optimized);
      }
    } else if (hasText) {
      row.classList.add('hero-campaign-content');
    } else {
      row.remove();
    }
  });
  if (!block.querySelector('.hero-campaign-media')) block.classList.add('no-image');
}
