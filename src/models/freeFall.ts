// Physics: Free Fall with Air Resistance (linear drag → terminal velocity).
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, label } from './canvasUtils';

const DURATION = 5; // seconds shown / animation loop

function dynamics(vars: Variables) {
  const m = vars.mass as number;
  const k = vars.drag as number;       // linear drag coefficient
  const g = vars.gravity as number;
  const hasDrag = k > 1e-6;
  const vT = hasDrag ? (m * g) / k : Infinity; // terminal velocity
  const vel = (t: number) => (hasDrag ? vT * (1 - Math.exp(-(k / m) * t)) : g * t);
  const pos = (t: number) =>
    hasDrag ? vT * t - (vT * m / k) * (1 - Math.exp(-(k / m) * t)) : 0.5 * g * t * t;
  return { m, k, g, hasDrag, vT, vel, pos };
}

function compute(vars: Variables, t: number): ComputeResult {
  const r = dynamics(vars);
  const tt = t % DURATION;
  const v = r.vel(tt);

  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= 100; i++) {
    const ti = (DURATION * i) / 100;
    points.push({ x: ti, y: r.vel(ti) });
  }

  return {
    data: [
      { key: 'terminal', label: 'Terminal velocity', labelZh: '终极速度', value: r.hasDrag ? r.vT : Infinity, unit: 'm/s', precision: 1 },
      { key: 'velocity', label: 'Current velocity', labelZh: '当前速度', value: v, unit: 'm/s', precision: 1 },
      { key: 'pctTerm', label: 'Percent of terminal', labelZh: '占终极速度比例', value: r.hasDrag ? (v / r.vT) * 100 : 0, unit: '%', precision: 0 },
    ],
    chart: {
      title: 'Velocity vs time', titleZh: '速度-时间',
      xLabel: 't (s)', yLabel: 'v (m/s)',
      series: [{ name: 'v', color: '#5eead4', points }],
      marker: { x: tt, y: v },
    },
    render: { ...r, tt, v, posEnd: r.pos(DURATION) },
  };
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  const r = computed.render;
  const topY = 30, botY = h - 40;
  const cx = w / 2;

  // channel
  ctx.strokeStyle = p.grid; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx, topY); ctx.lineTo(cx, botY); ctx.stroke();

  // ball position: scaled so the fall spans the channel over the loop
  const frac = r.posEnd > 0 ? r.pos(r.tt) / r.posEnd : 0;
  const by = topY + frac * (botY - topY);
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath(); ctx.arc(cx, by, 14, 0, Math.PI * 2); ctx.fill();

  // velocity vector
  const vlen = Math.min(60, r.v * 3);
  ctx.strokeStyle = '#5eead4'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(cx + 24, by); ctx.lineTo(cx + 24, by + vlen); ctx.stroke();
  ctx.fillStyle = '#5eead4';
  ctx.beginPath(); ctx.moveTo(cx + 24, by + vlen); ctx.lineTo(cx + 19, by + vlen - 8); ctx.lineTo(cx + 29, by + vlen - 8); ctx.closePath(); ctx.fill();

  // terminal velocity marker line (when applicable)
  if (r.hasDrag) label(ctx, `terminal ${r.vT.toFixed(1)} m/s`, w - 12, topY + 4, p.subtle, '11px system-ui', 'right');
  label(ctx, `v = ${r.v.toFixed(1)} m/s`, cx, h - 14, p.text, 'bold 14px system-ui', 'center');
}

