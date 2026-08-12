import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * cards-secure — "Members Only" locked teaser cards.
 *
 * Source: wknd.site .teaser.cmp-teaser--secure (two side-by-side teasers).
 * Each authored row has two cells: a content cell (heading + description +
 * "Read More" CTA) and an image cell. Unlike cards-article, the image renders
 * BELOW the content, each card carries a CTA, and the grid is 2-up. A yellow
 * corner ribbon with a lock icon marks the members-only/locked content.
 *
 * DA-compatible: no moveInstrumentation / fetchPlaceholders imports.
 */

// Inline SVG padlock — the source uses an icon-font glyph that isn't portable.
const LOCK_ICON = '<svg class="cards-secure-lock-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M17 9V7A5 5 0 0 0 7 7v2H5v13h14V9h-2zM9 7a3 3 0 0 1 6 0v2H9V7zm4 9.7V19h-2v-2.3a2 2 0 1 1 2 0z"/></svg>';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-secure-card-image';
      } else {
        div.className = 'cards-secure-card-body';

        // Yellow corner ribbon + lock icon (members-only / locked marker).
        const ribbon = document.createElement('span');
        ribbon.className = 'cards-secure-ribbon';
        ribbon.setAttribute('aria-label', 'Members only');
        ribbon.innerHTML = LOCK_ICON;
        div.prepend(ribbon);

        // "Read More" is the locked CTA. It's a real link if present; otherwise
        // it's the last plain paragraph (locked/anonymous). Tag it for styling.
        const cta = div.querySelector('a:last-of-type');
        if (cta) {
          cta.classList.add('cards-secure-cta');
        } else {
          const paras = div.querySelectorAll('p');
          const last = paras[paras.length - 1];
          if (last && /read more/i.test(last.textContent)) {
            last.classList.add('cards-secure-cta');
          }
        }
      }
    });
    // ensure the image cell renders after the body cell (image-below-content)
    const imageCell = li.querySelector('.cards-secure-card-image');
    if (imageCell) li.append(imageCell);
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);
}
