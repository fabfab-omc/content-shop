import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Builds the logo link: the static brand logo (icons/vw-logo.png) next to the
 * authored label of the brand section (its link sets the target, default home).
 * @param {Element} section The brand section
 * @returns {HTMLAnchorElement} The logo link
 */
function buildLogo(section) {
  const link = section.querySelector('a[href]');
  const label = link?.textContent.trim() || section.textContent.trim();

  const logo = document.createElement('a');
  logo.className = 'nav-logo';
  logo.href = link?.getAttribute('href') || '/';

  const img = document.createElement('img');
  img.src = `${window.hlx.codeBasePath}/icons/vw-logo.png`;
  img.width = 40;
  img.height = 40;
  img.loading = 'eager';
  // the label names the link; without one the logo itself does
  img.alt = label ? '' : 'Volkswagen – Home';
  logo.append(img);

  if (label) {
    const text = document.createElement('span');
    text.className = 'nav-logo-text';
    text.textContent = label;
    logo.append(text);
  }
  return logo;
}

/**
 * Marks the link of the current page (aria-current) or of the section
 * the current page belongs to, e.g. "Campaigns" on a campaign page.
 * @param {HTMLAnchorElement[]} links The navigation links
 */
function markCurrent(links) {
  const normalize = (path) => path.replace(/\/(index)?$/, '') || '/';
  const here = normalize(window.location.pathname);
  const local = links
    .map((a) => ({ a, url: new URL(a.href, window.location.href) }))
    .filter(({ url }) => url.origin === window.location.origin)
    .map(({ a, url }) => ({ a, path: normalize(url.pathname) }));

  const exact = local.find(({ path }) => path === here);
  if (exact) {
    exact.a.setAttribute('aria-current', 'page');
    exact.a.classList.add('nav-current');
    return;
  }
  const parent = local
    .filter(({ path }) => path !== '/' && here.startsWith(`${path}/`))
    .sort((x, y) => y.path.length - x.path.length)[0];
  parent?.a.classList.add('nav-current');
}

/**
 * loads and decorates the header: logo plus the authored navigation links
 * (nav document: section 1 = logo, section 2 = list of links)
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  block.textContent = '';
  if (!fragment) return;

  const [brand, sections] = [...fragment.querySelectorAll(':scope > .section')];

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');

  if (brand) nav.append(buildLogo(brand));

  if (sections) {
    const list = document.createElement('ul');
    list.className = 'nav-sections';
    sections.querySelectorAll('a[href]').forEach((a) => {
      a.className = '';
      const li = document.createElement('li');
      li.append(a);
      list.append(li);
    });
    markCurrent([...list.querySelectorAll('a')]);
    nav.append(list);
  }

  block.append(nav);
}
