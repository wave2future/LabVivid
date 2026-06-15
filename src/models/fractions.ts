// Mathematics: Fractions — visualize a fraction as pie slices, square cuts,
// or a grid. Supports proper and improper fractions (multiple whole shapes).
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, label } from './canvasUtils';

function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a || 1;
}

function compute(vars: Variables): ComputeResult {
  const num = vars.numerator as number;
  const den = Math.max(1, vars.denominator as number);
  const rep = String(vars.representation);
  const value = num / den;
  const g = gcd(num, den);
  const simplified = num === 0 ? '0' : `${num / g}/${den / g}`;

  return {
    data: [
      { key: 'value', label: 'Decimal value', labelZh: '小数值', value, precision: 3 },
      { key: 'percent', label: 'Percentage', labelZh: '百分比', value: value * 100, unit: '%', precision: 1 },
      { key: 'simplified', label: 'Simplified', labelZh: '最简分数', value: simplified },
      { key: 'parts', label: 'Shaded / total', labelZh: '已涂 / 总份', value: `${num} / ${den}` },
    ],
    render: { num, den, rep },
  };
}

function drawPie(ctx: CanvasRenderingContext2D, cx: number, cy: number, rad: number,
  den: number, filled: number, accent: string, empty: string, stroke: string) {
  const step = (Math.PI * 2) / den;
  for (let i = 0; i < den; i++) {
    const a0 = -Math.PI / 2 + i * step;
    const a1 = a0 + step;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, rad, a0, a1);
    ctx.closePath();
    ctx.fillStyle = i < filled ? accent : empty;
    ctx.fill();
    ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke();
  }
}

function drawBar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number,
  den: number, filled: number, accent: string, empty: string, stroke: string) {
  const stripW = size / den;
  for (let i = 0; i < den; i++) {
    ctx.fillStyle = i < filled ? accent : empty;
    ctx.fillRect(x + i * stripW, y, stripW, size);
    ctx.strokeStyle = stroke; ctx.lineWidth = 1.5;
    ctx.strokeRect(x + i * stripW, y, stripW, size);
  }
}

function drawGridShape(ctx: CanvasRenderingContext2D, x: number, y: number, size: number,
  den: number, filled: number, accent: string, empty: string, stroke: string) {
  const cols = Math.ceil(Math.sqrt(den));
  const rows = Math.ceil(den / cols);
  const cw = size / cols, ch = size / rows;
  let drawn = 0;
  for (let rIdx = 0; rIdx < rows; rIdx++) {
    for (let c = 0; c < cols; c++) {
      if (drawn >= den) break;
      ctx.fillStyle = drawn < filled ? accent : empty;
      ctx.fillRect(x + c * cw, y + rIdx * ch, cw, ch);
      ctx.strokeStyle = stroke; ctx.lineWidth = 1.5;
      ctx.strokeRect(x + c * cw, y + rIdx * ch, cw, ch);
      drawn++;
    }
  }
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  const r = computed.render;
  const num: number = r.num, den: number = r.den, rep: string = r.rep;
  const accent = '#38bdf8';
  const empty = isDark ? 'rgba(148,163,184,0.12)' : 'rgba(148,163,184,0.18)';

  const shapeCount = Math.max(1, Math.ceil(num / den));
  const cols = Math.ceil(Math.sqrt(shapeCount));
  const rows = Math.ceil(shapeCount / cols);
  const pad = 24;
  const areaW = w - pad * 2, areaH = h - pad * 2 - 24; // leave room for label
  const cellW = areaW / cols, cellH = areaH / rows;
  const size = Math.min(cellW, cellH) * 0.82;

  for (let s = 0; s < shapeCount; s++) {
    const col = s % cols, row = Math.floor(s / cols);
    const cx = pad + col * cellW + cellW / 2;
    const cy = pad + row * cellH + cellH / 2;
    const filled = Math.max(0, Math.min(den, num - s * den));
    if (rep === 'pie') {
      drawPie(ctx, cx, cy, size / 2, den, filled, accent, empty, p.axis);
    } else if (rep === 'grid') {
      drawGridShape(ctx, cx - size / 2, cy - size / 2, size, den, filled, accent, empty, p.axis);
    } else {
      drawBar(ctx, cx - size / 2, cy - size / 2, size, den, filled, accent, empty, p.axis);
    }
  }

  label(ctx, `${num}/${den}`, w / 2, h - 12, p.text, 'bold 18px system-ui', 'center');
}

export const fractions: ModelDefinition = {
  meta: {
    id: 'fractions',
    title: 'Fractions',
    titleZh: '分数',
    subject: 'math',
    description: 'See a fraction as pie slices, square cuts, or a grid — including improper fractions.',
    descriptionZh: '用饼图、方块切分或网格直观理解分数，也包括假分数。',
    difficulty: 'elementary',
    tags: ['fractions', 'numerator', 'denominator', 'visual'],
    accent: '#38bdf8',
  },
  controls: [
    { type: 'slider', key: 'numerator', label: 'Numerator', labelZh: '分子', min: 0, max: 12, step: 1 },
    { type: 'slider', key: 'denominator', label: 'Denominator', labelZh: '分母', min: 1, max: 12, step: 1 },
    {
      type: 'select', key: 'representation', label: 'Representation', labelZh: '表示方式',
      options: [
        { value: 'pie', label: 'Pie (circle)', labelZh: '饼图（圆形）' },
        { value: 'bar', label: 'Square cut', labelZh: '方块切分' },
        { value: 'grid', label: 'Grid', labelZh: '网格' },
      ],
    },
  ],
  defaultVariables: { numerator: 3, denominator: 4, representation: 'pie' },
  presets: [
    { name: 'One half', nameZh: '二分之一', variables: { numerator: 1, denominator: 2, representation: 'pie' } },
    { name: 'Three quarters', nameZh: '四分之三', variables: { numerator: 3, denominator: 4, representation: 'bar' } },
    { name: 'Five eighths', nameZh: '八分之五', variables: { numerator: 5, denominator: 8, representation: 'grid' } },
    { name: 'Improper 7/4', nameZh: '假分数 7/4', variables: { numerator: 7, denominator: 4, representation: 'pie' } },
  ],
  concepts: [
    'The denominator is how many equal parts the whole is divided into.',
    'The numerator is how many of those parts are shaded.',
    'Equivalent fractions (like 1/2 and 2/4) shade the same total amount.',
    'An improper fraction has a numerator larger than its denominator and is more than one whole.',
  ],
  conceptsZh: [
    '分母表示把整体平均分成多少份。',
    '分子表示其中涂了多少份。',
    '等值分数（如 1/2 和 2/4）涂色的总量相同。',
    '假分数的分子大于分母，表示超过一个整体。',
  ],
  formulas: [
    { tex: '\\dfrac{\\text{numerator}}{\\text{denominator}}', label: 'Fraction', labelZh: '分数' },
    { tex: '\\dfrac{a}{b} = a \\div b', label: 'Fraction as division', labelZh: '分数即除法' },
  ],
  animated: false,
  supportsStep: false,
  compute,
  render,
  suggestedQuestions: [
    { en: 'What does the denominator tell me?', zh: '分母告诉我什么？' },
    { en: 'Is this a proper or improper fraction?', zh: '这是真分数还是假分数？' },
    { en: 'What is an equivalent fraction for this?', zh: '它的等值分数是什么？' },
  ],
};
