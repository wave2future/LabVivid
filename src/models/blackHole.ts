// Physics: Black Hole simulation (Schwarzschild radius, photon sphere, accretion disk).
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';

// Schwarzschild radius of the Sun ≈ 2.95 km, so Rs ≈ 2.95·M (M in solar masses).
const RS_PER_SOLAR = 2.95;

function physics(vars: Variables) {
  const M = vars.mass as number;
  const Rs = RS_PER_SOLAR * M;       // km
  const photon = 1.5 * Rs;           // photon sphere
  const isco = 3 * Rs;               // innermost stable circular orbit
  return { M, Rs, photon, isco };
}

function compute(vars: Variables, t: number): ComputeResult {
  const r = physics(vars);
  return {
    data: [
      { key: 'rs', label: 'Event horizon (Rs)', labelZh: '事件视界 (Rs)', value: r.Rs, unit: 'km', precision: 1 },
      { key: 'photon', label: 'Photon sphere', labelZh: '光子球', value: r.photon, unit: 'km', precision: 1 },
      { key: 'isco', label: 'Innermost stable orbit', labelZh: '最内稳定轨道', value: r.isco, unit: 'km', precision: 1 },
      { key: 'mass', label: 'Mass', labelZh: '质量', value: r.M, unit: 'M☉', precision: 1 },
    ],
    render: { ...r, t },
  };
}

// deterministic pseudo-random in [0,1)
function rand(i: number) { return Math.abs((Math.sin(i * 127.1 + 311.7) * 43758.5453) % 1); }

// Library-card thumbnail: an "Interstellar"-style lensed black hole.
function render(rc: RenderContext): void {
  const { ctx, width: w, height: h } = rc;
  ctx.fillStyle = '#04060d'; ctx.fillRect(0, 0, w, h);
  // starfield
  for (let i = 0; i < 80; i++) {
    const sx = rand(i) * w, sy = rand(i + 60) * h, b = 0.25 + rand(i + 130) * 0.6;
    ctx.fillStyle = `rgba(200,212,238,${b})`;
    ctx.fillRect(sx, sy, 1.2, 1.2);
  }
  const cx = w / 2, cy = h / 2;
  const rs = Math.min(w, h) * 0.17;

  // accretion disk: flat elliptical glow behind the hole
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, 0.26);
  const g = ctx.createRadialGradient(0, 0, rs * 1.02, 0, 0, rs * 3.6);
  g.addColorStop(0, 'rgba(255,255,255,0.95)');
  g.addColorStop(0.16, 'rgba(255,214,150,0.95)');
  g.addColorStop(0.45, 'rgba(255,140,55,0.7)');
  g.addColorStop(1, 'rgba(120,40,20,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, rs * 3.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // gravitationally-lensed arc rising over the top of the hole
  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(255,226,170,0.9)';
  ctx.lineWidth = Math.max(2, rs * 0.18);
  ctx.beginPath(); ctx.ellipse(0, 0, rs * 1.5, rs * 1.42, 0, Math.PI * 1.04, Math.PI * 1.96); ctx.stroke();
  ctx.restore();

  // event horizon (pure black)
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(cx, cy, rs, 0, Math.PI * 2); ctx.fill();

  // bright photon ring just outside the horizon
  ctx.strokeStyle = 'rgba(255,236,202,0.95)';
  ctx.lineWidth = Math.max(1.5, rs * 0.08);
  ctx.beginPath(); ctx.arc(cx, cy, rs * 1.06, 0, Math.PI * 2); ctx.stroke();
}

