// Chemistry: Ideal Gas Law (PV = nRT) with an animated piston.
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, label } from './canvasUtils';

const R = 8.314; // J/(mol·K)
const V_MAX = 50; // L, used for piston scaling

function compute(vars: Variables): ComputeResult {
  const T = vars.temperature as number;
  const V = vars.volume as number;
  const n = vars.moles as number;
  // P(kPa) = n R T / V(L)  (since Pa = nRT/m^3 and 1 L = 1e-3 m^3 → /1000 for kPa)
  const P = (n * R * T) / V;

  const points: { x: number; y: number }[] = [];
  for (let v = 1; v <= V_MAX; v += 1) points.push({ x: v, y: (n * R * T) / v });

  return {
    data: [
      { key: 'pressure', label: 'Pressure', labelZh: '压强', value: P, unit: 'kPa', precision: 1 },
      { key: 'temperature', label: 'Temperature', labelZh: '温度', value: T, unit: 'K', precision: 0 },
      { key: 'volume', label: 'Volume', labelZh: '体积', value: V, unit: 'L', precision: 1 },
      { key: 'moles', label: 'Amount', labelZh: '物质的量', value: n, unit: 'mol', precision: 2 },
    ],
    chart: {
      title: 'Pressure vs volume (isotherm)', titleZh: '压强-体积（等温线）',
      xLabel: 'V (L)', yLabel: 'P (kPa)',
      series: [{ name: 'P = nRT/V', color: '#c084fc', points }],
      marker: { x: V, y: P },
    },
    render: { T, V, n, P },
  };
}

function tri(u: number) { const f = ((u % 1) + 1) % 1; return Math.abs(f * 2 - 1); }

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark, t } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  const r = computed.render;

  // Cylinder
  const cylW = w * 0.5, cylX = (w - cylW) / 2;
  const cylTop = h * 0.1, cylBot = h * 0.88;
  const cylH = cylBot - cylTop;
  ctx.strokeStyle = p.axis;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cylX, cylTop); ctx.lineTo(cylX, cylBot);
  ctx.lineTo(cylX + cylW, cylBot); ctx.lineTo(cylX + cylW, cylTop);
  ctx.stroke();

  // Piston position from volume
  const frac = r.V / V_MAX; // 0..1
  const gasTop = cylBot - cylH * Math.max(0.08, frac);
  // gas region fill
  ctx.fillStyle = isDark ? 'rgba(192,132,252,0.12)' : 'rgba(168,85,247,0.10)';
  ctx.fillRect(cylX + 2, gasTop, cylW - 4, cylBot - gasTop - 2);

  // piston
  ctx.fillStyle = p.subtle;
  ctx.fillRect(cylX - 6, gasTop - 12, cylW + 12, 12);
  ctx.fillRect(cylX + cylW / 2 - 6, cylTop - 4, 12, gasTop - cylTop - 6); // rod

  // particles: count ∝ moles, speed ∝ sqrt(T)
  const count = Math.min(48, Math.max(6, Math.round(r.n * 10)));
  const speed = 0.12 * Math.sqrt(r.T / 300);
  const regionH = cylBot - gasTop - 12;
  ctx.fillStyle = '#c084fc';
  for (let i = 0; i < count; i++) {
    const sx = (Math.sin(i * 12.9898) * 43758.5453) % 1;
    const sy = (Math.sin(i * 78.233) * 12345.678) % 1;
    const ax = Math.abs(sx), ay = Math.abs(sy);
    const px = cylX + 8 + tri(ax + t * speed * (0.6 + ax)) * (cylW - 16);
    const py = gasTop + 6 + tri(ay + t * speed * (0.6 + ay)) * Math.max(8, regionH - 4);
    ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();
  }

  label(ctx, `P = ${r.P.toFixed(0)} kPa`, w / 2, cylTop - 10, p.text, 'bold 15px system-ui', 'center');
  label(ctx, `${r.V.toFixed(0)} L · ${r.T.toFixed(0)} K`, w / 2, h - 8, p.subtle, '12px system-ui', 'center');
}

