// Physics: Coulomb's Law — electrostatic force between two point charges.
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, label } from './canvasUtils';

// With q in nC and r in cm, F(µN) = 89.875 · q1 · q2 / r².
const KSCALE = 89.875;

function electro(vars: Variables) {
  const q1 = vars.q1 as number;
  const q2 = vars.q2 as number;
  const r = vars.distance as number;
  const F = (KSCALE * q1 * q2) / (r * r); // µN, signed (+ repulsive, − attractive)
  const repulsive = q1 * q2 > 0;
  return { q1, q2, r, F, repulsive };
}

function compute(vars: Variables): ComputeResult {
  const e = electro(vars);
  const points: { x: number; y: number }[] = [];
  for (let r = 1; r <= 20; r += 0.5) points.push({ x: r, y: Math.abs((KSCALE * e.q1 * e.q2) / (r * r)) });
  return {
    data: [
      { key: 'force', label: 'Force magnitude', labelZh: '力的大小', value: Math.abs(e.F), unit: 'µN', precision: 2 },
      { key: 'type', label: 'Interaction', labelZh: '相互作用', value: e.q1 * e.q2 === 0 ? 'none' : e.repulsive ? 'repulsive' : 'attractive' },
      { key: 'q1', label: 'Charge 1', labelZh: '电荷 1', value: e.q1, unit: 'nC', precision: 1 },
      { key: 'q2', label: 'Charge 2', labelZh: '电荷 2', value: e.q2, unit: 'nC', precision: 1 },
    ],
    chart: {
      title: 'Force vs distance (inverse square)', titleZh: '力-距离（平方反比）',
      xLabel: 'r (cm)', yLabel: '|F| (µN)',
      series: [{ name: '|F|', color: '#fbbf24', points }],
      marker: { x: e.r, y: Math.abs(e.F) },
    },
    render: { ...e },
  };
}

function chargeBall(ctx: CanvasRenderingContext2D, x: number, y: number, q: number, isDark: boolean) {
  const rad = 14 + Math.min(16, Math.abs(q) * 1.6);
  ctx.fillStyle = q > 0 ? '#ef4444' : q < 0 ? '#3b82f6' : (isDark ? '#64748b' : '#94a3b8');
  ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 18px system-ui';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(q > 0 ? '+' : q < 0 ? '−' : '0', x, y);
  ctx.textBaseline = 'alphabetic';
  return rad;
}

function forceArrow(ctx: CanvasRenderingContext2D, x: number, y: number, dir: number, len: number, color: string) {
  const ex = x + dir * len;
  ctx.strokeStyle = color; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ex, y); ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(ex, y); ctx.lineTo(ex - dir * 9, y - 5); ctx.lineTo(ex - dir * 9, y + 5);
  ctx.closePath(); ctx.fill();
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  const r = computed.render;
  const cy = h / 2;
  // map distance (1..20 cm) to a screen separation
  const sep = 60 + (r.r / 20) * (w * 0.5);
  const x1 = w / 2 - sep / 2, x2 = w / 2 + sep / 2;

  // separation guide
  ctx.strokeStyle = p.grid; ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x1, cy); ctx.lineTo(x2, cy); ctx.stroke();
  ctx.setLineDash([]);
  label(ctx, `r = ${r.r.toFixed(1)} cm`, w / 2, cy - 12, p.subtle, '12px system-ui', 'center');

  const rad1 = chargeBall(ctx, x1, cy, r.q1, isDark);
  const rad2 = chargeBall(ctx, x2, cy, r.q2, isDark);

  // force arrows (equal & opposite). Repulsive → outward; attractive → inward.
  const mag = Math.min(70, 14 + Math.abs(r.F) * 0.6);
  if (r.q1 * r.q2 !== 0) {
    const dir1 = r.repulsive ? -1 : 1; // on charge 1
    forceArrow(ctx, x1 - dir1 * (rad1 + 2), cy + 0, dir1, mag, '#fbbf24');
    forceArrow(ctx, x2 + (r.repulsive ? 1 : -1) * (rad2 + 2), cy, r.repulsive ? 1 : -1, mag, '#fbbf24');
  }

  label(ctx, `|F| = ${Math.abs(r.F).toFixed(2)} µN · ${r.q1 * r.q2 === 0 ? 'no force' : r.repulsive ? 'repulsive' : 'attractive'}`,
    w / 2, h - 12, p.text, 'bold 14px system-ui', 'center');
}

