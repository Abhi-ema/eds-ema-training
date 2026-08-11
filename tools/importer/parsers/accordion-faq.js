/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-faq (base: accordion)
 * Source: https://wknd.site/us/en/faqs.html — .cmp-accordion
 * Collapsible Q&A. Accordion convention: 2 columns; row 1 = block name; each
 * subsequent row = one item (cell 1 = title/question [mandatory], cell 2 =
 * content/answer [mandatory]). The accordion-faq block JS renders each row as
 * a native <details>/<summary>.
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('.cmp-accordion__item'));

  const cells = [];
  items.forEach((item) => {
    // Title cell: the accordion title/button text (the question).
    const titleEl = item.querySelector('.cmp-accordion__title, .cmp-accordion__button, [class*="title"]');
    const question = titleEl ? titleEl.textContent.trim() : '';

    // Content cell: the panel body (keep the actual nodes, e.g. paragraphs).
    const panel = item.querySelector('.cmp-accordion__panel');
    const answerSource = panel
      ? (panel.querySelector('.cmp-text, .cmp-container, .text') || panel)
      : null;
    const answerCell = answerSource ? [answerSource] : '';

    // Skip empty items.
    if (!question && !answerSource) return;

    cells.push([question, answerCell]);
  });

  // Empty-block guard.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
