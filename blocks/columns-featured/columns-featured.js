export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-featured-${cols.length}-cols`);

  // tag image-only columns and text columns so CSS can target them reliably
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      const picWrapper = pic ? pic.closest('div') : null;
      if (pic && picWrapper && picWrapper.children.length === 1) {
        // picture is the only content in the column
        col.classList.add('columns-featured-img-col');
      } else {
        col.classList.add('columns-featured-text-col');
      }
    });
  });
}
