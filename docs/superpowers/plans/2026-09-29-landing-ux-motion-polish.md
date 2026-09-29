# Landing UX and Motion Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the existing Novye Vysoka landing page hierarchy, interaction states, motion, accessibility, and responsive behavior without changing its visual concept or content structure.

**Architecture:** Extend the current static HTML/CSS/JavaScript components in place. Reuse the existing dialogs, map model/controller, journey panels, native details elements, and lead forms; add small state classes and progressive-enhancement JavaScript rather than new dependencies.

**Tech Stack:** Static HTML5, CSS, vanilla JavaScript, Node.js built-in test runner.

**Spec:** User brief attached on 2026-09-29 and the current project context in `PROJECT-CONTEXT.md`.

## Global Constraints

- Preserve the current design, structure, typography, colors, and content.
- Do not invent infrastructure, distances, services, or plot availability.
- Motion must respect `prefers-reduced-motion`, avoid scroll capture, and be simpler on mobile.
- Keep the prototype repository untouched; modify only this design repository.
- Preserve all working video, sound, lead-dialog, and map behavior.

## Review Focus

- 375–390 px layouts must not overflow horizontally and tap targets remain at least 44 px.
- Keyboard users must reach and operate map, accordions, navigation, dialogs, and forms.
- Hidden/unknown data must not appear as user-facing “Уточняется”.
- Motion must not re-run unnecessarily or cause layout shift.
- Dynamic panels must retain clear selected state and return focus after dialogs close.

---

### Task 1: Structural hierarchy and conversion copy

**Files:** `dist/index.html`, `dist/styles.css`, `tests/content-alignment.test.cjs`, `tests/lead-experience.test.cjs`

- [x] Write failing assertions for the promotion CTA/copy, hidden unknown distance, closed FAQ, numbered purchase flow, selectable lead options, footer legal links, and compact header navigation.
- [x] Run focused tests and confirm the expected failures.
- [x] Update semantic HTML and component styling while preserving approved copy.
- [x] Run focused tests and the full suite.

### Task 2: Map and lifestyle interaction states

**Files:** `dist/interactive-map.js`, `dist/interactive-map.css`, `dist/app.js`, `dist/styles.css`, `tests/interactive-map-contract.test.cjs`, `tests/lead-experience.test.cjs`

- [x] Write failing contract assertions for selected map context, hover tooltips, directional journey transitions, preload, controls, and click-controlled reasons accordion.
- [x] Run focused tests and confirm the expected failures.
- [x] Add state classes, accessible labels, controls, preload, and responsive transitions using existing data and panels.
- [x] Run focused tests and the full suite.

### Task 3: Header, accordions, form states, and motion system

**Files:** `dist/index.html`, `dist/app.js`, `dist/styles.css`, `tests/lead-experience.test.cjs`

- [x] Write failing assertions for sticky header state, active section, form autocomplete/validation/status states, and controlled accordion behavior.
- [x] Run focused tests and confirm the expected failures.
- [x] Implement progressive enhancement with accessible focus/error behavior and reduced-motion fallbacks.
- [x] Run focused tests and the full suite.

### Task 4: Responsive and visual verification

**Files:** all modified files

- [x] Run syntax checks, full tests, `git diff --check`, and local HTTP checks.
- [x] Inspect 1440, 1280, 1024, 768, 390, and 375 px layouts and key interactive states.
- [x] Fix only high-confidence regressions found in verification, with a failing regression test first.
- [x] Commit, push `codex/design`, publish `dist` to `codex/pages`, and verify the public URL.
