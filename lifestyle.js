'use strict';
(() => {
  const root = document.querySelector('.life-story');
  if (!root) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = matchMedia('(max-width:760px)');
  const running = new Set();
  function animate(element, frames, options) {
    if (motion.matches || !element?.animate) return null;
    const animation = element.animate(frames, options);
    running.add(animation);
    animation.finished.then(() => running.delete(animation), () => running.delete(animation));
    return animation;
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        if (motion.matches) return;
        const scene = entry.target;
        const kind = scene.dataset.storyReveal;
        const copy = scene.querySelector('.story-copy');
        const frame = scene.querySelector('.story-frame, .water-stage');
        const mobile = narrow.matches;
        animate(copy, [{opacity:.25, transform:'translateY(6px)'},{opacity:1, transform:'none'}], {duration:mobile?280:500,easing:'ease-out'});
        if (mobile) {
          animate(frame, [{opacity:.4,transform:'translateY(5px)'},{opacity:1,transform:'none'}], {duration:360,delay:70,easing:'ease-out'});
        } else if (kind === 'squirrel' || kind === 'family') {
          animate(frame, [{opacity:.65,clipPath:'inset(0 3% 0 3% round 12px)'},{opacity:1,clipPath:'inset(0 0 0 0 round 12px)'}], {duration:900,delay:80,easing:'cubic-bezier(.2,.6,.3,1)'});
        } else {
          animate(frame, [{opacity:.4,transform:kind==='walk'?'translateY(12px)':'none'},{opacity:1,transform:'none'}], {duration:700,delay:110,easing:'ease-out'});
        }
        if (!mobile && (kind === 'squirrel' || kind === 'terrace')) {
          animate(frame.querySelector('img'), [{transform:'scale(1.015)'},{transform:'scale(1.025)'}], {duration:1100,easing:'ease-out',fill:'forwards'});
        }
      });
    }, {threshold:.12});
    root.querySelectorAll('[data-story-reveal]').forEach(scene => observer.observe(scene));
  }
  const gallery = root.querySelector('.water-gallery');
  const stage = gallery.querySelector('.water-stage');
  const slides = [...gallery.querySelectorAll('[data-water-slide]')];
  const caption = gallery.querySelector('[data-water-caption]');
  const counter = gallery.querySelector('[data-water-count]');
  const captionBox = gallery.querySelector('.water-caption');
  let active = 0, requested = 0, revision = 0, fade = null, captionFade = null, pointer = null;
  function settle() {
    slides.forEach((slide,index) => {
      slide.hidden = index !== active;
      slide.setAttribute('aria-hidden',String(index !== active));
      slide.style.zIndex = index === active ? '2' : '1';
    });
  }
  async function show(index) {
    requested = (index + slides.length) % slides.length;
    const wanted = requested, token = ++revision;
    const image = slides[wanted].querySelector('img');
    image.loading = 'eager';
    try { await image.decode(); } catch { /* Keep alt text if an image is unavailable. */ }
    if (token !== revision) return;
    if (wanted === active) { fade?.cancel(); captionFade?.cancel(); settle(); return; }
    fade?.cancel(); captionFade?.cancel(); settle();
    active = wanted;
    slides.forEach((slide,i) => { slide.setAttribute('aria-hidden',String(i !== active));slide.style.zIndex=i===active?'2':'1'; });
    slides[active].hidden = false;
    caption.textContent = slides[active].dataset.caption;
    counter.textContent = `${active + 1} / ${slides.length}`;
    fade = animate(slides[active], [{opacity:0},{opacity:1}], {duration:narrow.matches?240:450,easing:'ease-in-out'});
    captionFade = animate(captionBox, [{opacity:.35},{opacity:1}], {duration:narrow.matches?240:450,easing:'ease-in-out'});
    if (fade) fade.finished.then(() => { if (token === revision) settle(); }, () => {});
    else settle();
  }
  gallery.querySelector('.water-controls').hidden = false;
  gallery.querySelector('[data-water-prev]').addEventListener('click', () => show(requested - 1));
  gallery.querySelector('[data-water-next]').addEventListener('click', () => show(requested + 1));
  gallery.addEventListener('keydown', event => {
    const actions = {ArrowLeft:requested-1,ArrowRight:requested+1,Home:0,End:slides.length-1};
    if (!(event.key in actions) || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault(); show(actions[event.key]);
  });
  stage.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.pointerType === 'mouse') return;
    pointer = {id:event.pointerId,x:event.clientX,y:event.clientY};
    stage.setPointerCapture(event.pointerId);
  });
  stage.addEventListener('pointerup', event => {
    if (!pointer || event.pointerId !== pointer.id) return;
    const dx = event.clientX-pointer.x, dy = event.clientY-pointer.y;
    pointer = null;
    if (Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy)*1.4) show(requested+(dx<0?1:-1));
  });
  stage.addEventListener('pointercancel', () => { pointer=null; });
  motion.addEventListener('change', () => {
    if (!motion.matches) return;
    root.getAnimations({subtree:true}).forEach(animation => animation.cancel());
    running.clear(); settle();
  });
})();
