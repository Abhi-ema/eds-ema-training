/*
 * accordion-faq — collapsible question/answer accordion.
 *
 * Based on the Block Collection "accordion" block, adapted for this DA project:
 *  - no moveInstrumentation / scripts.js imports (DA-compatible; imports only
 *    from ../../scripts/aem.js when needed — this block needs nothing from it)
 *  - all CSS hooks renamed to the accordion-faq-* namespace
 *
 * Content model (author-facing):
 *   Each block row is one FAQ item with two cells: [ question | answer ].
 *   Rendered as a native <details>/<summary> so it works without JS and is
 *   keyboard/screen-reader accessible by default.
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    // decorate accordion item label (the question)
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-faq-item-label';
    summary.append(...label.childNodes);
    // decorate accordion item body (the answer)
    const body = row.children[1];
    body.className = 'accordion-faq-item-body';
    // decorate accordion item
    const details = document.createElement('details');
    details.className = 'accordion-faq-item';
    details.append(summary, body);
    row.replaceWith(details);
  });
}