export const idealGas: ModelDefinition = {
  meta: {
    id: 'ideal-gas-law',
    title: 'Ideal Gas Law',
    titleZh: '理想气体定律',
    titleJa: '理想気体の法則',
    subject: 'chemistry',
    description: 'Change temperature, volume, and amount of gas to see how pressure responds via PV = nRT.',
    descriptionZh: '改变温度、体积和气体的量，观察压强如何随 PV = nRT 变化。',
    descriptionJa: '温度・体積・物質量を変え、PV = nRT によって圧力がどう変化するかを観察します。',
    difficulty: 'high-school',
    tags: ['gas', 'pressure', 'temperature', 'PV=nRT'],
    accent: '#c084fc',
  },
  controls: [
    { type: 'slider', key: 'temperature', label: 'Temperature', labelZh: '温度', min: 100, max: 1000, step: 10, unit: 'K' },
    { type: 'slider', key: 'volume', label: 'Volume', labelZh: '体积', min: 1, max: 50, step: 1, unit: 'L' },
    { type: 'slider', key: 'moles', label: 'Amount of gas', labelZh: '气体的量', min: 0.1, max: 5, step: 0.1, unit: 'mol' },
  ],
  defaultVariables: { temperature: 300, volume: 25, moles: 1 },
  presets: [
    { name: 'Room conditions', nameZh: '常温', variables: { temperature: 300, volume: 25, moles: 1 } },
    { name: 'Hot & compressed', nameZh: '高温压缩', variables: { temperature: 800, volume: 8, moles: 1 } },
    { name: 'Cold & expanded', nameZh: '低温膨胀', variables: { temperature: 150, volume: 45, moles: 1 } },
  ],
  concepts: [
    'The ideal gas law links pressure, volume, amount, and temperature: PV = nRT.',
    'At fixed T and n, pressure and volume are inversely related (Boyle\'s law).',
    'At fixed V and n, pressure rises with temperature (Gay-Lussac\'s law).',
    'More gas (higher n) raises pressure at the same volume and temperature.',
  ],
  conceptsZh: [
    '理想气体定律联系压强、体积、量和温度：PV = nRT。',
    '温度和量固定时，压强与体积成反比（玻意耳定律）。',
    '体积和量固定时，压强随温度升高（盖-吕萨克定律）。',
    '相同体积和温度下，气体越多压强越大。',
  ],
  formulas: [
    { tex: 'PV = nRT', label: 'Ideal gas law', labelZh: '理想气体定律' },
    { tex: 'P = \\dfrac{nRT}{V}', label: 'Pressure', labelZh: '压强' },
  ],
  animated: true,
  supportsStep: false,
  duration: () => 6,
  compute,
  render,
  suggestedQuestions: [
    { en: 'What happens to pressure if I halve the volume?', zh: '体积减半时压强会怎样？' },
    { en: 'Why does heating the gas raise the pressure?', zh: '为什么加热气体会升高压强？' },
    { en: 'How does adding more gas change things?', zh: '加入更多气体会有什么变化？' },
  ],
  learn: {
    intro: {
      en: 'The ideal gas law ties together the pressure, volume, temperature, and amount of a gas.',
      zh: '理想气体定律把气体的压强、体积、温度和物质的量联系在一起。',
      ja: '理想気体の法則は、気体の圧力・体積・温度・物質量を結びつけます。',
    },
    principle: {
      en: 'PV = nRT: squeeze the gas or heat it and the pressure rises, because the moving particles hit the walls harder and more often.',
      zh: 'PV = nRT：压缩或加热气体，压强升高，因为运动的粒子撞击器壁更猛烈、更频繁。',
      ja: 'PV = nRT：圧縮や加熱で圧力が上がります。動く粒子が壁に強く・頻繁に衝突するからです。',
    },
    tips: [
      { en: 'Halve the volume at fixed temperature and the pressure doubles (Boyle’s law).', zh: '温度不变时体积减半，压强加倍（玻意耳定律）。', ja: '温度一定で体積を半分にすると圧力は 2 倍になります（ボイルの法則）。' },
      { en: 'Heat the gas and watch the particles speed up and the pressure climb.', zh: '加热气体，看粒子加速、压强升高。', ja: '加熱すると粒子が速くなり、圧力が上がります。' },
      { en: 'Adding more gas raises the pressure even without heating.', zh: '加入更多气体，即使不加热压强也会升高。', ja: '気体を増やすと、加熱しなくても圧力が上がります。' },
    ],
  },
};
