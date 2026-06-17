# Changelog

All notable changes to LabVivid are recorded here in reverse chronological order
(newest first). Each entry captures the originating prompt, what changed, and the
date.

---

## 2026-06-17 — Add French, German, Korean, Portuguese

**Prompt:** "Add multilingual support: French, German, Korean, Portuguese"

**Changes:**
- Extended the i18n layer to 7 languages (added `fr`, `de`, `ko`, `pt` to `Lang`
  and the language selector) and translated all UI chrome strings into the four
  new languages (English remains the fallback).
- Added the new languages to the embedded pages' overlay dictionaries (black
  hole, mandelbrot, lorenz, wormhole); the periodic table already supports
  fr/de/ko (pt falls back to English in that table).
- Updated README.
- Note: model-specific text (titles, descriptions, Learn content) currently
  carries en/zh/ja and falls back to English for the four new languages.

---

## 2026-06-17 — Black Hole overlay follows site language

**Prompt:** "Black Hole model multilingual support: Drag to rotate Scroll to zoom"

**Changes:**
- Localized the Black Hole overlay hint ("Drag to rotate · Scroll to zoom") into
  EN/中文/日本語; `public/blackhole.html` reads `?lang=` and sets the hint.
- Marked the black-hole embed as localized so it receives the site language and
  remounts on language change.

---

## 2026-06-17 — Periodic Table: fit to area (no scroll) + follow site language

**Prompts:** "Adjust Periodic Table size to avoid scroll bar … shrink elements to
fit the width" / "Adjust periodic table multilingual with the outer whole site …
change language according to the upper-right of the site."

**Changes (public/periodic-table.html):**
- Made the page a `100vh` flex column with `overflow:hidden`; the grid now fills
  the remaining space with `repeat(18,1fr)` columns and `fr` rows, so all elements
  fit the width and the whole table fits the height with no scrollbars. Tile
  fonts scale with `clamp()`/vw; header/eyebrow/subtitle condensed.
- The table now follows the site's language: it reads `?lang=` (the embed is
  marked localized so it remounts on language change) and applies it through the
  existing translations; its own language selector is hidden.

---

## 2026-06-17 — Reorder: Black Hole first in Physics, Periodic Table first in Chemistry

**Prompt:** "put Black Hole to the first of Physics, put Periodic Table to the
first of CHEMISTRY"

**Changes:**
- Reordered the `models` registry so `blackHole` leads the Physics group and
  `periodicTable` leads the Chemistry group (the sidebar and library preserve the
  registry order within each subject).

---

## 2026-06-17 — Fix localized embeds (?lang=) showing the whole app

**Prompt:** "PeriodicTable.html and blackhole.html display normally, but lorenz,
MandelbrotSet, and wormhole still display the entire website as an embedded page."

**Cause:** the localized embeds load with a `?lang=` query
(`mandelbrot.html?lang=en`). The earlier SW navigation-fallback denylist `/\.html$/`
is anchored at the end, so it matched the query-less embeds (periodic table, black
hole) but NOT the ones with a query — those still fell back to index.html (the
app). Precache also missed because `?lang=` wasn't an ignored URL parameter.

**Fix (vite.config.ts workbox):**
- `navigateFallbackDenylist: [/\.html(?:\?|$)/]` — matches `.html` with or without
  a query string.
- `ignoreURLParametersMatching: [/^lang$/]` — so `mandelbrot.html?lang=en` resolves
  to the precached `mandelbrot.html` (also works offline).

No TSX conversion needed — the embeds were fine; only the SW routing was wrong.

---

## 2026-06-16 — Make Ohm's Law current flow clearly visible

**Prompt:** "Click Ohm's Law Circuit menu model motion not work still exist"

**Context:** verified the animation fix is deployed (live bundle hash matches the
local build) and the render logic is correct, so a frozen circuit on the live
site is a stale cached service worker on the client (needs a hard refresh).

**Changes:**
- Sped up and brightened the Ohm's Law current-flow dots (faster, more dots, soft
  glow) so the motion is unmistakable once the latest build is loaded.

---

## 2026-06-16 — Reset simulation clock on model change (hook-level)

**Prompt:** "Ohm's Law Circuit has the same problem"

**Changes:**
- Added a `useSimulation` effect that resets the animation clock (time → 0) and
  play state (→ model.animated) whenever the model changes. This fixes the
  frozen-until-refresh issue at the source for every animated model (Ohm's Law,
  collisions, pendulum, waves, etc.), independent of how the view is mounted.

