// Physics: Energy Conservation — a ball oscillating in a frictionless bowl.
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, label } from './canvasUtils';

function setup(vars: Variables) {
  const m = vars.mass as number;
  const h0 = vars.height as number;   // release height above the bottom
  const g = vars.gravity as number;
  const total = m * g * h0;
  const omega = Math.sqrt(g / (0.4 * h0 + 0.6)); // animation pacing only
  return { m, h0, g, total, omega };
}

function compute(vars: Variables, t: number): ComputeResult {
  const r = setup(vars);
  // x = X cos(ωt) in the bowl; height y = h0·cos²(ωt) (0 at bottom, h0 at edges)
  const phase = Math.cos(r.omega * t);
  const y = r.h0 * phase * phase;
  const pe = r.m * r.g * y;
  const ke = Math.max(0, r.total - pe);
  const v = Math.sqrt((2 * ke) / r.m);
  return {
    data: [
      { key: 'ke', label: 'Kinetic energy', labelZh: '动能', value: ke, unit: 'J', precision: 1 },
      { key: 'pe', label: 'Potential energy', labelZh: '势能', value: pe, unit: 'J', precision: 1 },
      { key: 'total', label: 'Total energy', labelZh: '总能量', value: r.total, unit: 'J', precision: 1 },
      { key: 'speed', label: 'Speed', labelZh: '速度', value: v, unit: 'm/s', precision: 2 },
    ],
    render: { ...r, phase, y, pe, ke, v },
  };
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  const r = computed.render;

  // bowl (parabola) on the left two-thirds
  const bx = w * 0.06, bw = w * 0.56;
  const bottomY = h * 0.78, topY = h * 0.16;
  const bowl = (xf: number) => bottomY - (topY < bottomY ? (bottomY - topY) : 0) * xf * xf; // xf in [-1,1]
  ctx.strokeStyle = p.axis; ctx.lineWidth = 3; ctx.beginPath();
  for (let i = 0; i <= 60; i++) {
    const xf = -1 + (2 * i) / 60;
    const X = bx + ((xf + 1) / 2) * bw, Y = bowl(xf);
    if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
  }
  ctx.stroke();

  // ball: x = ±sqrt(y/h0) edge fraction, sign from phase
  const xf = Math.sign(r.phase) * Math.sqrt(Math.max(0, r.y / r.h0));
  const ballX = bx + ((xf + 1) / 2) * bw;
  const ballY = bowl(xf) - 10;
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath(); ctx.arc(ballX, ballY, 11, 0, Math.PI * 2); ctx.fill();

  // energy bars on the right
  const barsX = w * 0.7, barW = w * 0.07, gap = w * 0.04;
  const baseY = h * 0.8, maxH = h * 0.6;
  const scale = maxH / Math.max(r.total, 1);
  const bar = (i: number, val: number, color: string, name: string) => {
    const x = barsX + i * (barW + gap);
    ctx.fillStyle = color; ctx.fillRect(x, baseY - val * scale, barW, val * scale);
    ctx.strokeStyle = p.grid; ctx.lineWidth = 1; ctx.strokeRect(x, baseY - maxH, barW, maxH);
    label(ctx, name, x + barW / 2, baseY + 16, p.text, '11px system-ui', 'center');
  };
  bar(0, r.ke, '#34d399', 'KE');
  bar(1, r.pe, '#60a5fa', 'PE');
  bar(2, r.total, '#fbbf24', 'Total');

  label(ctx, `total energy ${r.total.toFixed(0)} J (conserved)`, w / 2, h - 10, p.subtle, '12px system-ui', 'center');
}

