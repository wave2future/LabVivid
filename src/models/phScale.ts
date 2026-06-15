// Chemistry: pH Scale — how concentration of a strong acid/base sets the pH.
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, label } from './canvasUtils';

function chem(vars: Variables) {
  const exp = vars.exp as number;          // concentration = 10^(-exp) mol/L
  const isBase = vars.isBase as boolean;
  const C = Math.pow(10, -exp);
  const H = isBase ? 1e-14 / C : C;
  const pH = Math.min(14, Math.max(0, -Math.log10(H)));
  return { exp, isBase, C, H, pH };
}

// pH colour: red (acidic) → green (neutral) → indigo (basic)
function phColor(pH: number): string {
  const stops: [number, [number, number, number]][] = [
    [0, [220, 38, 38]], [3, [249, 115, 22]], [6, [250, 204, 21]],
    [7, [34, 197, 94]], [8, [20, 184, 166]], [11, [59, 130, 246]], [14, [109, 40, 217]],
  ];
  let a = stops[0], b = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (pH >= stops[i][0] && pH <= stops[i + 1][0]) { a = stops[i]; b = stops[i + 1]; break; }
  }
  const f = (pH - a[0]) / ((b[0] - a[0]) || 1);
  const c = a[1].map((v, i) => Math.round(v + (b[1][i] - v) * f));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

function compute(vars: Variables): ComputeResult {
  const r = chem(vars);
  const nature = r.pH < 6.5 ? 'acidic' : r.pH > 7.5 ? 'basic' : 'neutral';
  return {
    data: [
      { key: 'pH', label: 'pH', labelZh: 'pH', value: r.pH, precision: 2 },
      { key: 'conc', label: 'Concentration', labelZh: '浓度', value: r.C, unit: 'mol/L', precision: 5 },
      { key: 'H', label: '[H⁺]', labelZh: '[H⁺]', value: r.H, unit: 'mol/L', precision: 8 },
      { key: 'nature', label: 'Nature', labelZh: '性质', value: nature },
    ],
    render: { ...r },
  };
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  const r = computed.render;
  const color = phColor(r.pH);

  // beaker on the left, tinted by the pH colour
  const bw = w * 0.34, bx = w * 0.12, bh = h * 0.55, by = h * 0.3;
  ctx.strokeStyle = p.axis; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(bx, by); ctx.lineTo(bx, by + bh);
  ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by); ctx.stroke();
  ctx.fillStyle = color; ctx.globalAlpha = 0.85;
  ctx.fillRect(bx + 2, by + bh * 0.35, bw - 4, bh * 0.65 - 2);
  ctx.globalAlpha = 1;
  label(ctx, `pH ${r.pH.toFixed(2)}`, bx + bw / 2, by - 12, p.text, 'bold 20px system-ui', 'center');

  // vertical pH scale on the right
  const sx = w * 0.62, sw = w * 0.12, sy = h * 0.12, sh = h * 0.76;
  for (let i = 0; i <= 14; i++) {
    const yy = sy + (sh * i) / 14;
    ctx.fillStyle = phColor(i);
    ctx.fillRect(sx, yy - sh / 28, sw, sh / 14 + 1);
  }
  ctx.strokeStyle = p.axis; ctx.lineWidth = 1; ctx.strokeRect(sx, sy - sh / 28, sw, sh + sh / 14);
  for (let i = 0; i <= 14; i += 2) {
    const yy = sy + (sh * i) / 14;
    label(ctx, String(i), sx - 6, yy + 4, p.subtle, '11px system-ui', 'right');
  }
  // marker at current pH
  const my = sy + (sh * r.pH) / 14;
  ctx.fillStyle = p.text;
  ctx.beginPath();
  ctx.moveTo(sx + sw + 4, my); ctx.lineTo(sx + sw + 16, my - 7); ctx.lineTo(sx + sw + 16, my + 7);
  ctx.closePath(); ctx.fill();
  label(ctx, r.isBase ? 'strong base' : 'strong acid', sx + sw / 2, sy - 12, p.subtle, '11px system-ui', 'center');
}

