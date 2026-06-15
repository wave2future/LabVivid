// Physics: Transverse Wave — y(x,t) = A sin(kx − ωt).
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, label } from './canvasUtils';

function waveParams(vars: Variables) {
  const A = vars.amplitude as number;       // cm
  const lambda = vars.wavelength as number; // m
  const f = vars.frequency as number;       // Hz
  const k = (2 * Math.PI) / lambda;
  const omega = 2 * Math.PI * f;
  const v = lambda * f;
  const T = 1 / f;
  return { A, lambda, f, k, omega, v, T };
}

function compute(vars: Variables, t: number): ComputeResult {
  const { A, lambda, f, omega, v, T } = waveParams(vars);
  // displacement of the particle at x = 0 over time (for the chart)
  const points: { x: number; y: number }[] = [];
  const N = 100;
  for (let i = 0; i <= N; i++) {
    const ti = (2 * T * i) / N;
    points.push({ x: ti, y: A * Math.sin(-omega * ti) });
  }
  const yAt0 = A * Math.sin(-omega * t);

  return {
    data: [
      { key: 'speed', label: 'Wave speed', labelZh: '波速', value: v, unit: 'm/s', precision: 2 },
      { key: 'period', label: 'Period', labelZh: '周期', value: T, unit: 's', precision: 2 },
      { key: 'frequency', label: 'Frequency', labelZh: '频率', value: f, unit: 'Hz', precision: 2 },
      { key: 'wavelength', label: 'Wavelength', labelZh: '波长', value: lambda, unit: 'm', precision: 2 },
      { key: 'amplitude', label: 'Amplitude', labelZh: '振幅', value: A, unit: 'cm', precision: 0 },
    ],
    chart: {
      title: 'Displacement at x = 0 vs time', titleZh: 'x = 0 处位移-时间',
      xLabel: 't (s)', yLabel: 'y (cm)',
      series: [{ name: 'y(0,t)', color: '#22d3ee', points }],
      marker: { x: t % (2 * T), y: yAt0 },
    },
    render: { ...waveParams(vars) },
  };
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark, t } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  const r = computed.render;
  const cy = h / 2;
  const pad = 24;
  const metersAcross = 8; // how many metres of the wave we show
  const pxPerM = (w - pad * 2) / metersAcross;
  const ampPx = Math.min(h / 2 - pad, r.A * (h / 220)); // scale cm amplitude to px

  // equilibrium axis
  ctx.strokeStyle = p.grid; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(pad, cy); ctx.lineTo(w - pad, cy); ctx.stroke();

  // waveform y(x,t) = A sin(kx - ωt)
  ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 3;
  ctx.beginPath();
  const steps = 240;
  for (let i = 0; i <= steps; i++) {
    const xm = (metersAcross * i) / steps;
    const y = r.A * Math.sin(r.k * xm - r.omega * t);
    const X = pad + xm * pxPerM;
    const Y = cy - (y / Math.max(r.A, 0.001)) * ampPx;
    if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
  }
  ctx.stroke();

  // a few oscillating "particles" to show transverse motion
  ctx.fillStyle = '#fbbf24';
  for (let m = 0; m <= metersAcross; m += 1) {
    const y = r.A * Math.sin(r.k * m - r.omega * t);
    const X = pad + m * pxPerM;
    const Y = cy - (y / Math.max(r.A, 0.001)) * ampPx;
    ctx.beginPath(); ctx.arc(X, Y, 4, 0, Math.PI * 2); ctx.fill();
  }

  // one wavelength indicator
  const lamPx = r.lambda * pxPerM;
  if (lamPx < w - pad * 2) {
    ctx.strokeStyle = p.subtle; ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, h - 16); ctx.lineTo(pad + lamPx, h - 16);
    ctx.stroke(); ctx.setLineDash([]);
    label(ctx, `λ = ${r.lambda} m`, pad + lamPx / 2, h - 20, p.subtle, '12px system-ui', 'center');
  }
  label(ctx, `v = ${r.v.toFixed(2)} m/s`, w - pad, pad, p.text, 'bold 14px system-ui', 'right');
}

