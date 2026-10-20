/**
 * Wraps a trailing period of the heading in a span so it can be accented.
 * @param {Element} heading The heading element
 */
function accentTrailingPeriod(heading) {
  const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
  let last = null;
  while (walker.nextNode()) {
    if (walker.currentNode.textContent.trim()) last = walker.currentNode;
  }
  if (!last) return;
  const text = last.textContent.replace(/\s+$/, '');
  if (!text.endsWith('.')) return;
  const period = document.createElement('span');
  period.className = 'columns-media-split-period';
  period.textContent = '.';
  last.textContent = text.slice(0, -1);
  last.after(period);
}

/**
 * columns-media-split: two-column side-by-side layout.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const firstRow = block.firstElementChild;
  if (!firstRow) return;
  block.classList.add(`columns-media-split-${firstRow.children.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col, i) => {
      col.classList.add('columns-media-split-col', `columns-media-split-col-${i + 1}`);
      const pic = col.querySelector('picture');
      if (pic && col.children.length === 1 && pic.closest('div') === col) {
        col.classList.add('columns-media-split-img-col');
      }
    });
  });

  block.querySelectorAll('h1, h2, h3').forEach(accentTrailingPeriod);
}
