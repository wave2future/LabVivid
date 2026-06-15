// Mathematics: Exponential Growth & Decay — y = a · b^x.
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, drawGrid, label } from './canvasUtils';

const WIN = 6; // x window half-width

function fn(vars: Variables) {
  const a = vars.coefficient as number;
  const b = Math.max(0.05, vars.base as number);
  const x0 = vars.x0 as number;
  const y0 = a * Math.pow(b, x0);
  const growth = b > 1;
  // doubling time / half-life in x-units
  const tHalfDouble = Math.abs(Math.log(b)) > 1e-6 ? Math.log(2) / Math.abs(Math.log(b)) : Infinity;
  return { a, b, x0, y0, growth, tHalfDouble };
}

function compute(vars: Variables): ComputeResult {
  const r = fn(vars);
  return {
    data: [
      { key: 'y0', label: 'y at x₀', labelZh: 'x₀ 处的 y', value: r.y0, precision: 3 },
      { key: 'base', label: 'Factor per step', labelZh: '每步倍率', value: r.b, precision: 2 },
      { key: 'mode', label: 'Behavior', labelZh: '行为', value: r.b > 1 ? 'growth' : r.b < 1 ? 'decay' : 'constant' },
      { key: 'thd', label: r.growth ? 'Doubling interval' : 'Half-life', labelZh: r.growth ? '倍增间隔' : '半衰期', value: r.tHalfDouble, unit: 'x', precision: 2 },
    ],
    render: { ...r },
  };
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  drawGrid(ctx, w, h, Math.max(28, w / 14), p.grid);
  const r = computed.render;
  // pick a y-range that frames the curve over the window
  const yEnds = [r.a * Math.pow(r.b, -WIN), r.a * Math.pow(r.b, WIN), r.a];
  let yMax = Math.max(1, ...yEnds.map((v) => Math.abs(v)));
  yMax = Math.min(yMax, 60); // clamp extreme growth for a readable frame
  const toX = (x: number) => ((x + WIN) / (2 * WIN)) * w;
  const toY = (y: number) => h / 2 - (y / yMax) * (h / 2 - 16);

  // axes
  ctx.strokeStyle = p.axis; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke();

  // curve
  ctx.strokeStyle = '#34d399'; ctx.lineWidth = 3; ctx.beginPath();
  let started = false;
  for (let i = 0; i <= 240; i++) {
    const x = -WIN + (2 * WIN * i) / 240;
    const y = r.a * Math.pow(r.b, x);
    const Yv = toY(y);
    if (Yv < -h || Yv > 2 * h) { started = false; continue; }
    const Xv = toX(x);
    if (!started) { ctx.moveTo(Xv, Yv); started = true; } else ctx.lineTo(Xv, Yv);
  }
  ctx.stroke();

  // current point
  ctx.fillStyle = '#fbbf24';
  const py = Math.max(-20, Math.min(h + 20, toY(r.y0)));
  ctx.beginPath(); ctx.arc(toX(r.x0), py, 6, 0, Math.PI * 2); ctx.fill();

  label(ctx, `y = ${r.a.toFixed(1)} · ${r.b.toFixed(2)}^x`, w / 2, 20, p.text, 'bold 14px system-ui', 'center');
  label(ctx, r.b > 1 ? 'growth' : r.b < 1 ? 'decay' : 'constant', w / 2, h - 12, '#34d399', '12px system-ui', 'center');
}

