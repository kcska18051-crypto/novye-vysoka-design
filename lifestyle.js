"use strict";
(() => {
  const buttons = [...document.querySelectorAll('[data-water-select]')];
  const slides = [...document.querySelectorAll('[data-water-slide]')];
  buttons.forEach(button => button.addEventListener('click', () => {
    const selected = button.dataset.waterSelect;
    slides.forEach(slide => { slide.hidden = slide.dataset.waterSlide !== selected; });
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  }));
})();
