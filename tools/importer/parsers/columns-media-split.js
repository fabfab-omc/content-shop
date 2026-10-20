/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-media-split variant. Base: columns.
 * Selector: section.creative
 * Columns block (xwalk): no field hints.
 * Row: [eyebrow, h2, body paragraph, creative label] | [image, overlay caption].
 */
export default function parse(element, { document }) {
  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();
  const toParagraph = (el) => {
    const p = document.createElement('p');
    p.textContent = clean(el.textContent);
    return p;
  };

  // Left column
  const left = [];
  const content = element.querySelector('.creative-content') || element;
  const eyebrow = content.querySelector('.eyebrow');
  const heading = content.querySelector('h2');
  const body = content.querySelector('p');
  const label = content.querySelector('.creative-label');
  if (eyebrow) left.push(toParagraph(eyebrow));
  if (heading) {
    // keep <br> and the trailing "." (flatten the period span to text)
    const h2 = document.createElement('h2');
    heading.childNodes.forEach((n) => {
      if (n.nodeType === 1 && n.tagName === 'BR') {
        h2.appendChild(document.createElement('br'));
      } else if (clean(n.textContent)) {
        h2.appendChild(document.createTextNode(clean(n.textContent)));
      }
    });
    left.push(h2);
  }
  if (body) left.push(body);
  if (label) left.push(toParagraph(label));

  // Right column
  const right = [];
  const visual = element.querySelector('.creative-visual');
  if (visual) {
    const img = visual.querySelector('img');
    const caption = visual.querySelector(':scope > span');
    if (img) right.push(img);
    if (caption) right.push(toParagraph(caption));
  }

  const cells = [[left, right]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-media-split', cells });
  element.replaceWith(block);
}
