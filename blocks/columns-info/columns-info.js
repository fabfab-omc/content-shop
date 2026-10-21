const META_PATTERN = /^([^:]{1,40}):\s+(.+)$/s;

const isMetaParagraph = (el) => el?.tagName === 'P' && !el.children.length
  && META_PATTERN.test(el.textContent.trim());

/**
 * Turns trailing "Label: Value" paragraphs of a column into a definition list.
 * With a lead paragraph, the pairs render as a small metadata row; when the
 * column holds nothing but pairs (at least two), they render as a "glance" grid.
 * @param {Element} col The column element
 */
function decorateMetadata(col) {
  const items = [];
  // collect the trailing run of plain "Label: Value" paragraphs
  let el = col.lastElementChild;
  while (isMetaParagraph(el)) {
    items.unshift(el);
    el = el.previousElementSibling;
  }
  // a single pair alone in the column stays a lead paragraph
  const isGlance = !el && items.length > 1;
  if (!el && !isGlance) items.shift();
  if (!items.length) return;

  const dl = document.createElement('dl');
  dl.className = 'columns-info-metadata';
  if (isGlance) dl.classList.add('columns-info-metadata-glance');
  items.forEach((p) => {
    const [, label, value] = p.textContent.trim().match(META_PATTERN);
    const item = document.createElement('div');
    const dt = document.createElement('dt');
    const dd = document.createElement('dd');
    dt.textContent = label.trim();
    dd.textContent = value.trim();
    item.append(dt, dd);
    dl.append(item);
  });
  items[0].before(dl);
  items.forEach((p) => p.remove());
}

/**
 * Wraps the trailing period of a heading so it can be accented.
 * @param {Element} heading The heading element
 */
function decorateTitlePeriod(heading) {
  const last = heading.lastChild;
  if (!last || last.nodeType !== Node.TEXT_NODE || !last.textContent.endsWith('.')) return;
  last.textContent = last.textContent.slice(0, -1);
  const period = document.createElement('span');
  period.className = 'columns-info-period';
  period.textContent = '.';
  heading.append(period);
}

/**
 * columns-info: two-column side-by-side layout.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const firstRow = block.firstElementChild;
  if (!firstRow) return;
  block.classList.add(`columns-info-${firstRow.children.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col, i) => {
      col.classList.add('columns-info-col', `columns-info-col-${i + 1}`);
      const pic = col.querySelector('picture');
      if (pic && col.children.length === 1 && pic.closest('div') === col) {
        col.classList.add('columns-info-img-col');
      }
      col.querySelectorAll('h1, h2').forEach(decorateTitlePeriod);
      if (i > 0) decorateMetadata(col);
    });
  });
}
