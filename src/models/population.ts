// Biology: Logistic Population Growth.
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, drawGrid, label } from './canvasUtils';

function logistic(N0: number, K: number, r: number, t: number) {
  return K / (1 + ((K - N0) / N0) * Math.exp(-r * t));
}

function horizon(N0: number, K: number, r: number) {
  // time to reach 99% of carrying capacity
  const ratio = ((K - N0) / N0) * (0.99 / 0.01);
  return Math.max(4, Math.log(Math.max(ratio, 1.0001)) / r);
}

function compute(vars: Variables, t: number): ComputeResult {
  const r = vars.growthRate as number;
  const K = vars.carryingCapacity as number;
  const N0 = vars.initialPop as number;
  const tMax = horizon(N0, K, r);
  const now = Math.min(t, tMax);
  const N = logistic(N0, K, r, now);

  const logiPts: { x: number; y: number }[] = [];
  const expPts: { x: number; y: number }[] = [];
  const M = 100;
  for (let i = 0; i <= M; i++) {
    const ti = (tMax * i) / M;
    logiPts.push({ x: ti, y: logistic(N0, K, r, ti) });
    expPts.push({ x: ti, y: Math.min(K * 1.4, N0 * Math.exp(r * ti)) });
  }

  return {
    data: [
      { key: 'population', label: 'Population', labelZh: '种群数量', value: Math.round(N), precision: 0 },
      { key: 'capacity', label: 'Carrying capacity', labelZh: '环境容纳量', value: K, precision: 0 },
      { key: 'rate', label: 'Growth rate', labelZh: '增长率', value: r, unit: '/t', precision: 2 },
      { key: 'time', label: 'Time', labelZh: '时间', value: now, unit: 't', precision: 1 },
    ],
    chart: {
      title: 'Population over time', titleZh: '种群随时间变化',
      xLabel: 'time', yLabel: 'N',
      series: [
        { name: 'Exponential', color: '#94a3b8', points: expPts },
        { name: 'Logistic', color: '#4ade80', points: logiPts },
      ],
      marker: { x: now, y: N },
    },
    render: { N0, K, r, tMax, now, N, logiPts },
  };
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  drawGrid(ctx, w, h, Math.max(28, w / 16), p.grid);
  const r = computed.render;
  const pad = { l: 44, r: 16, t: 20, b: 34 };
  const yMax = r.K * 1.15;
  const toX = (t: number) => pad.l + (t / r.tMax) * (w - pad.l - pad.r);
  const toY = (n: number) => h - pad.b - (n / yMax) * (h - pad.t - pad.b);

  // axes
  ctx.strokeStyle = p.axis; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, h - pad.b); ctx.lineTo(w - pad.r, h - pad.b);
  ctx.stroke();

  // carrying capacity line
  ctx.strokeStyle = '#f472b6'; ctx.setLineDash([6, 5]); ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(pad.l, toY(r.K)); ctx.lineTo(w - pad.r, toY(r.K)); ctx.stroke();
  ctx.setLineDash([]);
  label(ctx, `K = ${r.K}`, w - pad.r, toY(r.K) - 6, '#f472b6', '12px system-ui', 'right');

  // full logistic curve (faint)
  ctx.strokeStyle = isDark ? 'rgba(74,222,128,0.3)' : 'rgba(22,163,74,0.3)';
  ctx.lineWidth = 2; ctx.beginPath();
  r.logiPts.forEach((pt: { x: number; y: number }, i: number) => {
    const X = toX(pt.x), Y = toY(pt.y);
    if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
  });
  ctx.stroke();

  // grown portion (solid) up to now + filled area
  ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 3; ctx.beginPath();
  let started = false;
  ctx.fillStyle = isDark ? 'rgba(74,222,128,0.12)' : 'rgba(74,222,128,0.18)';
  ctx.beginPath();
  ctx.moveTo(pad.l, h - pad.b);
  for (const pt of r.logiPts as { x: number; y: number }[]) {
    if (pt.x > r.now) break;
    ctx.lineTo(toX(pt.x), toY(pt.y));
  }
  ctx.lineTo(toX(r.now), h - pad.b);
  ctx.closePath(); ctx.fill();

  ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 3; ctx.beginPath();
  for (const pt of r.logiPts as { x: number; y: number }[]) {
    if (pt.x > r.now) break;
    const X = toX(pt.x), Y = toY(pt.y);
    if (!started) { ctx.moveTo(X, Y); started = true; } else ctx.lineTo(X, Y);
  }
  ctx.stroke();

  // current dot
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath(); ctx.arc(toX(r.now), toY(r.N), 6, 0, Math.PI * 2); ctx.fill();

  label(ctx, `N = ${Math.round(r.N)}`, toX(r.now), toY(r.N) - 12, p.text, 'bold 14px system-ui', 'center');
}

