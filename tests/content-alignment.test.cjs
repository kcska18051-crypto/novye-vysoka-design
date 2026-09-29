const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'index.html'), 'utf8');

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
});

test('shows the current price promotion with a lead action and qualification', () => {
  assert.match(html, /Специальное предложение/);
  assert.match(html, /Успейте выбрать участок по 70 000 ₽ за сотку/);
  assert.match(html, /Условия и наличие уточняются/);
  assert.match(html, /data-lead-intent="promotion"[^>]*>Узнать об акции/);
});

test('uses the supplied aerial visuals for the hero and location story', () => {
  assert.match(html, /class="hero-image" src="assets\/hero-aerial-sunset\.webp"/);
  assert.match(html, /class="location-reference-image" src="assets\/location-reference-map\.webp"/);
  assert.doesNotMatch(html, /class="route-diagram"/);
});