---

## 2026-06-16 — Fix animation freezing when switching models via sidebar

**Prompt:** "When clicking 1D Collisions menu, the two cars do not move. Then I
click Pause/Play button, not move either. Only moves when I refresh this page."

**Cause:** navigating between models reused the same `ModelView`, so the
simulation hook kept the previous model's animation clock and play/pause state
(`useSimulation` never reset them on model change). A fresh page load worked
because it remounted everything.

**Fix:** key `ModelView` by `model.meta.id` in `ModelPage` so switching models
fully remounts the view — the animation clock and play state reset exactly like a
refresh.

---

## 2026-06-16 — Fix embedded pages showing the whole app on GitHub Pages

**Prompt:** "The Lorenz Attractor, Wormhole, and Mandelbrot Set models display
normally locally, but on GitHub Pages … instead of displaying the model content,
the entire website is embedded."

**Cause:** the PWA service worker's SPA navigation fallback intercepted the
iframe's request for the standalone `*.html` pages and served the precached
`index.html` (the whole app) instead — only on the deployed site where the SW is
active.

**Changes (vite.config.ts workbox):**
- Added `navigateFallbackDenylist: [/\.html$/]` so the SW never falls back to
  index.html for the embedded standalone pages.
- Widened `globPatterns` to precache the embedded pages (blackhole, periodic-table,
  mandelbrot, lorenz, wormhole) so they load (and work offline) directly.

---

## 2026-06-15 — Add Lorenz Attractor & Wormhole (physics), multilingual

**Prompts:** "physics\\lorenz.html Add lorenz attractor model with multilingual" /
"physics\\wormhole.html Add worm hole model with multilingual"

**Changes:**
- Added **Lorenz Attractor** (chaos / dynamical systems) and **Wormhole**
  (general relativity) under Physics, embedding the self-contained WebGL pages as
  `public/lorenz.html` and `public/wormhole.html`.
- Both embeds are localized via `?lang=` (EN/中文/日本語); their Chinese/English
  overlays now follow the app language. Lorenz's original Chinese overlay was
  translated.
- New models `src/models/lorenz.ts` (with a 2D attractor-projection thumbnail)
  and `src/models/wormhole.ts` (embedding-funnel thumbnail), both with EN/中文/
  日本語 metadata, data, and Learn content.
- `ModelPage` now treats every custom-view model as full-bleed. 50 models total.

---

## 2026-06-15 — Add Mandelbrot Set (math) with multilingual embed

**Prompt:** "E:\\GoingGlobal\\Code\\19-LabVivid\\physics\\MandelbrotSet.html Add
this Mandelbrot Set model (belongs physics or math?). Add multilingual support"

**Changes:**
- Added the Mandelbrot Set under **Mathematics** (it's a complex-number fractal,
  not physics). Embedded the self-contained WebGL explorer as
  `public/mandelbrot.html`.
- Made the embed multilingual: its overlay/zoom readout now switch via a
  `?lang=` param (EN/中文/日本語); `EmbedView` gained a `localize` option that
  passes the app language and remounts the iframe on language change.
- New model `src/models/mandelbrot.ts` with EN/中文/日本語 metadata, data, and
  Learn content, plus a 2D escape-time fractal thumbnail for the library card.
- Full-width layout (like the other embeds); now 48 models total (10 math).

---

## 2026-06-15 — Replace Black Hole with shader simulation (embedded)

**Prompt:** "Black hole effect not so good, change to this one instead (Remove
upperleft Chinese characters): E:\\GoingGlobal\\Code\\19-LabVivid\\blackhole.html"

**Changes:**
- Swapped the Three.js BlackHole3D component for the new raymarched/gravitational-
  lensing shader page, served as `public/blackhole.html` and embedded via an
  iframe. The upper-left overlay's Chinese title/hint was replaced with an English
  hint ("Drag to rotate · Scroll to zoom").
- Generalized embedding into `src/components/EmbedView.tsx` (`embedView(file,
  title)`); the custom-view registry now uses it for both the black hole and the
  periodic table. Removed the unused `BlackHole3D.tsx` and `PeriodicTable.tsx`.
- Black hole now uses the full-width layout (like the periodic table) and has no
  parameter controls; Learn content and reference data are kept.

---

## 2026-06-15 — Fix classroom-mode height for embedded/3D stages

**Prompt:** "periodic table classroom mode display area height too small."

