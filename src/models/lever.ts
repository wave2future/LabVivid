// Physics: Lever & Torque (balancing moments about a fulcrum).
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, label } from './canvasUtils';

const G = 9.8;

function torque(vars: Variables) {
  const m1 = vars.leftMass as number, d1 = vars.leftDist as number;
  const m2 = vars.rightMass as number, d2 = vars.rightDist as number;
  const tLeft = m1 * G * d1;
  const tRight = m2 * G * d2;
  const net = tRight - tLeft; // positive → tips right
  const balanced = Math.abs(net) < 1e-6;
  return { m1, d1, m2, d2, tLeft, tRight, net, balanced };
}

function compute(vars: Variables): ComputeResult {
  const r = torque(vars);
  return {
    data: [
      { key: 'tLeft', label: 'Left torque', labelZh: '左力矩', value: r.tLeft, unit: 'N·m', precision: 1 },
      { key: 'tRight', label: 'Right torque', labelZh: '右力矩', value: r.tRight, unit: 'N·m', precision: 1 },
      { key: 'net', label: 'Net torque', labelZh: '净力矩', value: r.net, unit: 'N·m', precision: 1 },
      { key: 'state', label: 'State', labelZh: '状态', value: r.balanced ? 'balanced' : r.net > 0 ? 'tips right' : 'tips left' },
    ],
    render: { ...r },
  };
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  const r = computed.render;
  const cx = w / 2, pivotY = h * 0.62;

  // tilt proportional to net torque, clamped
  const maxT = Math.max(50, Math.abs(r.net));
  const tilt = Math.max(-0.32, Math.min(0.32, (r.net / maxT) * 0.32));

  // fulcrum (triangle)
  ctx.fillStyle = p.subtle;
  ctx.beginPath();
  ctx.moveTo(cx, pivotY); ctx.lineTo(cx - 26, pivotY + 46); ctx.lineTo(cx + 26, pivotY + 46);
  ctx.closePath(); ctx.fill();

  // beam — positive net torque tips the right end down (larger y)
  const beamLen = Math.min(w * 0.82, 560);
  const half = beamLen / 2;
  const hx = half * Math.cos(tilt), hy = half * Math.sin(tilt);
  ctx.strokeStyle = p.text; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx - hx, pivotY - hy); ctx.lineTo(cx + hx, pivotY + hy); ctx.stroke();
  ctx.lineCap = 'butt';

  // place a mass box at a fractional distance along each side
  const maxDist = 5; // metres (slider max)
  const place = (sign: number, dist: number, mass: number, color: string) => {
    const f = dist / maxDist;
    const bx = cx + sign * half * Math.cos(tilt) * f;
    const by = pivotY + sign * half * Math.sin(tilt) * f;
    const size = 22 + mass * 3;
    ctx.fillStyle = color;
    ctx.fillRect(bx - size / 2, by - size, size, size);
    ctx.fillStyle = isDark ? '#0e1426' : '#fff';
    ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(`${mass}`, bx, by - size / 2);
    ctx.textBaseline = 'alphabetic';
  };
  place(-1, r.d1, r.m1, '#5eead4');
  place(1, r.d2, r.m2, '#f472b6');

  label(ctx, r.balanced ? 'balanced' : r.net > 0 ? 'tips right ▶' : '◀ tips left',
    cx, h - 14, r.balanced ? '#34d399' : '#fbbf24', 'bold 14px system-ui', 'center');
  label(ctx, `${r.tLeft.toFixed(0)} N·m`, cx - half * 0.7, pivotY - half * Math.sin(tilt) * 0.7 - 30, '#5eead4', '12px system-ui', 'center');
  label(ctx, `${r.tRight.toFixed(0)} N·m`, cx + half * 0.7, pivotY + half * Math.sin(tilt) * 0.7 - 30, '#f472b6', '12px system-ui', 'center');
}

