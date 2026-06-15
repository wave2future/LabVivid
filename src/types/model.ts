// Core type definitions for the LabVivid model runtime.
// A model is a self-contained definition of metadata, controls, presets,
// derived computation, rendering, charts, and formulas. The shared runtime
// drives every model through this single contract (PRD §13.3, §17).

export type Subject = 'physics' | 'chemistry' | 'math' | 'biology' | 'engineering';

export type VarValue = number | string | boolean;
export type Variables = Record<string, VarValue>;

export interface ModelMetadata {
  id: string;
  /** i18n key suffix; title/description resolved via t(`model.${id}.title`) */
  title: string;
  titleZh: string;
  subject: Subject;
  description: string;
  descriptionZh: string;
  difficulty: 'elementary' | 'middle-school' | 'high-school' | 'college';
  tags: string[];
  /** accent color used in cards and canvas */
  accent: string;
}

export interface SliderControl {
  type: 'slider';
  key: string;
  label: string;
  labelZh: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
}
export interface ToggleControl {
  type: 'toggle';
  key: string;
  label: string;
  labelZh: string;
}
export interface NumberControl {
  type: 'number';
  key: string;
  label: string;
  labelZh: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
}
export interface SelectControl {
  type: 'select';
  key: string;
  label: string;
  labelZh: string;
  options: { value: string; label: string; labelZh: string }[];
}

export type Control = SliderControl | ToggleControl | NumberControl | SelectControl;

export interface Preset {
  name: string;
  nameZh: string;
  variables: Variables;
}

/** A single named numeric/text output value shown in the data panel. */
export interface DataValue {
  key: string;
  label: string;
  labelZh: string;
  value: number | string;
  unit?: string;
  precision?: number;
}

export interface ChartSeries {
  name: string;
  color: string;
  points: { x: number; y: number }[];
}

export interface ChartSpec {
  title: string;
  titleZh: string;
  xLabel: string;
  yLabel: string;
  series: ChartSeries[];
  /** optional marker (e.g. current position / equivalence point) */
  marker?: { x: number; y: number; label?: string };
}

export interface FormulaSpec {
  tex: string;
  label: string;
  labelZh: string;
}

/** Result of computing a model at a given (variables, time). */
export interface ComputeResult {
  data: DataValue[];
  chart?: ChartSpec;
  /** opaque per-frame render state passed to render() */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: any;
}

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  /** device pixel ratio already applied to ctx scaling */
  dpr: number;
  vars: Variables;
  /** current simulation time in seconds */
  t: number;
  /** computed result for this frame */
  computed: ComputeResult;
  isDark: boolean;
}

export interface ModelDefinition {
  meta: ModelMetadata;
  controls: Control[];
  defaultVariables: Variables;
  presets: Preset[];
  /** Concept notes used to ground AI explanations (PRD §14.1). */
  concepts: string[];
  conceptsZh: string[];
  formulas: FormulaSpec[];
  /** Whether the simulation animates over time (vs. a static graph). */
  animated: boolean;
  /** Whether step-by-step frame execution is supported (FR-008). */
  supportsStep: boolean;
  /** Length of one simulation cycle in seconds (for animated models). */
  duration?(vars: Variables): number;
  /** Pure computation of derived values + chart for a frame. */
  compute(vars: Variables, t: number): ComputeResult;
  /** Draw the simulation frame onto the canvas. */
  render(rc: RenderContext): void;
  /** Suggested questions for the AI panel (FR-022). */
  suggestedQuestions: { en: string; zh: string }[];
}
