/* eslint-disable */
/* global WebImporter */

/**
 * Parser for tabs. Base: tabs.
 * Selector: section.insider .tabs
 * Model: container with tabs-item items (title text, content richtext).
 *
 * Tabs convention: 2 columns, one row per tab.
 *   Cell 1: tab label (mandatory)
 *   Cell 2: tab content (mandatory) - richtext from the tab panel
 */
export default function parse(element, { document }) {
  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();
  const tabs = Array.from(element.querySelectorAll(':scope > .tab'));

  const cells = [];

  tabs.forEach((tab) => {
    const label = tab.querySelector('.tab-label');
    const panel = tab.querySelector('.tab-panel');

    const labelFrag = document.createDocumentFragment();
    if (label && clean(label.textContent)) {
      labelFrag.appendChild(document.createComment(' field:title '));
      labelFrag.appendChild(document.createTextNode(clean(label.textContent)));
    }

    const contentFrag = document.createDocumentFragment();
    if (panel && panel.children.length) {
      contentFrag.appendChild(document.createComment(' field:content '));
      [...panel.children].forEach((child) => contentFrag.appendChild(child));
    }

    cells.push([labelFrag, contentFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs', cells });
  element.replaceWith(block);
}
