// Physics: Black Hole simulation (Schwarzschild radius, photon sphere, accretion disk).
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { label } from './canvasUtils';

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

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed } = rc;
  // black holes look best on a dark field regardless of theme
  ctx.fillStyle = '#05070f'; ctx.fillRect(0, 0, w, h);
  const r = computed.render;
  const cx = w / 2, cy = h / 2;
  const maxR = Math.min(w, h) * 0.46;
  // event-horizon visual radius grows with log(mass) but stays framed
  const rsPx = Math.max(16, Math.min(maxR * 0.42, 14 + Math.log(r.M + 1) * 16));

  // accretion disk: particles orbiting Keplerian-style (faster nearer in)
  const inner = rsPx * 1.6, outer = maxR;
  const N = 260;
  for (let i = 0; i < N; i++) {
    const fr = rand(i);
    const rad = inner + fr * (outer - inner);
    const omega = 1.4 * Math.pow(rsPx / rad, 1.5);
    const ang = rand(i + 99) * Math.PI * 2 + omega * r.t * 3;
    // slight ellipse to suggest a tilted disk
    const x = cx + rad * Math.cos(ang);
    const y = cy + rad * 0.35 * Math.sin(ang);
    // colour: hot/white near the horizon → orange/red outwards
    const heat = 1 - (rad - inner) / (outer - inner);
    const cr = 255, cg = Math.round(120 + heat * 135), cb = Math.round(40 + heat * 160);
    ctx.fillStyle = `rgba(${cr},${cg},${cb},${0.5 + heat * 0.5})`;
    ctx.beginPath(); ctx.arc(x, y, 1.6 + heat * 1.8, 0, Math.PI * 2); ctx.fill();
  }

  // photon sphere ring (1.5 Rs)
  ctx.strokeStyle = 'rgba(125,211,252,0.7)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 5]);
  ctx.beginPath(); ctx.arc(cx, cy, rsPx * 1.5, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);

  // glowing photon ring just outside the horizon
  const ring = ctx.createRadialGradient(cx, cy, rsPx, cx, cy, rsPx * 1.5);
  ring.addColorStop(0, 'rgba(255,200,120,0.0)');
  ring.addColorStop(0.7, 'rgba(255,180,90,0.5)');
  ring.addColorStop(1, 'rgba(255,180,90,0)');
  ctx.fillStyle = ring;
  ctx.beginPath(); ctx.arc(cx, cy, rsPx * 1.5, 0, Math.PI * 2); ctx.fill();

  // event horizon (pure black with a thin rim)
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(cx, cy, rsPx, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,200,120,0.6)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, rsPx, 0, Math.PI * 2); ctx.stroke();

  ctx.fillStyle = '#cbd5e1'; ctx.font = '11px system-ui'; ctx.textAlign = 'center';
  ctx.fillText('photon sphere', cx, cy - rsPx * 1.5 - 6);
  label(ctx, `${r.M.toFixed(0)} M☉ · event horizon Rs = ${r.Rs.toFixed(1)} km`, w / 2, h - 12, '#e2e8f0', 'bold 13px system-ui', 'center');
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
