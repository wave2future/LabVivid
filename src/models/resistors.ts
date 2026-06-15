// Physics: Resistors in Series & Parallel.
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, label } from './canvasUtils';

function circuit(vars: Variables) {
  const r1 = Math.max(1, vars.r1 as number);
  const r2 = Math.max(1, vars.r2 as number);
  const v = vars.voltage as number;
  const series = String(vars.mode) === 'series';
  const Rt = series ? r1 + r2 : (r1 * r2) / (r1 + r2);
  const I = v / Rt;
  const i1 = series ? I : v / r1;
  const i2 = series ? I : v / r2;
  return { r1, r2, v, series, Rt, I, i1, i2 };
}

function compute(vars: Variables): ComputeResult {
  const r = circuit(vars);
  return {
    data: [
      { key: 'Rt', label: 'Total resistance', labelZh: '总电阻', value: r.Rt, unit: 'Ω', precision: 2 },
      { key: 'I', label: 'Total current', labelZh: '总电流', value: r.I, unit: 'A', precision: 3 },
      { key: 'i1', label: 'Current through R₁', labelZh: '通过 R₁ 的电流', value: r.i1, unit: 'A', precision: 3 },
      { key: 'i2', label: 'Current through R₂', labelZh: '通过 R₂ 的电流', value: r.i2, unit: 'A', precision: 3 },
    ],
    render: { ...r },
  };
}

function resistorBox(ctx: CanvasRenderingContext2D, x: number, y: number, label_: string, color: string, isDark: boolean) {
  ctx.fillStyle = color; ctx.fillRect(x - 26, y - 12, 52, 24);
  ctx.strokeStyle = isDark ? '#0e1426' : '#0f172a'; ctx.lineWidth = 1; ctx.strokeRect(x - 26, y - 12, 52, 24);
  ctx.fillStyle = isDark ? '#0e1426' : '#fff';
  ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(label_, x, y); ctx.textBaseline = 'alphabetic';
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  const r = computed.render;
  ctx.strokeStyle = p.axis; ctx.lineWidth = 3; ctx.lineJoin = 'round';

  const left = w * 0.16, right = w * 0.84, midY = h * 0.5;
  const topY = h * 0.3, botY = h * 0.7;

  // battery on the left
  const by = midY;
  ctx.strokeStyle = p.text; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(left - 14, by - 16); ctx.lineTo(left - 14, by + 16); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(left - 4, by - 8); ctx.lineTo(left - 4, by + 8); ctx.stroke();
  label(ctx, `${r.v} V`, left - 26, by + 30, p.subtle, '12px system-ui', 'center');

  ctx.strokeStyle = p.axis; ctx.lineWidth = 3;
  if (r.series) {
    // single loop: battery → R1 → R2 → back
    ctx.beginPath();
    ctx.moveTo(left - 14, by - 16); ctx.lineTo(left - 14, topY); ctx.lineTo(w * 0.4 - 26, topY);
    ctx.moveTo(w * 0.4 + 26, topY); ctx.lineTo(w * 0.62 - 26, topY);
    ctx.moveTo(w * 0.62 + 26, topY); ctx.lineTo(right, topY); ctx.lineTo(right, botY); ctx.lineTo(left - 14, botY); ctx.lineTo(left - 14, by + 16);
    ctx.stroke();
    resistorBox(ctx, w * 0.4, topY, `R₁ ${r.r1}Ω`, '#fbbf24', isDark);
    resistorBox(ctx, w * 0.62, topY, `R₂ ${r.r2}Ω`, '#f472b6', isDark);
  } else {
    // two parallel branches
    ctx.beginPath();
    ctx.moveTo(left - 14, by - 16); ctx.lineTo(left - 14, midY); ctx.lineTo(w * 0.42, midY); // node A
    ctx.moveTo(w * 0.42, midY); ctx.lineTo(w * 0.42, topY); ctx.lineTo(w * 0.5 - 26, topY);
    ctx.moveTo(w * 0.5 + 26, topY); ctx.lineTo(w * 0.62, topY); ctx.lineTo(w * 0.62, midY);
    ctx.moveTo(w * 0.42, midY); ctx.lineTo(w * 0.42, botY); ctx.lineTo(w * 0.5 - 26, botY);
    ctx.moveTo(w * 0.5 + 26, botY); ctx.lineTo(w * 0.62, botY); ctx.lineTo(w * 0.62, midY);
    ctx.moveTo(w * 0.62, midY); ctx.lineTo(right, midY); ctx.lineTo(right, botY + 40); ctx.lineTo(left - 14, botY + 40); ctx.lineTo(left - 14, by + 16);
    ctx.stroke();
    resistorBox(ctx, w * 0.5, topY, `R₁ ${r.r1}Ω`, '#fbbf24', isDark);
    resistorBox(ctx, w * 0.5, botY, `R₂ ${r.r2}Ω`, '#f472b6', isDark);
  }

  label(ctx, `${r.series ? 'series' : 'parallel'} · R_total = ${r.Rt.toFixed(1)} Ω · I = ${r.I.toFixed(2)} A`,
    w / 2, h - 12, p.text, 'bold 14px system-ui', 'center');
}

