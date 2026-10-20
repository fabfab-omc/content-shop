import { loadFragment } from '../fragment/fragment.js';

/**
 * Builds the wordmark link from the brand section
 * (symbol, linked brand name, sub line).
 * @param {Element} section The brand section
 * @returns {Element} The wordmark link
 */
function buildWordmark(section) {
  const [symbol, name, sub] = [...section.querySelectorAll('p')];
  const link = name?.querySelector('a');

  const wordmark = document.createElement('a');
  wordmark.className = 'nav-wordmark';
  wordmark.href = link?.getAttribute('href') || '/';

  if (symbol) {
    const symbolEl = document.createElement('span');
    symbolEl.className = 'nav-symbol';
    symbolEl.setAttribute('aria-hidden', 'true');
    symbolEl.textContent = symbol.textContent.trim();
    wordmark.append(symbolEl);
  }

  const text = document.createElement('span');
  text.textContent = name?.textContent.trim() || '';
  if (sub) {
    const subEl = document.createElement('span');
    subEl.className = 'nav-sub';
    subEl.textContent = sub.textContent.trim();
    text.append(subEl);
  }
  wordmark.append(text);
  wordmark.setAttribute('aria-label', [text.firstChild?.textContent, sub?.textContent.trim()].filter(Boolean).join(' '));

  return wordmark;
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // local preview serves the fragment under /content, DA/EDS at the root
  const fragment = await loadFragment('/content/nav') || await loadFragment('/nav');
  block.textContent = '';
  if (!fragment) return;

  const [brand, sections, tools] = [...fragment.querySelectorAll(':scope > .section')];

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');

  if (brand) nav.append(buildWordmark(brand));

  if (sections) {
    const links = document.createElement('div');
    links.className = 'nav-sections';
    sections.querySelectorAll('a').forEach((a) => {
      a.className = '';
      links.append(a);
    });
    nav.append(links);
  }

  if (tools) {
    const status = document.createElement('p');
    status.className = 'nav-status';
    status.innerHTML = '<span class="nav-status-dot" aria-hidden="true"></span>';
    status.append(tools.textContent.trim());
    nav.append(status);
  }

  block.append(nav);
}
