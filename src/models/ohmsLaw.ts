// Physics: Ohm's Law Circuit (PRD §9.2).
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, label } from './canvasUtils';

function compute(vars: Variables, t: number): ComputeResult {
  const V = vars.voltage as number;
  const R = Math.max(0.1, vars.resistance as number);
  const closed = vars.closed as boolean;
  const I = closed ? V / R : 0;
  const P = V * I;

  // I-vs-V chart at fixed R (line through origin, slope 1/R)
  const points: { x: number; y: number }[] = [];
  for (let v = 0; v <= 24; v += 1) points.push({ x: v, y: v / R });

  return {
    data: [
      { key: 'current', label: 'Current', labelZh: '电流', value: I, unit: 'A', precision: 3 },
      { key: 'power', label: 'Power', labelZh: '功率', value: P, unit: 'W', precision: 2 },
      { key: 'voltage', label: 'Voltage', labelZh: '电压', value: V, unit: 'V', precision: 1 },
      { key: 'resistance', label: 'Resistance', labelZh: '电阻', value: R, unit: 'Ω', precision: 1 },
    ],
    chart: {
      title: 'Current vs Voltage (I = V/R)', titleZh: '电流-电压关系 (I = V/R)',
      xLabel: 'V (V)', yLabel: 'I (A)',
      series: [{ name: 'I = V/R', color: '#60a5fa', points }],
      marker: { x: V, y: I },
    },
    render: { V, R, I, P, closed, t },
  };
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  const r = computed.render;

  // Circuit rectangle
  const m = Math.min(w, h) * 0.16;
  const left = m, right = w - m, top = m, bottom = h - m;
  ctx.strokeStyle = p.axis;
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';

  // Draw wires with a gap on the top for the switch and a battery on the left
  ctx.beginPath();
  // top wire with switch gap in the middle
  const gap = (right - left) * 0.16;
  const midX = (left + right) / 2;
  ctx.moveTo(left, top);
  ctx.lineTo(midX - gap / 2, top);
  ctx.moveTo(midX + gap / 2, top);
  ctx.lineTo(right, top);
  // right wire
  ctx.lineTo(right, bottom);
  // bottom wire
  ctx.lineTo(left, bottom);
  // left wire up to battery gap
  ctx.lineTo(left, (top + bottom) / 2 + 16);
  ctx.moveTo(left, (top + bottom) / 2 - 16);
  ctx.lineTo(left, top);
  ctx.stroke();

  // Battery symbol (left middle)
  const by = (top + bottom) / 2;
  ctx.lineWidth = 4;
  ctx.strokeStyle = p.text;
  ctx.beginPath();
  ctx.moveTo(left - 10, by - 14); ctx.lineTo(left + 10, by - 14); // long plate +
  ctx.moveTo(left - 6, by + 6); ctx.lineTo(left + 6, by + 6);     // short plate -
  ctx.stroke();
  label(ctx, `${r.V.toFixed(0)} V`, left - 14, by + 26, p.subtle, '12px system-ui', 'center');

  // Switch (top middle)
  ctx.strokeStyle = r.closed ? '#34d399' : '#f87171';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(midX - gap / 2, top, 3, 0, Math.PI * 2);
  ctx.arc(midX + gap / 2, top, 3, 0, Math.PI * 2);
  ctx.moveTo(midX - gap / 2, top);
  if (r.closed) ctx.lineTo(midX + gap / 2, top);
  else ctx.lineTo(midX + gap / 2 - 6, top - 18);
  ctx.stroke();
  label(ctx, r.closed ? 'closed' : 'open', midX, top - 24, p.subtle, '12px system-ui', 'center');

  // Resistor (right side, zigzag)
  const rx = right, ry0 = top + (bottom - top) * 0.3, ry1 = top + (bottom - top) * 0.7;
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 4;
  ctx.beginPath();
  const seg = (ry1 - ry0) / 6;
  ctx.moveTo(rx, ry0);
  for (let i = 0; i < 6; i++) {
    const yy = ry0 + seg * (i + 0.5);
    ctx.lineTo(rx + (i % 2 === 0 ? 16 : -16), yy);
  }
  ctx.lineTo(rx, ry1);
  ctx.stroke();
  label(ctx, `${r.R.toFixed(1)} Ω`, rx + 24, (ry0 + ry1) / 2, p.text, '12px system-ui', 'left');

  // Current flow animation (dots moving around the loop) when closed
  if (r.closed && r.I > 0) {
    const perimeterPts: { x: number; y: number }[] = [];
    const steps = 120;
    // simple rectangle loop path
    const corners = [
      { x: left, y: top }, { x: right, y: top },
      { x: right, y: bottom }, { x: left, y: bottom },
    ];
    for (let s = 0; s < steps; s++) {
      const f = (s / steps) * 4;
      const seg = Math.floor(f);
      const lf = f - seg;
      const a = corners[seg];
      const b = corners[(seg + 1) % 4];
      perimeterPts.push({ x: a.x + (b.x - a.x) * lf, y: a.y + (b.y - a.y) * lf });
    }
    const speed = Math.min(1.2, 0.15 + r.I * 0.05);
    const offset = (r.t * speed * steps) % steps;
    ctx.fillStyle = '#60a5fa';
    const dots = 12;
    for (let d = 0; d < dots; d++) {
      const idx = Math.floor((offset + (d * steps) / dots) % steps);
      const pt = perimeterPts[idx];
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Readouts
  label(ctx, `I = ${r.I.toFixed(3)} A`, w / 2, h - 16, p.text, 'bold 16px system-ui', 'center');
}

export const ohmsLaw: ModelDefinition = {
  meta: {
    id: 'ohms-law',
    title: "Ohm's Law Circuit",
    titleZh: '欧姆定律电路',
    titleJa: 'オームの法則回路',
    subject: 'physics',
    description: 'Adjust voltage and resistance to see how current and power respond in a simple circuit.',
    descriptionZh: '调整电压和电阻，观察简单电路中电流和功率的变化。',
    descriptionJa: '電圧と抵抗を変えて、単純な回路で電流と電力がどう変化するかを観察します。',
    difficulty: 'middle-school',
    tags: ['electricity', 'current', 'voltage', 'power'],
    accent: '#60a5fa',
  },
  controls: [
    { type: 'slider', key: 'voltage', label: 'Voltage', labelZh: '电压', min: 0, max: 24, step: 0.5, unit: 'V' },
    { type: 'slider', key: 'resistance', label: 'Resistance', labelZh: '电阻', min: 1, max: 100, step: 1, unit: 'Ω' },
    { type: 'toggle', key: 'closed', label: 'Circuit closed', labelZh: '闭合电路' },
  ],
  defaultVariables: { voltage: 12, resistance: 10, closed: true },
  presets: [
    { name: 'Default', nameZh: '默认', variables: { voltage: 12, resistance: 10, closed: true } },
    { name: 'High resistance', nameZh: '高电阻', variables: { voltage: 12, resistance: 60, closed: true } },
    { name: 'Low resistance', nameZh: '低电阻', variables: { voltage: 12, resistance: 2, closed: true } },
    { name: 'Open switch', nameZh: '断开开关', variables: { voltage: 12, resistance: 10, closed: false } },
  ],
  concepts: [
    'Ohm\'s law: current equals voltage divided by resistance (I = V/R).',
    'Power dissipated is P = V × I = I²R.',
    'An open circuit carries no current.',
    'For fixed voltage, higher resistance means lower current.',
  ],
  conceptsZh: [
    '欧姆定律：电流等于电压除以电阻 (I = V/R)。',
    '消耗功率 P = V × I = I²R。',
    '断路时没有电流。',
    '电压固定时，电阻越大电流越小。',
  ],
  formulas: [
    { tex: 'I = \\dfrac{V}{R}', label: "Ohm's law", labelZh: '欧姆定律' },
    { tex: 'P = V I = I^2 R', label: 'Power', labelZh: '功率' },
  ],
  animated: true,
  supportsStep: false,
  duration: () => 6,
  compute,
  render,
  suggestedQuestions: [
    { en: 'What happens to the current if I double the resistance?', zh: '如果电阻加倍，电流会怎样？' },
    { en: 'How is power related to voltage and current?', zh: '功率与电压、电流有什么关系？' },
    { en: 'Why is there no current when the switch is open?', zh: '为什么开关断开时没有电流？' },
  ],
  learn: {
    intro: {
      en: "Ohm's law is the basic rule connecting voltage, current, and resistance in an electric circuit.",
      zh: '欧姆定律是连接电路中电压、电流和电阻的基本规律。',
      ja: 'オームの法則は、回路の電圧・電流・抵抗を結ぶ基本的な法則です。',
    },
    principle: {
      en: 'Current equals voltage divided by resistance (I = V/R); for a fixed voltage, more resistance means less current, and power is voltage times current.',
      zh: '电流等于电压除以电阻（I = V/R）；电压固定时电阻越大电流越小，功率等于电压乘以电流。',
      ja: '電流は電圧÷抵抗です（I = V/R）。電圧が一定なら抵抗が大きいほど電流は小さく、電力は電圧×電流です。',
    },
    tips: [
      { en: 'Double the resistance and watch the current fall by half.', zh: '把电阻加倍，看电流减半。', ja: '抵抗を 2 倍にすると電流は半分になります。' },
      { en: 'Open the switch and the current drops to zero.', zh: '断开开关，电流变为零。', ja: 'スイッチを開くと電流はゼロになります。' },
      { en: 'Power rises quickly with voltage because it depends on both V and I.', zh: '功率随电压快速上升，因为它同时取决于 V 和 I。', ja: '電力は V と I の両方に依存するため、電圧とともに急に増えます。' },
    ],
  },
};
