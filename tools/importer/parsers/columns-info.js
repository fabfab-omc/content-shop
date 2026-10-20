/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-info variant. Base: columns.
 * Selector: section.general
 * Columns block (xwalk): no field hints.
 * Row: [eyebrow + h2] | [lead paragraph + metadata as "Label: Value" paragraphs].
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
  const eyebrow = element.querySelector('.section-heading .eyebrow');
  const heading = element.querySelector('.section-heading h2, h2');
  if (eyebrow) left.push(toParagraph(eyebrow));
  if (heading) {
    const h2 = document.createElement('h2');
    h2.textContent = clean(heading.textContent).replace(/\s+\./g, '.');
    left.push(h2);
  }

  // Right column
  const right = [];
  const lead = element.querySelector('.general-body p.lead, .general-body > p');
  if (lead) right.push(lead);
  element.querySelectorAll('dl.metadata > div').forEach((row) => {
    const dt = row.querySelector('dt');
    const dd = row.querySelector('dd');
    if (!dt && !dd) return;
    const p = document.createElement('p');
    const label = clean(dt ? dt.textContent : '');
    const value = clean(dd ? dd.textContent : '');
    p.textContent = label && value ? `${label}: ${value}` : (label || value);
    right.push(p);
  });

  const cells = [[left, right]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-info', cells });
  element.replaceWith(block);
}
