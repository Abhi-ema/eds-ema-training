import { toClassName } from '../../scripts/aem.js';

/**
 * tabs-adventures — a tabbed category filter for adventure listings.
 *
 * Based on the Block Collection "tabs" block, adapted for this DA project:
 *  - imports only from ../../scripts/aem.js (no moveInstrumentation / scripts.js)
 *  - all CSS hooks renamed to the tabs-adventures-* namespace
 *
 * Content model (author-facing):
 *   Each block row is a tab: [ tab label | tab content ].
 *   The tab-content cell holds the adventures for that category (each adventure
 *   is an image on top, a bold title link, and a short description). The card
 *   grid layout is applied by tabs-adventures.css.
 *
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  // build tablist
  const tablist = document.createElement('div');
  tablist.className = 'tabs-adventures-list';
  tablist.setAttribute('role', 'tablist');

  /**
   * Activate a tab by its id (e.g. "climbing"): show its panel, hide the rest,
   * and update tab selection state. Optionally push the id to the URL hash so
   * the active tab is shareable/deep-linkable.
   * @param {string} id tab id (the toClassName of the label)
   * @param {boolean} updateHash whether to reflect the tab in location.hash
   */
  const activateTab = (id, updateHash) => {
    const panel = block.querySelector(`#tabpanel-${id}`);
    const button = tablist.querySelector(`#tab-${id}`);
    if (!panel || !button) return;
    block.querySelectorAll('[role=tabpanel]').forEach((p) => p.setAttribute('aria-hidden', true));
    tablist.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', false));
    panel.setAttribute('aria-hidden', false);
    button.setAttribute('aria-selected', true);
    if (updateHash) {
      // history.replaceState avoids adding a scroll jump / history entry.
      window.history.replaceState(null, '', `#tab-${id}`);
    }
  };

  // decorate tabs and tabpanels
  const tabs = [...block.children].map((child) => child.firstElementChild);
  tabs.forEach((tab, i) => {
    const id = toClassName(tab.textContent);

    // decorate tabpanel
    const tabpanel = block.children[i];
    tabpanel.className = 'tabs-adventures-panel';
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    // build tab button
    const button = document.createElement('button');
    button.className = 'tabs-adventures-tab';
    button.id = `tab-${id}`;
    button.innerHTML = tab.innerHTML;
    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    button.addEventListener('click', () => activateTab(id, true));
    tablist.append(button);
    tab.remove();
  });

  block.prepend(tablist);

  // Deep-linking: activate the tab named in the URL hash (e.g. #tab-climbing)
  // on load, and respond to hash changes (back/forward, shared links).
  const applyHash = () => {
    const match = window.location.hash.match(/^#tab-(.+)$/);
    if (match && block.querySelector(`#tab-${match[1]}`)) {
      activateTab(match[1], false);
    }
  };
  applyHash();
  window.addEventListener('hashchange', applyHash);

  // Style each adventure card: the source markup puts the title link and the
  // description in the same paragraph. Split them so the title reads as a bold
  // heading above the description.
  block.querySelectorAll('.tabs-adventures-panel li').forEach((li) => {
    // The image is the first paragraph's link; the second paragraph holds the
    // title link immediately followed by the description text node.
    const textP = [...li.querySelectorAll('p')].find((p) => {
      const a = p.querySelector('a');
      return a && !a.querySelector('picture');
    });
    if (!textP) return;
    const titleLink = textP.querySelector('a');
    if (titleLink && !titleLink.classList.contains('tabs-adventures-title')) {
      titleLink.classList.add('tabs-adventures-title');
    }
  });
}
