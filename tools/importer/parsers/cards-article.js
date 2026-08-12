/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-article (base: cards)
 * Source: https://wknd.site/us/en.html
 * Card grid. Each card -> one 2-column row: [image] | [linked title + description].
 * Library structure: 2 columns; row 1 = block name; each subsequent row = one card
 *   (cell 1 = image/icon mandatory, cell 2 = text: title/description/CTA).
 * NOTE: The page has two such lists; this parser handles a single block instance
 *   (the element passed in), so it only iterates the cards within that instance.
 */
export default function parse(element, { document }) {
  // Each card is a list item within this instance.
  let cards = Array.from(element.querySelectorAll(':scope > li, .cmp-image-list__item'));
  if (!cards.length) {
    cards = Array.from(element.querySelectorAll('li'));
  }

  const cells = [];

  cards.forEach((card) => {
    // Image cell: the card image (image only, per library convention).
    const image = card.querySelector('.cmp-image-list__item-image img, .cmp-image__image, img');

    // Text cell: linked title, then description, then any explicit CTA.
    const titleLink = card.querySelector('.cmp-image-list__item-title-link, a[class*="title"]');
    const description = card.querySelector('.cmp-image-list__item-description, [class*="description"]');

    const contentCell = [];
    if (titleLink) contentCell.push(titleLink);
    if (description) contentCell.push(description);

    // Skip empty cards (no image and no text).
    if (!image && !contentCell.length) return;

    // 2-column row: image | content. Pad missing cells to keep the table even.
    cells.push([image || '', contentCell.length ? contentCell : '']);
  });

  // Empty-block guard: nothing extracted -> unwrap children.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-article', cells });
  element.replaceWith(block);
}
