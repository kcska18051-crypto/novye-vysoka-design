const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'dist', 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'dist', 'app.js'), 'utf8');

test('header identifies Novye Vysoka as a Magazin Zemli project', () => {
  assert.match(html, /class="brand-project"[^>]*>\s*проект «Новые Высока»\s*</i);
});

test('hero offers two concrete lead actions', () => {
  assert.match(html, /data-lead-intent="selection"[^>]*>Подобрать участок</i);
  assert.match(html, /data-lead-intent="tour"[^>]*>Записаться на экскурсию</i);
});

test('reusable lead dialog supports selection and tour intents', () => {
  assert.match(html, /<dialog[^>]+id="lead-dialog"/i);
  assert.match(html, /<form[^>]+data-lead-form/i);
  assert.match(html, /value="selection"/i);
  assert.match(html, /value="tour"/i);
  assert.match(script, /querySelectorAll\('\[data-lead-intent\]'\)/);
  assert.match(script, /leadDialog\.showModal\(\)/);
});

test('lead dialog is available at several points in the landing page', () => {
  const triggers = html.match(/data-lead-intent=/g) || [];
  assert.ok(triggers.length >= 8, `expected at least 8 popup triggers, got ${triggers.length}`);
});

test('redundant section overlines are removed', () => {
  assert.doesNotMatch(html, /class="section-label"/i);
});
