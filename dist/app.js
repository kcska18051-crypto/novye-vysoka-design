'use strict';
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() { navigation.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); }
menuButton.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});
navigation.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && navigation.classList.contains('open')) { closeMenu(); menuButton.focus(); } });
window.matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

const catalog = document.querySelector('#catalog-form');
const catalogDialog = document.querySelector('#catalog-dialog');
let catalogOpener = null;
let restoreCatalogFocus = true;
function openCatalog(opener, intent) {
  catalogOpener = opener || document.activeElement;
  restoreCatalogFocus = true;
  closeMenu();
  setCatalogIntent(intent);
  if (!catalogDialog.open) catalogDialog.showModal();
  document.body.classList.add('catalog-open');
  catalogDialog.scrollTop = 0;
  document.querySelector('#catalog-form-title').focus({ preventScroll: true });
}
function closeCatalog(restoreFocus = true) {
  restoreCatalogFocus = restoreFocus;
  document.body.classList.remove('catalog-open');
  catalogDialog.close();
}
catalogDialog.querySelector('[data-close-catalog]').addEventListener('click', () => closeCatalog());
catalogDialog.addEventListener('close', () => {
  document.body.classList.remove('catalog-open');
  if (restoreCatalogFocus && catalogOpener?.isConnected) catalogOpener.focus({ preventScroll: true });
});
catalogDialog.addEventListener('cancel', event => { event.preventDefault(); closeCatalog(); });
const outsideCatalog = event => {
  const rect = catalogDialog.getBoundingClientRect();
  return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
};
let backdropPress = false;
catalogDialog.addEventListener('pointerdown', event => { backdropPress = event.target === catalogDialog && outsideCatalog(event); });
catalogDialog.addEventListener('click', event => {
  if (backdropPress && event.target === catalogDialog && outsideCatalog(event)) closeCatalog();
  backdropPress = false;
  if (event.target.closest('a[href="#plots"]')) {
    closeCatalog(false);
    requestAnimationFrame(() => document.querySelector('#plots h2').focus({ preventScroll: true }));
  }
});
function openCatalogFromHash() {
  if (['#catalog', '#catalog-form'].includes(location.hash)) openCatalog(null);
}
window.addEventListener('hashchange', openCatalogFromHash);
openCatalogFromHash();
const contact = document.querySelector('#catalog-contact');
const contactLabel = document.querySelector('#contact-label');
function setCatalogIntent(intent) {
  const installment = intent === 'installment';
  catalog.querySelector('[name="request"][value="' + (installment ? 'installment' : 'catalog') + '"]').checked = true;
  document.querySelector('#catalog-form-title').textContent = installment ? 'Каталог и условия рассрочки' : 'Получить каталог';
  catalog.querySelector('[type="submit"]').textContent = installment ? 'Запросить каталог и условия ↗' : 'Получить каталог ↗';
  catalog.querySelector('.form-feedback').hidden = true;
}
catalog.addEventListener('change', event => {
  if (event.target.name === 'request') setCatalogIntent(event.target.value);
});
const channels = {
  email: { label: 'Email', type: 'email', placeholder: 'name@example.ru' },
  max: { label: 'Телефон в MAX или ссылка на профиль', type: 'text', placeholder: '+7 … или https://max.ru/u/…' },
  vk: { label: 'Ссылка на профиль ВКонтакте', type: 'url', placeholder: 'https://vk.com/…' }
};
catalog.addEventListener('change', event => {
  if (event.target.name !== 'channel') return;
  const channel = channels[event.target.value];
  contactLabel.textContent = channel.label + " (обязательно)";
  contact.type = channel.type;
  contact.placeholder = channel.placeholder;
  contact.value = '';
  contact.setCustomValidity('');
  catalog.querySelector('.form-feedback').hidden = true;
});
document.querySelectorAll('[data-territory]').forEach(link => link.addEventListener('click', () => {
  document.querySelector('#territory').value = link.dataset.territory;
  catalog.querySelector('.form-feedback').hidden = true;
}));

