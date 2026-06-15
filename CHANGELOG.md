# Changelog

All notable changes to LabVivid are recorded here in reverse chronological order
(newest first). Each entry captures the originating prompt, what changed, and the
date.

---

## 2026-06-15 — Sidebar navigation + Fractions model

**Prompt:** "It can be split into left and right columns. The left column
displays model categories and model names, while the right side is the model
display area. On mobile devices, the left model type column can be toggled using a
'hamburger' menu button (like the '三' icon in the upper left corner of Android
apps) — tapping it shows or hides the left column. Additionally, more models can
be added; for mathematics, fraction models can be included (in forms such as
circular pie charts, square cuts, etc.)."

**Changes:**
- Restructured the app into a left/right layout:
  - Added `src/components/Sidebar.tsx` — a left column listing models grouped by
    subject category with model names; highlights the active model and includes a
    Home link.
  - Reworked `src/App.tsx` into a `Shell` with a sticky sidebar + main content
    area; added a hamburger (☰) button in the top bar that toggles the sidebar.
  - On mobile the sidebar becomes a slide-in drawer with a tap-to-dismiss
    backdrop; it auto-closes on navigation. On desktop it is always visible.
  - Added shell/sidebar/drawer/hamburger styling and `--topbar-h` / `--sidebar-w`
    tokens in `src/index.css`, including the mobile drawer media queries.
  - Added `nav.home`, `nav.menu`, `nav.models` i18n strings (EN/中文).
- Added a new mathematics model `src/models/fractions.ts` — Fractions visualized
  as pie slices, square cuts, or a grid; supports proper and improper fractions
  (renders multiple whole shapes), shows decimal value, percentage, and the
  simplified (reduced) fraction. Registered it in `src/models/index.ts` and added
  a grounded AI explanation case in `src/ai/explain.ts`.
- Updated `README.md` for the sidebar navigation and the 10-model set.

**Verification:** `tsc -b` clean; `npm run build` succeeds (PWA regenerated);
preview server returns HTTP 200 for page and `sw.js`; fraction math validated
(3/4 = 0.75 / 75%; 6/8 reduces to 3/4; improper 7/4 = 1.75; 0/5 = 0);
server-render smoke test confirmed the sidebar groups (Physics, Chemistry,
Mathematics, Biology), the active-model highlight, the mobile backdrop, the
Fractions link, and that the Fractions page renders canvas + KaTeX + controls.

---

## 2026-06-15 — Add changelog

**Prompt:** "All modification records should be saved to the CHANGELOG.md file in
reverse chronological order, including: prompts, modification descriptions,
modification dates, etc."

**Changes:**
- Added this `CHANGELOG.md` to track all project modifications (prompt, summary,
  and date) in reverse chronological order.
- Backfilled entries for the prior work in this project (initial MVP build and
  the additional models).

---

## 2026-06-15 — Add more models

**Prompt:** "Add more models"

**Changes:**
- Added five new models, expanding the library from 4 to 9 across four subjects:
  - `src/models/pendulum.ts` — Physics · Simple Pendulum (animated swing,
    `T = 2π√(L/g)`, angle-vs-time chart, step-through).
  - `src/models/springSHM.ts` — Physics · Mass on a Spring / SHM (Hooke's law,
    animated spring + block, displacement chart, step-through).
  - `src/models/idealGas.ts` — Chemistry · Ideal Gas Law `PV = nRT` (animated
    piston with bouncing particles: count ∝ moles, speed ∝ √T; P–V isotherm).
  - `src/models/population.ts` — Biology · Population Growth (exponential vs
    logistic S-curve, carrying capacity); introduces the Biology subject.
  - `src/models/derivative.ts` — Mathematics · Derivative & Tangent Line
    (slide a point, live tangent line + numerically estimated slope).
- Registered the new models in `src/models/index.ts`.
- Added the **Biology** subject filter chip in `src/pages/LibraryPage.tsx`.
- Added grounded AI explanation narratives and suggested questions for each new
  model.
