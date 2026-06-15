// Physics: Simple Pendulum (small-angle model).
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, label } from './canvasUtils';

const DEG = Math.PI / 180;

function dynamics(vars: Variables) {
  const L = vars.length as number;
  const g = vars.gravity as number;
  const theta0 = (vars.amplitude as number) * DEG;
  const omega = Math.sqrt(g / L);
  const T = (2 * Math.PI) / omega;
  return { L, g, theta0, omega, T };
}

function compute(vars: Variables, t: number): ComputeResult {
  const { L, theta0, omega, T } = dynamics(vars);
  const theta = theta0 * Math.cos(omega * t);
  const linearMaxSpeed = theta0 * L * omega;

  const points: { x: number; y: number }[] = [];
  const N = 80;
  for (let i = 0; i <= N; i++) {
    const ti = (2 * T * i) / N;
    points.push({ x: ti, y: (theta0 * Math.cos(omega * ti)) / DEG });
  }

  return {
    data: [
      { key: 'period', label: 'Period', labelZh: '周期', value: T, unit: 's', precision: 2 },
      { key: 'frequency', label: 'Frequency', labelZh: '频率', value: 1 / T, unit: 'Hz', precision: 3 },
      { key: 'angle', label: 'Current angle', labelZh: '当前角度', value: theta / DEG, unit: '°', precision: 1 },
      { key: 'maxSpeed', label: 'Max bob speed', labelZh: '最大摆速', value: linearMaxSpeed, unit: 'm/s', precision: 2 },
    ],
    chart: {
      title: 'Angle vs time', titleZh: '角度-时间',
      xLabel: 't (s)', yLabel: 'θ (°)',
      series: [{ name: 'θ', color: '#22d3ee', points }],
      marker: { x: t % (2 * T), y: theta / DEG },
    },
    render: { L, theta, T },
  };
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  const r = computed.render;
  const cx = w / 2;
  const topY = h * 0.12;
  const Lpx = (r.L / 3) * (h * 0.72);
  const bx = cx + Lpx * Math.sin(r.theta);
  const by = topY + Lpx * Math.cos(r.theta);

  // pivot beam
  ctx.strokeStyle = p.axis;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - 40, topY); ctx.lineTo(cx + 40, topY);
  ctx.stroke();

  // equilibrium reference (dashed)
  ctx.strokeStyle = p.grid;
  ctx.setLineDash([5, 6]);
  ctx.beginPath();
  ctx.moveTo(cx, topY); ctx.lineTo(cx, topY + Lpx + 16);
  ctx.stroke();
  ctx.setLineDash([]);

  // rod
  ctx.strokeStyle = p.subtle;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx, topY); ctx.lineTo(bx, by);
  ctx.stroke();

  // bob
  ctx.fillStyle = '#22d3ee';
  ctx.beginPath();
  ctx.arc(bx, by, 16, 0, Math.PI * 2);
  ctx.fill();

  // pivot dot
  ctx.fillStyle = p.text;
  ctx.beginPath(); ctx.arc(cx, topY, 4, 0, Math.PI * 2); ctx.fill();

  label(ctx, `θ = ${(r.theta * 180 / Math.PI).toFixed(1)}°`, cx, h - 14, p.text, 'bold 15px system-ui', 'center');
}

export const pendulum: ModelDefinition = {
  meta: {
    id: 'simple-pendulum',
    title: 'Simple Pendulum',
    titleZh: '单摆',
    titleJa: '単振り子',
    subject: 'physics',
    description: 'Swing a pendulum and discover how length and gravity set its period — independent of mass.',
    descriptionZh: '让单摆摆动，探索摆长和重力如何决定周期——而与质量无关。',
    descriptionJa: '振り子を振らせ、長さと重力が周期を決めること（質量に依存しない）を確かめます。',
    difficulty: 'high-school',
    tags: ['oscillation', 'period', 'gravity', 'SHM'],
    accent: '#22d3ee',
  },
  controls: [
    { type: 'slider', key: 'length', label: 'Length', labelZh: '摆长', min: 0.2, max: 3, step: 0.05, unit: 'm' },
    { type: 'slider', key: 'gravity', label: 'Gravity', labelZh: '重力加速度', min: 1, max: 20, step: 0.1, unit: 'm/s²' },
    { type: 'slider', key: 'amplitude', label: 'Amplitude', labelZh: '振幅', min: 5, max: 80, step: 1, unit: '°' },
  ],
  defaultVariables: { length: 1, gravity: 9.8, amplitude: 30 },
  presets: [
    { name: 'Default (1 m)', nameZh: '默认 (1 m)', variables: { length: 1, gravity: 9.8, amplitude: 30 } },
    { name: 'Long & slow', nameZh: '长摆慢摆', variables: { length: 2.5, gravity: 9.8, amplitude: 20 } },
    { name: 'Moon', nameZh: '月球', variables: { length: 1, gravity: 1.6, amplitude: 30 } },
  ],
  concepts: [
    'For small angles the period is T = 2π√(L/g) and does not depend on mass.',
    'A longer pendulum swings more slowly (longer period).',
    'Lower gravity also lengthens the period.',
    'The small-angle approximation is most accurate below about 15°.',
  ],
  conceptsZh: [
    '小角度下周期为 T = 2π√(L/g)，与质量无关。',
    '摆越长摆动越慢（周期越大）。',
    '重力越小周期也越大。',
    '小角度近似在约 15° 以下最准确。',
  ],
  formulas: [
    { tex: 'T = 2\\pi\\sqrt{\\dfrac{L}{g}}', label: 'Period', labelZh: '周期' },
    { tex: '\\theta(t) = \\theta_0 \\cos(\\omega t)', label: 'Angle', labelZh: '角度' },
  ],
  animated: true,
  supportsStep: true,
  duration: (vars) => dynamics(vars).T,
  compute,
  render,
  suggestedQuestions: [
    { en: 'How does length affect the period?', zh: '摆长如何影响周期？' },
    { en: 'Does the mass of the bob matter?', zh: '摆球的质量有影响吗？' },
    { en: 'Why does the period change on the Moon?', zh: '为什么在月球上周期会变化？' },
  ],
  learn: {
    intro: {
      en: 'A simple pendulum is a mass swinging on a string — one of the clearest examples of regular, repeating motion.',
      zh: '单摆是悬挂在绳上的摆动质量——规则重复运动最清晰的例子之一。',
      ja: '単振り子は糸につるしたおもりの振動で、規則的な繰り返し運動の最も分かりやすい例の一つです。',
    },
    principle: {
      en: 'For small swings the period depends only on length and gravity (T = 2π√(L/g)), not on the mass or how far it swings.',
      zh: '小角度摆动时，周期只取决于摆长和重力（T = 2π√(L/g)），与质量和摆幅无关。',
      ja: '小さな振れでは、周期は長さと重力だけで決まり（T = 2π√(L/g)）、質量や振れ幅には依存しません。',
    },
    tips: [
      { en: 'Make the string longer and the swing slows down.', zh: '把绳加长，摆动会变慢。', ja: '糸を長くすると振動はゆっくりになります。' },
      { en: 'Changing the amplitude barely changes the period for small angles.', zh: '改变振幅几乎不改变周期（小角度时）。', ja: '小角度では、振幅を変えても周期はほとんど変わりません。' },
      { en: 'Try the Moon preset to see a slower swing under weaker gravity.', zh: '试试月球预设，看看较弱重力下更慢的摆动。', ja: '月のプリセットで、弱い重力でのゆっくりした振動を見てみましょう。' },
    ],
  },
};