export const resistors: ModelDefinition = {
  meta: {
    id: 'resistors',
    title: 'Series & Parallel Resistors',
    titleZh: '串联与并联电阻',
    titleJa: '直列・並列の抵抗',
    subject: 'physics',
    description: 'Combine two resistors in series or parallel and compare the total resistance and current.',
    descriptionZh: '将两个电阻串联或并联，比较总电阻和电流。',
    descriptionJa: '2 つの抵抗を直列または並列につなぎ、合成抵抗と電流を比べます。',
    difficulty: 'high-school',
    tags: ['electricity', 'resistance', 'circuits', 'current'],
    accent: '#fbbf24',
  },
  controls: [
    { type: 'slider', key: 'r1', label: 'R₁', labelZh: 'R₁', min: 1, max: 100, step: 1, unit: 'Ω' },
    { type: 'slider', key: 'r2', label: 'R₂', labelZh: 'R₂', min: 1, max: 100, step: 1, unit: 'Ω' },
    { type: 'slider', key: 'voltage', label: 'Voltage', labelZh: '电压', min: 1, max: 24, step: 0.5, unit: 'V' },
    {
      type: 'select', key: 'mode', label: 'Connection', labelZh: '连接方式',
      options: [
        { value: 'series', label: 'Series', labelZh: '串联' },
        { value: 'parallel', label: 'Parallel', labelZh: '并联' },
      ],
    },
  ],
  defaultVariables: { r1: 20, r2: 30, voltage: 12, mode: 'series' },
  presets: [
    { name: 'Series', nameZh: '串联', variables: { r1: 20, r2: 30, voltage: 12, mode: 'series' } },
    { name: 'Parallel', nameZh: '并联', variables: { r1: 20, r2: 30, voltage: 12, mode: 'parallel' } },
    { name: 'Equal in parallel', nameZh: '等值并联', variables: { r1: 20, r2: 20, voltage: 12, mode: 'parallel' } },
  ],
  concepts: [
    'In series, resistances add: R_total = R₁ + R₂, and the same current flows through both.',
    'In parallel, the total resistance is less than either resistor: 1/R_total = 1/R₁ + 1/R₂.',
    'Parallel branches share the same voltage but split the current.',
    'Adding a parallel resistor lowers total resistance and raises total current.',
  ],
  conceptsZh: [
    '串联时电阻相加：R_total = R₁ + R₂，且通过两者的电流相同。',
    '并联时总电阻小于任一电阻：1/R_total = 1/R₁ + 1/R₂。',
    '并联支路电压相同，但电流分流。',
    '增加一个并联电阻会降低总电阻、提高总电流。',
  ],
  formulas: [
    { tex: 'R_{series} = R_1 + R_2', label: 'Series', labelZh: '串联' },
    { tex: '\\dfrac{1}{R_{parallel}} = \\dfrac{1}{R_1} + \\dfrac{1}{R_2}', label: 'Parallel', labelZh: '并联' },
  ],
  animated: false,
  supportsStep: false,
  compute,
  render,
  suggestedQuestions: [
    { en: 'Why is parallel resistance smaller than each resistor?', zh: '为什么并联电阻比每个电阻都小？' },
    { en: 'Does the same current flow through series resistors?', zh: '串联电阻中的电流相同吗？' },
    { en: 'How does adding a parallel branch change the current?', zh: '增加并联支路如何改变电流？' },
  ],
  learn: {
    intro: {
      en: 'Resistors can be wired in series (one after another) or in parallel (side by side), which changes the whole circuit.',
      zh: '电阻可以串联（一个接一个）或并联（并排），这会改变整个电路。',
      ja: '抵抗は直列（次々に）または並列（並べて）につなげ、回路全体が変わります。',
    },
    principle: {
      en: 'Series resistors share the current and add up, so the total grows. Parallel resistors share the voltage and give the current extra paths, so the total resistance drops below the smallest resistor.',
      zh: '串联电阻共享电流并相加，总电阻增大。并联电阻共享电压并为电流提供更多路径，因此总电阻低于最小的那个电阻。',
      ja: '直列の抵抗は電流を共有して足し合わさり、合計が大きくなります。並列の抵抗は電圧を共有し電流に余分な道を与えるため、合成抵抗は最小の抵抗より小さくなります。',
    },
    tips: [
      { en: 'Switch between series and parallel with the same resistors and compare R_total.', zh: '用相同电阻在串联与并联间切换，比较 R_total。', ja: '同じ抵抗で直列と並列を切り替え、R_total を比べましょう。' },
      { en: 'Two equal resistors in parallel give half the resistance.', zh: '两个相等电阻并联，总电阻减半。', ja: '等しい抵抗 2 つを並列にすると抵抗は半分になります。' },
      { en: 'Notice the current splits between parallel branches but is the same in series.', zh: '注意并联支路电流分流，而串联中电流相同。', ja: '並列では電流が分かれ、直列では同じになることに注目しましょう。' },
    ],
  },
};
