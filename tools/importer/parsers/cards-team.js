/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-team (base: cards)
 * Source: https://wknd.site/us/en/about-us.html —
 *   section.cmp-experience-fragment--contributor (one per person).
 * Team/people profile cards. Cards convention: 2 columns; row 1 = block name;
 * each subsequent row = one card (cell 1 = image [mandatory], cell 2 = text:
 * title/name + role + social links). Invoked once per contributor instance;
 * wraps the single element passed in as one card row. The cards-team block JS
 * renders the avatar as a circular image, the first heading as the name, and
 * swaps the social links for inline SVG icons (platform detected from href/text).
 */
export default function parse(element, { document }) {
  // Avatar image (mandatory, first per convention).
  const image = element.querySelector('.cmp-image__image, .image img, img');

  // Name (h3) and role (h5).
  const name = element.querySelector('.cmp-title__text, h3, h2, h4');
  const roleEl = element.querySelector('.cmp-title--black .cmp-title__text, h5');

  const contentCell = [];
  if (name) {
    const h3 = document.createElement('h3');
    h3.textContent = name.textContent.trim();
    contentCell.push(h3);
  }
  if (roleEl && roleEl !== name) {
    const h5 = document.createElement('h5');
    h5.textContent = roleEl.textContent.trim();
    contentCell.push(h5);
  }

  // Social links: each .cmp-button--icononly anchor. The platform is encoded in
  // the icon span class and/or the href (e.g. #facebook-...). Rebuild as
  // labelled links so the block's platform detection + inline-SVG swap work.
  const socialLinks = Array.from(element.querySelectorAll('.cmp-button--icononly a, .cmp-button a[href]'));
  const socialParagraph = document.createElement('p');
  socialLinks.forEach((a) => {
    const href = a.getAttribute('href') || '';
    const iconSpan = a.querySelector('[class*="icon--"]');
    let platform = '';
    if (iconSpan) {
      const m = iconSpan.className.match(/cmp-button__icon--([a-z]+)/i);
      if (m) [, platform] = m;
    }
    if (!platform) {
      const hm = href.toLowerCase().match(/facebook|twitter|instagram/);
      if (hm) [platform] = hm;
    }
    if (!platform) return;
    const link = document.createElement('a');
    link.href = href;
    link.textContent = platform.charAt(0).toUpperCase() + platform.slice(1);
    socialParagraph.append(link, document.createTextNode(' '));
  });
  if (socialParagraph.querySelector('a')) contentCell.push(socialParagraph);

  // Empty-block guard.
  if (!image && !contentCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // 2-column row: avatar | content. Pad to keep the row even.
  const cells = [
    [image || '', contentCell.length ? contentCell : ''],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-team', cells });
  element.replaceWith(block);
}
