import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Wraps a trailing character of an element's last text node in a span.
 * @param {Element} el The element to inspect
 * @param {RegExp} pattern Pattern matching the trailing character(s)
 * @param {string} className Class for the created span
 * @returns {HTMLSpanElement|null} The created span
 */
function wrapTrailing(el, pattern, className) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let last = null;
  while (walker.nextNode()) {
    if (walker.currentNode.textContent.trim()) last = walker.currentNode;
  }
  if (!last) return null;
  const text = last.textContent.replace(/\s+$/, '');
  const match = text.match(pattern);
  if (!match) return null;
  const span = document.createElement('span');
  span.className = className;
  span.textContent = match[0].trim();
  last.textContent = text.slice(0, match.index);
  last.after(span);
  return span;
}

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

  const content = block.querySelector('.hero-campaign-content');
  if (!content) return;

  const heading = content.querySelector('h1, h2');
  if (heading) {
    const prev = heading.previousElementSibling;
    if (prev && prev.tagName === 'P') prev.classList.add('hero-campaign-eyebrow');
    // accent-coloured trailing full stop, as on the source title
    wrapTrailing(heading, /\.$/, 'hero-campaign-period');
  }

  const cta = [...content.querySelectorAll('p')].find((p) => {
    const link = p.querySelector('a');
    return link && link.textContent.trim() === p.textContent.trim();
  });
  if (cta) {
    cta.classList.add('hero-campaign-cta');
    const arrow = wrapTrailing(cta.querySelector('a'), /\s*[↓↑→←]$/, 'hero-campaign-arrow');
    if (arrow) arrow.setAttribute('aria-hidden', 'true');
    const caption = cta.nextElementSibling;
    if (caption && caption.tagName === 'P' && !caption.querySelector('a')) {
      caption.classList.add('hero-campaign-caption');
    }
  }
}
