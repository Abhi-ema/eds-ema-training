/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-featured (base: columns)
 * Source: https://wknd.site/us/en.html
 * Single row, 2 columns: [image] | [eyebrow "Featured Article" + heading + description + CTA link].
 * Library structure: columns block; row 1 = block name; subsequent rows each hold the same number
 *   of columns. Here one content row with 2 cells (image | text stack).
 */
export default function parse(element, { document }) {
  // Image cell.
  const image = element.querySelector('.cmp-teaser__image img, .cmp-image__image, img');

  // Text cell: eyebrow/pretitle, heading, description, then CTA link(s).
  const eyebrow = element.querySelector('.cmp-teaser__pretitle, [class*="pretitle"], [class*="eyebrow"]');
  // Exclude pretitle: [class*="title"] would otherwise match "cmp-teaser__pretitle" and
  // pre-empt the real heading (querySelector returns first DOM match).
  const heading = element.querySelector('.cmp-teaser__title, h1, h2, h3, h4');
  const description = element.querySelector('.cmp-teaser__description, [class*="description"]');
  const ctaLinks = Array.from(
    element.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a, a.button'),
  );

  const contentCell = [];
  if (eyebrow) contentCell.push(eyebrow);
  if (heading) contentCell.push(heading);
  if (description) contentCell.push(description);
  contentCell.push(...ctaLinks);

  // Empty-block guard: no image and no text -> unwrap children.
  if (!image && !contentCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // One 2-column row: image | content. Pad missing cells to keep the row even.
  const cells = [
    [image || '', contentCell.length ? contentCell : ''],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-featured', cells });
  element.replaceWith(block);
}
