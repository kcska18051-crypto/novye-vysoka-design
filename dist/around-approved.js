(() => {
  const root = document.querySelector('[data-around]');
  if (!root) return;

  const groups = {
    life: [
      { title: 'Магазины', image: 'shop-visualization.webp', alt: 'Визуализация магазина у дороги' },
      { title: 'Остановки транспорта', image: 'stop-degtyaritsy.png' },
      { title: 'Образовательные учреждения', image: 'school-green-v2.webp', alt: 'Художественно обработанное фото образовательного учреждения среди зелени' },
      { title: 'Дороги и подъезды', image: 'road-client-natural.webp', position: 'center 70%', alt: 'Реальная лесная дорога. Фотография клиента с ретушью автомобиля.' }
    ],
    rest: [
      { title: 'Высоковский бор', image: 'forest-client-natural.webp', position: 'center 75%', alt: 'Высоковский бор и вода между соснами. Фотография клиента с лёгкой цветокоррекцией.' },
      { title: 'Причал', image: 'river-edited.webp' },
      { title: 'Берег Волги', image: 'shore-client-natural.webp', position: 'center 78%', alt: 'Песчаный берег Волги у соснового леса. Фотография клиента с лёгкой цветокоррекцией.' },
      { title: 'Рыбинск', image: 'rybinsk-sunset-v2.webp', alt: 'Художественно обработанное фото Рыбинска на закате' },
      { title: 'Детский лагерь «Высоковский бор»', image: 'camp-edited.webp' }
    ]
  };
  const tabs = [...root.querySelectorAll('[data-around-category]')];
  const gallery = root.querySelector('[data-around-gallery]');
  let category = 'rest';

  function render() {
    gallery.dataset.count = String(groups[category].length);
    tabs.forEach(tab => {
      const selected = tab.dataset.aroundCategory === category;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    gallery.classList.remove('is-changing');
    void gallery.offsetWidth;
    gallery.classList.add('is-changing');
    gallery.replaceChildren(...groups[category].map(item => {
      const card = document.createElement('figure');
      card.className = 'around-card';
      if (item.image === 'stop-degtyaritsy.png') card.classList.add('around-card--stop');
      if (item.image === 'river-edited.webp') card.classList.add('around-card--river');
      const photo = document.createElement('div');
      photo.className = 'around-photo';
      const image = document.createElement('img');
      image.src = `assets/around/${item.image}`;
      image.alt = item.alt || item.title;
      if (item.position) image.style.objectPosition = item.position;
      image.loading = 'lazy';
      image.decoding = 'async';
      photo.append(image);
      const caption = document.createElement('figcaption');
      caption.className = 'around-caption';
      caption.textContent = item.title;
      card.append(photo, caption);
      return card;
    }));
    gallery.scrollLeft = 0;
  }

  tabs.forEach(tab => tab.addEventListener('click', () => {
    if (category === tab.dataset.aroundCategory) return;
    category = tab.dataset.aroundCategory;
    render();
  }));
  tabs.forEach((tab, index) => tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    category = tabs[next].dataset.aroundCategory;
    render();
    tabs[next].focus({ preventScroll: true });
  }));
  render();
})();
