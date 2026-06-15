// Physics: Solar System simulation (Keplerian orbits).
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, label } from './canvasUtils';

interface Planet { name: string; nameZh: string; a: number; color: string; size: number; }
const PLANETS: Planet[] = [
  { name: 'Mercury', nameZh: '水星', a: 0.39, color: '#a8a29e', size: 3 },
  { name: 'Venus', nameZh: '金星', a: 0.72, color: '#fbbf24', size: 5 },
  { name: 'Earth', nameZh: '地球', a: 1.0, color: '#60a5fa', size: 5 },
  { name: 'Mars', nameZh: '火星', a: 1.52, color: '#f87171', size: 4 },
  { name: 'Jupiter', nameZh: '木星', a: 5.2, color: '#fb923c', size: 10 },
  { name: 'Saturn', nameZh: '土星', a: 9.58, color: '#fde68a', size: 9 },
  { name: 'Uranus', nameZh: '天王星', a: 19.2, color: '#5eead4', size: 7 },
  { name: 'Neptune', nameZh: '海王星', a: 30.05, color: '#818cf8', size: 7 },
];

function compute(vars: Variables, t: number): ComputeResult {
  const timeScale = vars.timeScale as number;
  const count = Math.round(vars.planetCount as number);
  const years = t * timeScale;
  const outer = PLANETS[count - 1];
  const outerPeriod = Math.pow(outer.a, 1.5);
  return {
    data: [
      { key: 'years', label: 'Years elapsed', labelZh: '已过年数', value: years, unit: 'yr', precision: 1 },
      { key: 'planets', label: 'Planets shown', labelZh: '显示行星数', value: count, precision: 0 },
      { key: 'outer', label: `Outer period (${outer.name})`, labelZh: `最外行星周期（${outer.nameZh}）`, value: outerPeriod, unit: 'yr', precision: 1 },
    ],
    render: { years, count, showLabels: vars.showLabels as boolean },
  };
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  const r = computed.render;
  const cx = w / 2, cy = h / 2;
  const maxR = Math.min(w, h) * 0.44;
  const shown = PLANETS.slice(0, r.count);
  const maxA = shown[shown.length - 1].a;
  const rPx = (a: number) => Math.sqrt(a / maxA) * maxR; // sqrt spacing so inner planets stay visible

  // sun
  const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 14);
  grad.addColorStop(0, '#fff7cc'); grad.addColorStop(1, '#f59e0b');
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2); ctx.fill();

  for (const pl of shown) {
    const rad = rPx(pl.a);
    // orbit
    ctx.strokeStyle = p.grid; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.stroke();
    // planet position (Kepler: T = a^1.5 years)
    const period = Math.pow(pl.a, 1.5);
    const ang = (2 * Math.PI * r.years) / period;
    const x = cx + rad * Math.cos(ang), y = cy + rad * Math.sin(ang);
    ctx.fillStyle = pl.color;
    ctx.beginPath(); ctx.arc(x, y, pl.size, 0, Math.PI * 2); ctx.fill();
    if (r.showLabels) {
      label(ctx, pl.name, x, y - pl.size - 4, p.subtle, '10px system-ui', 'center');
    }
  }

  label(ctx, `${r.years.toFixed(1)} years`, w / 2, h - 12, p.text, 'bold 14px system-ui', 'center');
}

