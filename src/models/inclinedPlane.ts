// Physics: Inclined Plane with Friction.
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, label } from './canvasUtils';

const DEG = Math.PI / 180;
const RAMP_LENGTH = 5; // metres along the incline (for the slide animation)

function mechanics(vars: Variables) {
  const angle = (vars.angle as number) * DEG;
  const m = vars.mass as number;
  const mu = vars.friction as number;
  const g = vars.gravity as number;
  const normal = m * g * Math.cos(angle);
  const driving = m * g * Math.sin(angle); // gravity component along the incline
  const maxStatic = mu * normal;
  const sliding = driving > maxStatic + 1e-9;
  const frictionForce = sliding ? mu * normal : driving;
  const accel = sliding ? g * (Math.sin(angle) - mu * Math.cos(angle)) : 0;
  return { angle, m, mu, g, normal, driving, frictionForce, sliding, accel };
}

function compute(vars: Variables, t: number): ComputeResult {
  const r = mechanics(vars);
  // distance slid (clamped to the ramp length) for the animation
  const s = r.accel > 0 ? Math.min(RAMP_LENGTH, 0.5 * r.accel * t * t) : 0;

  const points: { x: number; y: number }[] = [];
  for (let deg = 0; deg <= 60; deg += 1) {
    const a = deg * DEG;
    const acc = Math.max(0, r.g * (Math.sin(a) - r.mu * Math.cos(a)));
    points.push({ x: deg, y: acc });
  }

  return {
    data: [
      { key: 'accel', label: 'Acceleration', labelZh: '加速度', value: r.accel, unit: 'm/s²', precision: 2 },
      { key: 'normal', label: 'Normal force', labelZh: '法向力', value: r.normal, unit: 'N', precision: 1 },
      { key: 'driving', label: 'Gravity along ramp', labelZh: '沿斜面重力', value: r.driving, unit: 'N', precision: 1 },
      { key: 'friction', label: 'Friction force', labelZh: '摩擦力', value: r.frictionForce, unit: 'N', precision: 1 },
      { key: 'state', label: 'State', labelZh: '状态', value: r.sliding ? 'sliding' : 'static' },
    ],
    chart: {
      title: 'Acceleration vs angle', titleZh: '加速度-角度',
      xLabel: 'angle (°)', yLabel: 'a (m/s²)',
      series: [{ name: 'a', color: '#5eead4', points }],
      marker: { x: vars.angle as number, y: r.accel },
    },
    render: { ...r, s },
  };
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  const r = computed.render;
  const pad = 40;
  const baseY = h - pad;
  const base = w - pad * 2;
  const height = Math.min(h - pad * 2, base * Math.tan(r.angle));
  const x0 = pad;                 // bottom-left
  const topX = pad, topY = baseY - height; // top-left (apex of incline)
  const botX = pad + base, botY = baseY;   // bottom-right (foot)

  // triangle (ramp)
  ctx.fillStyle = isDark ? 'rgba(94,234,212,0.10)' : 'rgba(13,148,136,0.10)';
  ctx.strokeStyle = p.axis; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x0, baseY); ctx.lineTo(topX, topY); ctx.lineTo(botX, botY); ctx.closePath();
  ctx.fill(); ctx.stroke();

  // angle label near foot
  label(ctx, `${(r.angle / DEG).toFixed(0)}°`, botX - 30, botY - 8, p.text, '13px system-ui', 'right');

  // block position along hypotenuse from top (apex) toward foot
  const u = RAMP_LENGTH > 0 ? r.s / RAMP_LENGTH : 0;
  const bx = topX + (botX - topX) * u;
  const by = topY + (botY - topY) * u;
  const size = 30;
  ctx.save();
  ctx.translate(bx, by);
  ctx.rotate(r.angle); // align block to the slope (surface descends to the right)
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(-size / 2, -size, size, size);
  ctx.restore();

  // status text
  label(ctx, r.sliding ? `sliding · a = ${r.accel.toFixed(2)} m/s²` : 'static (friction holds)',
    w / 2, pad - 6 + 8, r.sliding ? '#fbbf24' : p.subtle, 'bold 14px system-ui', 'center');
}