function validPhone(value) { return /^[+\d\s().-]+$/.test(value) && value.replace(/\D/g, '').length >= 10 && value.replace(/\D/g, '').length <= 15; }
function validProfile(value, host) {
  try { const url = new URL(value); return url.protocol === 'https:' && [host, 'www.' + host].includes(url.hostname) && url.pathname.length > 1; } catch { return false; }
}
document.querySelectorAll('form').forEach(form => {
  form.addEventListener('input', event => {
    if (event.target.setCustomValidity) event.target.setCustomValidity('');
    form.querySelector('.form-feedback').hidden = true;
  });
  form.addEventListener('submit', event => {
    event.preventDefault();

    if (form.id === 'tour-form') {
      const phone = form.elements.phone;
      phone.setCustomValidity(validPhone(phone.value.trim()) ? '' : 'Введите телефон: от 10 до 15 цифр.');
    } else {
      const value = contact.value.trim();
      const channel = form.elements.channel.value;
      contact.setCustomValidity('');
      if (channel === 'max' && !validPhone(value) && !validProfile(value, 'max.ru')) contact.setCustomValidity('Введите телефон или полную ссылку на профиль в MAX.');
      if (channel === 'vk' && !validProfile(value, 'vk.com') && !validProfile(value, 'vk.ru')) contact.setCustomValidity('Введите полную ссылку на ваш профиль ВКонтакте.');
    }
    if (!form.reportValidity()) return;
    const feedback = form.querySelector('.form-feedback');
    feedback.textContent = form.id === 'tour-form'
      ? (form.elements.intent.value === 'video' ? 'Демонстрация запроса видео участка. Заявка не отправлена, видео не высылается. В рабочей версии команда уточнит участок и способ передачи записи.' : 'Демонстрация записи на экскурсию. Заявка не отправлена, поездка не назначена. В рабочей версии команда свяжется с вами для согласования визита.')
      : (form.elements.request.value === 'installment' ? 'Демонстрация запроса каталога и условий рассрочки. ' : 'Демонстрация запроса каталога — подборки участков. ') + 'Заявка не отправлена, материалы не высылаются. Выбранный канал будет использован в рабочей версии; формат и срок выдачи ещё согласуются.';
    feedback.hidden = false;
    feedback.focus({ preventScroll: true });
    feedback.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'nearest' });
  });
});

const tourForm = document.querySelector('#tour-form');
function setTourIntent(intent) {
  tourForm.querySelector('[name="intent"][value="' + intent + '"]').checked = true;
  const video = intent === 'video';
  document.querySelector('#tour-form-title').textContent = video ? 'Получить видео участка' : 'Записаться на экскурсию';
  tourForm.querySelector('[type="submit"]').textContent = video ? 'Запросить видео участка ↗' : 'Записаться на экскурсию ↗';
  document.querySelector('#visit-time').hidden = video;
  document.querySelector('#tour-time').disabled = video;
  tourForm.querySelector('.form-feedback').hidden = true;
}
window.setTourIntent = setTourIntent;
tourForm.addEventListener('change', event => { if(event.target.name === 'intent') setTourIntent(event.target.value); });
document.addEventListener('click', event => {
  const intentLink = event.target.closest('[data-tour-intent]');
  if (intentLink) setTourIntent(intentLink.dataset.tourIntent);
  const catalogLink = event.target.closest('[data-open-catalog], a[href="#catalog-form"]');
  if (catalogLink) {
    event.preventDefault();
    openCatalog(catalogLink, catalogLink.dataset.catalogIntent);
  }
  const clear = event.target.closest('[data-clear-selection]');
  if (!clear) return;
  const prefix = clear.dataset.clearSelection;
  document.querySelector('#' + prefix + '-selection').value = 'Участок пока не выбран';
  if(prefix === 'catalog') document.querySelector('#territory').value = 'Пока выбираю';
  document.querySelector('#' + prefix + '-form .form-feedback').hidden = true;
  document.dispatchEvent(new CustomEvent('clear-plan-selection'));
});
document.querySelector('#territory').addEventListener('change', event => {
  document.querySelector('#catalog-selection').value = event.target.value === 'Пока выбираю' ? 'Участок пока не выбран' : event.target.value + ' · участок не выбран';
  catalog.querySelector('.form-feedback').hidden = true;
});

// Accessible, mutually exclusive media panels. No autoplay or external players.
const mediaTabs = [...document.querySelectorAll('.media-tabs [role="tab"]')];
function activateMediaTab(nextTab) {
  for (const tab of mediaTabs) {
    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    const selected = tab === nextTab;
    if (!selected) panel.querySelectorAll('video').forEach(video => video.pause());
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    panel.hidden = !selected;
  }
}
mediaTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateMediaTab(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % mediaTabs.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + mediaTabs.length) % mediaTabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = mediaTabs.length - 1;
    else return;
    event.preventDefault();
    activateMediaTab(mediaTabs[next]);
    mediaTabs[next].focus();
  });
});
