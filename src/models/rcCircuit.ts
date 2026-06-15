// Physics: RC Circuit — capacitor charging and discharging.
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, label } from './canvasUtils';

function circuit(vars: Variables) {
  const V0 = vars.voltage as number;
  const R = vars.resistance as number;          // Ω
  const C = (vars.capacitance as number) * 1e-6; // µF → F
  const charging = String(vars.mode) === 'charge';
  const tau = R * C;
  return { V0, R, C, charging, tau, span: 5 * tau };
}

function compute(vars: Variables, t: number): ComputeResult {
  const r = circuit(vars);
  const tt = t % r.span;
  const e = Math.exp(-tt / r.tau);
  const Vc = r.charging ? r.V0 * (1 - e) : r.V0 * e;
  const I = (r.V0 / r.R) * e; // magnitude, amps
  return {
    data: [
      { key: 'tau', label: 'Time constant τ = RC', labelZh: '时间常数 τ = RC', value: r.tau, unit: 's', precision: 2 },
      { key: 'Vc', label: 'Capacitor voltage', labelZh: '电容电压', value: Vc, unit: 'V', precision: 2 },
      { key: 'current', label: 'Current', labelZh: '电流', value: I * 1000, unit: 'mA', precision: 2 },
      { key: 'pct', label: r.charging ? 'Percent charged' : 'Percent remaining', labelZh: r.charging ? '充电百分比' : '剩余百分比', value: (Vc / r.V0) * 100, unit: '%', precision: 0 },
    ],
    chart: {
      title: 'Capacitor voltage vs time', titleZh: '电容电压-时间',
      xLabel: 't (s)', yLabel: 'V_c (V)',
      series: [{
        name: 'V_c', color: '#60a5fa',
        points: Array.from({ length: 101 }, (_, i) => {
          const ti = (r.span * i) / 100;
          const ee = Math.exp(-ti / r.tau);
          return { x: ti, y: r.charging ? r.V0 * (1 - ee) : r.V0 * ee };
        }),
      }],
      marker: { x: tt, y: Vc },
    },
    render: { ...r, Vc },
  };
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  const r = computed.render;
  const left = w * 0.18, right = w * 0.82, top = h * 0.3, bot = h * 0.72;

  ctx.strokeStyle = p.axis; ctx.lineWidth = 3; ctx.lineJoin = 'round';
  // loop with a gap on the right for the capacitor
  ctx.beginPath();
  ctx.moveTo(left, (top + bot) / 2 + 16); ctx.lineTo(left, top); ctx.lineTo(right, top); ctx.lineTo(right, (top + bot) / 2 - 12);
  ctx.moveTo(right, (top + bot) / 2 + 12); ctx.lineTo(right, bot); ctx.lineTo(left, bot); ctx.lineTo(left, (top + bot) / 2 - 16);
  ctx.stroke();

  // battery (left)
  const by = (top + bot) / 2;
  ctx.strokeStyle = p.text; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(left - 9, by - 14); ctx.lineTo(left + 9, by - 14); ctx.moveTo(left - 5, by + 8); ctx.lineTo(left + 5, by + 8); ctx.stroke();
  label(ctx, `${r.V0} V`, left - 16, by + 26, p.subtle, '11px system-ui', 'center');

  // resistor (top, zigzag)
  ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 3;
  const rx0 = w * 0.4, rx1 = w * 0.6, seg = (rx1 - rx0) / 6;
  ctx.beginPath(); ctx.moveTo(rx0, top);
  for (let i = 0; i < 6; i++) ctx.lineTo(rx0 + seg * (i + 0.5), top + (i % 2 ? 10 : -10));
  ctx.lineTo(rx1, top); ctx.stroke();
  label(ctx, `${(r.R / 1000).toFixed(0)}kΩ`, (rx0 + rx1) / 2, top - 12, p.subtle, '11px system-ui', 'center');

  // capacitor plates (right gap), charge shown by blue fill between plates
  const frac = r.Vc / r.V0;
  ctx.strokeStyle = p.text; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(right - 16, by - 12); ctx.lineTo(right + 16, by - 12); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(right - 16, by + 12); ctx.lineTo(right + 16, by + 12); ctx.stroke();
  ctx.fillStyle = `rgba(96,165,250,${0.2 + frac * 0.7})`;
  ctx.fillRect(right - 15, by - 11, 30, 22);
  label(ctx, `${(r.C * 1e6).toFixed(0)}µF`, right + 26, by + 4, p.subtle, '11px system-ui', 'left');

  label(ctx, `V_c = ${r.Vc.toFixed(2)} V  ·  τ = ${r.tau.toFixed(1)} s`, w / 2, h - 12, p.text, 'bold 14px system-ui', 'center');
}

