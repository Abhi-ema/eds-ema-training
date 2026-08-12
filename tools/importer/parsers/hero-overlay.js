/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-overlay (base: hero)
 * Source: https://wknd.site/us/en.html
 * Full-width banner: [background image] then [heading + description + CTA link].
 * Library structure: 1 column, 3 rows -> row 1 = block name; row 2 = background image (optional);
 *   row 3 = title + subheading + CTA. Each row therefore holds exactly ONE cell.
 */
export default function parse(element, { document }) {
  // Background image (row 2).
  const image = element.querySelector('.cmp-teaser__image img, .cmp-image__image, img');

  // Content (row 3): title, description, then CTA link(s).
  const heading = element.querySelector('.cmp-teaser__title, h1, h2, h3, h4');
  const description = element.querySelector('.cmp-teaser__description, [class*="description"]');
  const ctaLinks = Array.from(
    element.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a, a.button'),
  );

  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (description) contentCell.push(description);
  contentCell.push(...ctaLinks);

  // Empty-block guard: no image and no content -> unwrap children.
  if (!image && !contentCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // 1-column block: each row is a single cell. Add the image row only when present.
  const cells = [];
  if (image) cells.push([image]);
  if (contentCell.length) cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-overlay', cells });
  element.replaceWith(block);
}