export const population: ModelDefinition = {
  meta: {
    id: 'population-growth',
    title: 'Population Growth',
    titleZh: '种群增长',
    subject: 'biology',
    description: 'Compare exponential and logistic growth, and see how carrying capacity limits a population.',
    descriptionZh: '比较指数增长与逻辑斯蒂增长，观察环境容纳量如何限制种群。',
    difficulty: 'high-school',
    tags: ['ecology', 'logistic', 'growth', 'carrying capacity'],
    accent: '#4ade80',
  },
  controls: [
    { type: 'slider', key: 'growthRate', label: 'Growth rate', labelZh: '增长率', min: 0.1, max: 2, step: 0.05, unit: '/t' },
    { type: 'slider', key: 'carryingCapacity', label: 'Carrying capacity', labelZh: '环境容纳量', min: 50, max: 1000, step: 10 },
    { type: 'slider', key: 'initialPop', label: 'Initial population', labelZh: '初始数量', min: 1, max: 200, step: 1 },
  ],
  defaultVariables: { growthRate: 0.6, carryingCapacity: 500, initialPop: 20 },
  presets: [
    { name: 'Default', nameZh: '默认', variables: { growthRate: 0.6, carryingCapacity: 500, initialPop: 20 } },
    { name: 'Fast growth', nameZh: '快速增长', variables: { growthRate: 1.5, carryingCapacity: 500, initialPop: 20 } },
    { name: 'Near capacity', nameZh: '接近容量', variables: { growthRate: 0.6, carryingCapacity: 300, initialPop: 250 } },
  ],
  concepts: [
    'Exponential growth (N₀eʳᵗ) assumes unlimited resources and rises without bound.',
    'Logistic growth slows as the population nears the carrying capacity K.',
    'The growth rate is fastest near K/2, where the curve is steepest.',
    'A higher growth rate reaches the capacity sooner but the ceiling is still K.',
  ],
  conceptsZh: [
    '指数增长 (N₀eʳᵗ) 假设资源无限，会无限上升。',
    '逻辑斯蒂增长在接近环境容纳量 K 时减慢。',
    '在 K/2 附近增长最快，曲线最陡。',
    '增长率越高越早接近容量，但上限仍是 K。',
  ],
  formulas: [
    { tex: '\\dfrac{dN}{dt} = rN\\left(1 - \\dfrac{N}{K}\\right)', label: 'Logistic model', labelZh: '逻辑斯蒂模型' },
    { tex: 'N(t) = \\dfrac{K}{1 + \\frac{K-N_0}{N_0}e^{-rt}}', label: 'Solution', labelZh: '解' },
  ],
  animated: true,
  supportsStep: true,
  duration: (vars) => horizon(vars.initialPop as number, vars.carryingCapacity as number, vars.growthRate as number),
  compute,
  render,
  suggestedQuestions: [
    { en: 'What does the carrying capacity mean?', zh: '环境容纳量是什么意思？' },
    { en: 'Why does logistic growth slow down?', zh: '为什么逻辑斯蒂增长会减慢？' },
    { en: 'Where is growth fastest?', zh: '增长在哪里最快？' },
  ],
};