export const rcCircuit: ModelDefinition = {
  meta: {
    id: 'rc-circuit',
    title: 'RC Circuit',
    titleZh: 'RC 电路',
    titleJa: 'RC 回路',
    subject: 'physics',
    description: 'Charge and discharge a capacitor through a resistor and meet the time constant τ = RC.',
    descriptionZh: '通过电阻给电容充电和放电，认识时间常数 τ = RC。',
    descriptionJa: '抵抗を通してコンデンサを充放電し、時定数 τ = RC を学びます。',
    difficulty: 'high-school',
    tags: ['electricity', 'capacitor', 'RC', 'time constant'],
    accent: '#60a5fa',
  },
  controls: [
    { type: 'slider', key: 'voltage', label: 'Voltage', labelZh: '电压', min: 1, max: 24, step: 1, unit: 'V' },
    { type: 'slider', key: 'resistance', label: 'Resistance', labelZh: '电阻', min: 1000, max: 100000, step: 1000, unit: 'Ω' },
    { type: 'slider', key: 'capacitance', label: 'Capacitance', labelZh: '电容', min: 10, max: 1000, step: 10, unit: 'µF' },
    {
      type: 'select', key: 'mode', label: 'Mode', labelZh: '模式',
      options: [
        { value: 'charge', label: 'Charging', labelZh: '充电' },
        { value: 'discharge', label: 'Discharging', labelZh: '放电' },
      ],
    },
  ],
  defaultVariables: { voltage: 12, resistance: 10000, capacitance: 470, mode: 'charge' },
  presets: [
    { name: 'Charging', nameZh: '充电', variables: { voltage: 12, resistance: 10000, capacitance: 470, mode: 'charge' } },
    { name: 'Discharging', nameZh: '放电', variables: { voltage: 12, resistance: 10000, capacitance: 470, mode: 'discharge' } },
    { name: 'Slow (big RC)', nameZh: '慢速（大 RC）', variables: { voltage: 12, resistance: 100000, capacitance: 1000, mode: 'charge' } },
  ],
  concepts: [
    'The capacitor voltage approaches the supply exponentially, not linearly.',
    'The time constant τ = RC sets how fast: after one τ it is ~63% charged.',
    'After about 5 time constants the capacitor is essentially fully charged.',
    'A larger resistor or capacitor makes charging slower.',
  ],
  conceptsZh: [
    '电容电压以指数方式（而非线性）趋近电源电压。',
    '时间常数 τ = RC 决定快慢：经过一个 τ 约充到 63%。',
    '约 5 个时间常数后电容基本充满。',
    '电阻或电容越大，充电越慢。',
  ],
  formulas: [
    { tex: 'V_C(t) = V_0\\left(1 - e^{-t/RC}\\right)', label: 'Charging', labelZh: '充电' },
    { tex: '\\tau = RC', label: 'Time constant', labelZh: '时间常数' },
  ],
  animated: true,
  supportsStep: true,
  duration: (vars) => circuit(vars).span,
  compute,
  render,
  suggestedQuestions: [
    { en: 'What does the time constant mean?', zh: '时间常数是什么意思？' },
    { en: 'Why is charging fast at first, then slow?', zh: '为什么充电先快后慢？' },
    { en: 'How do R and C change the speed?', zh: 'R 和 C 如何改变快慢？' },
  ],
  learn: {
    intro: {
      en: 'An RC circuit pairs a resistor and a capacitor — the building block of timers, filters, and smoothing circuits.',
      zh: 'RC 电路由电阻和电容组成——是定时器、滤波器和平滑电路的基本单元。',
      ja: 'RC 回路は抵抗とコンデンサの組み合わせで、タイマー・フィルター・平滑回路の基本要素です。',
    },
    principle: {
      en: 'As the capacitor fills, it pushes back against the supply, so the current — and the rate of charging — fades. The result is an exponential approach with a characteristic time τ = RC: bigger R or C means a slower curve.',
      zh: '电容充电时会反向抵抗电源，因此电流和充电速率逐渐减小。结果是以特征时间 τ = RC 指数趋近：R 或 C 越大，曲线越慢。',
      ja: 'コンデンサが充電されると電源に逆らうため、電流と充電速度が次第に弱まります。結果は時定数 τ = RC の指数的接近で、R や C が大きいほど曲線は緩やかになります。',
    },
    tips: [
      { en: 'Watch the curve reach about 63% of full charge after one time constant.', zh: '观察曲线在一个时间常数后达到约 63% 的满充。', ja: '1 時定数後に約 63% まで充電されることに注目しましょう。' },
      { en: 'Switch to discharge to see the mirror-image exponential decay.', zh: '切换到放电，看到镜像的指数衰减。', ja: '放電に切り替えると、鏡像の指数減衰が見られます。' },
      { en: 'Raise R or C to stretch the whole process out in time.', zh: '增大 R 或 C，让整个过程在时间上拉长。', ja: 'R や C を大きくすると、全体がゆっくりになります。' },
    ],
  },
};
