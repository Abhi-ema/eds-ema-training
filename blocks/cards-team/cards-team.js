import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * cards-team — team / people profile cards.
 *
 * Source: wknd.site /us/en/about-us.html "Our Contributors" and "WKND Guides"
 * grids. Each person is authored as a card with a circular avatar image, a name
 * (heading), a role/skills line, and a row of social-media links
 * (Facebook / Twitter / Instagram).
 *
 * Distinct from the existing card variants:
 *  - cards-article: landscape image-on-top + title link + single-line
 *    description, whole card is a link, NO buttons.
 *  - cards-secure:  content-first with the image BELOW the copy + one "Read
 *    More" CTA, 2-up members-only teasers.
 * This variant is centered, uses a circular avatar, and renders a row of social
 * icon links — a genuinely different people-directory pattern.
 *
 * DA-compatible: imports only from ../../scripts/aem.js (no moveInstrumentation
 * / fetchPlaceholders / scripts.js).
 */

// Inline SVG icons for social links (source uses an icon font that isn't
// portable). Same set as blocks/footer for a consistent look across the site.
const SOCIAL_ICONS = {
  facebook: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.5-1.5H17V3.9c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2V10H8v3h2.5v8h3z"/></svg>',
  twitter: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M22 5.9c-.7.3-1.5.5-2.3.6.8-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1a4.1 4.1 0 0 0-7 3.7A11.6 11.6 0 0 1 3.4 4.6a4.1 4.1 0 0 0 1.3 5.5c-.7 0-1.3-.2-1.9-.5v.1c0 2 1.4 3.6 3.3 4a4.1 4.1 0 0 1-1.8.1 4.1 4.1 0 0 0 3.8 2.8A8.2 8.2 0 0 1 2 18.1a11.6 11.6 0 0 0 6.3 1.8c7.5 0 11.6-6.2 11.6-11.6v-.5c.8-.6 1.5-1.3 2.1-2z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .4 1.4.9.5.4.7.8.9 1.4.1.4.3 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.4 1-.9 1.4-.4.5-.8.7-1.4.9-.4.1-1 .3-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.4-1.4-.9-.5-.4-.7-.8-.9-1.4-.1-.4-.3-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.4-1 .9-1.4.4-.5.8-.7 1.4-.9.4-.1 1-.3 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.1 0-3.5 0-4.7.1-1.1.1-1.7.2-2.1.4-.5.2-.9.4-1.3.8-.4.4-.6.8-.8 1.3-.2.4-.3 1-.4 2.1C2.6 8.5 2.6 8.9 2.6 12s0 3.5.1 4.7c.1 1.1.2 1.7.4 2.1.2.5.4.9.8 1.3.4.4.8.6 1.3.8.4.2 1 .3 2.1.4 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1.1-.1 1.7-.2 2.1-.4.5-.2.9-.4 1.3-.8.4-.4.6-.8.8-1.3.2-.4.3-1 .4-2.1.1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c-.1-1.1-.2-1.7-.4-2.1-.2-.5-.4-.9-.8-1.3-.4-.4-.8-.6-1.3-.8-.4-.2-1-.3-2.1-.4-1.2-.1-1.6-.1-4.7-.1zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8zm0 8a3.1 3.1 0 1 0 0-6.2 3.1 3.1 0 0 0 0 6.2zm6.3-8.2a1.15 1.15 0 1 1-2.3 0 1.15 1.15 0 0 1 2.3 0z"/></svg>',
};

/**
 * Match a social link to one of the known platforms using its label or href.
 * @param {HTMLAnchorElement} a
 * @returns {string|null} platform key or null
 */
function socialPlatform(a) {
  const hay = `${a.textContent} ${a.getAttribute('href') || ''}`.toLowerCase();
  return Object.keys(SOCIAL_ICONS).find((key) => hay.includes(key)) || null;
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-team-card-image';
      } else {
        div.className = 'cards-team-card-body';

        // Tag the first heading as the person's name and any following
        // heading/paragraph as the role line.
        const heading = div.querySelector('h1, h2, h3, h4, h5, h6');
        if (heading) heading.classList.add('cards-team-name');

        // Collect social links, group them into one row, and swap each link's
        // text for an inline SVG icon while keeping an accessible label.
        const socialLinks = [...div.querySelectorAll('a')].filter(socialPlatform);
        if (socialLinks.length) {
          const social = document.createElement('div');
          social.className = 'cards-team-social';
          socialLinks.forEach((a) => {
            const platform = socialPlatform(a);
            const label = a.textContent.trim() || platform;
            a.className = `cards-team-social-link cards-team-social-${platform}`;
            a.setAttribute('aria-label', label);
            a.innerHTML = `${SOCIAL_ICONS[platform]}<span class="cards-team-social-label">${label}</span>`;
            // Detach any wrapping paragraph left empty after moving the link.
            const wrapper = a.closest('p, div');
            social.append(a);
            if (wrapper && wrapper !== div && !wrapper.textContent.trim()
              && !wrapper.querySelector('a, picture, img')) {
              wrapper.remove();
            }
          });
          div.append(social);
        }
      }
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);
}
