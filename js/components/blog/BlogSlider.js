export default function BlogSlider(rootSelector = '.blog-slider') {
  const root = document.querySelector(rootSelector);
  if (!root) return;

  const track = root.querySelector('.blog-slider__track');
  const btnPrev = document.querySelector('.blog-btn--prev');
  const btnNext = document.querySelector('.blog-btn--next');
  const cards = Array.from(track.children);

  let index = 0;
  let offset = 0;
  const getGap = () => parseFloat(getComputedStyle(track).gap) || 0;
  const colWidth = () => cards[0]?.getBoundingClientRect().width || 0;

  const visible = () => {
    const w = root.getBoundingClientRect().width;
    const cw = colWidth(); const g = getGap();
    return Math.max(1, Math.floor((w + g) / (cw + g)));
  };
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  function maxIndex() { return Math.max(0, cards.length - visible()); }

  function goTo(i, animate = true) {
    i = clamp(i, 0, maxIndex());
    index = i;

    const shift = colWidth() + getGap();
    offset = -(index * shift);
    track.style.transition = animate ? 'transform .35s ease' : 'none';
    track.style.transform = `translate3d(${offset}px,0,0)`;

    btnPrev && (btnPrev.disabled = index === 0);
    btnNext && (btnNext.disabled = index === maxIndex());
  }

  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  btnNext?.addEventListener('click', next);
  btnPrev?.addEventListener('click', prev);

  // drag/swipe
  let down = false, startX = 0, startOffset = 0;
  const downH = e => { down = true; startX = (e.touches ? e.touches[0].clientX : e.clientX); startOffset = offset; track.style.transition = 'none'; };
  const moveH = e => {
    if (!down) return;
    const x = (e.touches ? e.touches.clientX : e.clientX);
    offset = startOffset + (x - startX);
    track.style.transform = `translate3d(${offset}px,0,0)`;
  };
  const upH = () => {
    if (!down) return;
    down = false;
    const step = colWidth() + getGap();
    const i = Math.round(Math.abs(offset) / step);
    goTo(i);
  };

  track.addEventListener('mousedown', downH);
  window.addEventListener('mousemove', moveH);
  window.addEventListener('mouseup', upH);
  track.addEventListener('touchstart', downH, {passive:true});
  window.addEventListener('touchmove', moveH, {passive:true});
  window.addEventListener('touchend', upH);

  // resize
  const ro = new ResizeObserver(() => goTo(clamp(index, 0, maxIndex()), false));
  ro.observe(root);

  goTo(0, false);
}
