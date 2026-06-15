// Chemistry: Beer–Lambert Law — absorbance of light by a solution.
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, label } from './canvasUtils';

const C_MAX = 2; // mM

function optics(vars: Variables) {
  const eps = vars.epsilon as number;   // L/(mol·cm)
  const cmM = vars.concentration as number; // mM
  const l = vars.pathLength as number;  // cm
  const c = cmM / 1000;                  // mol/L
  const A = eps * c * l;
  const T = Math.pow(10, -A);            // transmittance (fraction)
  return { eps, cmM, l, c, A, T };
}

function compute(vars: Variables): ComputeResult {
  const r = optics(vars);
  const points: { x: number; y: number }[] = [];
  for (let cm = 0; cm <= C_MAX; cm += 0.05) points.push({ x: cm, y: r.eps * (cm / 1000) * r.l });
  return {
    data: [
      { key: 'A', label: 'Absorbance', labelZh: '吸光度', value: r.A, precision: 3 },
      { key: 'T', label: 'Transmittance', labelZh: '透光率', value: r.T * 100, unit: '%', precision: 1 },
      { key: 'conc', label: 'Concentration', labelZh: '浓度', value: r.cmM, unit: 'mM', precision: 2 },
      { key: 'path', label: 'Path length', labelZh: '光程', value: r.l, unit: 'cm', precision: 1 },
    ],
    chart: {
      title: 'Absorbance vs concentration', titleZh: '吸光度-浓度',
      xLabel: 'c (mM)', yLabel: 'A',
      series: [{ name: 'A = εcl', color: '#a78bfa', points }],
      marker: { x: r.cmM, y: r.A },
    },
    render: { ...r },
  };
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  const r = computed.render;
  const cy = h / 2;

  // incoming beam (full brightness)
  const cuvX = w * 0.36, cuvW = w * 0.28, cuvY = h * 0.25, cuvH = h * 0.5;
  ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(w * 0.08, cy); ctx.lineTo(cuvX, cy); ctx.stroke();
  label(ctx, 'I₀', w * 0.08, cy - 10, '#fbbf24', '12px system-ui', 'left');

  // cuvette + colored solution (alpha grows with absorbance)
  const alpha = Math.min(0.92, 1 - r.T);
  ctx.fillStyle = `rgba(167,139,250,${0.1 + alpha * 0.85})`;
  ctx.fillRect(cuvX, cuvY, cuvW, cuvH);
  ctx.strokeStyle = p.axis; ctx.lineWidth = 2; ctx.strokeRect(cuvX, cuvY, cuvW, cuvH);

  // outgoing beam (dimmed by transmittance)
  ctx.strokeStyle = `rgba(251,191,36,${Math.max(0.12, r.T)})`;
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(cuvX + cuvW, cy); ctx.lineTo(w * 0.92, cy); ctx.stroke();
  label(ctx, 'I', w * 0.92, cy - 10, '#fbbf24', '12px system-ui', 'right');

  label(ctx, `A = ${r.A.toFixed(2)}  ·  T = ${(r.T * 100).toFixed(0)}%`, w / 2, cuvY - 12, p.text, 'bold 14px system-ui', 'center');
  label(ctx, `path ${r.l.toFixed(1)} cm`, cuvX + cuvW / 2, cuvY + cuvH + 18, p.subtle, '11px system-ui', 'center');
}

