const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '..', 'dist', 'styles.css'), 'utf8');

test('uses the approved core message from the prototype', () => {
  assert.match(html, /Больше леса,<br>больше жизни/);
  assert.match(html, /«Новые Высока» — место притяжения у леса и воды/);
  assert.match(html, /Дни, которые хочется<br>проводить за городом/);
  assert.match(html, /Выберите место<br>для своего дома/);
});

test('keeps the current five-quarter scope without inventing names', () => {
  assert.match(html, /Пять кварталов для вашей<br>загородной жизни/);
  assert.doesNotMatch(html, /Три квартала/);
});

test('restores all agreed geography and buyer questions', () => {
  for (const phrase of ['Москва', 'Ярославль', 'Рыбинск', 'Углич', 'Какие ещё коммуникации доступны?', 'Что входит в цену?', 'Можно ли познакомиться с участком из другого города?']) {
    assert.match(html, new RegExp(phrase.replace(/[?]/g, '\\?')));
  }
  assert.doesNotMatch(html, /Уточняется<\/strong>/);
  assert.doesNotMatch(html, /из Мышкина/);
});

test('shows the current price promotion with a lead action and qualification', () => {
  assert.match(html, /<h2>Специальное предложение<\/h2>/);
  assert.match(html, /class="promotion-offer">Участки от <span class="promotion-price">70 000 ₽<\/span> за сотку/);
  assert.match(html, /Актуальное наличие и полную стоимость проверим перед просмотром/);
  assert.match(html, /class="promotion-image" src="assets\/territory-panorama\.jpg"/);
  assert.match(html, /data-lead-intent="promotion"[^>]*>Посмотреть участки по акции/);
  assert.match(html, /Цена действует на выбранные участки/);
  assert.doesNotMatch(css, /\.promotion-band:hover \.promotion-image/);
});

test('keeps every major section concise and fact-led', () => {
  assert.match(html, /участки ИЖС в Рыбинском районе Ярославской области/);
  assert.match(html, /более 200 участков ИЖС/);
  assert.match(html, /275 га/);
  assert.match(html, /Выберите квартал или объект на карте/);
  assert.doesNotMatch(html, /Познакомьтесь с кварталами, сравните окружение/);
  assert.doesNotMatch(html, /В опыте команды — не только продажа земли/);
});

test('identifies Dmitry as founder and project lead without calling him director', () => {
  assert.match(html, /Дмитрий Родионов/);
  assert.match(html, /<strong>Дмитрий Родионов<\/strong><span>основатель «Магазина Земли», руководитель проекта «Новые Высока»<\/span>/);
  assert.doesNotMatch(html, /Дмитрий Родионов[\s\S]{0,120}директор «Магазина Земли»/);
});

test('distinguishes future infrastructure from existing surroundings', () => {
  const mapData = fs.readFileSync(path.join(__dirname, '..', 'dist', 'map-data.js'), 'utf8');
  assert.match(mapData, /Концепция проекта предусматривает точку у воды/);
  assert.match(mapData, /Визуализация будущего объекта/);
});

test('presents purchase as a numbered three-step sequence', () => {
  for (const step of ['01', '02', '03']) assert.match(html, new RegExp(`class="purchase-step-number"[^>]*>${step}<`));
  assert.match(html, /class="installment-flow"/);
});

test('uses the new forest hero and preserves the supplied location story', () => {
  assert.match(html, /class="hero-image" src="assets\/forest-v2\/hero\.webp"/);
  assert.match(html, /class="location-reference-image" src="assets\/location-reference-map\.webp"/);
  assert.doesNotMatch(html, /class="route-diagram"/);
});
