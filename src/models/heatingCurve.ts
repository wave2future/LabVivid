// Physics / Thermodynamics: Heating Curve of water (phase changes).
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, label } from './canvasUtils';

// Per-gram constants for water.
const C_ICE = 2.1, LF = 334, C_WATER = 4.18, LV = 2260, C_STEAM = 2.0;
const T_START = -20, T_MELT = 0, T_BOIL = 100, T_END = 140;

function thermo(vars: Variables) {
  const m = vars.mass as number;
  const P = vars.power as number;
  const q1 = m * C_ICE * (T_MELT - T_START);
  const q2 = q1 + m * LF;
  const q3 = q2 + m * C_WATER * (T_BOIL - T_MELT);
  const q4 = q3 + m * LV;
  const q5 = q4 + m * C_STEAM * (T_END - T_BOIL);
  return { m, P, q1, q2, q3, q4, q5 };
}

function tempAt(Q: number, s: ReturnType<typeof thermo>) {
  if (Q <= s.q1) return { T: T_START + Q / (s.m * C_ICE), phase: 'solid' };
  if (Q <= s.q2) return { T: T_MELT, phase: 'melting' };
  if (Q <= s.q3) return { T: T_MELT + (Q - s.q2) / (s.m * C_WATER), phase: 'liquid' };
  if (Q <= s.q4) return { T: T_BOIL, phase: 'boiling' };
  return { T: Math.min(T_END, T_BOIL + (Q - s.q4) / (s.m * C_STEAM)), phase: 'gas' };
}

function compute(vars: Variables, t: number): ComputeResult {
  const s = thermo(vars);
  const totalTime = s.q5 / s.P;
  const tt = t % totalTime;
  const Q = s.P * tt;
  const cur = tempAt(Q, s);
  return {
    data: [
      { key: 'temp', label: 'Temperature', labelZh: '温度', value: cur.T, unit: '°C', precision: 1 },
      { key: 'phase', label: 'Phase', labelZh: '物态', value: cur.phase },
      { key: 'heat', label: 'Heat added', labelZh: '已加热量', value: Q / 1000, unit: 'kJ', precision: 1 },
      { key: 'total', label: 'Heat to vaporize all', labelZh: '全部汽化所需热量', value: s.q5 / 1000, unit: 'kJ', precision: 1 },
    ],
    render: { ...s, Q, cur, totalTime },
  };
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  const r = computed.render;
  const pad = { l: 44, r: 16, t: 26, b: 30 };
  const toX = (Q: number) => pad.l + (Q / r.q5) * (w - pad.l - pad.r);
  const toY = (T: number) => h - pad.b - ((T - T_START) / (T_END - T_START)) * (h - pad.t - pad.b);

  // axes
  ctx.strokeStyle = p.axis; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, h - pad.b); ctx.lineTo(w - pad.r, h - pad.b); ctx.stroke();
  label(ctx, 'heat added →', (w + pad.l) / 2, h - 8, p.subtle, '11px system-ui', 'center');
  // 0°C and 100°C guides
  ctx.strokeStyle = p.grid; ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
  for (const T of [0, 100]) { ctx.beginPath(); ctx.moveTo(pad.l, toY(T)); ctx.lineTo(w - pad.r, toY(T)); ctx.stroke(); label(ctx, `${T}°`, pad.l - 6, toY(T) + 4, p.subtle, '10px system-ui', 'right'); }
  ctx.setLineDash([]);

  // curve
  ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 3; ctx.beginPath();
  for (let i = 0; i <= 200; i++) {
    const Q = (r.q5 * i) / 200;
    const X = toX(Q), Y = toY(tempAt(Q, r).T);
    if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
  }
  ctx.stroke();

  // current marker
  ctx.fillStyle = '#60a5fa';
  ctx.beginPath(); ctx.arc(toX(r.Q), toY(r.cur.T), 6, 0, Math.PI * 2); ctx.fill();

  label(ctx, `${r.cur.T.toFixed(0)}°C · ${r.cur.phase}`, w / 2, pad.t - 8, p.text, 'bold 15px system-ui', 'center');
}

