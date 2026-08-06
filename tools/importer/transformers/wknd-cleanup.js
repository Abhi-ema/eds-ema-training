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
