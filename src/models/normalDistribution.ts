// Mathematics: Normal Distribution (Gaussian bell curve).
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, label } from './canvasUtils';

const X_MIN = -10, X_MAX = 10;

function pdf(x: number, mu: number, sigma: number) {
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-((x - mu) ** 2) / (2 * sigma * sigma));
}

function compute(vars: Variables): ComputeResult {
  const mu = vars.mean as number;
  const sigma = Math.max(0.1, vars.stdDev as number);
  const x = vars.x as number;
  const z = (x - mu) / sigma;
  return {
    data: [
      { key: 'pdf', label: 'Density at x', labelZh: 'x 处的概率密度', value: pdf(x, mu, sigma), precision: 4 },
      { key: 'z', label: 'z-score', labelZh: 'z 分数', value: z, precision: 2 },
      { key: 'mean', label: 'Mean μ', labelZh: '均值 μ', value: mu, precision: 1 },
      { key: 'sigma', label: 'Std dev σ', labelZh: '标准差 σ', value: sigma, precision: 2 },
    ],
    render: { mu, sigma, x },
  };
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  const r = computed.render;
  const pad = { l: 20, r: 20, t: 24, b: 30 };
  const peak = pdf(r.mu, r.mu, r.sigma);
  const yMax = peak * 1.15;
  const toX = (x: number) => pad.l + ((x - X_MIN) / (X_MAX - X_MIN)) * (w - pad.l - pad.r);
  const toY = (y: number) => h - pad.b - (y / yMax) * (h - pad.t - pad.b);

  // axis
  ctx.strokeStyle = p.axis; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(pad.l, h - pad.b); ctx.lineTo(w - pad.r, h - pad.b); ctx.stroke();

  // shade ±1σ region (≈68%)
  ctx.fillStyle = isDark ? 'rgba(96,165,250,0.18)' : 'rgba(37,99,235,0.14)';
  ctx.beginPath();
  ctx.moveTo(toX(r.mu - r.sigma), h - pad.b);
  for (let x = r.mu - r.sigma; x <= r.mu + r.sigma; x += 0.05) ctx.lineTo(toX(x), toY(pdf(x, r.mu, r.sigma)));
  ctx.lineTo(toX(r.mu + r.sigma), h - pad.b);
  ctx.closePath(); ctx.fill();

  // bell curve
  ctx.strokeStyle = '#f472b6'; ctx.lineWidth = 3; ctx.beginPath();
  let first = true;
  for (let x = X_MIN; x <= X_MAX; x += 0.05) {
    const X = toX(x), Y = toY(pdf(x, r.mu, r.sigma));
    if (first) { ctx.moveTo(X, Y); first = false; } else ctx.lineTo(X, Y);
  }
  ctx.stroke();

  // mean line
  ctx.strokeStyle = p.subtle; ctx.setLineDash([5, 5]); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(toX(r.mu), toY(0)); ctx.lineTo(toX(r.mu), toY(peak)); ctx.stroke();
  ctx.setLineDash([]);
  label(ctx, 'μ', toX(r.mu), h - pad.b + 16, p.subtle, '12px system-ui', 'center');

  // current x marker
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath(); ctx.arc(toX(r.x), toY(pdf(r.x, r.mu, r.sigma)), 6, 0, Math.PI * 2); ctx.fill();

  label(ctx, '±1σ ≈ 68%', toX(r.mu), pad.t + 4, '#60a5fa', '12px system-ui', 'center');
}