export const heatingCurve: ModelDefinition = {
  meta: {
    id: 'heating-curve',
    title: 'Heating Curve',
    titleZh: '加热曲线',
    titleJa: '加熱曲線',
    subject: 'physics',
    description: 'Heat ice into steam and watch the temperature pause at each phase change (melting and boiling).',
    descriptionZh: '把冰加热成水蒸气，观察温度在每次相变（熔化和沸腾）时的停顿。',
    descriptionJa: '氷を水蒸気まで加熱し、相変化（融解・沸騰）のたびに温度が止まる様子を観察します。',
    difficulty: 'high-school',
    tags: ['thermodynamics', 'heat', 'phase change', 'latent heat'],
    accent: '#f59e0b',
  },
  controls: [
    { type: 'slider', key: 'mass', label: 'Mass of water', labelZh: '水的质量', min: 10, max: 200, step: 10, unit: 'g' },
    { type: 'slider', key: 'power', label: 'Heating power', labelZh: '加热功率', min: 50, max: 1000, step: 50, unit: 'W' },
  ],
  defaultVariables: { mass: 50, power: 400 },
  presets: [
    { name: 'Default', nameZh: '默认', variables: { mass: 50, power: 400 } },
    { name: 'More water', nameZh: '更多水', variables: { mass: 200, power: 400 } },
    { name: 'High power', nameZh: '大功率', variables: { mass: 50, power: 1000 } },
  ],
  concepts: [
    'Adding heat usually raises temperature, but not during a phase change.',
    'At the melting and boiling points the temperature stays flat as heat breaks bonds (latent heat).',
    'Boiling needs far more energy than melting, so its plateau is much longer.',
    'The slope within a phase depends on the specific heat of that phase.',
  ],
  conceptsZh: [
    '加热通常使温度升高，但相变期间不会。',
    '在熔点和沸点，热量用于打破分子间作用（潜热），温度保持不变。',
    '沸腾比熔化需要多得多的能量，因此其平台更长。',
    '某一物态内曲线的斜率取决于该物态的比热容。',
  ],
  formulas: [
    { tex: 'Q = mc\\Delta T', label: 'Heating a phase', labelZh: '加热某一物态' },
    { tex: 'Q = mL', label: 'Phase change (latent heat)', labelZh: '相变（潜热）' },
  ],
  animated: true,
  supportsStep: true,
  duration: (vars) => { const s = thermo(vars); return s.q5 / s.P; },
  compute,
  render,
  suggestedQuestions: [
    { en: 'Why does the temperature stop rising while ice melts?', zh: '为什么冰熔化时温度停止上升？' },
    { en: 'Why is the boiling plateau so long?', zh: '为什么沸腾的平台这么长？' },
    { en: 'What is latent heat?', zh: '什么是潜热？' },
  ],
  learn: {
    intro: {
      en: 'A heating curve plots temperature against heat added as a substance moves from solid to liquid to gas.',
      zh: '加热曲线绘制物质从固态到液态再到气态时，温度随加入热量的变化。',
      ja: '加熱曲線は、物質が固体→液体→気体と変わるときの、加えた熱に対する温度の変化を描きます。',
    },
    principle: {
      en: 'Within a single phase, added heat raises the temperature (Q = mcΔT). At a melting or boiling point the heat instead goes into breaking molecular bonds (latent heat, Q = mL), so the temperature pauses on a flat plateau until the change is complete.',
      zh: '在同一物态内，加入的热量使温度升高（Q = mcΔT）。在熔点或沸点，热量转而用于打破分子间作用（潜热，Q = mL），因此温度在平台上停顿，直到相变完成。',
      ja: '同じ相の中では、加えた熱が温度を上げます（Q = mcΔT）。融点や沸点では熱が分子の結合を切るのに使われ（潜熱、Q = mL）、変化が終わるまで温度は平らなまま止まります。',
    },
    tips: [
      { en: 'Notice the two flat plateaus — melting (short) and boiling (long).', zh: '注意两个平台——熔化（短）和沸腾（长）。', ja: '2 つの平らな部分（融解は短く、沸騰は長い）に注目しましょう。' },
      { en: 'Boiling’s plateau is longer because vaporization needs much more energy.', zh: '沸腾平台更长，因为汽化需要多得多的能量。', ja: '気化は多くのエネルギーを要するため、沸騰の平らな部分は長くなります。' },
      { en: 'More mass lengthens every stage; more power just speeds the clock.', zh: '质量越大每个阶段越长；功率越大只是加快进程。', ja: '質量が増えると各段階が長くなり、出力が上がると進行が速くなるだけです。' },
    ],
  },
};
