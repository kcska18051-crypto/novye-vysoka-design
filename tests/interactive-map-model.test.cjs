const test = require('node:test');
const assert = require('node:assert/strict');

const data = require('../dist/map-data.js');

test('all filter returns every quarter and object', () => {
  const model = require('../dist/interactive-map-model.js');
  assert.equal(model.getVisibleItems(data, 'all').length, data.quarters.length + data.objects.length);
});

test('category filter returns matching items and invalid filter falls back to all', () => {
  const model = require('../dist/interactive-map-model.js');
  assert.ok(model.getVisibleItems(data, 'nature').every((item) => item.category === 'nature'));
  assert.equal(model.getVisibleItems(data, 'missing').length, data.quarters.length + data.objects.length);
});

test('item lookup returns an item or null', () => {
  const model = require('../dist/interactive-map-model.js');
  assert.equal(model.getItemById(data, 'bus-stop').name, 'Остановка «Дегтярицы»');
  assert.equal(model.getItemById(data, 'does-not-exist'), null);
});

test('selection survives only while it remains visible', () => {
  const model = require('../dist/interactive-map-model.js');
  assert.equal(model.nextSelection(data, 'transport', 'bus-stop'), 'bus-stop');
  assert.equal(model.nextSelection(data, 'nature', 'bus-stop'), null);
});

test('card model distinguishes quarters and supplies safe media fallbacks', () => {
  const model = require('../dist/interactive-map-model.js');
  const quarter = model.getCardModel(data.quarters[0]);
  const school = model.getCardModel(data.objects.find((item) => item.id === 'school'));
  assert.equal(quarter.kind, 'quarter');
  assert.equal(quarter.metrics.free, 'Уточняется');
  assert.equal(school.kind, 'object');
  assert.equal(school.image, 'assets/territory-panorama.jpg');
});
