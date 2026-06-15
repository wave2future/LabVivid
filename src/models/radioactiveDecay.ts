// Chemistry / Nuclear: Radioactive Decay (half-life).
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, label } from './canvasUtils';

function decay(vars: Variables) {
  const half = vars.halfLife as number;
  const N0 = vars.initial as number;
  const tMax = half * 4;
  const N = (t: number) => N0 * Math.pow(0.5, t / half);
  return { half, N0, tMax, N };
}

function compute(vars: Variables, t: number): ComputeResult {
  const r = decay(vars);
  const tt = t % r.tMax;
  const n = r.N(tt);

  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= 100; i++) {
    const ti = (r.tMax * i) / 100;
    points.push({ x: ti, y: r.N(ti) });
  }

  return {
    data: [
      { key: 'half', label: 'Half-life', labelZh: '半衰期', value: r.half, unit: 's', precision: 1 },
      { key: 'remaining', label: 'Nuclei remaining', labelZh: '剩余原子核', value: Math.round(n), precision: 0 },
      { key: 'fraction', label: 'Fraction remaining', labelZh: '剩余比例', value: (n / r.N0) * 100, unit: '%', precision: 1 },
      { key: 'elapsed', label: 'Elapsed time', labelZh: '已用时间', value: tt, unit: 's', precision: 1 },
    ],
    chart: {
      title: 'Nuclei remaining vs time', titleZh: '剩余原子核-时间',
      xLabel: 't (s)', yLabel: 'N',
      series: [{ name: 'N', color: '#f59e0b', points }],
      marker: { x: tt, y: n },
    },
    render: { ...r, n, tt },
  };
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  const r = computed.render;

  // dot grid representing nuclei
  const total = Math.min(200, r.N0);
  const remaining = Math.round((r.n / r.N0) * total);
  const cols = Math.ceil(Math.sqrt(total * (w / h)));
  const rows = Math.ceil(total / cols);
  const pad = 30;
  const cw = (w - pad * 2) / cols, ch = (h - pad * 2 - 24) / rows;
  const rad = Math.max(2.5, Math.min(cw, ch) * 0.3);

  for (let i = 0; i < total; i++) {
    const col = i % cols, row = Math.floor(i / cols);
    const x = pad + col * cw + cw / 2, y = pad + row * ch + ch / 2;
    ctx.fillStyle = i < remaining ? '#f59e0b' : (isDark ? 'rgba(100,116,139,0.3)' : 'rgba(148,163,184,0.4)');
    ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();
  }

  // half-life ticks along the bottom
  label(ctx, `${Math.round(r.n)} of ${r.N0} remaining  ·  t = ${r.tt.toFixed(1)} s`,
    w / 2, h - 10, p.text, 'bold 13px system-ui', 'center');
}

export const radioactiveDecay: ModelDefinition = {
  meta: {
    id: 'radioactive-decay',
    title: 'Radioactive Decay',
    titleZh: '放射性衰变',
    titleJa: '放射性崩壊',
    subject: 'chemistry',
    description: 'Watch unstable nuclei decay and see how the half-life sets a steady, exponential countdown.',
    descriptionZh: '观察不稳定原子核衰变，看半衰期如何决定稳定的指数式衰减。',
    descriptionJa: '不安定な原子核が崩壊する様子を観察し、半減期が一定の指数的減少を決めることを見ます。',
    difficulty: 'high-school',
    tags: ['nuclear', 'half-life', 'decay', 'exponential'],
    accent: '#f59e0b',
  },
  controls: [
    { type: 'slider', key: 'halfLife', label: 'Half-life', labelZh: '半衰期', min: 1, max: 20, step: 0.5, unit: 's' },
    { type: 'slider', key: 'initial', label: 'Initial nuclei', labelZh: '初始原子核数', min: 50, max: 1000, step: 50 },
  ],
  defaultVariables: { halfLife: 5, initial: 400 },
  presets: [
    { name: 'Default', nameZh: '默认', variables: { halfLife: 5, initial: 400 } },
    { name: 'Short half-life', nameZh: '短半衰期', variables: { halfLife: 2, initial: 400 } },
    { name: 'Long half-life', nameZh: '长半衰期', variables: { halfLife: 15, initial: 400 } },
  ],
  concepts: [
    'Each half-life, exactly half of the remaining nuclei decay.',
    'Decay is random for any single nucleus but predictable for large numbers.',
    'After n half-lives, the fraction remaining is (1/2)ⁿ.',
    'The half-life is constant — it never speeds up or slows down.',
  ],
  conceptsZh: [
    '每经过一个半衰期，剩余原子核恰好衰变一半。',
    '单个原子核的衰变是随机的，但大量原子核的行为可预测。',
    '经过 n 个半衰期后，剩余比例为 (1/2)ⁿ。',
    '半衰期是恒定的——既不会加快也不会减慢。',
  ],
  formulas: [
    { tex: 'N(t) = N_0 \\left(\\tfrac{1}{2}\\right)^{t / t_{1/2}}', label: 'Decay law', labelZh: '衰变定律' },
  ],
  animated: true,
  supportsStep: true,
  duration: (vars) => (vars.halfLife as number) * 4,
  compute,
  render,
  suggestedQuestions: [
    { en: 'What is a half-life?', zh: '什么是半衰期？' },
    { en: 'How much is left after three half-lives?', zh: '经过三个半衰期后还剩多少？' },
    { en: 'Why is decay called exponential?', zh: '为什么衰变被称为指数式的？' },
  ],
  learn: {
    intro: {
      en: 'Radioactive decay is the random breakdown of unstable atomic nuclei, measured by the half-life.',
      zh: '放射性衰变是不稳定原子核的随机分解，用半衰期来衡量。',
      ja: '放射性崩壊は不安定な原子核がランダムに壊れる現象で、半減期で測ります。',
    },
    principle: {
      en: 'Although you cannot predict when any single nucleus decays, a huge population always loses half of whatever remains in one half-life. Repeating that gives the smooth exponential curve N = N₀(1/2)^(t/t½).',
      zh: '虽然无法预测单个原子核何时衰变，但庞大的原子核群体总是在一个半衰期内损失剩余量的一半。不断重复就得到平滑的指数曲线 N = N₀(1/2)^(t/t½)。',
      ja: '個々の原子核がいつ崩壊するかは予測できませんが、大量の集団は 1 半減期ごとに残りの半分を必ず失います。これを繰り返すと、なめらかな指数曲線 N = N₀(1/2)^(t/t½) になります。',
    },
    tips: [
      { en: 'Count how many dots remain after one, two, and three half-lives.', zh: '数一数经过一、二、三个半衰期后还剩多少个点。', ja: '1・2・3 半減期後に残る点の数を数えてみましょう。' },
      { en: 'A shorter half-life empties the sample much faster.', zh: '半衰期越短，样品衰减得越快。', ja: '半減期が短いほど、試料は速く減っていきます。' },
      { en: 'The fraction never quite reaches zero — it keeps halving.', zh: '剩余比例永远不会真正到零——它一直在减半。', ja: '残りの割合は決してゼロにならず、半分ずつ減り続けます。' },
    ],
  },
};
