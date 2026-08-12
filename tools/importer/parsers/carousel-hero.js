/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-hero (base: carousel)
 * Source: https://wknd.site/us/en.html
 * Full-bleed rotating hero. Each slide -> one 2-column row: [image] | [heading + description + CTA link].
 * Library structure: 2 columns; row 1 = block name; each subsequent row = one slide
 *   (cell 1 = image only, cell 2 = optional title/description/CTA).
 */
export default function parse(element, { document }) {
  // Each slide is a carousel item. Fall back to teaser blocks if item wrappers are absent.
  let slides = Array.from(element.querySelectorAll('.cmp-carousel__item'));
  if (!slides.length) {
    slides = Array.from(element.querySelectorAll('.cmp-teaser--hero, .teaser'));
  }

  const cells = [];

  slides.forEach((slide) => {
    // Image cell: the slide's image (image only, per library convention).
    const image = slide.querySelector('.cmp-teaser__image img, .cmp-image__image, img');

    // Content cell: title, description, then CTA link(s).
    const heading = slide.querySelector('.cmp-teaser__title, h1, h2, h3, [class*="title"]');
    const description = slide.querySelector('.cmp-teaser__description, [class*="description"]');
    const ctaLinks = Array.from(
      slide.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a, a.button'),
    );

    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (description) contentCell.push(description);
    contentCell.push(...ctaLinks);

    // Skip empty slides (no image and no content).
    if (!image && !contentCell.length) return;

    // 2-column row: image | content. Pad missing cells to keep the table even.
    cells.push([image || '', contentCell.length ? contentCell : '']);
  });

  // Empty-block guard: nothing extracted -> unwrap children rather than emit an empty block.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
