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
  for (const phrase of ['Мышкина', 'Углича', 'Какие ещё коммуникации доступны?', 'Что входит в цену и какие расходы оплачиваются отдельно?', 'Можно ли познакомиться с участком из другого города?']) {
    assert.match(html, new RegExp(phrase.replace(/[?]/g, '\\?')));
  }
  assert.doesNotMatch(html, /Уточняется<\/strong><span>из Мышкина/);
});

test('shows the current price promotion with a lead action and qualification', () => {
  assert.match(html, /<h2>Специальное предложение<\/h2>/);
  assert.match(html, /class="promotion-offer">Успейте купить участок по <span class="promotion-price">70 тысяч рублей<\/span> за сотку/);
  assert.match(html, /Условия и наличие уточняются/);
  assert.match(html, /class="promotion-image" src="assets\/territory-panorama\.jpg"/);
  assert.match(html, /data-lead-intent="promotion"[^>]*>Посмотреть участки по акции/);
  assert.match(html, /Предложение действует на выбранные участки/);
  assert.doesNotMatch(css, /\.promotion-band:hover \.promotion-image/);
});

test('presents purchase as a numbered three-step sequence', () => {
  for (const step of ['01', '02', '03']) assert.match(html, new RegExp(`class="purchase-step-number"[^>]*>${step}<`));
  assert.match(html, /class="installment-flow"/);
});

test('uses the supplied aerial visuals for the hero and location story', () => {
  assert.match(html, /class="hero-image" src="assets\/hero-aerial-sunset\.webp"/);
  assert.match(html, /class="location-reference-image" src="assets\/location-reference-map\.webp"/);
  assert.doesNotMatch(html, /class="route-diagram"/);
});