- Updated `README.md` to list the expanded model set.

**Verification:** `tsc -b` clean; `npm run build` succeeds (PWA regenerated);
model math validated against theory (pendulum T≈2.007 s, spring T≈1.405 s and
max force kA=10 N, gas P≈99.77 kPa with Boyle's-law doubling at half volume,
derivative slope 0.75 for `0.25x²` at x=1.5 and 3.0 for `3sin x` at 0);
server-render smoke test confirmed 9 library cards, the Biology filter, and
canvas + KaTeX + chart rendering on all new model pages.

---

## 2026-06-15 — Initial MVP build

**Prompt:** "Finish this project according to this PRD file:
E:\GoingGlobal\Code\19-LabVivid\docs\science-interactive-lab-prd.md"

**Changes:**
- Scaffolded a Web-first MVP per the PRD's recommended decision (§22): React 18 +
  TypeScript + Vite, hash routing, KaTeX formulas, and `vite-plugin-pwa`.
  - Tooling/config: `package.json`, `tsconfig*.json`, `vite.config.ts`,
    `index.html`, `.gitignore`, PWA icons (`public/favicon.svg`,
    `public/icon-192.png`, `public/icon-512.png`).
- Defined the shared model runtime contract in `src/types/model.ts` (metadata,
  controls, presets, compute, render, charts, formulas, concepts).
- Implemented the simulation runtime:
  - `src/runtime/useSimulation.ts` — animation loop with play/pause/reset/step,
    deterministic reset, throttled state to React, Canvas rendering.
  - `src/runtime/urlState.ts` — parameter serialization to/from the URL with
    range clamping for graceful shared-link handling.
  - `src/runtime/notes.ts` — local experiment notes + last-model persistence.
- Built the four initial models and registry:
  - `src/models/projectileMotion.ts`, `src/models/ohmsLaw.ts`,
    `src/models/titration.ts`, `src/models/functionTransform.ts`,
    `src/models/canvasUtils.ts`, `src/models/index.ts`.
- Implemented the AI explanation engine `src/ai/explain.ts` — optional,
  non-blocking, grounded strictly in current model state, with an
  OpenAI-compatible remote hook (`window.__LABVIVID_AI__`) and a deterministic
  local fallback.
- Built the UI components: `Stage`, `Controls`, `DataPanel`, `LineChart` (custom
  SVG), `Formula` (KaTeX), `AIPanel`, `NotesPanel`, `ModelCard`.
- Built the pages and shell: `src/pages/LibraryPage.tsx`,
  `src/pages/ModelPage.tsx`, `src/App.tsx`, `src/main.tsx`, `src/index.css`,
  with English/中文 localization (`src/i18n/index.ts`), light/dark themes,
  responsive desktop/mobile layouts, classroom full-screen mode, screenshot
  export, and shareable-link/reset controls.
- Fixed a conditional-hooks crash by splitting `ModelPage` into a route guard +
  inner `ModelView` so simulation hooks always run with a defined model.
- Added `README.md` documenting setup, architecture, PRD coverage, and how to
  enable a real LLM for AI explanations.

**Scope covered:** All MVP must-have features and P0 functional requirements
(FR-001…FR-026), plus nice-to-haves (screenshot export, classroom mode, PWA
offline, bilingual UI). Out-of-scope items per PRD §8.3 (accounts, grading,
low-code editor, marketplace, payments) intentionally deferred.

**Verification:** `tsc -b` clean; `npm run build` succeeds (service worker +
manifest generated); preview server returns HTTP 200 for the page, `sw.js`, and
`manifest.webmanifest`; model math validated (projectile range 40.82 m / max
height 10.20 m; Ohm's I=1.2 A, P=14.4 W; titration V_eq=50 mL, pH 1.48→7.00→
12.30; function g(0)=5); server-render smoke test confirmed library + model page
+ not-found guard render without runtime errors.
