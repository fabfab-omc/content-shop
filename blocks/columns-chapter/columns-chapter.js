/**
 * Groups the photo and the paragraphs that follow it in the content column
 * into a "lower" row: photo beside an annotation (rule, text, label).
 * @param {Element} col The content column
 */
function decorateLower(col) {
  const photo = [...col.children].find((el) => el.querySelector('picture'));
  if (!photo) return;

  const following = [];
  let next = photo.nextElementSibling;
  while (next) {
    following.push(next);
    next = next.nextElementSibling;
  }

  const lower = document.createElement('div');
  lower.className = 'columns-chapter-lower';
  photo.classList.add('columns-chapter-photo');
  photo.before(lower);
  lower.append(photo);

  if (!following.length) return;
  const annotation = document.createElement('div');
  annotation.className = 'columns-chapter-annotation';
  annotation.append(...following);
  if (following.length > 1) following.at(-1).classList.add('columns-chapter-label');
  lower.append(annotation);
}

/**
 * columns-chapter: chapter label column beside a statement column.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const firstRow = block.firstElementChild;
  if (!firstRow) return;
  block.classList.add(`columns-chapter-${firstRow.children.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col, i) => {
      col.classList.add('columns-chapter-col', `columns-chapter-col-${i + 1}`);
      const pic = col.querySelector('picture');
      if (pic && col.children.length === 1 && pic.closest('div') === col) {
        col.classList.add('columns-chapter-img-col');
      } else if (i > 0) {
        decorateLower(col);
      }
    });
  });
}