export const freeFall: ModelDefinition = {
  meta: {
    id: 'free-fall-drag',
    title: 'Free Fall & Air Resistance',
    titleZh: '自由落体与空气阻力',
    titleJa: '自由落下と空気抵抗',
    subject: 'physics',
    description: 'Drop an object with drag and watch it accelerate, then settle at a terminal velocity.',
    descriptionZh: '让带阻力的物体下落，观察它先加速、后达到终极速度。',
    descriptionJa: '抵抗のある物体を落とし、加速してから終端速度に落ち着く様子を観察します。',
    difficulty: 'high-school',
    tags: ['gravity', 'drag', 'terminal velocity', 'forces'],
    accent: '#5eead4',
  },
  controls: [
    { type: 'slider', key: 'mass', label: 'Mass', labelZh: '质量', min: 0.1, max: 10, step: 0.1, unit: 'kg' },
    { type: 'slider', key: 'drag', label: 'Air resistance (k)', labelZh: '空气阻力系数 (k)', min: 0, max: 2, step: 0.05 },
    { type: 'slider', key: 'gravity', label: 'Gravity', labelZh: '重力加速度', min: 1, max: 20, step: 0.1, unit: 'm/s²' },
  ],
  defaultVariables: { mass: 1, drag: 0.5, gravity: 9.8 },
  presets: [
    { name: 'With drag', nameZh: '有阻力', variables: { mass: 1, drag: 0.5, gravity: 9.8 } },
    { name: 'No drag (free fall)', nameZh: '无阻力（自由落体）', variables: { mass: 1, drag: 0, gravity: 9.8 } },
    { name: 'Heavy object', nameZh: '重物', variables: { mass: 8, drag: 0.5, gravity: 9.8 } },
    { name: 'Feather-like', nameZh: '羽毛状', variables: { mass: 0.2, drag: 1.5, gravity: 9.8 } },
  ],
  concepts: [
    'Without air resistance everything accelerates at g, regardless of mass.',
    'Drag grows with speed, so the net force — and acceleration — shrink as the object speeds up.',
    'Terminal velocity is reached when drag balances gravity: v_t = mg/k.',
    'A heavier object (same drag) reaches a higher terminal velocity.',
  ],
  conceptsZh: [
    '没有空气阻力时，所有物体都以 g 加速，与质量无关。',
    '阻力随速度增大，因此物体加速时净力和加速度都减小。',
    '当阻力与重力平衡时达到终极速度：v_t = mg/k。',
    '阻力相同时，较重的物体终极速度更大。',
  ],
  formulas: [
    { tex: 'v_t = \\dfrac{mg}{k}', label: 'Terminal velocity', labelZh: '终极速度' },
    { tex: 'v(t) = v_t\\left(1 - e^{-kt/m}\\right)', label: 'Velocity with drag', labelZh: '带阻力的速度' },
  ],
  animated: true,
  supportsStep: true,
  duration: () => DURATION,
  compute,
  render,
  suggestedQuestions: [
    { en: 'What is terminal velocity?', zh: '什么是终极速度？' },
    { en: 'Why does the object stop speeding up?', zh: '为什么物体不再加速？' },
    { en: 'Does mass affect the fall when there is drag?', zh: '有阻力时质量会影响下落吗？' },
  ],
  learn: {
    intro: {
      en: 'Real falling objects do not speed up forever — air resistance eventually balances gravity at a terminal velocity.',
      zh: '真实下落的物体不会一直加速——空气阻力最终与重力平衡，达到终极速度。',
      ja: '実際に落ちる物体はいつまでも加速しません。空気抵抗がやがて重力とつり合い、終端速度になります。',
    },
    principle: {
      en: 'Gravity pulls down with a constant mg, but drag pushes up and grows with speed. As the object accelerates, drag rises until the two forces cancel; from then on the velocity is constant at v_t = mg/k.',
      zh: '重力以恒定的 mg 向下拉，而阻力向上且随速度增大。物体加速时阻力上升，直到两力抵消；此后速度恒定为 v_t = mg/k。',
      ja: '重力は一定の mg で下に引きますが、抵抗は上向きで速さとともに増えます。加速すると抵抗が増し、両者がつり合うと、その後は v_t = mg/k で一定速度になります。',
    },
    tips: [
      { en: 'Set drag to 0 to recover constant-acceleration free fall.', zh: '把阻力设为 0，恢复匀加速的自由落体。', ja: '抵抗を 0 にすると、等加速度の自由落下に戻ります。' },
      { en: 'Watch the velocity–time curve flatten as it approaches terminal velocity.', zh: '观察速度-时间曲线在接近终极速度时变平。', ja: '速度–時間曲線が終端速度に近づくと平らになります。' },
      { en: 'Increase the mass and the terminal velocity rises.', zh: '增大质量，终极速度升高。', ja: '質量を増やすと終端速度が上がります。' },
    ],
  },
};