export const blackHole: ModelDefinition = {
  meta: {
    id: 'black-hole',
    title: 'Black Hole',
    titleZh: '黑洞',
    titleJa: 'ブラックホール',
    subject: 'physics',
    description: 'Explore a black hole: its event horizon, photon sphere, and a swirling accretion disk.',
    descriptionZh: '探索黑洞：它的事件视界、光子球和旋转的吸积盘。',
    descriptionJa: 'ブラックホールを探究：事象の地平面・光子球・渦巻く降着円盤。',
    difficulty: 'college',
    tags: ['gravity', 'relativity', 'astrophysics', 'event horizon'],
    accent: '#f59e0b',
  },
  controls: [],
  defaultVariables: { mass: 10 },
  presets: [],
  concepts: [
    'The event horizon is the boundary where escape would require faster than light — nothing gets out.',
    'Its size, the Schwarzschild radius Rs = 2GM/c², is directly proportional to mass.',
    'At the photon sphere (1.5 Rs) light itself can orbit the black hole.',
    'Infalling gas forms a hot accretion disk that glows brightest near the horizon.',
  ],
  conceptsZh: [
    '事件视界是逃逸所需速度超过光速的边界——任何东西都无法逃出。',
    '它的大小，即史瓦西半径 Rs = 2GM/c²，与质量成正比。',
    '在光子球（1.5 Rs）处，连光本身都能绕黑洞运行。',
    '落入的气体形成炽热的吸积盘，在视界附近最明亮。',
  ],
  formulas: [
    { tex: 'R_s = \\dfrac{2GM}{c^2}', label: 'Schwarzschild radius', labelZh: '史瓦西半径' },
    { tex: 'r_{photon} = 1.5\\,R_s', label: 'Photon sphere', labelZh: '光子球' },
  ],
  animated: true,
  supportsStep: false,
  duration: () => 1e6,
  compute,
  render,
  suggestedQuestions: [
    { en: 'What is the event horizon?', zh: '什么是事件视界？' },
    { en: 'Why does the accretion disk glow?', zh: '吸积盘为什么会发光？' },
    { en: 'How big is a 10 solar-mass black hole?', zh: '10 倍太阳质量的黑洞有多大？' },
  ],
  learn: {
    intro: {
      en: 'A black hole is a region where gravity is so strong that not even light can escape once it crosses the edge.',
      zh: '黑洞是一个引力极强的区域，任何东西一旦越过边界，连光都无法逃出。',
      ja: 'ブラックホールは重力が非常に強い領域で、ふちを越えると光さえ脱出できません。',
    },
    principle: {
      en: 'Compressing mass into a small enough space bends spacetime until the escape speed reaches the speed of light. That boundary is the event horizon, whose radius Rs = 2GM/c² scales with mass. Just outside, gas spirals inward, heating up and radiating as a brilliant accretion disk, while at 1.5 Rs light can circle in the photon sphere.',
      zh: '把质量压缩到足够小的空间，会使时空弯曲，直到逃逸速度达到光速。那条边界就是事件视界，其半径 Rs = 2GM/c² 与质量成正比。在它外侧，气体向内盘旋、升温并辐射，形成明亮的吸积盘；而在 1.5 Rs 处，光可以在光子球内环绕。',
      ja: '質量を十分小さな空間に圧縮すると時空が曲がり、脱出速度が光速に達します。その境界が事象の地平面で、半径 Rs = 2GM/c² は質量に比例します。すぐ外では気体が渦を巻いて落ち込み、熱を帯びて明るい降着円盤として輝き、1.5 Rs では光が光子球を周回できます。',
    },
    tips: [
      { en: 'Increase the mass and the event horizon (Rs) grows in direct proportion.', zh: '增大质量，事件视界（Rs）成正比增大。', ja: '質量を増やすと、事象の地平面（Rs）が比例して大きくなります。' },
      { en: 'The disk spins faster closer in — that inner gas is the hottest and brightest.', zh: '越靠内盘旋越快——内侧气体最热、最亮。', ja: '内側ほど速く回り、その気体が最も熱く明るくなります。' },
      { en: 'The dashed ring marks the photon sphere, where light can orbit.', zh: '虚线环标示光子球，光可在此环绕。', ja: '破線の輪は光子球で、そこでは光が周回できます。' },
    ],
  },
};
