# LabVivid — Interactive Science Lab

A cross-platform, Web-first interactive science simulation and learning platform.
Students manipulate models, observe outcomes in real time, read the data and
charts, and get grounded explanations. Built as the MVP described in
[`docs/science-interactive-lab-prd.md`](docs/science-interactive-lab-prd.md).

## Features (MVP)

- **Model library** with subject filtering and keyword search, live preview
  thumbnails, difficulty + tags, and a "continue recent experiment" banner.
- **Shared simulation runtime** — one definition format drives every model
  (metadata, controls, presets, compute, render, charts, formulas).
- **Left sidebar navigation** grouping models by subject category + name, with a
  persistent column on desktop and a hamburger-toggled drawer on mobile.
- **Seventeen high-quality models** across four subjects
  - Physics · Projectile Motion, Ohm's Law Circuit, Simple Pendulum, Mass on a
    Spring (SHM), Inclined Plane (friction), Transverse Wave, Converging Lens,
    1D Collisions (momentum), Refraction (Snell's law)
  - Chemistry · Acid–Base Titration, Ideal Gas Law, pH Scale, Reaction Rate
    (collision theory)
  - Mathematics · Function Transformation, Derivative & Tangent, Fractions
  - Biology · Population Growth (exponential vs logistic)
- **Learn panel** for every model — a localized introduction, the underlying
  principle, and practical tips for understanding.
- **Real-time controls** — sliders, toggles, numeric inputs, dropdowns, presets,
  with play / pause / reset / step and deterministic reset.
- **Visualization** — Canvas 2D animation, dependency-free SVG line charts, live
  numeric values, and KaTeX formula references.
- **Experiment state & sharing** — parameters serialize into the URL; copy a
  shareable link that restores the exact configuration. Invalid links are
  clamped to safe ranges and fall back gracefully.
- **AI explanation panel** — optional, non-blocking, grounded in the current
  model state (currently hidden via `FEATURES.aiExplanation` in `src/config.ts`).
- **Experiment notes** — save model + parameters + timestamp + observation to
  local storage; restore or delete any saved run.
- **Cross-platform** — responsive desktop/mobile layouts, touch-friendly
  controls, classroom (full-screen) mode, screenshot export, PWA offline
  support, English / 中文 / 日本語 localization, and light/dark themes.

## Tech stack

React 18 + TypeScript + Vite, `react-router-dom` (hash routing for static
hosting and future desktop/mobile wrappers), KaTeX for formulas, and
`vite-plugin-pwa` for offline support. Charts and renderers are hand-built (no
heavy chart/engine dependency) for predictable performance.

## Getting started

```bash
npm install
npm run dev        # start the dev server
npm run build      # type-check + production build to dist/
npm run preview    # serve the production build
```

## Project structure

```
src/
  types/model.ts        Model definition contract (the runtime's single API)
  models/               The models + registry + canvas helpers
  runtime/              Animation loop, URL state, local notes
  ai/explain.ts         Grounded explanation engine (remote + local fallback)
  components/           Stage, Controls, DataPanel, LineChart, Formula,
                        AIPanel, NotesPanel, ModelCard
  pages/                LibraryPage, ModelPage
  i18n/                 English + Chinese strings
  App.tsx, main.tsx     Shell, routing, theme/lang providers
```

### Adding a model

Implement a `ModelDefinition` (see `src/types/model.ts`) with `compute()` (pure
derived values + chart) and `render()` (Canvas drawing), then register it in
`src/models/index.ts`. No other wiring is required — the library, runtime,
sharing, charts, AI grounding, and notes all work automatically.

## AI explanation

By default the panel uses a **local, deterministic explainer** that references
only the values currently computed by the model — it never invents numbers
(PRD §14.2, FR-021). To connect a real LLM, set a runtime config before the app
loads (e.g. in a small inline script or a wrapper):

```js
window.__LABVIVID_AI__ = {
  endpoint: 'https://your-proxy/v1/chat/completions', // OpenAI-compatible
  apiKey: 'optional-bearer-token',
  model: 'gpt-4o-mini',
};
```

The request uses the grounded prompt shape from PRD §14.3. Any remote failure
falls back to the local explainer, so the panel is always non-blocking.

## PRD coverage

All MVP must-have features and P0 functional requirements (FR-001…FR-026) are
implemented, plus several nice-to-haves: screenshot export, classroom full-screen
mode, PWA offline support, and bilingual UI. Out-of-scope items (accounts,
grading, low-code editor, marketplace, payments) are intentionally deferred per
PRD §8.3.