export const beerLambert: ModelDefinition = {
  meta: {
    id: 'beer-lambert',
    title: 'Beer–Lambert Law',
    titleZh: '比尔-朗伯定律',
    titleJa: 'ランベルト・ベールの法則',
    subject: 'chemistry',
    description: 'See how concentration and path length darken a solution and raise its absorbance (A = εcl).',
    descriptionZh: '观察浓度和光程如何使溶液变深、吸光度升高（A = εcl）。',
    descriptionJa: '濃度と光路長が溶液を濃くし吸光度を上げる様子を見ます（A = εcl）。',
    difficulty: 'high-school',
    tags: ['spectroscopy', 'absorbance', 'concentration', 'light'],
    accent: '#a78bfa',
  },
  controls: [
    { type: 'slider', key: 'concentration', label: 'Concentration', labelZh: '浓度', min: 0, max: 2, step: 0.05, unit: 'mM' },
    { type: 'slider', key: 'pathLength', label: 'Path length', labelZh: '光程', min: 0.5, max: 5, step: 0.5, unit: 'cm' },
    { type: 'slider', key: 'epsilon', label: 'Molar absorptivity ε', labelZh: '摩尔吸光系数 ε', min: 100, max: 1000, step: 50 },
  ],
  defaultVariables: { concentration: 1, pathLength: 1, epsilon: 500 },
  presets: [
    { name: 'Default', nameZh: '默认', variables: { concentration: 1, pathLength: 1, epsilon: 500 } },
    { name: 'Concentrated', nameZh: '高浓度', variables: { concentration: 2, pathLength: 1, epsilon: 500 } },
    { name: 'Long path', nameZh: '长光程', variables: { concentration: 1, pathLength: 4, epsilon: 500 } },
  ],
  concepts: [
    'Absorbance is proportional to concentration and path length: A = ε·c·l.',
    'Transmittance is the fraction of light that passes through: T = 10^(−A).',
    'Doubling the concentration doubles the absorbance, but not the transmittance.',
    'This linear relationship lets absorbance measure unknown concentrations.',
  ],
  conceptsZh: [
    '吸光度与浓度和光程成正比：A = ε·c·l。',
    '透光率是透过光的比例：T = 10^(−A)。',
    '浓度加倍会使吸光度加倍，但透光率不会加倍。',
    '这种线性关系使吸光度可用于测定未知浓度。',
  ],
  formulas: [
    { tex: 'A = \\varepsilon\\, c\\, l', label: 'Beer–Lambert law', labelZh: '比尔-朗伯定律' },
    { tex: 'T = 10^{-A}', label: 'Transmittance', labelZh: '透光率' },
  ],
  animated: false,
  supportsStep: false,
  compute,
  render,
  suggestedQuestions: [
    { en: 'Why does a more concentrated solution look darker?', zh: '为什么浓度更高的溶液看起来更深？' },
    { en: 'What is the difference between absorbance and transmittance?', zh: '吸光度和透光率有什么区别？' },
    { en: 'How can absorbance measure concentration?', zh: '吸光度如何用来测浓度？' },
  ],
  learn: {
    intro: {
      en: 'The Beer–Lambert law connects how much light a solution absorbs to how concentrated it is — the basis of colorimetry.',
      zh: '比尔-朗伯定律把溶液吸收光的多少与其浓度联系起来——这是比色分析的基础。',
      ja: 'ランベルト・ベールの法則は、溶液が吸収する光の量と濃度を結びつけ、比色分析の基礎になります。',
    },
    principle: {
      en: 'Each layer of solution absorbs the same fraction of the light passing through it, so absorbance grows in direct proportion to both concentration and path length. Because it is linear, measuring absorbance reveals an unknown concentration.',
      zh: '溶液的每一层都吸收通过它的相同比例的光，因此吸光度与浓度和光程都成正比。由于是线性的，测量吸光度即可得出未知浓度。',
      ja: '溶液の各層は通過する光の同じ割合を吸収するため、吸光度は濃度と光路長の両方に正比例します。線形なので、吸光度を測れば未知の濃度が分かります。',
    },
    tips: [
      { en: 'Raise the concentration and watch the cuvette darken as the exit beam dims.', zh: '提高浓度，看比色皿变深、出射光变暗。', ja: '濃度を上げると、セルが濃くなり出射光が暗くなります。' },
      { en: 'A longer path length absorbs just as effectively as more concentration.', zh: '更长的光程与更高的浓度具有同样的吸收效果。', ja: '光路長を長くするのは、濃度を上げるのと同じだけ吸収します。' },
      { en: 'Open the chart to confirm absorbance is a straight line in concentration.', zh: '打开图表，确认吸光度对浓度是一条直线。', ja: 'グラフを開くと、吸光度が濃度に対して直線になることが分かります。' },
    ],
  },
};