export const normalDistribution: ModelDefinition = {
  meta: {
    id: 'normal-distribution',
    title: 'Normal Distribution',
    titleZh: '正态分布',
    titleJa: '正規分布',
    subject: 'math',
    description: 'Shape the bell curve with mean and standard deviation, and explore z-scores and the 68% rule.',
    descriptionZh: '用均值和标准差调整钟形曲线，探索 z 分数和 68% 规则。',
    descriptionJa: '平均と標準偏差でベル曲線を変え、z 得点と 68% ルールを調べます。',
    difficulty: 'high-school',
    tags: ['statistics', 'gaussian', 'probability', 'z-score'],
    accent: '#f472b6',
  },
  controls: [
    { type: 'slider', key: 'mean', label: 'Mean μ', labelZh: '均值 μ', min: -5, max: 5, step: 0.1 },
    { type: 'slider', key: 'stdDev', label: 'Standard deviation σ', labelZh: '标准差 σ', min: 0.3, max: 3, step: 0.1 },
    { type: 'slider', key: 'x', label: 'Value x', labelZh: '取值 x', min: -10, max: 10, step: 0.1 },
  ],
  defaultVariables: { mean: 0, stdDev: 1.5, x: 1 },
  presets: [
    { name: 'Standard normal', nameZh: '标准正态', variables: { mean: 0, stdDev: 1, x: 1 } },
    { name: 'Wide spread', nameZh: '分布较宽', variables: { mean: 0, stdDev: 3, x: 2 } },
    { name: 'Shifted mean', nameZh: '均值偏移', variables: { mean: 3, stdDev: 1.5, x: 3 } },
  ],
  concepts: [
    'The normal distribution is a symmetric bell curve centered on the mean.',
    'A larger standard deviation makes the curve wider and flatter.',
    'About 68% of values fall within one standard deviation of the mean.',
    'The z-score (x−μ)/σ measures how many standard deviations x is from the mean.',
  ],
  conceptsZh: [
    '正态分布是关于均值对称的钟形曲线。',
    '标准差越大，曲线越宽、越平。',
    '约 68% 的数值落在均值的一个标准差范围内。',
    'z 分数 (x−μ)/σ 表示 x 偏离均值多少个标准差。',
  ],
  formulas: [
    { tex: 'f(x) = \\dfrac{1}{\\sigma\\sqrt{2\\pi}}\\,e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}', label: 'Gaussian', labelZh: '高斯函数' },
    { tex: 'z = \\dfrac{x - \\mu}{\\sigma}', label: 'z-score', labelZh: 'z 分数' },
  ],
  animated: false,
  supportsStep: false,
  compute,
  render,
  suggestedQuestions: [
    { en: 'What does the standard deviation control?', zh: '标准差控制什么？' },
    { en: 'What is the 68-95-99.7 rule?', zh: '什么是 68-95-99.7 规则？' },
    { en: 'What does a z-score mean?', zh: 'z 分数是什么意思？' },
  ],
  learn: {
    intro: {
      en: 'The normal distribution — the bell curve — describes how many natural measurements cluster around an average.',
      zh: '正态分布（钟形曲线）描述了许多自然测量值如何聚集在平均值附近。',
      ja: '正規分布（ベル曲線）は、多くの自然な測定値が平均の周りに集まる様子を表します。',
    },
    principle: {
      en: 'Values near the mean are most likely and become rarer symmetrically on each side. The mean sets the center and the standard deviation sets the width: about 68% of data lies within ±1σ, 95% within ±2σ.',
      zh: '靠近均值的数值最常见，并向两侧对称地变得稀少。均值决定中心，标准差决定宽度：约 68% 的数据落在 ±1σ 内，95% 落在 ±2σ 内。',
      ja: '平均に近い値ほど起こりやすく、両側へ対称に少なくなります。平均が中心、標準偏差が幅を決め、約 68% が ±1σ、95% が ±2σ に入ります。',
    },
    tips: [
      { en: 'Increase σ and watch the curve flatten and spread out.', zh: '增大 σ，看曲线变平、变宽。', ja: 'σ を大きくすると、曲線は平らに広がります。' },
      { en: 'Move the mean to slide the whole curve sideways.', zh: '移动均值，让整条曲线横向平移。', ja: '平均を動かすと、曲線全体が横に移動します。' },
      { en: 'The shaded band is the ±1σ region holding roughly 68% of all values.', zh: '阴影带是 ±1σ 区域，约占全部数值的 68%。', ja: '影の帯は ±1σ の領域で、全体の約 68% を占めます。' },
    ],
  },
};
