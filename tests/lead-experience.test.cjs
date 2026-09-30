const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'dist', 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'dist', 'app.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'dist', 'styles.css'), 'utf8');

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
  assert.match(script, /closest\('\[data-lead-intent\]'\)/);
  assert.match(script, /leadDialog\.showModal\(\)/);
});

test('lead dialog is available at several points in the landing page', () => {
  const triggers = html.match(/data-lead-intent=/g) || [];
  assert.ok(triggers.length >= 5, `expected at least 5 static popup triggers, got ${triggers.length}`);
});

test('redundant section overlines are removed', () => {
  assert.doesNotMatch(html, /class="section-label"/i);
});

test('desktop header keeps five key links and a persistent selection action', () => {
  const nav = html.match(/<nav aria-label="Разделы страницы">([\s\S]*?)<\/nav>/i)?.[1] || '';
  assert.equal((nav.match(/<a /g) || []).length, 5);
  for (const label of ['О проекте', 'Как здесь жить', 'Кварталы', 'Покупка', 'О компании']) assert.match(nav, new RegExp(label));
  assert.match(html, /class="header-cta"[^>]+data-lead-intent="selection"/);
});

test('faq starts closed and both accordions expose controlled state', () => {
  assert.doesNotMatch(html, /<details open>/);
  assert.match(html, /class="faq-list reveal"[^>]*data-accordion/);
  assert.match(html, /class="company-reason[^\"]*"[^>]+aria-expanded="false"/);
  assert.doesNotMatch(script, /mouseenter[^\n]+activateReason/);
  assert.match(css, /company-reason-toggle/);
});

test('lead choices are visible selectable cards and footer includes legal navigation', () => {
  assert.match(html, /Приехать посмотреть/);
  assert.match(html, /Получить видео участка/);
  assert.match(html, /class="footer-legal"/);
  assert.match(html, /landmarket\.biz\/privacy/);
});

test('final form names the result of the selected action', () => {
  assert.match(html, /data-tour-submit[^>]*>Записаться на экскурсию/);
  assert.match(script, /syncTourSubmit/);
  assert.match(script, /Получить видео участка/);
});

test('company reasons address five distinct buyer concerns', () => {
  for (const reason of ['Юридическая прозрачность', 'Покупка напрямую', 'Знание территории', 'Сопровождение сделки', 'Рассрочка от собственника']) {
    assert.match(html, new RegExp(reason));
  }
});

test('faq covers ownership, access, viewing, and purchase terms in concise answers', () => {
  for (const question of ['Кто продаёт участки?', 'Как устроен подъезд к участкам?', 'Можно ли приехать и посмотреть участок?', 'Как предоставляется рассрочка?']) {
    assert.match(html, new RegExp(question.replace(/[?]/g, '\\?')));
  }
  const faq = html.match(/<div class="faq-list reveal"[\s\S]*?<\/div>\s*<\/section>/)?.[0] || '';
  const answers = [...faq.matchAll(/<details><summary>[^<]+<\/summary><p>([^<]+)<\/p><\/details>/g)].map((match) => match[1]);
  assert.ok(answers.length >= 8);
  assert.ok(answers.every((answer) => answer.length <= 260), `long FAQ answer: ${Math.max(...answers.map((answer) => answer.length))}`);
});

test('journey supports explicit controls, directional transitions, and adjacent image preload', () => {
  assert.match(html, /data-journey-prev/);
  assert.match(html, /data-journey-next/);
  assert.match(script, /dataset\.direction/);
  assert.match(script, /preloadJourneyNeighbors/);
  assert.match(css, /journey-control/);
});

test('project image has restrained contextual hotspots and visualization note is readable', () => {
  assert.equal((html.match(/class="project-hotspot/g) || []).length, 3);
  assert.match(html, /class="visual-note"[^>]*><span[^>]*aria-hidden="true">i<\/span>/);
  assert.match(css, /\.visual-note[^\{]*\{[^\}]*font-size:\s*13px/s);
});

test('sticky header exposes compact and active-section states', () => {
  assert.match(script, /syncHeaderState/);
  assert.match(script, /aria-current/);
  assert.match(css, /\.site-header\.is-scrolled/);
  assert.match(css, /\.site-header nav a\[aria-current="location"\]/);
});

test('forms provide phone input metadata, inline errors, and submission states', () => {
  const phones = html.match(/<input type="tel"[^>]+>/g) || [];
  assert.ok(phones.length >= 2);
  for (const phone of phones) {
    assert.match(phone, /inputmode="tel"/);
    assert.match(phone, /autocomplete="tel"/);
    assert.match(phone, /required/);
  }
  assert.match(script, /formatPhone/);
  assert.match(script, /aria-invalid/);
  assert.match(script, /is-loading/);
  assert.match(css, /\.lead-form\.is-success/);
  assert.match(css, /\.lead-form\.is-error/);
});

test('hero content uses a staged reveal and motion has a reduced-motion fallback', () => {
  assert.match(css, /\.hero-content\.is-visible > \*/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test('secondary video reel supports pointer drag without changing the modal contract', () => {
  assert.match(script, /enableDragScroll/);
  assert.match(script, /setPointerCapture/);
  assert.match(css, /\.reels-track[^\{]*\{[^\}]*cursor:\s*grab/s);
  assert.match(css, /\.reels-track\.is-dragging/);
});
