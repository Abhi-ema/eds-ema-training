/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-secure (base: cards)
 * Source: https://wknd.site/us/en/magazine.html — .teaser.cmp-teaser--secure
 * "Members Only" locked teaser cards. Follows the cards convention:
 *   2 columns; row 1 = block name; each subsequent row = one card
 *   (cell 1 = image [mandatory], cell 2 = text: heading + description + CTA).
 * Invoked once per teaser instance (two on the page); wraps the single element
 *   passed in as one card row. The two resulting sibling blocks are laid out
 *   side-by-side (2-up) at render time by the block JS/CSS.
 */
export default function parse(element, { document }) {
  // Image cell (mandatory, first per convention).
  const image = element.querySelector('.cmp-teaser__image img, .cmp-image__image, img');

  // Text cell: heading, description, and the "Read More" affordance.
  const heading = element.querySelector('.cmp-teaser__title, h1, h2, h3, h4');
  const description = element.querySelector('.cmp-teaser__description, [class*="description"]');
  const action = element.querySelector('.cmp-teaser__action-container, .cmp-teaser__action-link');

  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (description) contentCell.push(description);
  if (action) {
    // "Read More" is plain text (locked) on the source — preserve as a paragraph.
    const label = action.textContent.trim();
    if (label) {
      const p = document.createElement('p');
      p.textContent = label;
      contentCell.push(p);
    }
  }

  // Empty-block guard.
  if (!image && !contentCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // 2-column row: image | content. Pad to keep the row even.
  const cells = [
    [image || '', contentCell.length ? contentCell : ''],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-secure', cells });
  element.replaceWith(block);
}
