// Physics: Hooke's Law — Mass on a Spring (Simple Harmonic Motion).
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, label } from './canvasUtils';

function dynamics(vars: Variables) {
  const m = vars.mass as number;
  const k = vars.springConstant as number;
  const A = vars.amplitude as number;
  const omega = Math.sqrt(k / m);
  const T = (2 * Math.PI) / omega;
  return { m, k, A, omega, T };
}

function compute(vars: Variables, t: number): ComputeResult {
  const { k, A, omega, T } = dynamics(vars);
  const x = A * Math.cos(omega * t);
  const maxSpeed = A * omega;
  const maxForce = k * A;

  const points: { x: number; y: number }[] = [];
  const N = 80;
  for (let i = 0; i <= N; i++) {
    const ti = (2 * T * i) / N;
    points.push({ x: ti, y: A * Math.cos(omega * ti) });
  }

  return {
    data: [
      { key: 'period', label: 'Period', labelZh: '周期', value: T, unit: 's', precision: 2 },
      { key: 'frequency', label: 'Frequency', labelZh: '频率', value: 1 / T, unit: 'Hz', precision: 3 },
      { key: 'position', label: 'Displacement', labelZh: '位移', value: x, unit: 'm', precision: 2 },
      { key: 'maxSpeed', label: 'Max speed', labelZh: '最大速度', value: maxSpeed, unit: 'm/s', precision: 2 },
      { key: 'maxForce', label: 'Max restoring force', labelZh: '最大回复力', value: maxForce, unit: 'N', precision: 1 },
    ],
    chart: {
      title: 'Displacement vs time', titleZh: '位移-时间',
      xLabel: 't (s)', yLabel: 'x (m)',
      series: [{ name: 'x', color: '#fb923c', points }],
      marker: { x: t % (2 * T), y: x },
    },
    render: { x, A, T },
  };
}

function drawSpring(ctx: CanvasRenderingContext2D, x0: number, y: number, x1: number, color: string) {
  const coils = 12;
  const len = x1 - x0;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x0, y);
  const lead = 14;
  ctx.lineTo(x0 + lead, y);
  for (let i = 0; i <= coils; i++) {
    const px = x0 + lead + ((len - lead * 2) * i) / coils;
    const py = y + (i % 2 === 0 ? -12 : 12);
    ctx.lineTo(px, py);
  }
  ctx.lineTo(x1 - lead, y);
  ctx.lineTo(x1, y);
  ctx.stroke();
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  const r = computed.render;
  const y = h * 0.5;
  const wallX = w * 0.12;
  const travel = w * 0.28; // px per max amplitude
  const eqX = w * 0.62;
  const blockX = eqX + (r.x / Math.max(r.A, 0.001)) * travel;

  // wall
  ctx.fillStyle = p.subtle;
  ctx.fillRect(wallX - 10, y - 60, 10, 120);
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath(); ctx.moveTo(wallX - 10, y + i * 18); ctx.lineTo(wallX - 22, y + i * 18 - 10);
    ctx.strokeStyle = p.grid; ctx.lineWidth = 2; ctx.stroke();
  }

  // equilibrium marker
  ctx.strokeStyle = p.grid;
  ctx.setLineDash([5, 6]);
  ctx.beginPath(); ctx.moveTo(eqX, y - 70); ctx.lineTo(eqX, y + 70); ctx.stroke();
  ctx.setLineDash([]);
  label(ctx, 'equilibrium', eqX, y - 78, p.subtle, '11px system-ui', 'center');

  // spring + block
  drawSpring(ctx, wallX, y, blockX - 26, '#fb923c');
  ctx.fillStyle = '#fb923c';
  ctx.fillRect(blockX - 26, y - 26, 52, 52);
  ctx.fillStyle = isDark ? '#0e1426' : '#fff';
  ctx.font = 'bold 13px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('m', blockX, y);
  ctx.textBaseline = 'alphabetic';

  label(ctx, `x = ${r.x.toFixed(2)} m`, w / 2, h - 14, p.text, 'bold 15px system-ui', 'center');
}

export const springSHM: ModelDefinition = {
  meta: {
    id: 'spring-mass-shm',
    title: 'Mass on a Spring',
    titleZh: '弹簧振子',
    subject: 'physics',
    description: "Explore Hooke's law and simple harmonic motion: how mass and stiffness set the oscillation.",
    descriptionZh: '探索胡克定律与简谐运动：质量和劲度系数如何决定振动。',
    difficulty: 'high-school',
    tags: ['Hooke', 'SHM', 'oscillation', 'force'],
    accent: '#fb923c',
  },
  controls: [
    { type: 'slider', key: 'mass', label: 'Mass', labelZh: '质量', min: 0.1, max: 10, step: 0.1, unit: 'kg' },
    { type: 'slider', key: 'springConstant', label: 'Spring constant', labelZh: '劲度系数', min: 1, max: 100, step: 1, unit: 'N/m' },
    { type: 'slider', key: 'amplitude', label: 'Amplitude', labelZh: '振幅', min: 0.1, max: 1, step: 0.05, unit: 'm' },
  ],
  defaultVariables: { mass: 1, springConstant: 20, amplitude: 0.5 },
  presets: [
    { name: 'Default', nameZh: '默认', variables: { mass: 1, springConstant: 20, amplitude: 0.5 } },
    { name: 'Heavy mass', nameZh: '重物', variables: { mass: 6, springConstant: 20, amplitude: 0.5 } },
    { name: 'Stiff spring', nameZh: '硬弹簧', variables: { mass: 1, springConstant: 80, amplitude: 0.5 } },
  ],
  concepts: [
    "Hooke's law: the restoring force is F = -kx, proportional to displacement.",
    'The period is T = 2π√(m/k); heavier mass slows it, stiffer spring speeds it.',
    'The period does not depend on the amplitude.',
    'Speed is greatest at equilibrium and zero at the extremes.',
  ],
  conceptsZh: [
    '胡克定律：回复力 F = -kx，与位移成正比。',
    '周期 T = 2π√(m/k)；质量越大越慢，弹簧越硬越快。',
    '周期与振幅无关。',
    '在平衡位置速度最大，在两端速度为零。',
  ],
  formulas: [
    { tex: 'F = -k x', label: "Hooke's law", labelZh: '胡克定律' },
    { tex: 'T = 2\\pi\\sqrt{\\dfrac{m}{k}}', label: 'Period', labelZh: '周期' },
  ],
  animated: true,
  supportsStep: true,
  duration: (vars) => dynamics(vars).T,
  compute,
  render,
  suggestedQuestions: [
    { en: 'What happens to the period if I double the mass?', zh: '质量加倍后周期会怎样？' },
    { en: 'Does a larger amplitude change the period?', zh: '更大的振幅会改变周期吗？' },
    { en: 'Where is the speed greatest?', zh: '速度在哪里最大？' },
  ],
};
