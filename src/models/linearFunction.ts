// Mathematics: Linear Function — y = mx + b.
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, drawGrid, label } from './canvasUtils';

const WIN = 8;

function compute(vars: Variables): ComputeResult {
  const m = vars.slope as number;
  const b = vars.intercept as number;
  const x0 = vars.x0 as number;
  const y0 = m * x0 + b;
  const xInt = Math.abs(m) < 1e-6 ? NaN : -b / m;
  return {
    data: [
      { key: 'slope', label: 'Slope m', labelZh: '斜率 m', value: m, precision: 2 },
      { key: 'yint', label: 'y-intercept', labelZh: 'y 截距', value: b, precision: 2 },
      { key: 'xint', label: 'x-intercept', labelZh: 'x 截距', value: Number.isFinite(xInt) ? xInt : 'none', precision: 2 },
      { key: 'y0', label: 'y at x₀', labelZh: 'x₀ 处的 y', value: y0, precision: 2 },
    ],
    render: { m, b, x0, y0, xInt },
  };
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  drawGrid(ctx, w, h, Math.max(28, w / 16), p.grid);
  const r = computed.render;
  const Y = (WIN * h) / w;
  const toX = (x: number) => ((x + WIN) / (2 * WIN)) * w;
  const toY = (y: number) => h / 2 - (y / Y) * (h / 2);

  ctx.strokeStyle = p.axis; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke();

  // line
  ctx.strokeStyle = '#5eead4'; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(toX(-WIN), toY(r.m * -WIN + r.b));
  ctx.lineTo(toX(WIN), toY(r.m * WIN + r.b));
  ctx.stroke();

  // slope triangle near origin
  const x1 = 1;
  ctx.strokeStyle = p.subtle; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(toX(0), toY(r.b)); ctx.lineTo(toX(x1), toY(r.b));
  ctx.lineTo(toX(x1), toY(r.m * x1 + r.b)); ctx.stroke();
  ctx.setLineDash([]);

  // intercepts
  ctx.fillStyle = '#60a5fa';
  ctx.beginPath(); ctx.arc(toX(0), toY(r.b), 5, 0, Math.PI * 2); ctx.fill();
  if (Number.isFinite(r.xInt)) {
    ctx.fillStyle = '#34d399';
    ctx.beginPath(); ctx.arc(toX(r.xInt), toY(0), 5, 0, Math.PI * 2); ctx.fill();
  }
  // current point
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath(); ctx.arc(toX(r.x0), toY(r.y0), 6, 0, Math.PI * 2); ctx.fill();

  label(ctx, `y = ${r.m.toFixed(1)}x ${r.b >= 0 ? '+' : '−'} ${Math.abs(r.b).toFixed(1)}`, w / 2, 20, p.text, 'bold 14px system-ui', 'center');
}

export const linearFunction: ModelDefinition = {
  meta: {
    id: 'linear-function',
    title: 'Linear Function',
    titleZh: '一次函数',
    titleJa: '一次関数',
    subject: 'math',
    description: 'Tune the slope and intercept of y = mx + b and see how the line tilts and shifts.',
    descriptionZh: '调整 y = mx + b 的斜率和截距，观察直线如何倾斜和平移。',
    descriptionJa: 'y = mx + b の傾きと切片を変え、直線がどう傾き・移動するかを見ます。',
    difficulty: 'middle-school',
    tags: ['algebra', 'line', 'slope', 'intercept'],
    accent: '#5eead4',
  },
  controls: [
    { type: 'slider', key: 'slope', label: 'Slope m', labelZh: '斜率 m', min: -5, max: 5, step: 0.1 },
    { type: 'slider', key: 'intercept', label: 'y-intercept b', labelZh: 'y 截距 b', min: -6, max: 6, step: 0.1 },
    { type: 'slider', key: 'x0', label: 'Evaluate at x₀', labelZh: '在 x₀ 处求值', min: -8, max: 8, step: 0.1 },
  ],
  defaultVariables: { slope: 1, intercept: 1, x0: 2 },
  presets: [
    { name: 'Rising', nameZh: '上升', variables: { slope: 1, intercept: 1, x0: 2 } },
    { name: 'Falling', nameZh: '下降', variables: { slope: -2, intercept: 3, x0: 1 } },
    { name: 'Horizontal', nameZh: '水平', variables: { slope: 0, intercept: 2, x0: 0 } },
    { name: 'Steep', nameZh: '陡峭', variables: { slope: 4, intercept: -2, x0: 1 } },
  ],
  concepts: [
    'The slope m is the rise over run — how steeply the line climbs.',
    'The y-intercept b is where the line crosses the y-axis (x = 0).',
    'The x-intercept is where y = 0, at x = −b/m.',
    'A positive slope rises left to right; a negative slope falls.',
  ],
  conceptsZh: [
    '斜率 m 是纵向变化与横向变化之比——表示直线上升的陡峭程度。',
    'y 截距 b 是直线与 y 轴的交点（x = 0）。',
    'x 截距是 y = 0 处，即 x = −b/m。',
    '斜率为正时直线从左向右上升；为负时下降。',
  ],
  formulas: [
    { tex: 'y = m x + b', label: 'Slope-intercept form', labelZh: '斜截式' },
    { tex: 'm = \\dfrac{\\Delta y}{\\Delta x}', label: 'Slope', labelZh: '斜率' },
  ],
  animated: false,
  supportsStep: false,
  compute,
  render,
  suggestedQuestions: [
    { en: 'What does the slope tell me?', zh: '斜率告诉我什么？' },
    { en: 'How do I find the x-intercept?', zh: '如何求 x 截距？' },
    { en: 'What does a slope of zero look like?', zh: '斜率为零是什么样子？' },
  ],
  learn: {
    intro: {
      en: 'A linear function graphs as a straight line — the simplest and most common relationship in mathematics.',
      zh: '一次函数的图像是一条直线——数学中最简单、最常见的关系。',
      ja: '一次関数のグラフは直線で、数学で最も単純でよく現れる関係です。',
    },
    principle: {
      en: 'In y = mx + b the slope m fixes the steepness and direction, while b slides the whole line up or down. Together they pin down a unique line.',
      zh: '在 y = mx + b 中，斜率 m 决定陡峭程度和方向，而 b 使整条直线上下平移。两者共同确定唯一的一条直线。',
      ja: 'y = mx + b では、傾き m が急さと向きを決め、b が直線全体を上下に動かします。両方で 1 本の直線が定まります。',
    },
    tips: [
      { en: 'Change b and the line slides vertically without changing its tilt.', zh: '改变 b，直线竖直平移而倾斜不变。', ja: 'b を変えると、傾きを変えずに直線が上下します。' },
      { en: 'Set the slope to 0 for a flat, horizontal line.', zh: '把斜率设为 0，得到一条水平线。', ja: '傾きを 0 にすると水平な直線になります。' },
      { en: 'Watch the dashed triangle — it shows the rise for one unit of run.', zh: '观察虚线三角形——它表示横向走一格时的纵向变化。', ja: '破線の三角形は、横に 1 進むときの縦の変化を表します。' },
    ],
  },
};