export const lever: ModelDefinition = {
  meta: {
    id: 'lever-torque',
    title: 'Lever & Torque',
    titleZh: '杠杆与力矩',
    titleJa: 'てことトルク',
    subject: 'physics',
    description: 'Balance masses on a lever and discover how distance and weight combine into torque.',
    descriptionZh: '在杠杆上平衡质量，发现距离与重量如何共同构成力矩。',
    descriptionJa: 'てこに質量を載せて釣り合わせ、距離と重さがどうトルクをつくるかを発見します。',
    difficulty: 'middle-school',
    tags: ['torque', 'lever', 'moments', 'equilibrium'],
    accent: '#5eead4',
  },
  controls: [
    { type: 'slider', key: 'leftMass', label: 'Left mass', labelZh: '左侧质量', min: 1, max: 10, step: 1, unit: 'kg' },
    { type: 'slider', key: 'leftDist', label: 'Left distance', labelZh: '左侧距离', min: 0.5, max: 5, step: 0.5, unit: 'm' },
    { type: 'slider', key: 'rightMass', label: 'Right mass', labelZh: '右侧质量', min: 1, max: 10, step: 1, unit: 'kg' },
    { type: 'slider', key: 'rightDist', label: 'Right distance', labelZh: '右侧距离', min: 0.5, max: 5, step: 0.5, unit: 'm' },
  ],
  defaultVariables: { leftMass: 4, leftDist: 3, rightMass: 6, rightDist: 2 },
  presets: [
    { name: 'Balanced', nameZh: '平衡', variables: { leftMass: 4, leftDist: 3, rightMass: 6, rightDist: 2 } },
    { name: 'Heavy near pivot', nameZh: '重物靠支点', variables: { leftMass: 2, leftDist: 5, rightMass: 10, rightDist: 1 } },
    { name: 'Tips left', nameZh: '向左倾', variables: { leftMass: 8, leftDist: 4, rightMass: 3, rightDist: 2 } },
  ],
  concepts: [
    'Torque (moment) equals force times distance from the pivot: τ = F·d.',
    'A lever balances when the left and right torques are equal.',
    'A small mass far out can balance a large mass close in.',
    'This trade-off of force for distance is the principle of mechanical advantage.',
  ],
  conceptsZh: [
    '力矩等于力乘以到支点的距离：τ = F·d。',
    '当左右力矩相等时杠杆平衡。',
    '远端的小质量可以平衡近端的大质量。',
    '用力换距离的这种取舍正是机械效益的原理。',
  ],
  formulas: [
    { tex: '\\tau = F \\cdot d', label: 'Torque', labelZh: '力矩' },
    { tex: 'm_1 d_1 = m_2 d_2', label: 'Balance condition', labelZh: '平衡条件' },
  ],
  animated: false,
  supportsStep: false,
  compute,
  render,
  suggestedQuestions: [
    { en: 'How can a light weight balance a heavy one?', zh: '轻的重物怎么能平衡重的？' },
    { en: 'What is torque?', zh: '什么是力矩？' },
    { en: 'Why do door handles sit far from the hinge?', zh: '为什么门把手离铰链很远？' },
  ],
  learn: {
    intro: {
      en: 'A lever is a stiff bar that turns about a pivot; torque measures how much a force twists it.',
      zh: '杠杆是绕支点转动的硬棒；力矩衡量一个力使它转动的程度。',
      ja: 'てこは支点を中心に回る硬い棒で、トルクは力がそれをどれだけ回すかを表します。',
    },
    principle: {
      en: 'Turning effect depends on both the force and how far it acts from the pivot (τ = F·d). The bar balances when the clockwise and counter-clockwise torques are equal, so distance can make up for a smaller force.',
      zh: '转动效果取决于力以及它到支点的距离（τ = F·d）。当顺时针与逆时针力矩相等时杠杆平衡，因此距离可以弥补较小的力。',
      ja: '回す効果は力と支点からの距離の両方で決まります（τ = F·d）。時計回りと反時計回りのトルクが等しいとき釣り合い、距離が小さな力を補えます。',
    },
    tips: [
      { en: 'Match m₁·d₁ to m₂·d₂ to make the beam sit level.', zh: '让 m₁·d₁ 等于 m₂·d₂，横梁就保持水平。', ja: 'm₁·d₁ と m₂·d₂ を等しくすると、棒は水平になります。' },
      { en: 'Move a heavy mass close to the pivot to balance a lighter, far-out one.', zh: '把重物移近支点，去平衡远处较轻的物体。', ja: '重い質量を支点に近づけると、遠くの軽い質量と釣り合います。' },
      { en: 'Doubling a distance has the same effect as doubling the mass.', zh: '距离加倍与质量加倍效果相同。', ja: '距離を 2 倍にするのは、質量を 2 倍にするのと同じ効果です。' },
    ],
  },
};
