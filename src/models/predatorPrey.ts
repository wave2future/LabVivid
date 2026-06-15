// Biology: Predator–Prey dynamics (Lotka–Volterra).
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, label } from './canvasUtils';

const T_MAX = 40;
const DT = 0.04;

function simulate(vars: Variables) {
  const a = vars.preyGrowth as number;    // prey birth rate α
  const b = vars.predation as number;     // predation rate β
  const d = vars.efficiency as number;    // predator growth per prey eaten δ
  const g = vars.predatorDeath as number; // predator death rate γ
  // Start as a modest perturbation from the coexistence equilibrium so the orbit
  // stays bounded for any slider values.
  const xeq = g / d, yeq = a / b;
  let x = Math.max(2, 1.6 * xeq), y = Math.max(1, 0.8 * yeq);

  const dx = (xx: number, yy: number) => a * xx - b * xx * yy;
  const dy = (xx: number, yy: number) => d * xx * yy - g * yy;

  const time: number[] = [], prey: number[] = [], pred: number[] = [];
  for (let t = 0; t <= T_MAX + 1e-9; t += DT) {
    time.push(t); prey.push(x); pred.push(y);
    // RK4 — keeps the Lotka–Volterra orbit nearly closed (Euler would spiral out)
    const k1x = dx(x, y), k1y = dy(x, y);
    const k2x = dx(x + (DT / 2) * k1x, y + (DT / 2) * k1y), k2y = dy(x + (DT / 2) * k1x, y + (DT / 2) * k1y);
    const k3x = dx(x + (DT / 2) * k2x, y + (DT / 2) * k2y), k3y = dy(x + (DT / 2) * k2x, y + (DT / 2) * k2y);
    const k4x = dx(x + DT * k3x, y + DT * k3y), k4y = dy(x + DT * k3x, y + DT * k3y);
    x = Math.max(0, Math.min(5000, x + (DT / 6) * (k1x + 2 * k2x + 2 * k3x + k4x)));
    y = Math.max(0, Math.min(5000, y + (DT / 6) * (k1y + 2 * k2y + 2 * k3y + k4y)));
  }
  return { time, prey, pred };
}

function compute(vars: Variables, t: number): ComputeResult {
  const sim = simulate(vars);
  const idx = Math.min(sim.time.length - 1, Math.max(0, Math.round(t / DT)));
  const curPrey = sim.prey[idx], curPred = sim.pred[idx];

  const phase: { x: number; y: number }[] = sim.prey.map((p, i) => ({ x: p, y: sim.pred[i] }));

  return {
    data: [
      { key: 'prey', label: 'Prey', labelZh: '猎物', value: Math.round(curPrey), precision: 0 },
      { key: 'predator', label: 'Predators', labelZh: '捕食者', value: Math.round(curPred), precision: 0 },
      { key: 'time', label: 'Time', labelZh: '时间', value: t % T_MAX, unit: 't', precision: 1 },
    ],
    chart: {
      title: 'Phase portrait (prey vs predators)', titleZh: '相图（猎物 vs 捕食者）',
      xLabel: 'prey', yLabel: 'predators',
      series: [{ name: 'orbit', color: '#a78bfa', points: phase }],
      marker: { x: curPrey, y: curPred },
    },
    render: { ...sim, idx },
  };
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  const r = computed.render;
  const pad = { l: 40, r: 14, t: 20, b: 30 };
  let maxY = 1;
  for (let i = 0; i < r.prey.length; i++) maxY = Math.max(maxY, r.prey[i], r.pred[i]);
  maxY *= 1.1;
  const toX = (t: number) => pad.l + (t / T_MAX) * (w - pad.l - pad.r);
  const toY = (n: number) => h - pad.b - (n / maxY) * (h - pad.t - pad.b);

  ctx.strokeStyle = p.axis; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, h - pad.b); ctx.lineTo(w - pad.r, h - pad.b);
  ctx.stroke();

  const curve = (arr: number[], color: string) => {
    ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.beginPath();
    for (let i = 0; i <= r.idx; i++) {
      const X = toX(r.time[i]), Y = toY(arr[i]);
      if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
    }
    ctx.stroke();
    // moving dot
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(toX(r.time[r.idx]), toY(arr[r.idx]), 5, 0, Math.PI * 2); ctx.fill();
  };
  curve(r.prey, '#4ade80');
  curve(r.pred, '#f87171');

  label(ctx, `prey ${Math.round(r.prey[r.idx])}`, 12, 18, '#4ade80', '12px system-ui');
  label(ctx, `predators ${Math.round(r.pred[r.idx])}`, 12, 36, '#f87171', '12px system-ui');
}

