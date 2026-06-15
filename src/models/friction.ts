// Physics: Friction on a flat surface (static vs kinetic).
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, label } from './canvasUtils';

const G = 9.8;
const TRACK = 6; // metres of slide for the animation

function mechanics(vars: Variables) {
  const m = vars.mass as number;
  const muS = vars.muStatic as number;
  const muK = vars.muKinetic as number;
  const F = vars.appliedForce as number;
  const N = m * G;
  const maxStatic = muS * N;
  const moving = F > maxStatic + 1e-9;
  const kinetic = muK * N;
  const friction = moving ? kinetic : F;
  const net = moving ? F - kinetic : 0;
  const accel = net / m;
  return { m, muS, muK, F, N, maxStatic, moving, friction, net, accel };
}

function compute(vars: Variables, t: number): ComputeResult {
  const r = mechanics(vars);
  const x = r.accel > 0 ? Math.min(TRACK, 0.5 * r.accel * t * t) : 0;
  return {
    data: [
      { key: 'state', label: 'State', labelZh: '状态', value: r.moving ? 'sliding' : 'static' },
      { key: 'maxStatic', label: 'Max static friction', labelZh: '最大静摩擦力', value: r.maxStatic, unit: 'N', precision: 1 },
      { key: 'friction', label: 'Friction force', labelZh: '摩擦力', value: r.friction, unit: 'N', precision: 1 },
      { key: 'accel', label: 'Acceleration', labelZh: '加速度', value: r.accel, unit: 'm/s²', precision: 2 },
    ],
    render: { ...r, x },
  };
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  const r = computed.render;
  const groundY = h * 0.66;

  // ground with hatching
  ctx.strokeStyle = p.axis; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(w, groundY); ctx.stroke();
  ctx.strokeStyle = p.grid; ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 16) { ctx.beginPath(); ctx.moveTo(x, groundY); ctx.lineTo(x - 10, groundY + 12); ctx.stroke(); }

  // block
  const size = 54;
  const x0 = w * 0.18 + (r.x / TRACK) * (w * 0.5);
  const by = groundY - size;
  ctx.fillStyle = r.moving ? '#fbbf24' : '#5eead4';
  ctx.fillRect(x0, by, size, size);
  ctx.fillStyle = isDark ? '#0e1426' : '#0f172a';
  ctx.font = 'bold 13px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(`${r.m}kg`, x0 + size / 2, by + size / 2);
  ctx.textBaseline = 'alphabetic';

  const cy = by + size / 2;
  // applied force (right)
  if (r.F > 0) {
    const len = Math.min(80, 16 + r.F * 0.8);
    ctx.strokeStyle = '#f472b6'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x0 + size, cy); ctx.lineTo(x0 + size + len, cy); ctx.stroke();
    ctx.fillStyle = '#f472b6';
    ctx.beginPath(); ctx.moveTo(x0 + size + len, cy); ctx.lineTo(x0 + size + len - 8, cy - 5); ctx.lineTo(x0 + size + len - 8, cy + 5); ctx.closePath(); ctx.fill();
    label(ctx, `F ${r.F.toFixed(0)}N`, x0 + size + len, cy - 10, '#f472b6', '11px system-ui', 'center');
  }
  // friction (left)
  if (r.friction > 0.01) {
    const len = Math.min(80, 16 + r.friction * 0.8);
    ctx.strokeStyle = '#60a5fa'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x0, cy); ctx.lineTo(x0 - len, cy); ctx.stroke();
    ctx.fillStyle = '#60a5fa';
    ctx.beginPath(); ctx.moveTo(x0 - len, cy); ctx.lineTo(x0 - len + 8, cy - 5); ctx.lineTo(x0 - len + 8, cy + 5); ctx.closePath(); ctx.fill();
    label(ctx, `f ${r.friction.toFixed(0)}N`, x0 - len, cy - 10, '#60a5fa', '11px system-ui', 'center');
  }

  label(ctx, r.moving ? `sliding · a = ${r.accel.toFixed(2)} m/s²` : 'static — friction balances the push',
    w / 2, h - 12, r.moving ? '#fbbf24' : p.subtle, 'bold 14px system-ui', 'center');
}

