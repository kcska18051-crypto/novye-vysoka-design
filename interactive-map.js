(function () {
  const root = document.querySelector('[data-interactive-map]');
  const data = globalThis.NOVYE_VYSOKA_MAP_DATA;
  const model = globalThis.NOVYE_VYSOKA_MAP_MODEL;
  if (!root || !data || !model) return;

  const filters = root.querySelector('[data-map-filters]');
  const markers = root.querySelector('[data-map-markers]');
  const card = root.querySelector('[data-map-card]');
  const list = root.querySelector('[data-map-object-list]');
  const live = root.querySelector('[data-map-live]');
  const dialog = document.querySelector('#quarter-plan-dialog');
  const dialogTitle = dialog?.querySelector('#quarter-plan-title');
  const dialogImage = dialog?.querySelector('[data-quarter-plan-image]');
  const dialogClose = dialog?.querySelector('.quarter-plan-dialog-close');
  let category = 'all';
  let selectedId = null;
  let returnFocus = null;

  const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  const categoryIcon = { quarters: '⌂', nature: '♧', infrastructure: '◆', transport: '↔' };
  const categoryName = { quarters: 'Квартал', nature: 'Природа', infrastructure: 'Инфраструктура', transport: 'Транспорт' };

  function renderFilters() {
    filters.innerHTML = data.categories.map((item) => `<button class="map-filter" type="button" data-map-filter="${item.id}" aria-pressed="${item.id === category}">${escapeHtml(item.label)}</button>`).join('');
  }

  function renderMedia(view) {
    if (!view.image) return '<div class="map-card-media is-fallback"></div>';
    return `<div class="map-card-media"><img src="${escapeHtml(view.image)}" data-fallback="${escapeHtml(view.imageFallback)}" alt="${escapeHtml(view.name)}" loading="lazy"></div>`;
  }

  function renderQuarter(view) {
    const metrics = [
      ['Стоимость 1 сотки', view.metrics.pricePerSotka],
      ['Свободно', view.metrics.free],
      ['В брони', view.metrics.reserved],
      ['Продано', view.metrics.sold]
    ];
    return `${renderMedia(view)}<button class="map-card-close" type="button" data-map-close aria-label="Закрыть карточку">×</button><span class="map-card-type">Квартал проекта</span><h3>${escapeHtml(view.name)}</h3><p class="map-card-description">${escapeHtml(view.description)}</p><div class="map-metrics">${metrics.map(([label,value]) => `<div class="map-metric"><span>${label}</span><strong>${escapeHtml(value)}</strong></div>`).join('')}</div><div class="map-card-actions"><button class="button map-secondary" type="button" data-open-plan>Открыть генплан</button><a class="button button-primary" href="#tour" data-lead-intent="selection">Подобрать участок</a></div>`;
  }

  function renderObject(view) {
    const facts = view.facts.length ? `<ul class="map-card-facts">${view.facts.map((fact) => `<li>${escapeHtml(fact)}</li>`).join('')}</ul>` : '';
    const mapLink = view.mapUrl ? `<a class="map-card-maplink" href="${escapeHtml(view.mapUrl)}" target="_blank" rel="noopener noreferrer">Открыть в Яндекс Картах ↗</a>` : '';
    return `${renderMedia(view)}<button class="map-card-close" type="button" data-map-close aria-label="Закрыть карточку">×</button><span class="map-card-type">${categoryName[model.getItemById(data, view.id).category]}</span><h3>${escapeHtml(view.name)}</h3><p class="map-card-description">${escapeHtml(view.description)}</p>${facts}${mapLink}`;
  }

  function bindMediaFallback() {
    const image = card.querySelector('.map-card-media img');
    image?.addEventListener('error', () => {
      const fallback = image.dataset.fallback;
      if (fallback && image.src !== new URL(fallback, location.href).href) image.src = fallback;
      else image.parentElement.classList.add('is-fallback');
    }, { once: true });
  }

  function render() {
    const visible = model.getVisibleItems(data, category);
    selectedId = model.nextSelection(data, category, selectedId);
    const selectedItem = selectedId ? model.getItemById(data, selectedId) : null;
    root.dataset.selectionKind = selectedItem?.category || '';
    renderFilters();
    markers.innerHTML = visible.map((item) => {
      const tooltipId = `map-tooltip-${item.id}`;
      return `<button class="map-marker" type="button" data-map-item="${item.id}" data-category="${item.category}" aria-label="Открыть: ${escapeHtml(item.name)}" aria-describedby="${tooltipId}" aria-pressed="${item.id === selectedId}" style="--x:${item.x}%;--y:${item.y}%"><span aria-hidden="true">${categoryIcon[item.category]}</span><span class="map-marker-label" id="${tooltipId}" role="tooltip">${escapeHtml(item.name)}</span></button>`;
    }).join('');
    list.innerHTML = visible.map((item) => `<button class="map-list-button" type="button" data-map-item="${item.id}" aria-pressed="${item.id === selectedId}">${escapeHtml(item.name)}</button>`).join('');
    root.classList.toggle('has-selection', Boolean(selectedId));
    if (!selectedId) {
      card.innerHTML = '<div class="map-card-empty"><span>Нажмите на точку</span><h3>Выберите квартал или объект на карте</h3><p>Здесь появятся генплан, показатели квартала или краткая информация о месте.</p></div>';
      return;
    }
    const view = model.getCardModel(model.getItemById(data, selectedId));
    card.innerHTML = `<article class="map-card">${view.kind === 'quarter' ? renderQuarter(view) : renderObject(view)}</article>`;
    bindMediaFallback();
  }

  function selectItem(id, trigger) {
    selectedId = id;
    returnFocus = trigger || null;
    render();
    const item = model.getItemById(data, id);
    live.textContent = `Открыта карточка: ${item.name}`;
  }

  function closeCard() {
    selectedId = null;
    render();
    returnFocus?.focus({ preventScroll: true });
  }

  root.addEventListener('click', (event) => {
    const filter = event.target.closest('[data-map-filter]');
    if (filter) {
      category = filter.dataset.mapFilter;
      render();
      live.textContent = `Фильтр карты: ${filter.textContent}`;
      return;
    }
    const item = event.target.closest('[data-map-item]');
    if (item) {
      selectItem(item.dataset.mapItem, item);
      return;
    }
    if (event.target.closest('[data-map-close]')) closeCard();
    if (event.target.closest('[data-open-plan]')) {
      const view = model.getCardModel(model.getItemById(data, selectedId));
      if (!view || view.kind !== 'quarter' || !dialog) return;
      dialogTitle.textContent = `Генплан: ${view.name}`;
      dialogImage.src = view.image;
      dialogImage.alt = `Генплан квартала ${view.name}`;
      dialog.showModal();
    }
  });

  dialogClose?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  dialog?.addEventListener('close', () => root.querySelector('[data-open-plan]')?.focus({ preventScroll: true }));
  render();
})();
