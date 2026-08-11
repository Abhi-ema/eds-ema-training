/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-adventures (base: tabs)
 * Source: https://wknd.site/us/en/adventures.html — .cmp-tabs
 * Interactive category filter. Tabs: All / Climbing / Cycling / Skiing /
 * Surfing / Travel. Each tab reveals an adventure card grid.
 *
 * Tabs convention: 2 columns; row 1 = block name; each subsequent row is one
 * tab: [ tab label (mandatory) | tab content (mandatory) ]. Here the content
 * cell holds the category's adventure card grid (.image-list). The
 * tabs-adventures block JS turns each row into a tab + panel; the card-grid
 * layout inside each panel is applied by tabs-adventures.css.
 */
export default function parse(element, { document }) {
  // Tab labels (in order).
  const labels = Array.from(element.querySelectorAll('.cmp-tabs__tab'))
    .map((t) => t.textContent.trim())
    .filter(Boolean);

  // Tab panels (each holds the adventure card grid for that category).
  const panels = Array.from(element.querySelectorAll('.cmp-tabs__tabpanel'));

  const cells = [];
  panels.forEach((panel, i) => {
    const label = labels[i] || `Tab ${i + 1}`;

    // The panel's card grid — keep the actual content nodes for the tab body.
    const grid = panel.querySelector('.image-list, .cmp-image-list, ul') || panel;
    const contentCell = grid ? [grid] : [];

    // label cell | content cell
    cells.push([label, contentCell.length ? contentCell : '']);
  });

  // Empty-block guard.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-adventures', cells });
  element.replaceWith(block);
}
