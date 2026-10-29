import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Wraps " / " separators in a paragraph so they can be styled.
 * @param {Element} p The paragraph
 */
function decorateDividers(p) {
  if (!p.textContent.includes(' / ') || p.querySelector('a')) return;
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
 * loads and decorates the footer: the authored footer document
 * (e.g. copyright line, contact email), one group per section
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);
  block.textContent = '';
  if (!fragment) return;

  const footer = document.createElement('div');
  fragment.querySelectorAll(':scope > .section').forEach((section) => {
    const group = document.createElement('div');
    group.className = 'footer-group';
    section.querySelectorAll('.default-content-wrapper > *').forEach((el) => group.append(el));
    group.querySelectorAll('p').forEach(decorateDividers);
    if (group.children.length) footer.append(group);
  });

  block.append(footer);
}
