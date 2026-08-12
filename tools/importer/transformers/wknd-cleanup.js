/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND site-wide cleanup.
 *
 * Removes non-authorable site chrome so the imported document contains only
 * page-level authorable content. On WKND the header and footer are AEM
 * experience fragments that are auto-populated in EDS (header/footer
 * auto-blocks), so they must be stripped from imported content.
 *
 * All selectors below were verified against migration-work/cleaned.html:
 *   - header.cmp-experiencefragment--header          (line 5)   auto-populated header XF
 *   - footer.cmp-experiencefragment--footer          (line 471) auto-populated footer XF
 *   - #toggleNav                                     (line 568) mobile nav hamburger toggle chrome
 *   - #mobileNav                                     (line 574) duplicate mobile navigation
 *   - #destination_publishing_iframe_wkndsite_0      (line 566) Adobe ID sync / analytics iframe
 *   - iframe                                         (line 566) safety net for any analytics/tracking iframe
 *
 * These live in the site shell alongside <main>, none of the block parsers
 * (carousel-hero, columns-featured, cards-article, hero-overlay) target
 * selectors inside them, so removal happens in afterTransform (does not affect
 * block parsing).
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Standalone WKND primary CTAs ("All Articles", "All Trips") are default
    // content, not part of a block. EDS decorateButtons only buttonizes links
    // wrapped in <strong>/<em>, so wrap these anchors in <strong> to render them
    // as primary buttons. Scoped to the standalone button component only — block
    // CTAs (carousel/hero/columns) use .cmp-teaser__action-link and are untouched.
    element.querySelectorAll('.button.cmp-button--primary a.cmp-button').forEach((a) => {
      const { document } = payload;
      // Reduce anchor to its text label (drop nested icon/label spans)
      const label = a.textContent.trim();
      a.textContent = label;
      if (a.parentElement && a.parentElement.tagName === 'STRONG') return;
      const strong = document.createElement('strong');
      a.replaceWith(strong);
      strong.appendChild(a);
    });
  }

  if (hookName === TransformHook.afterTransform) {
    WebImporter.DOMUtils.remove(element, [
      // Auto-populated experience fragments (header/footer handled by EDS auto-blocks)
      'header.cmp-experiencefragment--header',
      'footer.cmp-experiencefragment--footer',
      // Mobile navigation chrome (toggle + duplicate mobile nav)
      '#toggleNav',
      '#mobileNav',
      // Analytics / tracking iframes
      '#destination_publishing_iframe_wkndsite_0',
      'iframe',
    ]);
  }
}
