# Interactive Masterplan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static quarter illustration with a responsive interactive map that opens infrastructure cards and five replaceable quarter plans with summary metrics.

**Architecture:** Keep the site dependency-free and split the feature into immutable content data, pure selection/filter helpers, and a DOM controller. Place markers over a responsive masterplan with percentage coordinates; render one shared detail panel on desktop and a bottom sheet on mobile. Quarter availability remains inside replaceable images, while price and counts live in the data file.

**Tech Stack:** Static HTML5, CSS, vanilla JavaScript, Node.js `node:test`, Python/pypdfium2 for source-plan rendering, WebP/JPG assets.

**Spec:** `docs/superpowers/specs/2026-09-29-interactive-masterplan-design.md`

## Global Constraints

- Do not label or divide objects as existing versus planned.
- Show all categories by default; filters change visibility only.
- Do not infer quarter names, boundaries, prices, counts, availability, distances, or travel times that the client has not confirmed.
- The client updates availability by replacing a quarter image, not by editing individual plot polygons.
- Use five independent quarter image slots even while their final names and boundaries remain unconfirmed.
- Keep the page dependency-free and compatible with the existing static GitHub Pages build.
- Do not intercept vertical page scrolling.
- Preserve `prefers-reduced-motion` behavior and 44 × 44 px minimum touch targets.
- Forms remain demonstrational until a backend is connected.

## Review Focus

- Missing image or unknown metric: the card must remain usable and show `Уточняется`, never broken media or fabricated values; Task 1 and Task 3 test this.
- Rapid switching between filters and markers: selection must clear only when the selected item is no longer visible; Task 2 tests this.
- Mobile viewport at 360 px: the bottom sheet and expanded plan must not create horizontal overflow; Task 4 tests this.
- Keyboard use: every marker and filter must be reachable, expose state, and return focus after closing; Task 2 and Task 4 test this.
- Client replaces a quarter file without code changes: unchanged filenames and aspect-ratio handling must display the new plan; Task 3 tests this.

---

### Task 1: Content contract and asset pipeline

**Files:**
- Create: `dist/map-data.js`
- Create: `tools/export-quarter-plans.py`
- Create: `source-assets/masterplan/novye-vysoka-2026-08-30.pdf`
- Create: `dist/assets/quarters/quarter-1.webp`
- Create: `dist/assets/quarters/quarter-2.webp`
- Create: `dist/assets/quarters/quarter-3.webp`
- Create: `dist/assets/quarters/quarter-4.webp`
- Create: `dist/assets/quarters/quarter-5.webp`
- Test: `tests/interactive-map-data.test.cjs`

**Interfaces:**
- Produces: `globalThis.NOVYE_VYSOKA_MAP_DATA` with `categories`, `quarters`, and `objects` arrays.
- Produces: each quarter record with `id`, `name`, `category`, `x`, `y`, `image`, `pricePerSotka`, `free`, `reserved`, `sold`, `distances`, and `description`.
- Produces: each object record with `id`, `name`, `category`, `x`, `y`, `image`, `description`, `facts`, and optional `mapUrl`.
- Produces: five stable quarter filenames that later tasks render directly.

- [ ] **Step 1: Write failing content-contract tests**

Add tests named `exports_five_replaceable_quarters`, `all_items_have_unique_ids_and_valid_percent_coordinates`, `unknown_values_are_explicit`, and `object_categories_match_filters`. Assert five quarter filenames exactly match `assets/quarters/quarter-1.webp` through `quarter-5.webp`, coordinates are between 0 and 100, and unknown numeric content equals `Уточняется`.

- [ ] **Step 2: Run the content tests and verify RED**

Run: `node --test tests/interactive-map-data.test.cjs`

Expected: FAIL because `dist/map-data.js` does not exist.

- [ ] **Step 3: Add the immutable data contract**

Create `dist/map-data.js` with categories `all`, `quarters`, `nature`, `infrastructure`, and `transport`. Include five neutral quarter records and the confirmed object names from the spec. Use working percentage coordinates based on the supplied full plan; keep unknown content as `Уточняется`.

- [ ] **Step 4: Preserve and render the supplied plan**

Copy the source PDF to `source-assets/masterplan/novye-vysoka-2026-08-30.pdf`. Implement `tools/export-quarter-plans.py --source <pdf> --output <dir>` with five named crop boxes stored in one `CROPS` mapping. Render WebP files at minimum 1600 px width per crop without rewriting labels or plot colors.

- [ ] **Step 5: Run tests and inspect all five crops**

Run: `node --test tests/interactive-map-data.test.cjs`

Expected: PASS.

Render/inspect: open each `dist/assets/quarters/quarter-*.webp` and confirm the file is sharp, contains no clipped outer parcels, and uses no invented quarter label.

- [ ] **Step 6: Commit the content layer**

