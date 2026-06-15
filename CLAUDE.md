# LabVivid — project memory

LabVivid is a Web-first interactive science simulation platform (React 18 +
TypeScript + Vite, hash routing, KaTeX, PWA). See `docs/science-interactive-lab-prd.md`
for the PRD and `README.md` for setup and architecture.

## Standing working agreements (always follow)

1. **Changelog on every major modification.** For each meaningful change, add a
   new entry at the TOP of `CHANGELOG.md` (reverse chronological) containing: the
   originating user prompt, a short description of what changed, and the date.
2. **Commit & push every major modification to GitHub.** Stage, commit, and push
   to `origin` (current branch, `main`). A `Stop` hook
   (`.claude/hooks/auto-commit.sh`) auto-commits + pushes whenever a turn ends;
   if it has not fired (e.g. the settings watcher needs a `/hooks` reload), commit
   manually so nothing is lost. Commit messages end with the standard
   `Co-Authored-By` trailer.
3. Keep `tsc -b` clean and `npm run build` passing before committing.

## Architecture quick reference

- `src/types/model.ts` — the `ModelDefinition` contract every model implements
  (metadata, controls, presets, compute, render, charts, formulas, concepts,
  `learn`). Localized fields: English + `*Zh`; optional `*Ja`/`titleJa` etc.
- `src/models/` — one file per model + `index.ts` registry. Add a model by
  implementing `ModelDefinition` and registering it; the library, sidebar,
  sharing, charts, Learn panel, and i18n pick it up automatically.
- `src/i18n/index.ts` — locale-extensible strings (`en`/`zh`/`ja`); `translate()`
  for UI chrome and `pick()` for localized model fields (English fallback).
- `src/components/`, `src/pages/` — UI. `src/config.ts` has feature flags
  (e.g. `aiExplanation` is currently off — the AI panel is hidden).

## Verifying changes without a browser

- Type/build: `npx tsc -b` then `npm run build`.
- Model math: bundle a tiny script with `npx esbuild <t>.mjs --bundle
  --platform=node --format=cjs --outfile=<o>.cjs` and run it.
- Render/SSR: `react-dom/server` + `StaticRouter` (polyfill `window`/`localStorage`)
  to confirm pages render without runtime errors.

## Notes

- 17 models across physics, chemistry, math, biology.
- `jq` and `gh` are NOT installed here; use Node for JSON and plain `git` for pushes.
- `*.tsbuildinfo` is gitignored.
