// Physics: 1D Collisions (momentum & restitution).
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, label } from './canvasUtils';

const WORLD = 12;       // metres across the track
const HALF = 0.7;       // cart half-width in metres
const X1_0 = 2, X2_0 = 10;

function dynamics(vars: Variables) {
  const m1 = vars.mass1 as number, m2 = vars.mass2 as number;
  const v1 = vars.vel1 as number, v2 = vars.vel2 as number;
  const e = vars.restitution as number;
  const M = m1 + m2;
  const v1f = (m1 * v1 + m2 * v2 + m2 * e * (v2 - v1)) / M;
  const v2f = (m1 * v1 + m2 * v2 + m1 * e * (v1 - v2)) / M;
  const p = m1 * v1 + m2 * v2;
  const keB = 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2;
  const keA = 0.5 * m1 * v1f * v1f + 0.5 * m2 * v2f * v2f;
  const approaching = v1 > v2;
  const tc = approaching ? (X2_0 - X1_0 - 2 * HALF) / (v1 - v2) : Infinity;
  return { m1, m2, v1, v2, e, v1f, v2f, p, keB, keA, tc };
}

function positions(r: ReturnType<typeof dynamics>, t: number) {
  let x1: number, x2: number;
  if (t < r.tc) {
    x1 = X1_0 + r.v1 * t;
    x2 = X2_0 + r.v2 * t;
  } else {
    const x1c = X1_0 + r.v1 * r.tc;
    const x2c = X2_0 + r.v2 * r.tc;
    x1 = x1c + r.v1f * (t - r.tc);
    x2 = x2c + r.v2f * (t - r.tc);
  }
  x1 = Math.max(HALF, Math.min(WORLD - HALF, x1));
  x2 = Math.max(HALF, Math.min(WORLD - HALF, x2));
  return { x1, x2, collided: t >= r.tc };
}

function compute(vars: Variables, t: number): ComputeResult {
  const r = dynamics(vars);
  const pos = positions(r, t);
  return {
    data: [
      { key: 'v1f', label: 'Cart 1 final velocity', labelZh: '小车1末速度', value: r.v1f, unit: 'm/s', precision: 2 },
      { key: 'v2f', label: 'Cart 2 final velocity', labelZh: '小车2末速度', value: r.v2f, unit: 'm/s', precision: 2 },
      { key: 'p', label: 'Total momentum', labelZh: '总动量', value: r.p, unit: 'kg·m/s', precision: 2 },
      { key: 'keB', label: 'KE before', labelZh: '碰前动能', value: r.keB, unit: 'J', precision: 1 },
      { key: 'keA', label: 'KE after', labelZh: '碰后动能', value: r.keA, unit: 'J', precision: 1 },
    ],
    render: { ...r, ...pos },
  };
}

function cart(ctx: CanvasRenderingContext2D, x: number, y: number, wpx: number, color: string, name: string, isDark: boolean) {
  ctx.fillStyle = color;
  ctx.fillRect(x - wpx / 2, y - 26, wpx, 32);
  ctx.fillStyle = isDark ? '#0e1426' : '#fff';
  ctx.font = 'bold 13px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(name, x, y - 10);
  ctx.textBaseline = 'alphabetic';
  // wheels
  ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
  ctx.beginPath(); ctx.arc(x - wpx / 4, y + 6, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + wpx / 4, y + 6, 5, 0, Math.PI * 2); ctx.fill();
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  const r = computed.render;
  const pad = 30;
  const scale = (w - pad * 2) / WORLD;
  const trackY = h * 0.6;

  // track
  ctx.strokeStyle = p.axis; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(pad, trackY + 12); ctx.lineTo(w - pad, trackY + 12); ctx.stroke();

  const wpx = Math.max(28, 14 + r.m1 * 4);
  const wpx2 = Math.max(28, 14 + r.m2 * 4);
  cart(ctx, pad + r.x1 * scale, trackY, wpx, '#5eead4', 'm₁', isDark);
  cart(ctx, pad + r.x2 * scale, trackY, wpx2, '#f472b6', 'm₂', isDark);

  label(ctx, `${r.m1} kg`, pad + r.x1 * scale, trackY + 30, p.subtle, '11px system-ui', 'center');
  label(ctx, `${r.m2} kg`, pad + r.x2 * scale, trackY + 30, p.subtle, '11px system-ui', 'center');
  label(ctx, r.collided ? `after: v₁=${r.v1f.toFixed(2)}, v₂=${r.v2f.toFixed(2)} m/s`
    : `before: v₁=${r.v1.toFixed(1)}, v₂=${r.v2.toFixed(1)} m/s`,
    w / 2, pad, p.text, 'bold 14px system-ui', 'center');
  label(ctx, `momentum ${r.p.toFixed(1)} kg·m/s conserved · KE ${r.keB.toFixed(0)}→${r.keA.toFixed(0)} J`,
    w / 2, h - 12, p.subtle, '12px system-ui', 'center');
}

