(() => {
  const root = document.querySelector('.hero-preview');
  if (!root) return;
  const choices = [
    {src:'assets/client-october/hero-beach.webp',mobile:'assets/client-october/hero-beach-mobile.webp',alt:'Песчаный берег, вода и сосновый лес'},
    {src:'assets/forest-v2/hero.webp',alt:'Образ загородного дома среди сосен у воды'}
  ];
  const buttons = [...root.querySelectorAll('[data-hero-option]')];
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  let current = 0, version = 0;
  let visible = root.querySelector('.hero-picture') || root.querySelector('.hero-image');
  root.querySelector('.hero-image').classList.add('hero-option-image');
  async function choose(index) {
    if (!choices[index]) return;
    const request = ++version;
    if (index === current) return;
    const choice = choices[index];
    const picture = document.createElement('picture');
    picture.className = 'hero-picture';
    if (choice.mobile) {
      const source = document.createElement('source');
      source.media = '(max-width: 760px)';
      source.srcset = choice.mobile;
      picture.append(source);
    }
    const next = new Image();
    next.alt = choice.alt;
    next.className = 'hero-image hero-option-image';
    next.width = 1672;
    next.height = 941;
    next.style.opacity = '0';
    picture.append(next);
    next.src = choice.src;
    try { await next.decode(); } catch { return; }
    if (request !== version) return;
    const previous = visible;
    root.insertBefore(picture, root.querySelector('.hero-shade'));
    void next.offsetWidth;
    next.style.opacity = '1';
    (previous.matches('img') ? previous : previous.querySelector('img')).style.opacity = '0';
    visible = picture;
    current = index;
    root.dataset.heroChoice = String(index);
    buttons.forEach((button,i) => button.setAttribute('aria-pressed', String(i === index)));
    setTimeout(() => previous.remove(), reduced.matches ? 0 : 450);
  }
  buttons.forEach((button,index) => button.addEventListener('click', () => choose(index)));
  const requested = Number(new URLSearchParams(location.search).get('hero'));
  if (requested >= 1 && requested <= choices.length) choose(requested - 1);
})();
