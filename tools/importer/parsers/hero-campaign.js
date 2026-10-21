/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-campaign variant. Base: hero.
 * Selector: section.hero-section
 * Model (hero-campaign): image (reference, +imageAlt collapsed), text (richtext).
 *
 * Hero convention: 1 column, never more than 3 rows (block name + 2 content rows).
 *   Row 2: background image (optional, left empty when there is no key visual)
 *   Row 3: richtext - eyebrow, title (h1), subheading text, call-to-action link(s), caption
 * The richtext cell keeps the .hero-copy children in source order.
 */
export default function parse(element, { document }) {
  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();
  const toParagraph = (el) => {
    const p = document.createElement('p');
    p.textContent = clean(el.textContent);
    return p;
  };
  const toHeading = (el) => {
    const h1 = document.createElement('h1');
    // keep <br> and the trailing "." (flatten the period span to text)
    el.childNodes.forEach((n) => {
      if (n.nodeType === 1 && n.tagName === 'BR') {
        h1.appendChild(document.createElement('br'));
      } else if (n.textContent.trim()) {
        h1.appendChild(document.createTextNode(clean(n.textContent)));
      }
    });
    return h1;
  };
  const toLink = (el) => {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.setAttribute('href', el.getAttribute('href') || '');
    a.textContent = clean(el.textContent);
    p.appendChild(a);
    return p;
  };

  const img = element.querySelector('img.hero-photo') || element.querySelector('img');
  const copy = element.querySelector('.hero-copy') || element;
  const caption = element.querySelector(':scope > .hero-caption');

  // Content row 1: background image
  const imageFrag = document.createDocumentFragment();
  if (img) {
    imageFrag.appendChild(document.createComment(' field:image '));
    imageFrag.appendChild(img);
  }

  // Content row 2: title, subheading and call-to-action as richtext
  const textNodes = [];
  [...copy.children].forEach((child) => {
    if (child.matches('h1, h2')) textNodes.push(toHeading(child));
    else if (child.matches('a')) textNodes.push(toLink(child));
    else if (child.matches('p, span, div') && clean(child.textContent)) textNodes.push(toParagraph(child));
  });
  if (caption) textNodes.push(toParagraph(caption));

  const textFrag = document.createDocumentFragment();
  if (textNodes.length) {
    textFrag.appendChild(document.createComment(' field:text '));
    textNodes.forEach((n) => textFrag.appendChild(n));
  }

  const cells = [[imageFrag], [textFrag]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-campaign', cells });
  element.replaceWith(block);
}