export const energyConservation: ModelDefinition = {
  meta: {
    id: 'energy-conservation',
    title: 'Energy Conservation',
    titleZh: '能量守恒',
    titleJa: 'エネルギー保存',
    subject: 'physics',
    description: 'Roll a ball in a frictionless bowl and watch kinetic and potential energy trade off while the total stays fixed.',
    descriptionZh: '让小球在无摩擦的碗中滚动，观察动能与势能此消彼长，而总能量保持不变。',
    descriptionJa: '摩擦のない器の中で球を転がし、運動エネルギーと位置エネルギーが入れ替わりながら総量が一定であることを見ます。',
    difficulty: 'high-school',
    tags: ['energy', 'kinetic', 'potential', 'conservation'],
    accent: '#34d399',
  },
  controls: [
    { type: 'slider', key: 'mass', label: 'Mass', labelZh: '质量', min: 0.5, max: 10, step: 0.5, unit: 'kg' },
    { type: 'slider', key: 'height', label: 'Release height', labelZh: '释放高度', min: 1, max: 10, step: 0.5, unit: 'm' },
    { type: 'slider', key: 'gravity', label: 'Gravity', labelZh: '重力加速度', min: 1, max: 20, step: 0.1, unit: 'm/s²' },
  ],
  defaultVariables: { mass: 2, height: 5, gravity: 9.8 },
  presets: [
    { name: 'Default', nameZh: '默认', variables: { mass: 2, height: 5, gravity: 9.8 } },
    { name: 'High drop', nameZh: '高处释放', variables: { mass: 2, height: 10, gravity: 9.8 } },
    { name: 'Heavy ball', nameZh: '重球', variables: { mass: 8, height: 5, gravity: 9.8 } },
  ],
  concepts: [
    'Total mechanical energy (KE + PE) stays constant without friction.',
    'At the top of the swing all the energy is potential and the ball is momentarily still.',
    'At the bottom all the energy is kinetic and the speed is greatest.',
    'Energy is transformed between forms, never created or destroyed.',
  ],
  conceptsZh: [
    '没有摩擦时，总机械能（动能 + 势能）保持不变。',
    '在最高点能量全部为势能，小球瞬间静止。',
    '在最低点能量全部为动能，速度最大。',
    '能量在不同形式之间转化，既不会产生也不会消失。',
  ],
  formulas: [
    { tex: 'E = \\tfrac{1}{2}mv^2 + mgh', label: 'Mechanical energy', labelZh: '机械能' },
  ],
  animated: true,
  supportsStep: true,
  duration: (vars) => (2 * Math.PI) / setup(vars).omega,
  compute,
  render,
  suggestedQuestions: [
    { en: 'Where is the ball moving fastest?', zh: '小球在哪里运动最快？' },
    { en: 'Why does the total energy stay the same?', zh: '为什么总能量保持不变？' },
    { en: 'Does a heavier ball reach a higher speed?', zh: '更重的球会达到更高的速度吗？' },
  ],
  learn: {
    intro: {
      en: 'Energy conservation says energy can change form but the total never changes — a cornerstone of physics.',
      zh: '能量守恒指能量可以改变形式，但总量永不改变——这是物理学的基石。',
      ja: 'エネルギー保存は、エネルギーは形を変えても総量は変わらないという、物理学の基本法則です。',
    },
    principle: {
      en: 'As the ball rolls down, gravitational potential energy (mgh) converts into kinetic energy (½mv²) and back again. With no friction the sum is constant, so the ball returns to exactly the same height each time.',
      zh: '小球滚下时，重力势能（mgh）转化为动能（½mv²），再转化回来。没有摩擦时两者之和恒定，因此小球每次都回到完全相同的高度。',
      ja: '球が転がり下りると、重力による位置エネルギー（mgh）が運動エネルギー（½mv²）に変わり、また戻ります。摩擦がなければ合計は一定で、球は毎回まったく同じ高さに戻ります。',
    },
    tips: [
      { en: 'Watch the KE and PE bars swap height while the total bar never moves.', zh: '观察 KE 和 PE 柱状条交换高度，而总能量柱始终不动。', ja: 'KE と PE のバーが入れ替わる一方、Total のバーは動きません。' },
      { en: 'Raise the release height to give the ball more total energy and speed.', zh: '提高释放高度，让小球获得更多总能量和速度。', ja: '釈放高さを上げると、球の総エネルギーと速さが増えます。' },
      { en: 'The ball is slowest (still) at the edges and fastest at the bottom.', zh: '小球在两端最慢（静止），在底部最快。', ja: '球は端で最も遅く（静止）、底で最も速くなります。' },
    ],
  },
};