**Changes:**
- In classroom (full-screen) mode the panel now flexes to fill the height and the
  embedded iframe (and 3D mounts) stretch to 100%, so the periodic table — and
  the 3D models — use the full screen instead of a short box. Previously only the
  2D `.stage` had a flex rule.

---

## 2026-06-15 — Full-width layout for the Periodic Table

**Prompt:** "Too small of the model display area for periodic table. Can you just
embed E:\\GoingGlobal\\Code\\19-LabVivid\\PeriodicTable.html file?"

**Changes:**
- The periodic table now uses a full-width, single-column layout (`model-page.full`)
  with a much taller embed (82vh, min 560px) so it is no longer cramped in the
  split column; the Learn/Notes panels flow below in a responsive grid.
- Hid the Formulas panel for models that define none (matches the earlier
  empty-Parameters fix).

---

## 2026-06-15 — Integrate interactive Periodic Table (chemistry)

**Prompt:** "E:\\GoingGlobal\\Code\\19-LabVivid\\PeriodicTable.html Integrate this
Period Table into CHEMISTRY"

**Changes:**
- Added the self-contained interactive 3D periodic table as a static asset
  (`public/periodic-table.html`) and embedded it via `src/components/PeriodicTable.tsx`
  (iframe, base-URL aware so it works under GitHub Pages).
- New chemistry model `src/models/periodicTable.ts` (metadata, data, Learn
  content, EN/中文/日本語, plus a 2D mini-grid thumbnail for the library card);
  registered in the model registry and the custom-view registry.
- `ModelPage` now hides the Parameters panel for models with no controls.
- Now 47 models total (8 chemistry).

---

## 2026-06-15 — Interactive 3D for Solar System & Black Hole

**Prompt:** "solar system and black hole 2d effect is not so good, I want you to
make them interactive 3d"

**Changes:**
- Added Three.js and built interactive WebGL views:
  - `src/components/SolarSystem3D.tsx` — 3D planets on Keplerian orbits, sun
    glow, starfield, Saturn ring, orbit rings toggle.
  - `src/components/BlackHole3D.tsx` — 3D event horizon, wireframe photon sphere,
    and a differentially-rotating, additively-blended accretion disk.
  - `src/three/orbitControls.ts` — dependency-free mouse/touch orbit controls
    (drag to rotate, scroll/pinch to zoom).
- `src/components/custom3d.ts` registry maps these model ids to lazy-loaded 3D
  views; `ModelPage` renders them (in `<Suspense>`) instead of the 2D `<Stage>`,
  so Three.js is code-split and only fetched when a 3D model opens.
- `useSimulation` now recomputes the data panel without a 2D canvas (for custom
  views). Each 3D view has its own play/pause/reset + a controls hint.
- The existing 2D renderers are kept for the library-card thumbnails.

---

## 2026-06-15 — Black hole & solar system simulations

**Prompt:** "Add two more models (black hole simulation, the solar system
simulation) in physics category"

**Changes:**
- `src/models/solarSystem.ts` — Solar System (planets on Keplerian orbits,
  T = a^1.5; adjustable count, time speed, labels; sqrt radial scaling).
- `src/models/blackHole.ts` — Black Hole (Schwarzschild radius Rs = 2GM/c²,
  photon sphere, ISCO, animated glowing accretion disk on a dark field).
- Registered both with Japanese title/description and Learn content (now 46
  models total).

---

## 2026-06-15 — More physics models (RC circuit, friction, heating curve)

**Prompt:** "Add more physics models"

**Changes:**
- `src/models/rcCircuit.ts` — RC circuit charging/discharging (time constant
  τ = RC, exponential V_c curve, animated capacitor).
- `src/models/friction.ts` — Friction on a flat surface (static vs kinetic; the
  block breaks free once the push exceeds μs·N).
- `src/models/heatingCurve.ts` — Heating curve of water (temperature vs heat with
  melting/boiling plateaus and latent heat).
- Registered all three with Japanese title/description and Learn content (now 44
  models total).

---

## 2026-06-15 — More physics models (magnetism, hydraulics, orbits)

**Prompt:** "Add more physics models"

**Changes:**
- `src/models/magneticForce.ts` — Magnetic force on a moving charge (F = qvB,
  circular motion, r = mv/qB; animated with field, velocity & force vectors).
- `src/models/hydraulicPress.ts` — Hydraulic press / Pascal's principle (force
  multiplication by piston-area ratio).