export const predatorPrey: ModelDefinition = {
  meta: {
    id: 'predator-prey',
    title: 'Predator & Prey',
    titleZh: '捕食者与猎物',
    titleJa: '捕食者と被食者',
    subject: 'biology',
    description: 'Watch predator and prey populations rise and fall in linked cycles (Lotka–Volterra).',
    descriptionZh: '观察捕食者与猎物种群在相互联系的周期中此消彼长（洛特卡-沃尔泰拉模型）。',
    descriptionJa: '捕食者と被食者の個体数が連動して増減する周期を観察します（ロトカ・ヴォルテラ）。',
    difficulty: 'college',
    tags: ['ecology', 'population', 'cycles', 'Lotka-Volterra'],
    accent: '#a78bfa',
  },
  controls: [
    { type: 'slider', key: 'preyGrowth', label: 'Prey growth (α)', labelZh: '猎物增长 (α)', min: 0.2, max: 2, step: 0.05 },
    { type: 'slider', key: 'predation', label: 'Predation rate (β)', labelZh: '捕食率 (β)', min: 0.1, max: 1, step: 0.02 },
    { type: 'slider', key: 'efficiency', label: 'Predator gain (δ)', labelZh: '捕食者获益 (δ)', min: 0.02, max: 0.5, step: 0.01 },
    { type: 'slider', key: 'predatorDeath', label: 'Predator death (γ)', labelZh: '捕食者死亡 (γ)', min: 0.2, max: 2, step: 0.05 },
  ],
  defaultVariables: { preyGrowth: 1.1, predation: 0.4, efficiency: 0.1, predatorDeath: 0.4 },
  presets: [
    { name: 'Classic cycles', nameZh: '经典周期', variables: { preyGrowth: 1.1, predation: 0.4, efficiency: 0.1, predatorDeath: 0.4 } },
    { name: 'Fast prey', nameZh: '猎物繁殖快', variables: { preyGrowth: 1.8, predation: 0.4, efficiency: 0.1, predatorDeath: 0.4 } },
    { name: 'Hungry predators', nameZh: '饥饿的捕食者', variables: { preyGrowth: 1.1, predation: 0.7, efficiency: 0.15, predatorDeath: 0.3 } },
  ],
  concepts: [
    'Prey grow when predators are few; predators grow when prey are plentiful.',
    'The two populations oscillate, with the predator peak lagging behind the prey peak.',
    'Stronger predation lowers prey numbers and changes the cycle.',
    'The cycle traces a closed loop in the prey–predator phase plane.',
  ],
  conceptsZh: [
    '捕食者少时猎物增多；猎物多时捕食者增多。',
    '两个种群振荡，捕食者峰值滞后于猎物峰值。',
    '捕食越强，猎物数量越低，周期也随之改变。',
    '在猎物-捕食者相平面上，周期形成闭合曲线。',
  ],
  formulas: [
    { tex: '\\dfrac{dx}{dt} = \\alpha x - \\beta x y', label: 'Prey', labelZh: '猎物' },
    { tex: '\\dfrac{dy}{dt} = \\delta x y - \\gamma y', label: 'Predators', labelZh: '捕食者' },
  ],
  animated: true,
  supportsStep: true,
  duration: () => T_MAX,
  compute,
  render,
  suggestedQuestions: [
    { en: 'Why does the predator peak come after the prey peak?', zh: '为什么捕食者峰值在猎物峰值之后？' },
    { en: 'What happens if prey grow faster?', zh: '如果猎物繁殖更快会怎样？' },
    { en: 'What does the phase portrait loop mean?', zh: '相图中的闭合曲线意味着什么？' },
  ],
  learn: {
    intro: {
      en: 'Predator–prey models show how two species that depend on each other rise and fall together over time.',
      zh: '捕食者-猎物模型展示了相互依存的两个物种如何随时间一起此消彼长。',
      ja: '捕食者・被食者モデルは、互いに依存する 2 種が時間とともに一緒に増減する様子を示します。',
    },
    principle: {
      en: 'More prey feeds more predators; more predators then eat the prey down, which starves the predators, letting the prey recover — producing endless linked cycles.',
      zh: '猎物多则捕食者增多；捕食者增多又把猎物吃少，导致捕食者挨饿，猎物随之恢复——形成持续的联动周期。',
      ja: '被食者が増えると捕食者が増え、やがて被食者を食べ尽くして捕食者が飢え、被食者が回復する——という連動した周期が続きます。',
    },
    tips: [
      { en: 'Notice the predator curve always peaks just after the prey curve.', zh: '注意捕食者曲线总在猎物曲线之后达到峰值。', ja: '捕食者の曲線は、いつも被食者の少し後にピークになります。' },
      { en: 'Open the chart to see the cycle as a closed loop (phase portrait).', zh: '打开图表，把周期看作一条闭合曲线（相图）。', ja: 'グラフを開くと、周期が閉じたループ（相図）として見えます。' },
      { en: 'Raise predation (β) and watch the prey population crash lower.', zh: '提高捕食率 (β)，看猎物数量跌得更低。', ja: '捕食率 (β) を上げると、被食者の数はより低く落ち込みます。' },
    ],
  },
};