export const phScale: ModelDefinition = {
  meta: {
    id: 'ph-scale',
    title: 'pH Scale',
    titleZh: 'pH 值',
    titleJa: 'pH スケール',
    subject: 'chemistry',
    description: 'Change the concentration of a strong acid or base and watch the pH and color shift.',
    descriptionZh: '改变强酸或强碱的浓度，观察 pH 值和颜色的变化。',
    descriptionJa: '強酸・強塩基の濃度を変え、pH と色の変化を観察します。',
    difficulty: 'high-school',
    tags: ['pH', 'acid', 'base', 'concentration'],
    accent: '#22c55e',
  },
  controls: [
    { type: 'slider', key: 'exp', label: 'Concentration 10⁻ˣ mol/L', labelZh: '浓度 10⁻ˣ mol/L', min: 0, max: 6, step: 0.1 },
    { type: 'toggle', key: 'isBase', label: 'Strong base (instead of acid)', labelZh: '强碱（而非强酸）' },
  ],
  defaultVariables: { exp: 2, isBase: false },
  presets: [
    { name: '0.01 M acid', nameZh: '0.01 M 酸', variables: { exp: 2, isBase: false } },
    { name: '1 M acid', nameZh: '1 M 酸', variables: { exp: 0, isBase: false } },
    { name: '0.01 M base', nameZh: '0.01 M 碱', variables: { exp: 2, isBase: true } },
    { name: 'Near neutral', nameZh: '接近中性', variables: { exp: 6, isBase: false } },
  ],
  concepts: [
    'pH = −log₁₀[H⁺]; lower pH means a higher hydrogen-ion concentration.',
    'Each pH unit is a tenfold change in [H⁺].',
    'For a strong acid, pH equals −log of its concentration.',
    'For a strong base, pH = 14 − pOH at 25 °C.',
  ],
  conceptsZh: [
    'pH = −log₁₀[H⁺]；pH 越低，氢离子浓度越高。',
    '每变化一个 pH 单位，[H⁺] 变化十倍。',
    '强酸的 pH 等于其浓度的负对数。',
    '25 °C 时，强碱的 pH = 14 − pOH。',
  ],
  formulas: [
    { tex: '\\text{pH} = -\\log_{10}[\\text{H}^+]', label: 'pH', labelZh: 'pH' },
    { tex: '\\text{pH} + \\text{pOH} = 14', label: 'Water relation (25 °C)', labelZh: '水的关系（25 °C）' },
  ],
  animated: false,
  supportsStep: false,
  compute,
  render,
  suggestedQuestions: [
    { en: 'What does a change of one pH unit mean?', zh: '改变一个 pH 单位意味着什么？' },
    { en: 'Why is a dilute acid closer to pH 7?', zh: '为什么稀酸更接近 pH 7？' },
    { en: 'How is pH related to pOH?', zh: 'pH 与 pOH 有什么关系？' },
  ],
  learn: {
    intro: {
      en: 'The pH scale measures how acidic or basic a solution is, from 0 (very acidic) to 14 (very basic).',
      zh: 'pH 值衡量溶液的酸碱性，从 0（强酸性）到 14（强碱性）。',
      ja: 'pH スケールは溶液の酸性・塩基性を 0（強酸性）から 14（強塩基性）で表します。',
    },
    principle: {
      en: 'pH is the negative logarithm of the hydrogen-ion concentration, so it is a logarithmic scale: every step of 1 represents a tenfold change in [H⁺].',
      zh: 'pH 是氢离子浓度的负对数，因此是对数刻度：每变化 1，[H⁺] 就变化十倍。',
      ja: 'pH は水素イオン濃度の負の対数で、対数スケールです。1 ごとに [H⁺] は 10 倍変化します。',
    },
    tips: [
      { en: 'Dilute the acid (raise the exponent) and watch the pH climb toward 7.', zh: '稀释酸（增大指数），看 pH 向 7 靠近。', ja: '酸を薄める（指数を上げる）と pH は 7 に近づきます。' },
      { en: 'Switch to a base to jump to the upper half of the scale.', zh: '切换为碱，跳到刻度的上半部分。', ja: '塩基に切り替えると、スケールの上半分に移ります。' },
      { en: 'Notice that very dilute solutions can never pass pH 7 from either side.', zh: '注意：极稀的溶液从任一侧都无法越过 pH 7。', ja: '非常に薄い溶液は、どちら側からも pH 7 を越えられないことに注目しましょう。' },
    ],
  },
};