- `src/models/orbit.ts` — Gravitation & circular orbits (v = √(GM/r), Kepler's
  third law; animated planet around a star).
- Registered all three with Japanese title/description and Learn content (now 41
  models total).

---

## 2026-06-15 — GitHub Pages deployment workflow

**Prompt:** "Add yaml file to publish into Github Pages. Then git add and push to
github" / "Give me the deployed GitHub Pages link for preview"

**Changes:**
- Added `.github/workflows/deploy.yml` — a GitHub Actions workflow that builds the
  Vite app and deploys `dist/` to GitHub Pages on every push to `main` (and via
  manual dispatch). Uses `configure-pages` with `enablement: true` so Pages turns
  on automatically. The app already uses relative `base` and hash routing, so it
  works under the project subpath.
- Preview URL: https://wave2future.github.io/LabVivid/

---

## 2026-06-15 — More math & physics models (linear, normal, energy, resistors)

**Prompt:** "Add more math and physics models"

**Changes:**
- Math: `src/models/linearFunction.ts` (y = mx + b — slope, intercepts) and
  `src/models/normalDistribution.ts` (Gaussian bell curve, z-score, ±1σ).
- Physics: `src/models/energyConservation.ts` (KE ⇄ PE in a frictionless bowl,
  energy bars) and `src/models/resistors.ts` (series vs parallel total
  resistance and current).
- Registered all four with Japanese title/description and Learn content (now 38
  models total).

---

## 2026-06-15 — More chemistry models (equilibrium, Beer–Lambert, decay)

**Prompt:** "Add more chemistry models"

**Changes:**
- `src/models/equilibrium.ts` — Chemical Equilibrium (reversible A ⇌ B, K from
  forward/reverse rates, animated approach + concentration chart).
- `src/models/beerLambert.ts` — Beer–Lambert law (A = εcl, transmittance,
  colored cuvette + absorbance-vs-concentration chart).
- `src/models/radioactiveDecay.ts` — Radioactive Decay (half-life, animated
  nuclei grid + N-vs-time decay curve).
- Registered all three with Japanese title/description and Learn content (now
  34 models total; 7 chemistry).

---

## 2026-06-15 — More math & physics models (vectors, exponential, Doppler, lever)

**Prompt:** "Add more math and physics models"

**Changes:**
- Math: `src/models/vectorAddition.ts` (2D head-to-tail vector addition →
  resultant magnitude & direction) and `src/models/exponential.ts` (y = a·bˣ
  growth/decay with doubling time / half-life).
- Physics: `src/models/doppler.ts` (Doppler effect — moving source, animated
  wavefronts, ahead/behind frequencies) and `src/models/lever.ts` (Lever &
  torque — balancing moments about a fulcrum).
- Registered all four with Japanese title/description and Learn content (now 31
  models total).

---

## 2026-06-15 — More math & physics models

**Prompt:** "Add more math and physics models"

**Changes:**
- Math: `src/models/unitCircle.ts` (Unit Circle & Trigonometry — sin/cos/tan,
  projections, sine/cosine chart) and `src/models/quadratic.ts` (Quadratic
  Function — parabola, vertex, roots, discriminant).
- Physics: `src/models/freeFall.ts` (Free Fall with air resistance → terminal
  velocity, v–t chart) and `src/models/buoyancy.ts` (Archimedes' principle —
  float/sink, fraction submerged, buoyant force).
- Registered all four with Japanese title/description and Learn content (now 27
  models total).

---

## 2026-06-15 — More physics models (circular motion, standing waves, Coulomb)

**Prompt:** "Add more Physics models"

**Changes:**
- Added `src/models/circularMotion.ts` — Uniform Circular Motion (centripetal
  acceleration & force, animated object with velocity/force vectors).
- Added `src/models/standingWave.ts` — Standing Waves on a string (harmonics,
  nodes/antinodes, resonant frequencies fₙ = nv/2L).
- Added `src/models/coulomb.ts` — Coulomb's Law (attraction/repulsion, inverse-
  square force vs distance).
- Registered all three with Japanese title/description and Learn content (now
  23 models total).

---

## 2026-06-15 — More biology models

**Prompt:** "Add more biology models"

**Changes:**
- Added `src/models/predatorPrey.ts` — Predator & Prey (Lotka–Volterra) with RK4
  integration and equilibrium-relative initial conditions for stable, bounded
  cycles; animated time series + phase-portrait chart.
