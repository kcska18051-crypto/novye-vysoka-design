# Company and Video Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved local company, media and territory-story iteration without publishing it.

**Architecture:** Keep the existing static `index.html`, `styles.css`, and `app.js` structure. Add lightweight local poster assets and create remote video iframes only when the user opens the shared media dialog.

**Tech Stack:** Semantic HTML, responsive CSS, vanilla JavaScript, Kinescope embeds, Rutube embed.

## Global Constraints

- Keep the work local; do not push or publish.
- Keep the draft genplan unchanged.
- Section headings use a shared maximum of 44 px desktop and 34 px mobile; the hero heading remains separate.
- Do not autoplay video or sound.
- Use verified company and project facts from the official pages.

---

### Task 1: Prepare verified media assets

**Files:**
- Create: `local-preview/assets/dmitry-rodionov.webp`
- Create: `local-preview/assets/video-project.webp`
- Create: `local-preview/assets/video-vertical-01.webp` through `video-vertical-05.webp`

**Interfaces:**
- Produces local image paths consumed by the company and media HTML.

- [x] Download the official founder photograph, the Rutube project thumbnail, and five Kinescope posters from their current official sources.
- [x] Convert all images to responsive WebP assets, keeping the founder portrait vertical, the film poster 16:9, and reel posters 9:16.
- [x] Verify every asset decodes and is available through the local server with HTTP 200.

### Task 2: Rebuild the company section and heading scale

**Files:**
- Modify: `local-preview/index.html`
- Modify: `local-preview/styles.css`
- Modify: `local-preview/app.js`

**Interfaces:**
- Produces `.company-founder`, `.company-reasons`, and `.company-reason` controls.

- [x] Replace Tatyana's image and caption with Dmitry Rodionov's verified portrait and founder role.
- [x] Replace the short sales copy with the approved explanation of the company's project role and update the assortment fact to `1000+`.
- [x] Add five button-driven reason rows with one expanded by default.
- [x] Add pointer, focus, and click behavior while maintaining `aria-expanded` state.
- [x] Change the global `h2` scale to `clamp(32px, 3.2vw, 44px)` and mobile maximum to 34 px.

### Task 3: Add landscape and vertical video experiences

**Files:**
- Modify: `local-preview/index.html`
- Modify: `local-preview/styles.css`
- Modify: `local-preview/app.js`

**Interfaces:**
- Produces buttons with `data-video-provider`, `data-video-id`, and `data-video-title`.
- Produces one reusable `#video-dialog` whose iframe `src` is created only while open.

- [x] Insert the media section after `#life` and before `#location`.
- [x] Add one 16:9 project-film poster and five 9:16 reel cards with local posters.
- [x] Add a responsive horizontal rail with snap scrolling and a visible next-card edge on mobile.
- [x] Implement the shared accessible video dialog for Rutube and Kinescope embed URLs.
- [x] Verify open, close, Escape, backdrop click, focus return, and iframe cleanup.

### Task 4: Add concrete forest and Volga content

**Files:**
- Modify: `local-preview/index.html`
- Modify: `local-preview/styles.css`
- Modify: `local-preview/app.js`

**Interfaces:**
- Produces `.place-tab` buttons and `.place-panel` content regions.

- [x] Add two tabs: `Высоковский бор` and `Берег Волги`.
- [x] Add verified activity copy for forest walks, mushrooms, berries, beach, swimming, family recreation, fishing, pier and boat trips.
- [x] Implement tab selection with correct keyboard and ARIA state.
- [x] Keep planned infrastructure out of the existing-features list.

### Task 5: Verify the local intermediate result

**Files:**
- Verify: `local-preview/index.html`
- Verify: `local-preview/styles.css`
- Verify: `local-preview/app.js`

**Interfaces:**
- Consumes the completed local page and reports its URL without publishing.

- [x] Run `node --check local-preview/app.js` and `git diff --check`.
- [x] Verify the page and all new local assets return HTTP 200.
- [x] Inspect company, landscape video, vertical rail, tabs, and dialog at desktop and mobile widths.
- [x] Confirm no browser console errors, no horizontal page overflow, and no remote iframe before user interaction.
- [x] Commit only the local iteration files; leave unrelated untracked files untouched and do not push.
