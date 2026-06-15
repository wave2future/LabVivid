// Mathematics: Derivative & Tangent Line Explorer.
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, drawGrid, label } from './canvasUtils';

type Fn = (x: number) => number;
const BASES: Record<string, { f: Fn; tex: string }> = {
  quadratic: { f: (x) => 0.25 * x * x, tex: '0.25x^2' },
  sine: { f: (x) => 3 * Math.sin(x), tex: '3\\sin x' },
  cubic: { f: (x) => 0.05 * x * x * x, tex: '0.05x^3' },
  exp: { f: (x) => Math.exp(0.4 * x) - 1, tex: 'e^{0.4x} - 1' },
};

const WIN = 7; // x window half-width

function compute(vars: Variables): ComputeResult {
  const base = (BASES[String(vars.fn)] ?? BASES.quadratic).f;
  const x0 = vars.x0 as number;
  const hh = 1e-4;
  const slope = (base(x0 + hh) - base(x0 - hh)) / (2 * hh);
  const y0 = base(x0);

  const curve: { x: number; y: number }[] = [];
  const tangent: { x: number; y: number }[] = [];
  const N = 200;
  for (let i = 0; i <= N; i++) {
    const x = -WIN + (2 * WIN * i) / N;
    const y = base(x);
    if (Number.isFinite(y)) curve.push({ x, y });
    tangent.push({ x, y: y0 + slope * (x - x0) });
  }

  return {
    data: [
      { key: 'x0', label: 'x₀', labelZh: 'x₀', value: x0, precision: 2 },
      { key: 'fx0', label: 'f(x₀)', labelZh: 'f(x₀)', value: y0, precision: 2 },
      { key: 'slope', label: "f'(x₀) (slope)", labelZh: "f'(x₀)（斜率）", value: slope, precision: 2 },
    ],
    chart: {
      title: 'Function and tangent line', titleZh: '函数与切线',
      xLabel: 'x', yLabel: 'y',
      series: [
        { name: 'f(x)', color: '#fb7185', points: curve },
        { name: 'tangent', color: '#38bdf8', points: tangent },
      ],
      marker: { x: x0, y: y0 },
    },
    render: { curve, tangent, x0, y0, slope },
  };
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  drawGrid(ctx, w, h, Math.max(28, w / 16), p.grid);
  const r = computed.render;
  const Y = (WIN * h) / w;
  const toX = (x: number) => ((x + WIN) / (2 * WIN)) * w;
  const toY = (y: number) => h / 2 - (y / Y) * (h / 2);

  // axes
  ctx.strokeStyle = p.axis; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
  ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
  ctx.stroke();

  const plot = (pts: { x: number; y: number }[], color: string, lw: number) => {
    ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.beginPath();
    let started = false;
    for (const pt of pts) {
      const Yv = toY(pt.y);
      if (Yv < -h || Yv > 2 * h) { started = false; continue; }
      const Xv = toX(pt.x);
      if (!started) { ctx.moveTo(Xv, Yv); started = true; } else ctx.lineTo(Xv, Yv);
    }
    ctx.stroke();
  };

  plot(r.tangent, '#38bdf8', 2);
  plot(r.curve, '#fb7185', 3);

  // point of tangency
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath(); ctx.arc(toX(r.x0), toY(r.y0), 6, 0, Math.PI * 2); ctx.fill();

  label(ctx, `slope f'(x₀) = ${r.slope.toFixed(2)}`, 12, 20, '#38bdf8', '13px system-ui');
  label(ctx, 'f(x)', 12, 38, '#fb7185', '12px system-ui');
}

