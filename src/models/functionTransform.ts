// Mathematics: Function Transformation (PRD §9.4).
// g(x) = a · f(x - h) + k, with an optional vertical reflection.
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, drawGrid, label } from './canvasUtils';

type BaseFn = (x: number) => number;
const BASES: Record<string, { f: BaseFn; tex: string }> = {
  quadratic: { f: (x) => x * x, tex: 'x^2' },
  sine: { f: (x) => Math.sin(x), tex: '\\sin x' },
  absolute: { f: (x) => Math.abs(x), tex: '|x|' },
  cubic: { f: (x) => x * x * x, tex: 'x^3' },
  sqrt: { f: (x) => (x >= 0 ? Math.sqrt(x) : NaN), tex: '\\sqrt{x}' },
};

function transformed(vars: Variables): { base: BaseFn; g: BaseFn } {
  const base = (BASES[String(vars.fn)] ?? BASES.quadratic).f;
  const a0 = vars.a as number;
  const a = (vars.reflect as boolean) ? -a0 : a0;
  const h = vars.h as number;
  const k = vars.k as number;
  const g = (x: number) => a * base(x - h) + k;
  return { base, g };
}

function compute(vars: Variables): ComputeResult {
  const { base, g } = transformed(vars);
  const X = 10;
  const N = 200;
  const basePts: { x: number; y: number }[] = [];
  const gPts: { x: number; y: number }[] = [];
  for (let i = 0; i <= N; i++) {
    const x = -X + (2 * X * i) / N;
    const by = base(x);
    const gy = g(x);
    if (Number.isFinite(by)) basePts.push({ x, y: by });
    if (Number.isFinite(gy)) gPts.push({ x, y: gy });
  }
  const a0 = vars.a as number;
  const a = (vars.reflect as boolean) ? -a0 : a0;
  return {
    data: [
      { key: 'a', label: 'Scale a', labelZh: '缩放 a', value: a, precision: 2 },
      { key: 'h', label: 'Horizontal shift h', labelZh: '水平平移 h', value: vars.h as number, precision: 2 },
      { key: 'k', label: 'Vertical shift k', labelZh: '竖直平移 k', value: vars.k as number, precision: 2 },
      { key: 'g0', label: 'g(0)', labelZh: 'g(0)', value: g(0), precision: 2 },
    ],
    chart: {
      title: 'Function graph', titleZh: '函数图像',
      xLabel: 'x', yLabel: 'y',
      series: [
        { name: 'f(x)', color: '#94a3b8', points: basePts },
        { name: 'g(x)', color: '#f472b6', points: gPts },
      ],
    },
    render: { basePts, gPts, X },
  };
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  drawGrid(ctx, w, h, Math.max(28, w / 16), p.grid);
  const r = computed.render;
  const X = r.X;
  const Y = (X * h) / w; // keep roughly square scale
  const toX = (x: number) => ((x + X) / (2 * X)) * w;
  const toY = (y: number) => h / 2 - (y / Y) * (h / 2);

  // axes
  ctx.strokeStyle = p.axis;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
  ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
  ctx.stroke();
  label(ctx, 'x', w - 12, h / 2 - 6, p.subtle, '12px system-ui', 'right');
  label(ctx, 'y', w / 2 + 8, 14, p.subtle, '12px system-ui', 'left');

  const plot = (pts: { x: number; y: number }[], color: string, width: number, dash: number[]) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.setLineDash(dash);
    ctx.beginPath();
    let started = false;
    for (const pt of pts) {
      const Yv = toY(pt.y);
      if (Yv < -h || Yv > 2 * h) { started = false; continue; } // skip off-screen
      const Xv = toX(pt.x);
      if (!started) { ctx.moveTo(Xv, Yv); started = true; }
      else ctx.lineTo(Xv, Yv);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  };

  plot(r.basePts, isDark ? 'rgba(148,163,184,0.7)' : 'rgba(100,116,139,0.7)', 2, [6, 5]); // base dashed
  plot(r.gPts, '#f472b6', 3, []); // transformed solid

  label(ctx, 'f(x) (base)', 12, 18, p.subtle, '12px system-ui');
  label(ctx, 'g(x) (transformed)', 12, 36, '#f472b6', '12px system-ui');
}

