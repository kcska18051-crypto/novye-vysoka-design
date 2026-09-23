'use strict';
(() => {
  const data = window.planData;
  const root = document.querySelector('#plot-picker');
  const svg = root.querySelector('svg');
  const card = root.querySelector('#plot-detail');
  const list = root.querySelector('#plot-list');
  const state = {quarter:'all',free:true,selected:null,view:'plan'};
  const quarter = id => data.quarters.find(q => q.id === id);
  root.querySelectorAll('[data-quarter-price]').forEach(label => {
    label.textContent = quarter(label.dataset.quarterPrice).price;
  });
  const results = () => data.plots.filter(p => (state.quarter === 'all' || p.quarter === state.quarter) && (!state.free || p.status === 'free'));
  const money = value => value == null ? 'Уточняется' : new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
  function changeQuarter(id) {
    state.quarter=id; state.selected=null; state.view='plan'; render();
    root.querySelector('#quarter-summary').focus({preventScroll:true});
  }
  function choose(id) {
    const plot = results().find(p => p.id === id && p.status === 'free');
    if (!plot) return;
    state.selected=id; render();
    card.focus({preventScroll:true});
    if (matchMedia('(max-width:760px)').matches) card.scrollIntoView({block:'nearest',behavior:'smooth'});
  }
  function render() {
    const visible = results();
    root.classList.toggle('overview-mode', state.quarter === 'all');
    if (!visible.some(p => p.id === state.selected)) state.selected=null;
    root.querySelectorAll('[data-quarter]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.quarter===state.quarter)));
    const q = quarter(state.quarter);
    card.hidden=!q;
    root.querySelector('.plan-toolbar').hidden=!q;
    root.querySelector('.plan-legend').hidden=!q;
    root.querySelector('#plan-help').textContent=q ? 'Выберите свободный участок на схеме или откройте список.' : 'Три квартала одного проекта. Нажмите на квартал на схеме или выберите его выше.';
    root.querySelector('#picker-catalog-link').textContent = state.selected ? 'Получить подборку с учётом выбранного участка →' : q ? 'Получить подборку по этому кварталу →' : 'Получить подборку участков →';
    root.querySelector('#quarter-summary').textContent = q
      ? `${q.description} Наличие и ограничения конкретных участков уточняются по документам.`
      : 'Николо-Корма, Дегтярицы и центральная часть — три квартала «Новых Высока». Выберите квартал, чтобы перейти к участкам.';
    svg.setAttribute('viewBox',q ? `${q.bounds[0]-20} ${q.bounds[1]-30} ${q.bounds[2]+40} ${q.bounds[3]+60}` : '0 0 900 480');
    svg.innerHTML = `<rect width="900" height="480" fill="#edf0e5"/><path d="M0 0H900V75Q600 110 0 70Z" fill="#c3d3bb"/><text x="450" y="42" text-anchor="middle" class="landmark">Лес · условное расположение</text><path d="M0 435Q450 400 900 435V480H0Z" fill="#bbd6df"/><text x="450" y="466" text-anchor="middle" class="landmark">Вода · условное расположение</text><path d="M10 420H890" stroke="#c4bda9" stroke-width="14"/><text x="450" y="424" text-anchor="middle" class="road-label">Подъезд · условно</text>`;
    for (const district of data.quarters) {
      if(q && district.id!==q.id) continue;
      const [x,y,w,h]=district.bounds;
      svg.insertAdjacentHTML('beforeend',`<g class="district ${state.quarter!=='all' && state.quarter!==district.id?'outside':''}" role="button" tabindex="${state.quarter!=='all' && state.quarter!==district.id?'-1':'0'}" aria-label="Приблизить квартал ${district.name}" data-zone="${district.id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12"/><text x="${x+w/2}" y="${q ? y+38 : y+h/2-15}" text-anchor="middle">${district.id==='ct'?'<tspan x="'+(x+w/2)+'" dy="-8">Центральная</tspan><tspan x="'+(x+w/2)+'" dy="34">часть</tspan>':district.name}</text>${q ? '' : '<text x="'+(x+w/2)+'" y="'+(y+h/2+65)+'" text-anchor="middle" class="quarter-map-action">Открыть участки →</text>'}</g>`);
    }
    for (const plot of data.plots) {
      if(!q || !visible.includes(plot)) continue;
      const [x,y,w,h]=plot.rect;
      const active=plot.status==='free' && visible.includes(plot);
      const outside=state.quarter!=='all' && plot.quarter!==state.quarter;
      svg.insertAdjacentHTML('beforeend',`<g class="plot ${plot.status} ${state.selected===plot.id?'selected':''} ${outside?'outside':''}" ${active?`role="button" tabindex="0" data-plot="${plot.id}"`: 'role="img"'} aria-label="${plot.id}, ${plot.area} соток, ${plot.status==='free'?'свободен':'продан'} — условные данные"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5"/><text x="${x+w/2}" y="${y+h/2-5}" text-anchor="middle">${plot.id}</text><text class="plot-status" x="${x+w/2}" y="${y+h/2+18}" text-anchor="middle">${plot.status==='free'?'Свободен':'Продан'}</text></g>`);
    }
    root.querySelector('#result-count').textContent=q ? `Условных участков: ${visible.length}. Свободных: ${visible.filter(p=>p.status==='free').length}.` : 'Общий план проекта · 3 квартала';
    root.querySelector('#empty-plots').hidden=!q || visible.some(p=>p.status==='free');
    list.innerHTML=visible.map(p=>`<article class="list-plot"><div><h4>${p.id}</h4><p>${quarter(p.quarter).name} · ${p.area} соток (условно)</p><p>${p.status==='free'?'Свободен':'Продан'} · демонстрационный статус</p></div>${p.status==='free'?`<button type="button" class="button secondary" data-list-plot="${p.id}">Выбрать участок</button>`:'<span class="small">Недоступен для выбора</span>'}</article>`).join('');
    const plot=data.plots.find(p=>p.id===state.selected);
    card.innerHTML=plot ? `<button class="detail-close" type="button" aria-label="Закрыть карточку участка">×</button><h3>${plot.id}</h3><p>${quarter(plot.quarter).name}</p><p class="demo-status">Свободен — демо-статус</p><dl class="plot-facts"><div><dt>Площадь (условная)</dt><dd>${plot.area} соток</dd></div><div><dt>Полная стоимость</dt><dd>${money(plot.total)}</dd></div><div><dt>Цена за сотку</dt><dd>${money(plot.pricePerSotka)}</dd></div><div><dt>Назначение проекта</dt><dd>ИЖС · сведения участка проверяются по ЕГРН</dd></div></dl><div class="detail-photo">Фото участка пока нет</div><p class="small">Номер, площадь, границы и доступность придуманы для проверки сценария. Это не предложение продажи.</p><button type="button" class="text-link show-on-plan">Показать на плане</button><a class="button tour-plot" href="#tour-form">Записаться на просмотр участка ↗</a>`
      : '<h3>Выберите свободный участок</h3><p>Нажмите на участок на схеме или в списке. Здесь появятся его параметры.</p><p class="small">Все участки и статусы в этом блоке демонстрационные.</p>';
    root.querySelector('#plan-panel').hidden=state.view!=='plan';
    list.hidden=!q || state.view!=='list';
    root.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===state.view)));
  }
  root.addEventListener('click',event=> {
    const button=event.target.closest('button,a,[data-zone],[data-plot]');
    if(!button) return;
    if(button.dataset.quarter) changeQuarter(button.dataset.quarter);
    else if(button.dataset.zone) changeQuarter(button.dataset.zone);
    else if(button.dataset.plot || button.dataset.listPlot) choose(button.dataset.plot || button.dataset.listPlot);
    else if(button.dataset.view) {state.view=button.dataset.view;render();}
    else if(button.classList.contains('detail-close')) {state.selected=null;render();root.querySelector('[data-view="'+state.view+'"]').focus();}
    else if(button.classList.contains('show-on-plan')) {state.view='plan';render();svg.scrollIntoView({block:'center',behavior:'smooth'});}
    else if(button.classList.contains('tour-plot')) window.setTourIntent('visit');
  });
  svg.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&event.target.matches('[data-zone],[data-plot]')){event.preventDefault();event.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
  root.querySelector('#free-only').addEventListener('change',event=>{state.free=event.target.checked;render();});
  card.addEventListener('keydown',event=>{if(event.key==='Escape'){state.selected=null;render();root.querySelector('[data-view="'+state.view+'"]').focus();}});
  let catalogPlanContext = null;
  document.addEventListener('click', event => {
    const link = event.target.closest('[data-open-catalog], a[href="#catalog-form"], a[href="#tour-form"]');
    if (!link) return;
    const prefix = link.matches('[data-open-catalog], a[href="#catalog-form"]') ? 'catalog' : 'tour';
    if (prefix === 'catalog') {
      const context = state.quarter + ':' + (state.selected || '');
      if (catalogPlanContext === context) return;
      catalogPlanContext = context;
    }
    const plot = data.plots.find(p => p.id === state.selected);
    const q = plot ? quarter(plot.quarter) : quarter(state.quarter);
    document.querySelector('#' + prefix + '-selection').value = plot ? q.name + ' · ' + plot.id + ' (условный участок)' : q ? q.name + ' · участок не выбран' : 'Участок пока не выбран';
    if(prefix === 'catalog') document.querySelector('#territory').value = q ? q.name : 'Пока выбираю';
    document.querySelector('#' + prefix + '-form .form-feedback').hidden = true;
  });
  document.addEventListener('clear-plan-selection', () => {state.selected=null;state.quarter='all';catalogPlanContext=null;render();});
  render();
})();