```bash
git add dist/map-data.js tools/export-quarter-plans.py source-assets/masterplan dist/assets/quarters tests/interactive-map-data.test.cjs
git commit -m "Add interactive map data and quarter plan assets"
```

### Task 2: Pure map state and selection behavior

**Files:**
- Create: `dist/interactive-map-model.js`
- Test: `tests/interactive-map-model.test.cjs`

**Interfaces:**
- Consumes: the data contract from Task 1.
- Produces: CommonJS/browser-compatible functions `getVisibleItems(data, category)`, `getItemById(data, id)`, `nextSelection(data, category, selectedId)`, and `getCardModel(item)`.

- [ ] **Step 1: Write failing state tests**

Cover `all` returning every item, each category returning only matching items, invalid category falling back to `all`, missing ID returning `null`, a hidden selection clearing after filtering, and a visible selection surviving filtering. Assert `getCardModel` supplies a fallback image state and `Уточняется` metrics without inventing values.

- [ ] **Step 2: Run state tests and verify RED**

Run: `node --test tests/interactive-map-model.test.cjs`

Expected: FAIL because the model module does not exist.

- [ ] **Step 3: Implement the pure model**

Use a UMD-style wrapper so Node tests can `require()` the functions and the browser receives `globalThis.NOVYE_VYSOKA_MAP_MODEL`. Keep DOM access out of this file.

- [ ] **Step 4: Run state tests and verify GREEN**

Run: `node --test tests/interactive-map-model.test.cjs`

Expected: PASS.

- [ ] **Step 5: Commit the model**

```bash
git add dist/interactive-map-model.js tests/interactive-map-model.test.cjs
git commit -m "Add interactive map state model"
```

### Task 3: Interactive map markup, cards, and filters

**Files:**
- Modify: `dist/index.html`
- Create: `dist/interactive-map.js`
- Create: `dist/interactive-map.css`
- Modify: `dist/app.js`
- Test: `tests/interactive-map-contract.test.cjs`

**Interfaces:**
- Consumes: `NOVYE_VYSOKA_MAP_DATA` and `NOVYE_VYSOKA_MAP_MODEL`.
- Produces: one `[data-interactive-map]` component, filter buttons, marker layer, accessible object list, detail panel, close action, and full-plan dialog.
- Emits: existing lead popup through `data-lead-intent="selection"` from the quarter CTA.

- [ ] **Step 1: Write failing DOM-contract tests**

Assert `index.html` loads `interactive-map.css`, then `map-data.js`, `interactive-map-model.js`, and `interactive-map.js` in dependency order. Assert the old `.quarter-grid` and `.plan-draft` are removed, and the new component includes a live region, accessible list, detail panel, and plan dialog.

- [ ] **Step 2: Run the DOM-contract tests and verify RED**

Run: `node --test tests/interactive-map-contract.test.cjs`

Expected: FAIL because the new component is absent.

- [ ] **Step 3: Replace the static quarter block**

Keep the section heading and insert the new component shell. Retain city-distance content in the earlier location section, but remove the duplicated four-item `nearby-list` after the map supplies those objects.

- [ ] **Step 4: Implement controller behavior**

In `dist/interactive-map.js`, render filters and markers from data, update `aria-pressed`, call `nextSelection` after filtering, render object or quarter cards, restore focus after closing, and open the full-plan dialog from a quarter card. Do not add drag libraries or a Yandex Maps embed.

- [ ] **Step 5: Implement desktop styling**

Create a 68/32 map-to-panel layout, absolute percentage markers, category-specific icon shapes, a selected-marker transform, and a wider quarter-card treatment. Use one subtle entry transition and reduced-motion overrides.

- [ ] **Step 6: Connect the existing lead popup**

When a quarter card renders `Подобрать участок`, include `data-lead-intent="selection"`. Refactor the lead-popup binding in `dist/app.js` into an exported/reusable `bindLeadTriggers(root = document)` or delegated click handler so dynamically rendered CTAs open the same popup.

- [ ] **Step 7: Run contract and regression tests**

Run: `node --test tests/*.test.cjs`

Expected: all tests PASS, including the existing five lead-experience tests.

- [ ] **Step 8: Commit the desktop interaction**

```bash
git add dist/index.html dist/interactive-map.js dist/interactive-map.css dist/app.js tests/interactive-map-contract.test.cjs
git commit -m "Build interactive masterplan and object cards"
```

### Task 4: Mobile bottom sheet, zoom, and accessibility

**Files:**
- Modify: `dist/interactive-map.js`
- Modify: `dist/interactive-map.css`
- Modify: `tests/interactive-map-contract.test.cjs`

**Interfaces:**
- Consumes: the component and controller from Task 3.
- Produces: mobile bottom-sheet behavior, full-screen quarter-plan dialog, keyboard navigation, Escape handling, and focus restoration.