export const derivative: ModelDefinition = {
  meta: {
    id: 'derivative-tangent',
    title: 'Derivative & Tangent',
    titleZh: '导数与切线',
    titleJa: '微分と接線',
    subject: 'math',
    description: 'Slide a point along a curve and watch the tangent line and its slope — the derivative.',
    descriptionZh: '沿曲线移动一个点，观察切线及其斜率——也就是导数。',
    descriptionJa: '曲線上の点を動かし、接線とその傾き（微分）を観察します。',
    difficulty: 'high-school',
    tags: ['calculus', 'derivative', 'slope', 'tangent'],
    accent: '#fb7185',
  },
  controls: [
    {
      type: 'select', key: 'fn', label: 'Function', labelZh: '函数',
      options: [
        { value: 'quadratic', label: '0.25x²', labelZh: '0.25x²' },
        { value: 'sine', label: '3 sin x', labelZh: '3 sin x' },
        { value: 'cubic', label: '0.05x³', labelZh: '0.05x³' },
        { value: 'exp', label: 'eˣ', labelZh: 'eˣ' },
      ],
    },
    { type: 'slider', key: 'x0', label: 'Point x₀', labelZh: '点 x₀', min: -6, max: 6, step: 0.1 },
  ],
  defaultVariables: { fn: 'quadratic', x0: 1.5 },
  presets: [
    { name: 'Parabola', nameZh: '抛物线', variables: { fn: 'quadratic', x0: 1.5 } },
    { name: 'Sine peak', nameZh: '正弦峰', variables: { fn: 'sine', x0: 0 } },
    { name: 'Cubic inflection', nameZh: '三次拐点', variables: { fn: 'cubic', x0: 0 } },
  ],
  concepts: [
    'The derivative f′(x₀) is the slope of the tangent line at x₀.',
    'Where the curve rises the slope is positive; where it falls the slope is negative.',
    'At a peak or valley (local extremum) the slope is zero.',
    'The slope is estimated here numerically with a small symmetric difference.',
  ],
  conceptsZh: [
    '导数 f′(x₀) 是 x₀ 处切线的斜率。',
    '曲线上升时斜率为正，下降时为负。',
    '在极大或极小值处斜率为零。',
    '这里用对称差商数值估计斜率。',
  ],
  formulas: [
    { tex: "f'(x_0) = \\lim_{h\\to 0}\\dfrac{f(x_0+h)-f(x_0)}{h}", label: 'Derivative', labelZh: '导数' },
    { tex: 'y = f(x_0) + f\'(x_0)(x - x_0)', label: 'Tangent line', labelZh: '切线' },
  ],
  animated: false,
  supportsStep: false,
  compute,
  render,
  suggestedQuestions: [
    { en: 'What does the slope tell me about the function?', zh: '斜率说明了函数的什么？' },
    { en: 'Where is the slope zero?', zh: '斜率在哪里为零？' },
    { en: 'Why is the slope negative on the left side?', zh: '为什么左侧斜率为负？' },
  ],
  learn: {
    intro: {
      en: 'The derivative measures how fast a function is changing at a point — the slope of its tangent line.',
      zh: '导数衡量函数在某点的变化快慢——也就是切线的斜率。',
      ja: '微分は、関数がある点でどれだけ速く変化しているか（接線の傾き）を表します。',
    },
    principle: {
      en: 'Zoom in far enough and any smooth curve looks straight; that local slope is the derivative, positive where the curve rises and zero at peaks and valleys.',
      zh: '放大到足够近，任何光滑曲线都近似为直线；这个局部斜率就是导数，曲线上升处为正，在峰谷处为零。',
      ja: '十分に拡大すると、なめらかな曲線は直線に見えます。その局所的な傾きが微分で、上りで正、山や谷でゼロです。',
    },
    tips: [
      { en: 'Slide the point to a peak or valley to find where the slope is zero.', zh: '把点滑到峰或谷，找出斜率为零的位置。', ja: '点を山や谷に動かすと、傾きがゼロになる場所が分かります。' },
      { en: 'On a downhill section the slope (and derivative) is negative.', zh: '在下坡段，斜率（导数）为负。', ja: '下り坂では傾き（微分）は負になります。' },
      { en: 'Switch functions to compare how their slopes behave.', zh: '切换函数，比较它们的斜率行为。', ja: '関数を切り替えて、傾きの振る舞いを比べましょう。' },
    ],
  },
};
