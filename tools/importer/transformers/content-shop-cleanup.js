/* eslint-disable */
/* global WebImporter */

/**
 * Cleanup transformer for content-shop campaign pages.
 * Removes non-authorable chrome and purely decorative elements.
 * Selectors verified against migration-work/cleaned.html.
 */
export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    // Page chrome (skip link, header incl. nav, footer)
    WebImporter.DOMUtils.remove(element, [
      'a.skip-link',
      'header.site-header',
      'footer.site-footer',
    ]);

    // Decorative-only elements (gradients, rules, dots, topline labels)
    WebImporter.DOMUtils.remove(element, [
      '.hero-gradient',
      '.hero-topline',
      '.creative-rule',
      '.mini-rule',
      '.draft-dot',
    ]);
  }

  if (hookName === 'afterTransform') {
    // Final cleanup of non-content elements (do not touch comments: xwalk field hints)
    WebImporter.DOMUtils.remove(element, [
      'script',
      'style',
      'noscript',
      'link',
      'iframe',
    ]);
  }
}
