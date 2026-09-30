const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const dataPath = path.join(root, 'dist', 'map-data.js');

function loadData() {
  delete require.cache[require.resolve(dataPath)];
  return require(dataPath);
}

test('exports five replaceable quarters', () => {
  const data = loadData();
  assert.equal(data.quarters.length, 5);
  assert.deepEqual(
    data.quarters.map((item) => item.image),
    [1, 2, 3, 4, 5].map((number) => `assets/quarters/quarter-${number}.webp`)
  );
});

test('all items have unique ids and valid percent coordinates', () => {
  const data = loadData();
  const items = [...data.quarters, ...data.objects];
  assert.equal(new Set(items.map((item) => item.id)).size, items.length);
  for (const item of items) {
    assert.ok(item.x >= 0 && item.x <= 100, `${item.id} x`);
    assert.ok(item.y >= 0 && item.y <= 100, `${item.id} y`);
  }
});

test('unknown quarter values are explicit', () => {
  const data = loadData();
  for (const quarter of data.quarters) {
    for (const key of ['pricePerSotka', 'free', 'reserved', 'sold']) {
      assert.equal(quarter[key], 'По запросу');
    }
  }
});

test('object categories match available filters', () => {
  const data = loadData();
  const categories = new Set(data.categories.map((item) => item.id));
  assert.ok(categories.has('all'));
  assert.ok(categories.has('quarters'));
  for (const item of [...data.quarters, ...data.objects]) {
    assert.ok(categories.has(item.category), `${item.id}: ${item.category}`);
  }
});

test('restaurant has a stable generated image slot', () => {
  const data = loadData();
  const restaurant = data.objects.find((item) => item.id === 'restaurant');
  assert.equal(restaurant.image, 'assets/map-objects/restaurant.webp');
});
