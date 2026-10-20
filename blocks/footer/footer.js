import { loadFragment } from '../fragment/fragment.js';

/**
 * Wraps " / " separators in a paragraph so they can be styled.
 * @param {Element} p The paragraph
 */
function decorateDividers(p) {
  if (!p.textContent.includes(' / ')) return;
  const parts = p.textContent.split(' / ');
  p.textContent = '';
  parts.forEach((part, i) => {
    if (i > 0) {
      const divider = document.createElement('span');
      divider.className = 'footer-divider';
      divider.textContent = '/';
      p.append(' ', divider, ' ');
    }
    p.append(part);
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // local preview serves the fragment under /content, DA/EDS at the root
  const fragment = await loadFragment('/content/footer') || await loadFragment('/footer');
  block.textContent = '';
  if (!fragment) return;

  const footer = document.createElement('div');
  fragment.querySelectorAll('p').forEach((p) => {
    decorateDividers(p);
    footer.append(p);
  });

  block.append(footer);
}
