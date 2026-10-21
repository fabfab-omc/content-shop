import { toClassName } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

let blockCount = 0;

/**
 * Activates one tab and shows its panel; all other tabs/panels are deactivated.
 * @param {Element} block The tabs block
 * @param {Element} button The tab button to activate
 * @param {boolean} focus Whether to move focus to the tab
 */
function activate(block, button, focus = false) {
  block.querySelectorAll(':scope > .tabs-list > [role="tab"]').forEach((tab) => {
    const selected = tab === button;
    tab.setAttribute('aria-selected', selected);
    tab.tabIndex = selected ? 0 : -1;
  });
  block.querySelectorAll(':scope > [role="tabpanel"]').forEach((panel) => {
    panel.hidden = panel.id !== button.getAttribute('aria-controls');
  });
  if (focus) button.focus();
}

/**
 * tabs: one authored row per tab (cell 1 = label, cell 2 = rich content).
 * @param {Element} block The block element
 */
export default function decorate(block) {
  blockCount += 1;
  const prefix = `tabs-${blockCount}`;

  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');

  const rows = [...block.children];
  const usedIds = new Set();
  rows.forEach((row, i) => {
    const [labelCell, ...contentCells] = [...row.children];
    if (!labelCell) {
      row.remove();
      return;
    }

    let id = `${prefix}-${toClassName(labelCell.textContent) || i + 1}`;
    if (usedIds.has(id)) id = `${id}-${i + 1}`;
    usedIds.add(id);

    // the row becomes the panel, keeping the row's UE instrumentation
    row.className = 'tabs-panel';
    row.id = `${id}-panel`;
    row.setAttribute('role', 'tabpanel');
    row.setAttribute('aria-labelledby', `${id}-tab`);
    row.tabIndex = 0;
    contentCells.forEach((cell) => cell.classList.add('tabs-panel-content'));

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tabs-tab';
    button.id = `${id}-tab`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', row.id);
    // keep the label's inline markup (and its field instrumentation) but drop block wrappers
    const label = labelCell.children.length === 1 && labelCell.firstElementChild.tagName === 'P'
      ? labelCell.firstElementChild : labelCell;
    if (label !== labelCell) moveInstrumentation(label, button);
    moveInstrumentation(labelCell, button);
    button.innerHTML = label.innerHTML;
    button.addEventListener('click', () => activate(block, button));
    tablist.append(button);
    labelCell.remove();
  });

  tablist.addEventListener('keydown', (e) => {
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const current = tabs.indexOf(document.activeElement);
    if (current < 0) return;
    let next;
    if (e.key === 'ArrowRight') next = (current + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    else return;
    e.preventDefault();
    activate(block, tabs[next], true);
  });

  block.prepend(tablist);
  const first = tablist.querySelector('[role="tab"]');
  if (first) activate(block, first);
}