export const collisions: ModelDefinition = {
  meta: {
    id: 'collisions-1d',
    title: '1D Collisions',
    titleZh: '一维碰撞',
    titleJa: '一次元の衝突',
    subject: 'physics',
    description: 'Crash two carts and explore momentum conservation across elastic and inelastic collisions.',
    descriptionZh: '让两辆小车相撞，探索弹性碰撞与非弹性碰撞中的动量守恒。',
    descriptionJa: '2 台の台車を衝突させ、弾性・非弾性衝突における運動量保存を調べます。',
    difficulty: 'high-school',
    tags: ['momentum', 'collision', 'energy', 'conservation'],
    accent: '#5eead4',
  },
  controls: [
    { type: 'slider', key: 'mass1', label: 'Cart 1 mass', labelZh: '小车1质量', min: 0.5, max: 10, step: 0.5, unit: 'kg' },
    { type: 'slider', key: 'vel1', label: 'Cart 1 velocity', labelZh: '小车1速度', min: -10, max: 10, step: 0.5, unit: 'm/s' },
    { type: 'slider', key: 'mass2', label: 'Cart 2 mass', labelZh: '小车2质量', min: 0.5, max: 10, step: 0.5, unit: 'kg' },
    { type: 'slider', key: 'vel2', label: 'Cart 2 velocity', labelZh: '小车2速度', min: -10, max: 10, step: 0.5, unit: 'm/s' },
    { type: 'slider', key: 'restitution', label: 'Elasticity', labelZh: '弹性系数', min: 0, max: 1, step: 0.05 },
  ],
  defaultVariables: { mass1: 2, vel1: 4, mass2: 3, vel2: -2, restitution: 1 },
  presets: [
    { name: 'Elastic', nameZh: '弹性碰撞', variables: { mass1: 2, vel1: 4, mass2: 3, vel2: -2, restitution: 1 } },
    { name: 'Perfectly inelastic', nameZh: '完全非弹性', variables: { mass1: 2, vel1: 4, mass2: 3, vel2: -2, restitution: 0 } },
    { name: 'Equal masses', nameZh: '等质量', variables: { mass1: 2, vel1: 5, mass2: 2, vel2: 0, restitution: 1 } },
    { name: 'Heavy hits light', nameZh: '重撞轻', variables: { mass1: 8, vel1: 3, mass2: 1, vel2: 0, restitution: 1 } },
  ],
  concepts: [
    'Total momentum is conserved in every collision (no external forces).',
    'In an elastic collision (e = 1) kinetic energy is also conserved.',
    'In a perfectly inelastic collision (e = 0) the carts stick and move together.',
    'When equal masses collide elastically, they exchange velocities.',
  ],
  conceptsZh: [
    '每次碰撞中总动量都守恒（无外力）。',
    '弹性碰撞（e = 1）中动能也守恒。',
    '完全非弹性碰撞（e = 0）中两车粘在一起共同运动。',
    '等质量弹性碰撞时，两者交换速度。',
  ],
  formulas: [
    { tex: 'p = m_1 v_1 + m_2 v_2', label: 'Total momentum', labelZh: '总动量' },
    { tex: 'e = \\dfrac{v_{2f} - v_{1f}}{v_1 - v_2}', label: 'Coefficient of restitution', labelZh: '恢复系数' },
  ],
  animated: true,
  supportsStep: true,
  duration: (vars) => {
    const r = dynamics(vars);
    return Number.isFinite(r.tc) && r.tc > 0 ? Math.min(r.tc, 6) + 3.5 : 4;
  },
  compute,
  render,
  suggestedQuestions: [
    { en: 'Is momentum always conserved?', zh: '动量总是守恒吗？' },
    { en: 'What happens to kinetic energy in an inelastic collision?', zh: '非弹性碰撞中动能会怎样？' },
    { en: 'What if the two masses are equal?', zh: '如果两个质量相等会怎样？' },
  ],
  learn: {
    intro: {
      en: 'Collisions show how momentum and energy move between objects when they crash into each other.',
      zh: '碰撞展示了物体相撞时动量和能量如何在它们之间转移。',
      ja: '衝突は、物体がぶつかるときに運動量とエネルギーがどう移り合うかを示します。',
    },
    principle: {
      en: 'Total momentum is always conserved. Elastic collisions also conserve kinetic energy, while inelastic ones convert some of it to heat and sound; the elasticity slider sets where you are between these.',
      zh: '总动量始终守恒。弹性碰撞还守恒动能，而非弹性碰撞会把部分动能转化为热和声；弹性系数决定介于两者之间的位置。',
      ja: '運動量は常に保存されます。弾性衝突は運動エネルギーも保存し、非弾性衝突は一部を熱や音に変えます。弾性係数でその度合いを決めます。',
    },
    tips: [
      { en: 'Compare KE before and after as you lower the elasticity.', zh: '降低弹性系数时，比较碰前与碰后的动能。', ja: '弾性係数を下げながら、衝突前後の運動エネルギーを比べましょう。' },
      { en: 'Set elasticity to 0 to make the carts stick together.', zh: '把弹性系数设为 0，让两车粘在一起。', ja: '弾性係数を 0 にすると、台車はくっついて一緒に動きます。' },
      { en: 'Give equal masses an elastic hit and watch them swap velocities.', zh: '让等质量小车弹性相撞，观察它们交换速度。', ja: '等質量を弾性衝突させると、速度を交換します。' },
    ],
  },
};