export const exponential: ModelDefinition = {
  meta: {
    id: 'exponential',
    title: 'Exponential Growth & Decay',
    titleZh: '指数增长与衰减',
    titleJa: '指数関数の増加と減衰',
    subject: 'math',
    description: 'Explore y = a·bˣ: how the base sets explosive growth or gradual decay, with doubling and half-life.',
    descriptionZh: '探索 y = a·bˣ：底数如何决定爆炸式增长或逐渐衰减，并理解倍增与半衰期。',
    descriptionJa: 'y = a·bˣ を探究：底が急成長か緩やかな減衰かを決め、倍加時間と半減期を理解します。',
    difficulty: 'high-school',
    tags: ['exponential', 'growth', 'decay', 'half-life'],
    accent: '#34d399',
  },
  controls: [
    { type: 'slider', key: 'coefficient', label: 'Coefficient a', labelZh: '系数 a', min: -5, max: 5, step: 0.5 },
    { type: 'slider', key: 'base', label: 'Base b', labelZh: '底数 b', min: 0.2, max: 3, step: 0.05 },
    { type: 'slider', key: 'x0', label: 'Evaluate at x₀', labelZh: '在 x₀ 处求值', min: -6, max: 6, step: 0.1 },
  ],
  defaultVariables: { coefficient: 1, base: 1.5, x0: 2 },
  presets: [
    { name: 'Growth', nameZh: '增长', variables: { coefficient: 1, base: 1.5, x0: 2 } },
    { name: 'Decay', nameZh: '衰减', variables: { coefficient: 4, base: 0.6, x0: 2 } },
    { name: 'Doubling', nameZh: '倍增', variables: { coefficient: 1, base: 2, x0: 3 } },
  ],
  concepts: [
    'In y = a·bˣ, a is the starting value at x = 0 and b is the factor applied each step.',
    'If b > 1 the function grows; if 0 < b < 1 it decays toward zero.',
    'Exponential growth eventually outpaces any linear or polynomial growth.',
    'Constant base means a constant doubling time (or half-life for decay).',
  ],
  conceptsZh: [
    '在 y = a·bˣ 中，a 是 x = 0 时的初值，b 是每步施加的倍率。',
    '若 b > 1 则增长；若 0 < b < 1 则向零衰减。',
    '指数增长最终会超过任何线性或多项式增长。',
    '底数恒定意味着倍增时间（或衰减的半衰期）恒定。',
  ],
  formulas: [
    { tex: 'y = a\\,b^{x}', label: 'Exponential', labelZh: '指数函数' },
    { tex: 't_{1/2} = \\dfrac{\\ln 2}{|\\ln b|}', label: 'Half-life / doubling', labelZh: '半衰期 / 倍增' },
  ],
  animated: false,
  supportsStep: false,
  compute,
  render,
  suggestedQuestions: [
    { en: 'What does the base b control?', zh: '底数 b 控制什么？' },
    { en: 'When does the function decay instead of grow?', zh: '什么时候函数衰减而不是增长？' },
    { en: 'What is a doubling time?', zh: '什么是倍增时间？' },
  ],
  learn: {
    intro: {
      en: 'Exponential functions describe anything that multiplies at a steady rate — populations, savings, or radioactive decay.',
      zh: '指数函数描述以恒定比率成倍变化的事物——人口、储蓄或放射性衰变。',
      ja: '指数関数は、一定の割合で増え続ける（または減り続ける）ものを表します——人口・貯蓄・放射性崩壊など。',
    },
    principle: {
      en: 'Each step multiplies by the base b rather than adding a fixed amount. A base above 1 compounds into faster and faster growth; a base below 1 shrinks by a constant fraction each step, approaching zero but never reaching it.',
      zh: '每一步都乘以底数 b，而不是加上固定的量。底数大于 1 时复合成越来越快的增长；底数小于 1 时每步按固定比例缩小，趋近于零但永不到达。',
      ja: '各ステップで一定量を足すのではなく、底 b を掛けます。底が 1 より大きいと加速度的に増え、1 より小さいと毎回一定の割合で縮み、ゼロに近づきますが到達はしません。',
    },
    tips: [
      { en: 'Nudge the base just above 1 and watch growth start slow, then explode.', zh: '把底数调到略大于 1，看增长先慢后爆发。', ja: '底を 1 より少し上にすると、最初は遅く、やがて急増します。' },
      { en: 'Set b below 1 for decay — the half-life stays the same throughout.', zh: '把 b 设为小于 1 形成衰减——半衰期始终不变。', ja: 'b を 1 未満にすると減衰し、半減期は常に一定です。' },
      { en: 'Change a to scale the whole curve up or down (or flip it with a negative a).', zh: '改变 a 让整条曲线放大或缩小（a 为负则翻转）。', ja: 'a を変えると曲線全体が拡大・縮小します（負なら反転）。' },
    ],
  },
};