export const functionTransform: ModelDefinition = {
  meta: {
    id: 'function-transform',
    title: 'Function Transformation',
    titleZh: '函数变换',
    titleJa: '関数の変換',
    subject: 'math',
    description: 'See how shifting, scaling, and reflecting change the graph of a function: g(x) = a·f(x−h)+k.',
    descriptionZh: '观察平移、缩放和翻转如何改变函数图像：g(x) = a·f(x−h)+k。',
    descriptionJa: '平行移動・拡大縮小・反転がグラフをどう変えるかを見ます：g(x) = a·f(x−h)+k。',
    difficulty: 'high-school',
    tags: ['functions', 'translation', 'scaling', 'reflection'],
    accent: '#f472b6',
  },
  controls: [
    {
      type: 'select', key: 'fn', label: 'Base function', labelZh: '基函数',
      options: [
        { value: 'quadratic', label: 'x²', labelZh: 'x²' },
        { value: 'sine', label: 'sin x', labelZh: 'sin x' },
        { value: 'absolute', label: '|x|', labelZh: '|x|' },
        { value: 'cubic', label: 'x³', labelZh: 'x³' },
        { value: 'sqrt', label: '√x', labelZh: '√x' },
      ],
    },
    { type: 'slider', key: 'a', label: 'Scale (a)', labelZh: '缩放 (a)', min: -3, max: 3, step: 0.1 },
    { type: 'slider', key: 'h', label: 'Horizontal shift (h)', labelZh: '水平平移 (h)', min: -6, max: 6, step: 0.1 },
    { type: 'slider', key: 'k', label: 'Vertical shift (k)', labelZh: '竖直平移 (k)', min: -6, max: 6, step: 0.1 },
    { type: 'toggle', key: 'reflect', label: 'Reflect over x-axis', labelZh: '关于 x 轴翻转' },
  ],
  defaultVariables: { fn: 'quadratic', a: 1, h: 0, k: 0, reflect: false },
  presets: [
    { name: 'Identity', nameZh: '原函数', variables: { fn: 'quadratic', a: 1, h: 0, k: 0, reflect: false } },
    { name: 'Shift right + up', nameZh: '右移上移', variables: { fn: 'quadratic', a: 1, h: 2, k: 3, reflect: false } },
    { name: 'Stretch + flip', nameZh: '拉伸翻转', variables: { fn: 'quadratic', a: 2, h: 0, k: 0, reflect: true } },
    { name: 'Sine wave', nameZh: '正弦波', variables: { fn: 'sine', a: 2, h: 1, k: 0, reflect: false } },
  ],
  concepts: [
    'h shifts the graph horizontally; positive h moves it right.',
    'k shifts the graph vertically; positive k moves it up.',
    '|a| > 1 stretches vertically, |a| < 1 compresses, negative a flips it.',
    'Transformations combine: g(x) = a·f(x−h)+k.',
  ],
  conceptsZh: [
    'h 控制水平平移；h 为正时图像右移。',
    'k 控制竖直平移；k 为正时图像上移。',
    '|a|>1 竖直拉伸，|a|<1 压缩，a 为负则翻转。',
    '变换可以组合：g(x) = a·f(x−h)+k。',
  ],
  formulas: [{ tex: 'g(x) = a\\,f(x - h) + k', label: 'General transform', labelZh: '一般变换' }],
  animated: false,
  supportsStep: false,
  compute,
  render,
  suggestedQuestions: [
    { en: 'What does changing h do to the graph?', zh: '改变 h 会对图像有什么影响？' },
    { en: 'How does a negative scale factor change the curve?', zh: '负的缩放因子如何改变曲线？' },
    { en: 'What is the difference between h and k?', zh: 'h 和 k 有什么区别？' },
  ],
  learn: {
    intro: {
      en: 'Function transformation shows how changing a few numbers shifts, stretches, or flips the graph of a function.',
      zh: '函数变换展示了改变几个数值如何对函数图像进行平移、伸缩或翻转。',
      ja: '関数の変換は、いくつかの数を変えるだけでグラフが平行移動・拡大縮小・反転する様子を示します。',
    },
    principle: {
      en: 'In g(x) = a·f(x−h)+k, h moves the graph horizontally, k moves it vertically, and a scales it (negative a flips it).',
      zh: '在 g(x) = a·f(x−h)+k 中，h 使图像水平移动，k 使其竖直移动，a 进行缩放（a 为负则翻转）。',
      ja: 'g(x) = a·f(x−h)+k では、h が左右、k が上下に動かし、a が拡大縮小します（a が負なら反転）。',
    },
    tips: [
      { en: 'Change one parameter at a time to isolate its effect.', zh: '一次只改变一个参数，单独观察它的作用。', ja: '一度に 1 つだけ変えると、その効果が分かりやすくなります。' },
      { en: 'Positive h moves the graph right, not left — watch carefully.', zh: 'h 为正时图像向右移（而非向左），注意观察。', ja: 'h が正だとグラフは（左ではなく）右に動きます。' },
      { en: 'Compare g(x) with the dashed base curve f(x) to see the change.', zh: '把 g(x) 和虚线的基函数 f(x) 比较，看出变化。', ja: '破線の元の曲線 f(x) と比べると変化が分かります。' },
    ],
  },
};
