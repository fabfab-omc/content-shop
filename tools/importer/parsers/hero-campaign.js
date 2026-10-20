/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-campaign variant. Base: hero.
 * Selector: section.hero-section
 * Model (hero-campaign): image (reference, +imageAlt collapsed), text (richtext).
 * Rows: [image], [eyebrow, h1, CTA link, caption].
 */
export default function parse(element, { document }) {
  const toParagraph = (el) => {
    const p = document.createElement('p');
    p.textContent = el.textContent.replace(/\s+/g, ' ').trim();
    return p;
  };

  const img = element.querySelector('img.hero-photo') || element.querySelector('img');
  const eyebrow = element.querySelector('.hero-copy .eyebrow');
  const heading = element.querySelector('.hero-copy h1, h1');
  const cta = element.querySelector('a.hero-explore');
  const caption = element.querySelector('.hero-caption');

  const cells = [];

  // Row 1: image
  const imageFrag = document.createDocumentFragment();
  if (img) {
    imageFrag.appendChild(document.createComment(' field:image '));
    imageFrag.appendChild(img);
  }
  cells.push([imageFrag]);

  // Row 2: text (richtext)
  const textFrag = document.createDocumentFragment();
  const textNodes = [];
  if (eyebrow) textNodes.push(toParagraph(eyebrow));
  if (heading) {
    const h1 = document.createElement('h1');
    // keep <br> and the trailing "." (flatten the period span to text)
    heading.childNodes.forEach((n) => {
      if (n.nodeType === 1 && n.tagName === 'BR') {
        h1.appendChild(document.createElement('br'));
      } else if (n.textContent.trim()) {
        h1.appendChild(document.createTextNode(n.textContent.replace(/\s+/g, ' ').trim()));
      }
    });
    textNodes.push(h1);
  }
  if (cta) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.setAttribute('href', cta.getAttribute('href') || '');
    const label = Array.from(cta.childNodes)
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    a.textContent = label || 'Explore the campaign';
    p.appendChild(a);
    textNodes.push(p);
  }
  if (caption) textNodes.push(toParagraph(caption));

  if (textNodes.length) {
    textFrag.appendChild(document.createComment(' field:text '));
    textNodes.forEach((n) => textFrag.appendChild(n));
  }
  cells.push([textFrag]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-campaign', cells });
  element.replaceWith(block);
}