export const solarSystem: ModelDefinition = {
  meta: {
    id: 'solar-system',
    title: 'Solar System',
    titleZh: '太阳系',
    titleJa: '太陽系',
    subject: 'physics',
    description: 'Watch the planets orbit the Sun, with inner worlds racing around faster than the outer giants.',
    descriptionZh: '观察行星绕太阳运行，内行星比外侧巨行星转得更快。',
    descriptionJa: '惑星が太陽を公転する様子を観察します。内側の惑星は外側の巨大惑星より速く回ります。',
    difficulty: 'middle-school',
    tags: ['astronomy', 'orbit', 'Kepler', 'planets'],
    accent: '#fbbf24',
  },
  controls: [
    { type: 'slider', key: 'timeScale', label: 'Time speed', labelZh: '时间速度', min: 0.1, max: 5, step: 0.1, unit: 'yr/s' },
    { type: 'slider', key: 'planetCount', label: 'Planets shown', labelZh: '显示行星数', min: 2, max: 8, step: 1 },
    { type: 'toggle', key: 'showLabels', label: 'Show orbit rings', labelZh: '显示轨道环' },
  ],
  defaultVariables: { timeScale: 1, planetCount: 6, showLabels: true },
  presets: [
    { name: 'Inner planets', nameZh: '内行星', variables: { timeScale: 1, planetCount: 4, showLabels: true } },
    { name: 'All eight', nameZh: '全部八颗', variables: { timeScale: 2, planetCount: 8, showLabels: true } },
    { name: 'Fast forward', nameZh: '快进', variables: { timeScale: 5, planetCount: 6, showLabels: false } },
  ],
  concepts: [
    'Planets travel in nearly circular orbits around the Sun.',
    "Kepler's third law: a planet's period grows with the 1.5 power of its distance (T = a^1.5 in years/AU).",
    'Inner planets move faster and complete an orbit in less time.',
    'Neptune takes about 165 years to lap the Sun once; Mercury takes only 88 days.',
  ],
  conceptsZh: [
    '行星沿近似圆形的轨道绕太阳运行。',
    '开普勒第三定律：行星周期随距离的 1.5 次方增长（以年/天文单位计，T = a^1.5）。',
    '内行星运动更快，用更短的时间完成一圈。',
    '海王星绕太阳一圈约需 165 年；水星只需 88 天。',
  ],
  formulas: [
    { tex: 'T^2 = a^3', label: "Kepler's third law (yr, AU)", labelZh: '开普勒第三定律（年，AU）' },
  ],
  animated: true,
  supportsStep: true,
  duration: () => 1e6,
  compute,
  render,
  suggestedQuestions: [
    { en: 'Why do inner planets orbit faster?', zh: '为什么内行星运行更快？' },
    { en: "What is Kepler's third law?", zh: '什么是开普勒第三定律？' },
    { en: 'How much longer is Neptune’s year than Earth’s?', zh: '海王星的一年比地球长多少？' },
  ],
  learn: {
    intro: {
      en: 'The solar system is the Sun and the planets bound to it by gravity, each tracing its own orbit.',
      zh: '太阳系是太阳以及被它的引力束缚的行星，每颗行星沿各自的轨道运行。',
      ja: '太陽系は太陽と、その重力に束縛された惑星からなり、それぞれが固有の軌道を描きます。',
    },
    principle: {
      en: "Gravity weakens with distance, so far-off planets are pulled gently and move slowly. Kepler's third law makes this precise: the orbital period grows with the 3/2 power of the orbit's size, which is why Mercury blurs around the Sun while Neptune barely creeps.",
      zh: '引力随距离减弱，因此遥远的行星受到的拉力较小、运动缓慢。开普勒第三定律把这一点精确化：轨道周期随轨道大小的 3/2 次方增长，所以水星绕太阳飞快，而海王星几乎缓缓爬行。',
      ja: '重力は距離とともに弱まるため、遠い惑星は弱く引かれてゆっくり動きます。ケプラーの第三法則がこれを正確にし、公転周期は軌道の大きさの 3/2 乗で増えます。だから水星は速く、海王星はほとんど這うように動きます。',
    },
    tips: [
      { en: 'Speed up time and watch the inner planets lap the outer ones many times.', zh: '加快时间，看内行星多次套圈外行星。', ja: '時間を速めると、内側の惑星が外側を何周も追い越します。' },
      { en: 'Show all eight planets to see how vast the outer solar system is.', zh: '显示全部八颗行星，感受外太阳系的辽阔。', ja: '8 惑星すべてを表示すると、外側の太陽系の広さが分かります。' },
      { en: 'Orbit spacing here uses a square-root scale so the inner planets stay visible.', zh: '这里的轨道间距采用平方根缩放，以便内行星可见。', ja: '軌道間隔は平方根スケールで、内惑星も見えるようにしています。' },
    ],
  },
};
