/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-chapter variant. Base: columns.
 * Selector: section.strategy
 * Columns block (xwalk): no field hints.
 * Row: [eyebrow + chapter caption] | [h2, strategy photo, annotation paragraph, product-role label].
 */
export default function parse(element, { document }) {
  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();
  const toParagraph = (el, keepBreaks = false) => {
    const p = document.createElement('p');
    if (keepBreaks) {
      el.childNodes.forEach((n) => {
        if (n.nodeType === 1 && n.tagName === 'BR') {
          p.appendChild(document.createElement('br'));
        } else if (clean(n.textContent)) {
          p.appendChild(document.createTextNode(clean(n.textContent)));
        }
      });
    } else {
      p.textContent = clean(el.textContent);
    }
    return p;
  };

  // Left column
  const left = [];
  const eyebrow = element.querySelector('.section-heading .eyebrow');
  const caption = element.querySelector('.section-heading .chapter-caption');
  if (eyebrow) left.push(toParagraph(eyebrow));
  if (caption) left.push(toParagraph(caption, true));

  // Right column
  const right = [];
  const body = element.querySelector('.strategy-body') || element;
  const heading = body.querySelector('h2');
  const img = body.querySelector('img.strategy-photo') || body.querySelector('img');
  const annotation = body.querySelector('.strategy-annotation p');
  const label = body.querySelector('.strategy-annotation .eyebrow');
  if (heading) right.push(heading);
  if (img) right.push(img);
  if (annotation) right.push(annotation);
  if (label) right.push(toParagraph(label));

  const cells = [[left, right]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-chapter', cells });
  element.replaceWith(block);
}