- Added `src/models/genetics.ts` — Genetics / Punnett square (monohybrid cross →
  genotype & phenotype ratios, color-coded grid).
- Added `src/models/enzymeKinetics.ts` — Enzyme Kinetics (Michaelis–Menten
  saturation curve, Km/Vmax guides, competitive inhibitor toggle).
- Registered all three with Japanese title/description and Learn content (now 4
  biology models, 20 total).

---

## 2026-06-15 — Automate changelog + commits; project memory

**Prompt:** "For each major modification, automatically write to `CHANGELOG.md`
as required, and automatically commit to GitHub. Also you can write this to
memory."

**Changes:**
- Added `CLAUDE.md` (project memory) with standing working agreements: update
  `CHANGELOG.md` for every major modification and commit + push to GitHub each
  time (the `Stop` hook auto-commits; commit manually if it has not reloaded).
- Going forward, every major change records a changelog entry and is pushed.

---

## 2026-06-15 — More chemistry models

**Prompt:** "Add more chemistry models."

**Changes:**
- Added `src/models/phScale.ts` — pH Scale explorer (strong acid/base
  concentration → pH, with a colored pH scale and tinted beaker).
- Added `src/models/reactionRate.ts` — Reaction Rate via collision theory
  (temperature, concentration, catalyst → Arrhenius relative rate; animated
  particles + rate-vs-temperature chart).
- Registered both; each includes Japanese title/description and Learn content.

---

## 2026-06-15 — Fix Converging Lens object-height scaling

**Prompt:** "For Converging Lens model, changing parameters 'Object height', the
object height does not changed in the graph."

**Changes:**
- The vertical scale auto-normalized to the object height, which canceled out
  any change. Switched to a fixed vertical scale (px per cm) so the object arrow
  visibly grows/shrinks with the height; clamped the image tip to stay on-canvas.

---

## 2026-06-15 — More physics models (collisions, refraction)

**Prompt:** "Add more Physics models"

**Changes:**
- Added `src/models/collisions.ts` — 1D Collisions (momentum + restitution;
  elastic↔inelastic, animated carts).
- Added `src/models/refraction.ts` — Refraction / Snell's law (with total
  internal reflection and critical angle; ray diagram).
- Registered both with Japanese title/description and Learn content.

---

## 2026-06-15 — Model introductions, principles & tips

**Prompt:** "Add introductions, principles, understanding tips, etc. for the
corresponding models."

**Changes:**
- Added a localized `learn` field (intro, principle, tips) to the model contract
  and a `LearnPanel` component shown in a new "Learn" tab/panel.
- Wrote introduction, how-it-works principle, and 3 understanding tips (EN/中文/
  日本語) for every model.

---

## 2026-06-15 — Multilingual support (Japanese)

**Prompt:** "Add multilingual support. Add Japanese support first."

**Changes:**
- Made the i18n layer locale-extensible (`en`/`zh`/`ja`) with English fallback;
  fully translated the UI chrome to Japanese and added a `pick()` helper for
  localized model fields.
- Replaced the language toggle with a 3-way selector (English / 中文 / 日本語).
- Added Japanese titles and descriptions to all models.

---

## 2026-06-15 — Hide AI panel; add physics models

**Prompt:** "Hide AI Explanation, add more physics models."

**Changes:**
- Added a `FEATURES` flag (`src/config.ts`) and hid the AI Explanation panel and
  its tab (easy to re-enable).
- Added three physics models: `inclinedPlane.ts` (friction on a ramp),
  `wave.ts` (transverse wave, v = λf), and `lens.ts` (converging-lens ray
  diagram). Registered all three.

---

## 2026-06-15 — Auto-commit major modifications to GitHub

**Prompt:** "For all major modifications, automatically commit to GitHub."

**Changes:**
- Committed and pushed the prior sidebar + Fractions work to `origin/main`.
- Stopped tracking `tsconfig.app.tsbuildinfo` and ignored `*.tsbuildinfo`.
- Added a `Stop` hook in `.claude/settings.json` that runs
  `.claude/hooks/auto-commit.sh` whenever Claude finishes a turn. The script
  stages all changes, creates a commit, and pushes the current branch to
  `origin` — but only when the working tree has changes. It is resilient: it
  no-ops on a clean tree, never blocks stopping, and treats the push as
  best-effort (a local commit still succeeds if the push fails, e.g. offline).

**Verification:** script pipe-tested for both the commit path and the clean-tree
no-op path; push to `origin/main` confirmed.

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