export const wave: ModelDefinition = {
  meta: {
    id: 'transverse-wave',
    title: 'Transverse Wave',
    titleZh: '横波',
    titleJa: '横波',
    subject: 'physics',
    description: 'Watch a travelling wave and see how wavelength and frequency set its speed (v = λf).',
    descriptionZh: '观察行波，看波长和频率如何决定波速 (v = λf)。',
    descriptionJa: '進行波を観察し、波長と振動数が波の速さを決めること（v = λf）を見ます。',
    difficulty: 'high-school',
    tags: ['waves', 'wavelength', 'frequency', 'speed'],
    accent: '#22d3ee',
  },
  controls: [
    { type: 'slider', key: 'amplitude', label: 'Amplitude', labelZh: '振幅', min: 5, max: 80, step: 1, unit: 'cm' },
    { type: 'slider', key: 'wavelength', label: 'Wavelength', labelZh: '波长', min: 0.5, max: 5, step: 0.1, unit: 'm' },
    { type: 'slider', key: 'frequency', label: 'Frequency', labelZh: '频率', min: 0.2, max: 3, step: 0.1, unit: 'Hz' },
  ],
  defaultVariables: { amplitude: 40, wavelength: 2, frequency: 1 },
  presets: [
    { name: 'Default', nameZh: '默认', variables: { amplitude: 40, wavelength: 2, frequency: 1 } },
    { name: 'Long wavelength', nameZh: '长波长', variables: { amplitude: 40, wavelength: 4, frequency: 1 } },
    { name: 'High frequency', nameZh: '高频率', variables: { amplitude: 40, wavelength: 2, frequency: 2.5 } },
  ],
  concepts: [
    'Wave speed equals wavelength times frequency: v = λf.',
    'The period is the time for one full cycle: T = 1/f.',
    'Amplitude sets the height of the wave but not its speed.',
    'In a transverse wave the particles move perpendicular to the direction of travel.',
  ],
  conceptsZh: [
    '波速等于波长乘以频率：v = λf。',
    '周期是完成一个完整循环的时间：T = 1/f。',
    '振幅决定波的高度，但不影响波速。',
    '横波中粒子的振动方向与传播方向垂直。',
  ],
  formulas: [
    { tex: 'v = \\lambda f', label: 'Wave speed', labelZh: '波速' },
    { tex: 'y(x,t) = A\\sin(kx - \\omega t)', label: 'Wave function', labelZh: '波函数' },
  ],
  animated: true,
  supportsStep: true,
  duration: (vars) => 1 / (vars.frequency as number),
  compute,
  render,
  suggestedQuestions: [
    { en: 'How does wavelength affect the wave speed?', zh: '波长如何影响波速？' },
    { en: 'What happens to the period when frequency increases?', zh: '频率增大时周期会怎样？' },
    { en: 'Does amplitude change the speed?', zh: '振幅会改变波速吗？' },
  ],
  learn: {
    intro: {
      en: 'A transverse wave carries energy along while each point of the medium just moves up and down.',
      zh: '横波沿传播方向传递能量，而介质上每个点只上下振动。',
      ja: '横波はエネルギーを伝えていきますが、媒質の各点は上下に振動するだけです。',
    },
    principle: {
      en: 'Wave speed equals wavelength times frequency (v = λf); the amplitude sets the height but never the speed.',
      zh: '波速等于波长乘以频率（v = λf）；振幅决定高度，但不决定波速。',
      ja: '波の速さは波長×振動数です（v = λf）。振幅は高さを決めますが、速さには関係しません。',
    },
    tips: [
      { en: 'Increase the frequency and the wave packs in more cycles and travels faster.', zh: '增大频率，波在相同空间里有更多周期，波速也增大。', ja: '振動数を上げると波の山が増え、速さも上がります。' },
      { en: 'Watch a single dot — it only moves vertically, not sideways.', zh: '盯住一个点——它只上下运动，不向两侧移动。', ja: '一つの点に注目すると、横ではなく上下にしか動きません。' },
      { en: "Amplitude changes the wave's height but not how fast it travels.", zh: '振幅改变波高，但不改变传播速度。', ja: '振幅は波の高さを変えますが、伝わる速さは変えません。' },
    ],
  },
};
