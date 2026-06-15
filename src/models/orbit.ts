// Physics: Gravitation & Circular Orbits (units with G = 1).
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, label } from './canvasUtils';

const R_MAX = 10;

function physics(vars: Variables) {
  const M = vars.starMass as number;
  const r = vars.radius as number;
  const v = Math.sqrt(M / r);          // circular orbit speed (G = 1)
  const T = (2 * Math.PI * r) / v;     // = 2π √(r³/M)
  const g = M / (r * r);               // gravitational acceleration at orbit
  return { M, r, v, T, g };
}

function compute(vars: Variables, t: number): ComputeResult {
  const p = physics(vars);
  const theta = (2 * Math.PI * t) / p.T;
  return {
    data: [
      { key: 'speed', label: 'Orbital speed', labelZh: '轨道速度', value: p.v, unit: 'u/s', precision: 2 },
      { key: 'period', label: 'Orbital period', labelZh: '轨道周期', value: p.T, unit: 's', precision: 2 },
      { key: 'gravity', label: 'Gravity at orbit', labelZh: '轨道处引力', value: p.g, unit: 'u/s²', precision: 3 },
    ],
    render: { ...p, theta },
  };
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  const r = computed.render;
  const cx = w / 2, cy = h / 2;
  const maxR = Math.min(w, h) * 0.4;
  const rPx = Math.max(24, (r.r / R_MAX) * maxR);

  // orbit path
  ctx.strokeStyle = p.grid; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(cx, cy, rPx, 0, Math.PI * 2); ctx.stroke();

  // star (size grows with mass)
  const starR = 8 + r.M * 1.6;
  const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, starR);
  grad.addColorStop(0, '#fde68a'); grad.addColorStop(1, '#f59e0b');
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.arc(cx, cy, starR, 0, Math.PI * 2); ctx.fill();

  // planet
  const px = cx + rPx * Math.cos(r.theta), py = cy + rPx * Math.sin(r.theta);
  ctx.fillStyle = '#60a5fa';
  ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2); ctx.fill();

  // velocity vector (tangent)
  const tx = -Math.sin(r.theta), ty = Math.cos(r.theta);
  ctx.strokeStyle = '#34d399'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + tx * 30, py + ty * 30); ctx.stroke();

  label(ctx, `v = ${r.v.toFixed(2)} · T = ${r.T.toFixed(1)}`, w / 2, h - 12, p.text, 'bold 14px system-ui', 'center');
}

export const orbit: ModelDefinition = {
  meta: {
    id: 'orbital-gravitation',
    title: 'Gravitation & Orbits',
    titleZh: '万有引力与轨道',
    titleJa: '万有引力と軌道',
    subject: 'physics',
    description: 'Orbit a planet around a star and discover how mass and radius set the speed and period.',
    descriptionZh: '让行星绕恒星运行，发现质量和半径如何决定速度与周期。',
    descriptionJa: '惑星を恒星の周りで公転させ、質量と半径が速さと周期をどう決めるかを発見します。',
    difficulty: 'high-school',
    tags: ['gravity', 'orbit', 'Kepler', 'astronomy'],
    accent: '#60a5fa',
  },
  controls: [
    { type: 'slider', key: 'starMass', label: 'Star mass', labelZh: '恒星质量', min: 1, max: 10, step: 0.5 },
    { type: 'slider', key: 'radius', label: 'Orbit radius', labelZh: '轨道半径', min: 1, max: 10, step: 0.5 },
  ],
  defaultVariables: { starMass: 5, radius: 5 },
  presets: [
    { name: 'Default', nameZh: '默认', variables: { starMass: 5, radius: 5 } },
    { name: 'Close orbit', nameZh: '近轨道', variables: { starMass: 5, radius: 2 } },
    { name: 'Massive star', nameZh: '大质量恒星', variables: { starMass: 10, radius: 5 } },
  ],
  concepts: [
    'Gravity provides the centripetal force that holds a planet in orbit.',
    'For a circular orbit the speed is v = √(GM/r): closer orbits move faster.',
    "Kepler's third law: the period squared grows with the radius cubed (T² ∝ r³).",
    'A more massive star pulls planets around faster at the same radius.',
  ],
  conceptsZh: [
    '引力提供使行星维持轨道的向心力。',
    '圆轨道速度为 v = √(GM/r)：越近的轨道运行越快。',
    '开普勒第三定律：周期的平方随半径的立方增长（T² ∝ r³）。',
    '质量更大的恒星在相同半径上把行星拉得更快。',
  ],
  formulas: [
    { tex: 'v = \\sqrt{\\dfrac{GM}{r}}', label: 'Orbital speed', labelZh: '轨道速度' },
    { tex: 'T^2 \\propto r^3', label: "Kepler's third law", labelZh: '开普勒第三定律' },
  ],
  animated: true,
  supportsStep: true,
  duration: (vars) => physics(vars).T,
  compute,
  render,
  suggestedQuestions: [
    { en: 'Why do closer planets orbit faster?', zh: '为什么更近的行星运行更快？' },
    { en: "What is Kepler's third law?", zh: '什么是开普勒第三定律？' },
    { en: 'How does the star’s mass change the orbit?', zh: '恒星质量如何改变轨道？' },
  ],
  learn: {
    intro: {
      en: 'Gravity keeps planets, moons, and satellites in orbit by constantly pulling them toward the body they circle.',
      zh: '引力不断把行星、卫星拉向它们环绕的天体，从而维持轨道运行。',
      ja: '重力は、惑星・衛星・人工衛星を回る相手へ絶えず引きつけ、軌道に保ちます。',
    },
    principle: {
      en: 'An orbit is continual free-fall: gravity supplies exactly the centripetal force needed to curve the path into a loop. This fixes the speed at v = √(GM/r), so smaller orbits and heavier stars mean faster motion and shorter periods.',
      zh: '轨道是持续的自由下落：引力恰好提供使路径弯成环形所需的向心力。这确定了速度 v = √(GM/r)，因此更小的轨道和更重的恒星意味着更快的运动和更短的周期。',
      ja: '軌道は絶え間ない自由落下です。重力が経路を環にするのに必要な向心力をちょうど与え、速さは v = √(GM/r) に定まります。小さい軌道や重い恒星ほど速く、周期は短くなります。',
    },
    tips: [
      { en: 'Shrink the orbit radius and watch the planet whip around faster.', zh: '减小轨道半径，看行星绕得更快。', ja: '軌道半径を小さくすると、惑星は速く回ります。' },
      { en: 'Increase the star mass for stronger gravity and a quicker orbit.', zh: '增大恒星质量，引力更强、公转更快。', ja: '恒星の質量を増やすと重力が強まり、公転が速くなります。' },
      { en: 'Compare periods at different radii to see Kepler’s T² ∝ r³ law.', zh: '比较不同半径下的周期，验证开普勒 T² ∝ r³ 定律。', ja: '半径ごとの周期を比べ、ケプラーの T² ∝ r³ を確かめましょう。' },
    ],
  },
};