export const coulomb: ModelDefinition = {
  meta: {
    id: 'coulomb-law',
    title: "Coulomb's Law",
    titleZh: '库仑定律',
    titleJa: 'クーロンの法則',
    subject: 'physics',
    description: 'Set two charges and distance to see the electrostatic force — attraction, repulsion, and inverse-square falloff.',
    descriptionZh: '设定两个电荷和距离，观察静电力——吸引、排斥与平方反比衰减。',
    descriptionJa: '2 つの電荷と距離を設定し、静電気力（引力・斥力・逆 2 乗の減衰）を見ます。',
    difficulty: 'high-school',
    tags: ['electrostatics', 'charge', 'force', 'Coulomb'],
    accent: '#fbbf24',
  },
  controls: [
    { type: 'slider', key: 'q1', label: 'Charge 1', labelZh: '电荷 1', min: -10, max: 10, step: 0.5, unit: 'nC' },
    { type: 'slider', key: 'q2', label: 'Charge 2', labelZh: '电荷 2', min: -10, max: 10, step: 0.5, unit: 'nC' },
    { type: 'slider', key: 'distance', label: 'Distance', labelZh: '距离', min: 1, max: 20, step: 0.5, unit: 'cm' },
  ],
  defaultVariables: { q1: 5, q2: -5, distance: 8 },
  presets: [
    { name: 'Opposite (attract)', nameZh: '异号（吸引）', variables: { q1: 5, q2: -5, distance: 8 } },
    { name: 'Like (repel)', nameZh: '同号（排斥）', variables: { q1: 6, q2: 6, distance: 8 } },
    { name: 'Close & strong', nameZh: '近距强力', variables: { q1: 8, q2: 8, distance: 3 } },
  ],
  concepts: [
    'Like charges repel; opposite charges attract.',
    'The force follows an inverse-square law: F = k·q₁q₂ / r².',
    'Doubling the distance cuts the force to a quarter.',
    'The two charges always feel equal and opposite forces.',
  ],
  conceptsZh: [
    '同号电荷相斥；异号电荷相吸。',
    '力遵循平方反比定律：F = k·q₁q₂ / r²。',
    '距离加倍，力变为四分之一。',
    '两个电荷始终受到大小相等、方向相反的力。',
  ],
  formulas: [
    { tex: 'F = k\\,\\dfrac{q_1 q_2}{r^2}', label: "Coulomb's law", labelZh: '库仑定律' },
  ],
  animated: false,
  supportsStep: false,
  compute,
  render,
  suggestedQuestions: [
    { en: 'Why do opposite charges attract?', zh: '为什么异号电荷相吸？' },
    { en: 'What happens to the force when I double the distance?', zh: '距离加倍时力会怎样？' },
    { en: 'How is this like gravity?', zh: '这与万有引力有何相似？' },
  ],
  learn: {
    intro: {
      en: "Coulomb's law gives the electric force between two charged objects.",
      zh: '库仑定律给出两个带电物体之间的电力。',
      ja: 'クーロンの法則は、2 つの帯電した物体の間にはたらく電気の力を表します。',
    },
    principle: {
      en: 'The force is proportional to the product of the charges and falls off with the square of the distance. Same signs push apart, opposite signs pull together, and both charges feel the same size of force.',
      zh: '力与两电荷的乘积成正比，并随距离的平方衰减。同号相斥，异号相吸，两电荷受力大小相同。',
      ja: '力は電荷の積に比例し、距離の 2 乗で弱まります。同符号は反発、異符号は引き合い、両方の電荷が同じ大きさの力を受けます。',
    },
    tips: [
      { en: 'Flip one charge’s sign to switch between attraction and repulsion.', zh: '改变一个电荷的符号，在吸引与排斥之间切换。', ja: '片方の電荷の符号を変えると、引力と斥力が切り替わります。' },
      { en: 'Halve the distance and the force jumps four times larger.', zh: '距离减半，力增大到四倍。', ja: '距離を半分にすると、力は 4 倍になります。' },
      { en: 'Open the chart to see the steep inverse-square curve.', zh: '打开图表，看陡峭的平方反比曲线。', ja: 'グラフを開くと、急な逆 2 乗曲線が見えます。' },
    ],
  },
};
