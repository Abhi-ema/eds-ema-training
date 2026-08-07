import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-article-card-image';
      } else {
        div.className = 'cards-article-card-body';
        // Source pattern: a bold uppercase title link followed by an uppercase
        // description. In the authored/decorated DOM both live in one <p>.
        // Split them so each can be styled (and the description truncated).
        const container = div.querySelector('p') || div;
        const link = container.querySelector('a');
        let descText = '';
        container.childNodes.forEach((node) => {
          if (node === link) return;
          descText += node.textContent;
        });
        descText = descText.trim();
        div.textContent = '';
        if (link) {
          link.classList.add('cards-article-title');
          div.append(link);
        }
        if (descText) {
          const desc = document.createElement('p');
          desc.className = 'cards-article-description';
          desc.textContent = descText;
          desc.title = descText;
          div.append(desc);
        }
      }
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);
}
