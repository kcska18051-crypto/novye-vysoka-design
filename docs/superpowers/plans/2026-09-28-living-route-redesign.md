# Living Route Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Replace the static post-hero content with an atmospheric introduction and a reliable four-scene photo journey that is obvious and pleasant to use on mobile.

**Architecture:** Keep the existing static HTML/CSS/JavaScript structure and preserve the hero plus benefit cards. Replace only the `about` and `life` markup, isolate scene state in a small controller in `app.js`, and use CSS media queries for desktop accordion versus mobile horizontal snap behavior.

**Tech Stack:** Semantic HTML5, CSS custom properties and media queries, vanilla JavaScript, IntersectionObserver, Web Animations API, local WebP assets.

## Global Constraints

- Do not change the hero, forest-sound control, or three benefit cards.
- Do not add claims about unconfirmed infrastructure or services.
- Never autoplay audio or take over vertical scrolling.
- Respect `prefers-reduced-motion` and keep the content usable without JavaScript.
- Work only in `local-preview`; do not publish this iteration.

---

### Task 1: Atmospheric project introduction

**Files:**
- Modify: `local-preview/index.html`
- Modify: `local-preview/styles.css`

**Interfaces:**
- Consumes: existing `forest-path.webp` and `quiet-beach.webp` assets.
- Produces: `.project-intro`, `.project-intro-media`, and `.place-marker` elements for CSS reveal behavior.

- [x] **Step 1: Replace the current two-photo about collage**

Create one wide image composition with the existing project heading, product explanation, a CTA to `#life`, and two compact markers: `Высоковский бор` and `Большая вода рядом`.

- [x] **Step 2: Add responsive styling**

Use an asymmetric desktop layout and a single stable mobile composition. Set an image aspect ratio of `16 / 10` on desktop and `4 / 5` on mobile, with readable text and no hover-only content.

- [x] **Step 3: Verify the HTML response**

Run:

```powershell
$page = Invoke-WebRequest http://127.0.0.1:4175/ -UseBasicParsing
$page.StatusCode
([regex]::Matches($page.Content, 'place-marker')).Count
```

Expected: status `200`, marker count `2`.

### Task 2: Desktop and mobile photo journey

**Files:**
- Modify: `local-preview/index.html`
- Modify: `local-preview/styles.css`

**Interfaces:**
- Consumes: `forest-path.webp`, `pier-boats.webp`, `terrace-family.webp`, and `family-walk.webp`.
- Produces: `.journey-tab[data-scene]`, `.journey-panel[data-scene]`, `.journey-track`, and `.journey-progress-fill`.

- [x] **Step 1: Add explicit scene navigation**

Render four real buttons named `Лес`, `Вода`, `Дом`, and `Семья`. Connect each button to its photo panel through matching `data-scene` values and `aria-controls`.

- [x] **Step 2: Build the desktop accordion**

Show all four panels at once. Give the active panel most of the width while keeping all inactive labels visible. Use click and keyboard focus as the only activation triggers.

- [x] **Step 3: Build the mobile swipe layout**

Make each panel `84vw`, expose the next card, enable horizontal scroll snap, and keep `touch-action: pan-y pinch-zoom`. Show `1 / 4` plus a four-step progress line below the track.

- [x] **Step 4: Preserve truthful content**

Keep the visualization disclosure below the block. Do not describe the pictured boats, terrace, or other objects as existing project infrastructure.

### Task 3: Reliable interaction and motion

**Files:**
- Modify: `local-preview/app.js`

**Interfaces:**
- Consumes: the scene buttons and panels from Task 2.
- Produces: `activateScene(index, options)`, synchronized `aria-selected`, `aria-expanded`, mobile scroll position, counter, and progress state.

- [x] **Step 1: Replace the current story state controller**

Implement one `activateScene(index, { scrollMobile, focusTab })` function. Clamp the index to `0..3`, update classes and ARIA state, and move the progress fill by `index * 100%`.

- [x] **Step 2: Add input methods**

Tabs activate on click and support `ArrowLeft`, `ArrowRight`, `Home`, and `End`. Panel clicks activate the matching scene. Mobile scrolling updates the active index after an animation frame.

- [x] **Step 3: Make reveal animation failure-safe**

Apply visible state immediately when reduced motion is enabled or IntersectionObserver is unavailable. Otherwise reveal the intro once on intersection. Do not use sticky positioning or scroll interception.

- [x] **Step 4: Run syntax and source checks**

Run:

```powershell
node --check local-preview/app.js
git diff --check
```

Expected: both commands exit with code `0` and produce no error output.

### Task 4: Responsive browser verification

**Files:**
- Verify: `local-preview/index.html`
- Verify: `local-preview/styles.css`
- Verify: `local-preview/app.js`

**Interfaces:**
- Consumes: the complete local preview.
- Produces: verified desktop and mobile behavior with no console errors.

- [x] **Step 1: Verify desktop at 1366 × 768**

Confirm the project introduction is balanced, all four panels are visible, and clicking each panel expands it without shifting the page vertically.

- [x] **Step 2: Verify mobile at 390 × 844**

Confirm the next photo edge is visible, all four scene buttons fit or scroll horizontally, the counter begins at `1 / 4`, and tapping `Вода` updates the photo, count, and progress.

- [x] **Step 3: Verify scrolling and errors**

Swipe the photo track horizontally and then scroll the page vertically. Confirm neither direction is blocked and read browser error/warning logs; expected result is an empty log list.

- [x] **Step 4: Verify reduced motion**

Emulate `prefers-reduced-motion: reduce`. Confirm all content is visible and scene switching still works without animated transitions.

- [x] **Step 5: Leave the local preview open**

Reset temporary viewport overrides, return the tab to `http://127.0.0.1:4175/`, and mark it as the user-facing deliverable.