export const friction: ModelDefinition = {
  meta: {
    id: 'friction-flat',
    title: 'Friction',
    titleZh: '摩擦力',
    titleJa: '摩擦',
    subject: 'physics',
    description: 'Push a block on a flat surface and find the threshold where static friction gives way to sliding.',
    descriptionZh: '在平面上推动木块，找出静摩擦转为滑动的临界点。',
    descriptionJa: '平らな面で物体を押し、静止摩擦が滑りに変わる境目を見つけます。',
    difficulty: 'high-school',
    tags: ['forces', 'friction', 'static', 'kinetic'],
    accent: '#5eead4',
  },
  controls: [
    { type: 'slider', key: 'appliedForce', label: 'Applied force', labelZh: '施加的力', min: 0, max: 100, step: 1, unit: 'N' },
    { type: 'slider', key: 'mass', label: 'Mass', labelZh: '质量', min: 1, max: 20, step: 1, unit: 'kg' },
    { type: 'slider', key: 'muStatic', label: 'Static coefficient μs', labelZh: '静摩擦系数 μs', min: 0, max: 1, step: 0.05 },
    { type: 'slider', key: 'muKinetic', label: 'Kinetic coefficient μk', labelZh: '动摩擦系数 μk', min: 0, max: 1, step: 0.05 },
  ],
  defaultVariables: { appliedForce: 20, mass: 5, muStatic: 0.5, muKinetic: 0.3 },
  presets: [
    { name: 'Not moving', nameZh: '未移动', variables: { appliedForce: 20, mass: 5, muStatic: 0.5, muKinetic: 0.3 } },
    { name: 'Just sliding', nameZh: '刚好滑动', variables: { appliedForce: 30, mass: 5, muStatic: 0.5, muKinetic: 0.3 } },
    { name: 'Slippery', nameZh: '光滑', variables: { appliedForce: 20, mass: 5, muStatic: 0.15, muKinetic: 0.1 } },
  ],
  concepts: [
    'Static friction adjusts to match your push, up to a maximum of μs·N.',
    'Once the push exceeds that maximum, the block breaks free and slides.',
    'While sliding, kinetic friction μk·N is usually smaller than the static limit.',
    'Friction depends on the normal force, not on the contact area.',
  ],
  conceptsZh: [
    '静摩擦力会随你的推力自动调整，最大为 μs·N。',
    '一旦推力超过该最大值，木块就挣脱并开始滑动。',
    '滑动时，动摩擦力 μk·N 通常小于静摩擦极限。',
    '摩擦力取决于法向力，而非接触面积。',
  ],
  formulas: [
    { tex: 'f_{s,\\max} = \\mu_s N', label: 'Max static friction', labelZh: '最大静摩擦力' },
    { tex: 'f_k = \\mu_k N', label: 'Kinetic friction', labelZh: '动摩擦力' },
  ],
  animated: true,
  supportsStep: true,
  duration: (vars) => {
    const r = mechanics(vars);
    return r.accel > 0 ? Math.sqrt((2 * TRACK) / r.accel) * 1.1 : 3;
  },
  compute,
  render,
  suggestedQuestions: [
    { en: 'Why does the block not move at first?', zh: '为什么木块一开始不动？' },
    { en: 'What force is needed to start it sliding?', zh: '需要多大的力才能让它滑动？' },
    { en: 'Why is it easier to keep something moving than to start it?', zh: '为什么让物体保持运动比让它开始运动更容易？' },
  ],
  learn: {
    intro: {
      en: 'Friction is the force that resists sliding between two surfaces — and it behaves differently before and after motion starts.',
      zh: '摩擦力是阻碍两个表面之间相对滑动的力——在运动开始前后表现不同。',
      ja: '摩擦は 2 つの面の滑りを妨げる力で、動き出す前と後で振る舞いが変わります。',
    },
    principle: {
      en: 'At rest, static friction quietly grows to exactly cancel your push, up to a ceiling of μs·N. Beyond that the surfaces slip and a usually-weaker kinetic friction μk·N takes over, so the leftover force accelerates the block.',
      zh: '静止时，静摩擦力会悄悄增大，恰好抵消你的推力，直到上限 μs·N。超过后表面打滑，通常较弱的动摩擦力 μk·N 接管，剩余的力使木块加速。',
      ja: '静止時、静止摩擦は押す力をちょうど打ち消すまで増え、上限は μs·N です。それを超えると滑り、ふつうより弱い動摩擦 μk·N に変わり、余った力が物体を加速します。',
    },
    tips: [
      { en: 'Raise the applied force slowly and watch the block stay put until it suddenly slides.', zh: '缓慢增大施加的力，木块会一直不动直到突然滑动。', ja: '力をゆっくり上げると、物体は急に滑り出すまで動きません。' },
      { en: 'The slide starts when the push passes μs·N (try the "just sliding" preset).', zh: '当推力超过 μs·N 时开始滑动（试试“刚好滑动”预设）。', ja: '押す力が μs·N を超えると滑り始めます（「ちょうど滑り」プリセット）。' },
      { en: 'Because μk < μs, less force is needed to keep it moving than to start it.', zh: '由于 μk < μs，保持运动所需的力小于启动所需的力。', ja: 'μk < μs なので、動かし続ける力は動かし始める力より小さくて済みます。' },
    ],
  },
};
