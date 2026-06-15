// Physics: Uniform Circular Motion (centripetal acceleration & force).
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, label } from './canvasUtils';

function mechanics(vars: Variables) {
  const r = vars.radius as number;
  const v = vars.speed as number;
  const m = vars.mass as number;
  const a = (v * v) / r;       // centripetal acceleration
  const F = m * a;             // centripetal force
  const omega = v / r;         // angular velocity
  const T = (2 * Math.PI * r) / v;
  return { r, v, m, a, F, omega, T };
}

function compute(vars: Variables, t: number): ComputeResult {
  const r = mechanics(vars);
  const theta = r.omega * t;

  const points: { x: number; y: number }[] = [];
  for (let v = 1; v <= 20; v += 0.5) points.push({ x: v, y: (r.m * v * v) / r.r });

  return {
    data: [
      { key: 'accel', label: 'Centripetal acceleration', labelZh: '向心加速度', value: r.a, unit: 'm/s²', precision: 2 },
      { key: 'force', label: 'Centripetal force', labelZh: '向心力', value: r.F, unit: 'N', precision: 1 },
      { key: 'period', label: 'Period', labelZh: '周期', value: r.T, unit: 's', precision: 2 },
      { key: 'omega', label: 'Angular velocity', labelZh: '角速度', value: r.omega, unit: 'rad/s', precision: 2 },
    ],
    chart: {
      title: 'Centripetal force vs speed', titleZh: '向心力-速度',
      xLabel: 'v (m/s)', yLabel: 'F (N)',
      series: [{ name: 'F = mv²/r', color: '#60a5fa', points }],
      marker: { x: r.v, y: r.F },
    },
    render: { ...r, theta },
  };
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  const r = computed.render;
  const cx = w / 2, cy = h / 2;
  const rad = Math.min(w, h) * 0.32;

  // circular path
  ctx.strokeStyle = p.grid; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.stroke();
  // centre
  ctx.fillStyle = p.subtle; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();

  const ox = cx + rad * Math.cos(r.theta);
  const oy = cy + rad * Math.sin(r.theta);

  // radius line
  ctx.strokeStyle = p.axis; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ox, oy); ctx.stroke();

  // velocity vector (tangent)
  const tx = -Math.sin(r.theta), ty = Math.cos(r.theta);
  const vlen = 38;
  ctx.strokeStyle = '#34d399'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + tx * vlen, oy + ty * vlen); ctx.stroke();
  label(ctx, 'v', ox + tx * vlen, oy + ty * vlen - 4, '#34d399', '12px system-ui', 'center');

  // centripetal force vector (toward centre)
  const fx = cx - ox, fy = cy - oy; const fl = Math.hypot(fx, fy) || 1;
  ctx.strokeStyle = '#f472b6'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + (fx / fl) * 36, oy + (fy / fl) * 36); ctx.stroke();
  label(ctx, 'F', ox + (fx / fl) * 36, oy + (fy / fl) * 36, '#f472b6', '12px system-ui', 'center');

  // object
  ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(ox, oy, 10, 0, Math.PI * 2); ctx.fill();

  label(ctx, `a = ${r.a.toFixed(1)} m/s²  ·  F = ${r.F.toFixed(0)} N`, w / 2, h - 12, p.text, 'bold 14px system-ui', 'center');
}

export const circularMotion: ModelDefinition = {
  meta: {
    id: 'circular-motion',
    title: 'Circular Motion',
    titleZh: '圆周运动',
    titleJa: '円運動',
    subject: 'physics',
    description: 'Spin an object in a circle and see the centripetal acceleration and force that keep it turning.',
    descriptionZh: '让物体做圆周运动，观察使其转弯的向心加速度和向心力。',
    descriptionJa: '物体を円運動させ、回転を保つ向心加速度と向心力を観察します。',
    difficulty: 'high-school',
    tags: ['circular', 'centripetal', 'force', 'rotation'],
    accent: '#60a5fa',
  },
  controls: [
    { type: 'slider', key: 'radius', label: 'Radius', labelZh: '半径', min: 0.5, max: 5, step: 0.1, unit: 'm' },
    { type: 'slider', key: 'speed', label: 'Speed', labelZh: '速度', min: 1, max: 20, step: 0.5, unit: 'm/s' },
    { type: 'slider', key: 'mass', label: 'Mass', labelZh: '质量', min: 0.5, max: 10, step: 0.5, unit: 'kg' },
  ],
  defaultVariables: { radius: 2, speed: 6, mass: 1 },
  presets: [
    { name: 'Default', nameZh: '默认', variables: { radius: 2, speed: 6, mass: 1 } },
    { name: 'Tight & fast', nameZh: '小半径高速', variables: { radius: 1, speed: 12, mass: 1 } },
    { name: 'Wide & slow', nameZh: '大半径低速', variables: { radius: 5, speed: 4, mass: 1 } },
  ],
  concepts: [
    'Centripetal acceleration points toward the centre and equals v²/r.',
    'The centripetal force needed is F = mv²/r.',
    'Halving the radius doubles the required force at the same speed.',
    'Velocity is always tangent to the circle; the force is perpendicular to it.',
  ],
  conceptsZh: [
    '向心加速度指向圆心，大小为 v²/r。',
    '所需向心力为 F = mv²/r。',
    '同样速度下，半径减半所需的力加倍。',
    '速度始终与圆相切；力与速度垂直。',
  ],
  formulas: [
    { tex: 'a_c = \\dfrac{v^2}{r}', label: 'Centripetal acceleration', labelZh: '向心加速度' },
    { tex: 'F = \\dfrac{m v^2}{r}', label: 'Centripetal force', labelZh: '向心力' },
  ],
  animated: true,
  supportsStep: true,
  duration: (vars) => mechanics(vars).T,
  compute,
  render,
  suggestedQuestions: [
    { en: 'Why does the object need a force to go in a circle?', zh: '为什么物体做圆周运动需要力？' },
    { en: 'What happens to the force if I increase the speed?', zh: '如果增大速度，向心力会怎样？' },
    { en: 'Which way does the velocity point?', zh: '速度指向哪个方向？' },
  ],
  learn: {
    intro: {
      en: 'Uniform circular motion is movement around a circle at constant speed — but with constantly changing direction.',
      zh: '匀速圆周运动是以恒定速率绕圆运动，但方向不断改变。',
      ja: '等速円運動は一定の速さで円を回る運動ですが、向きは絶えず変化します。',
    },
    principle: {
      en: 'Because the direction keeps changing, the object is always accelerating toward the centre. This centripetal acceleration is v²/r, supplied by a force F = mv²/r pointing inward.',
      zh: '由于方向不断改变，物体始终在向圆心加速。该向心加速度为 v²/r，由指向圆心的力 F = mv²/r 提供。',
      ja: '向きが変わり続けるため、物体は常に中心へ向かって加速しています。この向心加速度は v²/r で、内向きの力 F = mv²/r が生み出します。',
    },
    tips: [
      { en: 'Watch the green velocity arrow stay tangent while the pink force points inward.', zh: '观察绿色速度箭头始终相切，而粉色力箭头指向圆心。', ja: '緑の速度矢印は接線方向、ピンクの力矢印は内向きのままです。' },
      { en: 'Increase the speed and the centripetal force grows with its square.', zh: '增大速度，向心力按速度的平方增长。', ja: '速さを上げると、向心力は速さの 2 乗で増えます。' },
      { en: 'Shrink the radius to feel how much more force a tight turn needs.', zh: '减小半径，体会急转弯需要多大的力。', ja: '半径を小さくすると、急な回転にどれだけ力が要るか分かります。' },
    ],
  },
};
