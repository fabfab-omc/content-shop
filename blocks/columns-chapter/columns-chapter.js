/**
 * columns-chapter: two-column side-by-side layout.
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
      }
    });
  });
}