export const inclinedPlane: ModelDefinition = {
  meta: {
    id: 'inclined-plane',
    title: 'Inclined Plane',
    titleZh: '斜面',
    titleJa: '斜面',
    subject: 'physics',
    description: 'Balance gravity against friction on a ramp and find when a block starts to slide.',
    descriptionZh: '在斜面上权衡重力与摩擦力，找出物体何时开始滑动。',
    descriptionJa: '斜面上で重力と摩擦のつり合いを調べ、物体が滑り出す条件を見つけます。',
    difficulty: 'high-school',
    tags: ['forces', 'friction', 'gravity', 'newton'],
    accent: '#5eead4',
  },
  controls: [
    { type: 'slider', key: 'angle', label: 'Incline angle', labelZh: '倾角', min: 0, max: 60, step: 1, unit: '°' },
    { type: 'slider', key: 'mass', label: 'Mass', labelZh: '质量', min: 0.5, max: 20, step: 0.5, unit: 'kg' },
    { type: 'slider', key: 'friction', label: 'Friction coefficient', labelZh: '摩擦系数', min: 0, max: 1, step: 0.01 },
    { type: 'slider', key: 'gravity', label: 'Gravity', labelZh: '重力加速度', min: 1, max: 20, step: 0.1, unit: 'm/s²' },
  ],
  defaultVariables: { angle: 30, mass: 2, friction: 0.3, gravity: 9.8 },
  presets: [
    { name: 'Just sliding', nameZh: '临界滑动', variables: { angle: 30, mass: 2, friction: 0.3, gravity: 9.8 } },
    { name: 'Held by friction', nameZh: '摩擦保持', variables: { angle: 15, mass: 2, friction: 0.5, gravity: 9.8 } },
    { name: 'Frictionless', nameZh: '无摩擦', variables: { angle: 30, mass: 2, friction: 0, gravity: 9.8 } },
    { name: 'Steep ramp', nameZh: '陡坡', variables: { angle: 50, mass: 2, friction: 0.2, gravity: 9.8 } },
  ],
  concepts: [
    'Gravity along the incline is m·g·sinθ; the normal force is m·g·cosθ.',
    'The block stays still while m·g·sinθ ≤ μ·m·g·cosθ, i.e. tanθ ≤ μ.',
    'Once sliding, acceleration is a = g(sinθ − μcosθ) and is independent of mass.',
    'A frictionless ramp gives a = g·sinθ.',
  ],
  conceptsZh: [
    '沿斜面的重力分量为 m·g·sinθ；法向力为 m·g·cosθ。',
    '当 m·g·sinθ ≤ μ·m·g·cosθ（即 tanθ ≤ μ）时物体保持静止。',
    '一旦滑动，加速度 a = g(sinθ − μcosθ)，与质量无关。',
    '无摩擦时 a = g·sinθ。',
  ],
  formulas: [
    { tex: 'a = g(\\sin\\theta - \\mu\\cos\\theta)', label: 'Sliding acceleration', labelZh: '滑动加速度' },
    { tex: 'N = m g \\cos\\theta', label: 'Normal force', labelZh: '法向力' },
  ],
  animated: true,
  supportsStep: true,
  duration: (vars) => {
    const r = mechanics(vars);
    return r.accel > 0 ? Math.sqrt((2 * RAMP_LENGTH) / r.accel) * 1.1 : 3;
  },
  compute,
  render,
  suggestedQuestions: [
    { en: 'At what angle does the block start to slide?', zh: '物体在什么角度开始滑动？' },
    { en: 'Does mass affect the acceleration?', zh: '质量会影响加速度吗？' },
    { en: 'What does the friction coefficient change?', zh: '摩擦系数改变了什么？' },
  ],
  learn: {
    intro: {
      en: 'An inclined plane shows how gravity splits into components and competes with friction on a slope.',
      zh: '斜面展示了重力如何分解为分量，并在坡面上与摩擦力相互作用。',
      ja: '斜面は、重力が成分に分かれ、坂の上で摩擦と競い合う様子を示します。',
    },
    principle: {
      en: "The block slides only when the pull down the slope (mg sinθ) exceeds the maximum friction (μmg cosθ); once sliding, its acceleration does not depend on mass.",
      zh: '只有当沿斜面的下滑力（mg sinθ）超过最大摩擦力（μmg cosθ）时物体才滑动；一旦滑动，加速度与质量无关。',
      ja: '斜面に沿う力（mg sinθ）が最大摩擦力（μmg cosθ）を超えたときだけ滑り出します。滑り始めると加速度は質量に依存しません。',
    },
    tips: [
      { en: 'Raise the angle until the block just begins to slide (tanθ = μ).', zh: '增大角度，直到物体刚好开始滑动（tanθ = μ）。', ja: 'tanθ = μ になるまで角度を上げると、ちょうど滑り始めます。' },
      { en: 'Set friction to zero to see pure gravitational acceleration.', zh: '将摩擦设为零，观察纯重力加速度。', ja: '摩擦をゼロにすると、純粋な重力加速度が見られます。' },
      { en: 'Mass changes the forces but not the acceleration.', zh: '质量改变受力，但不改变加速度。', ja: '質量は力を変えますが、加速度は変えません。' },
    ],
  },
};