- [ ] **Step 1: Extend tests for mobile and accessibility contracts**

Assert 44 px marker hit areas, horizontal filter scrolling, `overflow-x: clip` or equivalent containment, `aria-pressed` markers, a labelled dialog, reduced-motion rules, and focus-restoration code. Add a test that an image with `naturalWidth === 0` receives the fallback state.

- [ ] **Step 2: Run tests and verify RED**

Run: `node --test tests/interactive-map-contract.test.cjs`

Expected: FAIL on the new mobile/accessibility assertions.

- [ ] **Step 3: Implement mobile layout and controls**

At widths up to 760 px, place the map above the detail surface, render the card as a fixed/in-component bottom sheet with a close button, keep part of the map visible, and make the full plan independently scrollable and pinch-zoom compatible through native browser scaling.

- [ ] **Step 4: Implement keyboard and fallback behavior**

Support Enter/Space through native buttons, Escape to close both surfaces, focus restoration to the initiating marker, live-region announcements, and a visual fallback when media is missing.

- [ ] **Step 5: Verify responsive behavior in a real browser**

Check widths 1440, 1024, 768, 390, and 360 px. At each width select a normal object and a quarter, switch filters while an item is selected, open/close the full plan, and confirm `document.documentElement.scrollWidth === document.documentElement.clientWidth`.

- [ ] **Step 6: Commit mobile and accessibility work**

```bash
git add dist/interactive-map.js dist/interactive-map.css tests/interactive-map-contract.test.cjs
git commit -m "Polish mobile map and accessible interactions"
```

### Task 5: Restaurant image and object-media pass

**Files:**
- Create: `source-assets/map-objects/restaurant-v1.png`
- Create: `dist/assets/map-objects/restaurant.webp`
- Create or update: `dist/assets/map-objects/*`
- Modify: `dist/map-data.js`
- Test: `tests/interactive-map-data.test.cjs`

**Interfaces:**
- Consumes: object media slots from Task 1 and cards from Task 3.
- Produces: optimized card images with stable filenames and meaningful alt text.

- [ ] **Step 1: Extend media tests**

Assert every object has a stable image path or an explicit `imageFallback` and that the restaurant points to `assets/map-objects/restaurant.webp`.

- [ ] **Step 2: Run tests and verify RED**

Run: `node --test tests/interactive-map-data.test.cjs`

Expected: FAIL until media references are complete.

- [ ] **Step 3: Generate and approve the restaurant visual**

Generate a realistic horizontal scene of a welcoming timber restaurant with a terrace among pine trees, natural daylight, ordinary visitors, and no luxury styling. Inspect anatomy, architecture, reflections, signage, and consistency with the approved lifestyle photographs before accepting the image.

- [ ] **Step 4: Optimize the restaurant and assign other media**

Export the restaurant at a card-ready 3:2 ratio in WebP. Reuse only project-owned assets for other objects; where no owned photo exists, use the designed icon fallback rather than downloading third-party map photographs.

- [ ] **Step 5: Run tests and visually inspect cards**

Run: `node --test tests/interactive-map-data.test.cjs`

Expected: PASS. Open every card at desktop and mobile widths and confirm no crop hides the subject.

- [ ] **Step 6: Commit media**

```bash
git add source-assets/map-objects dist/assets/map-objects dist/map-data.js tests/interactive-map-data.test.cjs
git commit -m "Add masterplan object media"
```

### Task 6: Context, regression verification, and publication

**Files:**
- Modify: `PROJECT-CONTEXT.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: completed Tasks 1–5.
- Produces: handoff instructions for replacing quarter images and updating metrics, plus published `codex/design` and `codex/pages` commits.

- [ ] **Step 1: Document the update workflow**

Record the five stable filenames, the exact data keys for price/counts/distances, the no-status rule, confirmed map facts, and the remaining client inputs. Explain that changing plot availability means replacing the image file.

- [ ] **Step 2: Run the full automated verification**

Run:

```bash
node --test tests/*.test.cjs
node --check dist/app.js
node --check dist/interactive-map-model.js
node --check dist/interactive-map.js
git diff --check
```

Expected: every command exits 0.

- [ ] **Step 3: Run the final browser verification**

Verify all filters, all object cards, five quarter cards, lead CTA, full-plan dialog, keyboard focus, reduced motion, missing-image fallback, desktop/mobile widths, no console errors, and no horizontal overflow.

- [ ] **Step 4: Commit documentation and final fixes**

```bash
git add PROJECT-CONTEXT.md README.md dist tests
git commit -m "Document interactive masterplan workflow"
```

- [ ] **Step 5: Publish source and Pages branches**

Push `codex/design`. Create a non-force `codex/pages` commit from the final `dist` tree with `origin/codex/pages` as parent, push it, and verify the public URL with a cache-busting query.
