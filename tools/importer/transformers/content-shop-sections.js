/* eslint-disable */
/* global WebImporter */

/**
 * Sections transformer for content-shop campaign pages.
 * Uses payload.template.sections (from page-templates.json):
 * - beforeTransform: inserts <hr> section breaks before every non-first section
 *   (while the original section elements still exist), marking styled ones.
 * - afterTransform: inserts Section Metadata blocks for styled sections.
 */
const MARKER = 'data-excat-section-id';

function findSectionElement(root, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (const sel of selectors) {
    if (!sel) continue;
    try {
      const el = root.querySelector(sel);
      if (el) return el;
    } catch (e) {
      // invalid selector, try next
    }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = payload && payload.template && payload.template.sections;
  if (!sections || sections.length < 2) return;
  const document = element.ownerDocument || payload.document;

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const sectionEl = findSectionElement(element, section);
      if (!sectionEl || !sectionEl.parentNode) continue;

      if (i > 0 || section.style) {
        const hr = document.createElement('hr');
        if (section.style) hr.setAttribute(MARKER, section.id);
        if (i === 0) hr.setAttribute('data-excat-first-section', 'true');
        sectionEl.parentNode.insertBefore(hr, sectionEl);
      }
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
      const anchor = marker || findSectionElement(element, section);
      if (!anchor || !anchor.parentNode) continue;

      const metadata = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.parentNode.insertBefore(metadata, anchor.nextSibling);

      if (marker) {
        marker.removeAttribute(MARKER);
        if (marker.hasAttribute('data-excat-first-section')) {
          marker.remove();
        }
      }
    }

    // Safety: drop any leftover temporary first-section break
    element.querySelectorAll('hr[data-excat-first-section]').forEach((hr) => hr.remove());
  }
}
