import { loadCSS, readBlockConfig } from '../../scripts/aem.js';
import decorateCards from '../cards-campaigns/cards-campaigns.js';

const CAMPAIGN_PATH = /^\/campaigns\/[^/]+\/?$/;

/**
 * Fetches the published campaign pages from the query index, most recently updated first.
 * @returns {Promise<Object[]>} The campaign index entries
 */
async function fetchCampaigns() {
  const resp = await fetch(`${window.hlx.codeBasePath}/query-index.json?limit=1000`);
  if (!resp.ok) return [];
  const { data = [] } = await resp.json();
  return data
    .filter((entry) => CAMPAIGN_PATH.test(entry.path))
    .sort((a, b) => (Number(b.lastModified) || 0) - (Number(a.lastModified) || 0));
}

/**
 * Checks the "Archived" page metadata (any value other than empty / no / false counts).
 * @param {Object} entry The index entry
 * @returns {boolean} True for archived campaigns
 */
function isArchived(entry) {
  return !!entry.archived && !/^(no|false|0)$/i.test(entry.archived.trim());
}

/**
 * Builds a campaign card row in the authored cards-campaigns structure
 * (cell 1 = key visual, cell 2 = h3 + "View campaign" link).
 * @param {Object} entry The index entry
 * @returns {HTMLDivElement} The card row
 */
function buildRow(entry) {
  const row = document.createElement('div');
  const media = document.createElement('div');
  if (entry.image && !entry.image.includes('default-meta-image')) {
    const picture = document.createElement('picture');
    const img = document.createElement('img');
    img.src = entry.image;
    img.alt = '';
    img.loading = 'lazy';
    picture.append(img);
    media.append(picture);
  }

  const body = document.createElement('div');
  const title = document.createElement('h3');
  title.textContent = entry.title || entry.path.split('/').filter(Boolean).pop();
  const cta = document.createElement('p');
  const link = document.createElement('a');
  link.href = entry.path;
  link.textContent = 'View campaign →';
  link.setAttribute('aria-label', `View campaign: ${title.textContent}`);
  cta.append(link);
  body.append(title, cta);

  row.append(media, body);
  return row;
}

/**
 * campaign-list: lists the published campaign pages (/campaigns/{name}/) from the query index.
 * Optional config rows: "Limit" (number of cards) and "Show" (current, archived or all).
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const config = readBlockConfig(block);
  const limit = Number.parseInt(config.limit, 10) || 0;
  const show = (config.show || 'current').toLowerCase();
  block.textContent = '';

  const [campaigns] = await Promise.all([
    fetchCampaigns(),
    loadCSS(`${window.hlx.codeBasePath}/blocks/cards-campaigns/cards-campaigns.css`),
  ]);
  let entries = campaigns;
  if (show === 'current') entries = entries.filter((entry) => !isArchived(entry));
  if (show === 'archived') entries = entries.filter(isArchived);
  if (limit) entries = entries.slice(0, limit);

  if (!entries.length) {
    // nothing archived yet: hide the whole section, including its authored heading
    if (show === 'archived') {
      block.closest('.section')?.classList.add('campaign-list-empty');
    } else {
      const empty = document.createElement('p');
      empty.className = 'campaign-list-message';
      empty.textContent = 'No campaigns published yet.';
      block.append(empty);
    }
    return;
  }

  block.classList.add('cards-campaigns');
  block.append(...entries.map(buildRow));
  decorateCards(block);
}
