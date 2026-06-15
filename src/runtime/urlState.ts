// Experiment state serialization to/from the URL (FR-015..017).
// Format: #/model/<id>?v=<base64-json-of-variables>
import type { Variables, ModelDefinition, Control } from '../types/model';

export function encodeVariables(vars: Variables): string {
  try {
    const json = JSON.stringify(vars);
    return btoa(encodeURIComponent(json));
  } catch {
    return '';
  }
}

export function decodeVariables(encoded: string): Variables | null {
  try {
    const json = decodeURIComponent(atob(encoded));
    const obj = JSON.parse(json);
    if (obj && typeof obj === 'object') return obj as Variables;
    return null;
  } catch {
    return null;
  }
}

function controlFor(model: ModelDefinition, key: string): Control | undefined {
  return model.controls.find((c) => c.key === key);
}

/** Clamp/validate incoming variables against the model's control ranges
 *  so shared links fail gracefully (PRD §11.3). */
export function sanitizeVariables(
  model: ModelDefinition,
  incoming: Variables | null
): Variables {
  const result: Variables = { ...model.defaultVariables };
  if (!incoming) return result;
  for (const key of Object.keys(model.defaultVariables)) {
    if (!(key in incoming)) continue;
    const ctrl = controlFor(model, key);
    const raw = incoming[key];
    if (!ctrl) continue;
    if (ctrl.type === 'slider' || ctrl.type === 'number') {
      const n = Number(raw);
      if (Number.isFinite(n)) {
        result[key] = Math.min(ctrl.max, Math.max(ctrl.min, n));
      }
    } else if (ctrl.type === 'toggle') {
      result[key] = Boolean(raw);
    } else if (ctrl.type === 'select') {
      if (ctrl.options.some((o) => o.value === raw)) result[key] = String(raw);
    }
  }
  return result;
}

export function buildShareUrl(modelId: string, vars: Variables): string {
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#/model/${modelId}?v=${encodeVariables(vars)}`;
}
