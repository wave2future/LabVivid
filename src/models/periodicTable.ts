// Chemistry: Periodic Table (interactive). The visual is an embedded
// self-contained page; this definition supplies metadata, data, and Learn
// content, plus a 2D thumbnail for the library card.
import type { ModelDefinition, ComputeResult, RenderContext } from '../types/model';
import { palette, clear } from './canvasUtils';

const CATEGORY_COLORS = ['#ff6e6e', '#ffa94d', '#ffd43b', '#69db7c', '#38d9a9', '#4dabf7', '#9775fa', '#f783ac', '#66d9e8'];

function compute(): ComputeResult {
  return {
    data: [
      { key: 'elements', label: 'Known elements', labelZh: '已知元素', value: 118, precision: 0 },
      { key: 'periods', label: 'Periods (rows)', labelZh: '周期（行）', value: 7, precision: 0 },
      { key: 'groups', label: 'Groups (columns)', labelZh: '族（列）', value: 18, precision: 0 },
      { key: 'natural', label: 'Naturally occurring', labelZh: '天然存在', value: '~94' },
    ],
    render: {},
  };
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  // a stylised mini periodic-table grid for the library card
  const cols = 18, rows = 9;
  const pad = 10;
  const cw = (w - pad * 2) / cols, ch = (h - pad * 2) / rows;
  const cell = Math.min(cw, ch) * 0.86;
  // rough layout: which (row,col) cells are "filled" to suggest the table shape
  const filled = (r: number, c: number) => {
    if (r === 0) return c === 0 || c === 17;
    if (r === 1 || r === 2) return c <= 1 || c >= 12;
    if (r >= 3 && r <= 5) return true;
    if (r === 7 || r === 8) return c >= 2 && c <= 16; // lanthanides/actinides strip
    return false;
  };
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!filled(r, c)) continue;
      const x = pad + c * cw + (cw - cell) / 2;
      const y = pad + r * ch + (ch - cell) / 2;
      ctx.fillStyle = CATEGORY_COLORS[(c + r) % CATEGORY_COLORS.length];
      ctx.globalAlpha = 0.85;
      ctx.fillRect(x, y, cell, cell);
      ctx.globalAlpha = 1;
    }
  }
}

export const periodicTable: ModelDefinition = {
  meta: {
    id: 'periodic-table',
    title: 'Periodic Table',
    titleZh: '元素周期表',
    titleJa: '周期表',
    subject: 'chemistry',
    description: 'Explore all 118 elements in an interactive periodic table — by group, period, and properties.',
    descriptionZh: '在交互式周期表中探索全部 118 种元素——按族、周期和性质浏览。',
    descriptionJa: 'インタラクティブな周期表で 118 元素を探究——族・周期・性質ごとに見られます。',
    difficulty: 'middle-school',
    tags: ['elements', 'periodic table', 'atoms', 'reference'],
    accent: '#4dabf7',
  },
  controls: [],
  defaultVariables: {},
  presets: [],
  concepts: [
    'Elements are arranged by increasing atomic number (number of protons).',
    'Rows are periods; columns are groups of elements with similar properties.',
    'Elements in the same group share the same number of outer (valence) electrons.',
    'Properties like metallic character trend across periods and down groups.',
  ],
  conceptsZh: [
    '元素按原子序数（质子数）递增排列。',
    '行是周期；列是性质相似的族。',
    '同一族的元素最外层（价）电子数相同。',
    '金属性等性质沿周期和族呈规律性变化。',
  ],
  formulas: [],
  animated: false,
  supportsStep: false,
  compute,
  render,
  suggestedQuestions: [
    { en: 'Why are elements grouped into columns?', zh: '为什么元素按列分组？' },
    { en: 'What does the atomic number mean?', zh: '原子序数是什么意思？' },
    { en: 'What is a period versus a group?', zh: '周期和族有什么区别？' },
  ],
  learn: {
    intro: {
      en: 'The periodic table organizes all the chemical elements so their patterns and relationships are easy to see.',
      zh: '元素周期表把所有化学元素有序排列，使它们的规律和关系一目了然。',
      ja: '周期表はすべての化学元素を整理し、規則性と関係が見やすいように並べたものです。',
    },
    principle: {
      en: 'Elements are ordered by atomic number and wrapped into rows (periods) so that columns (groups) line up elements with similar electron arrangements — and therefore similar chemistry. That structure makes trends like reactivity, size, and metallic character predictable.',
      zh: '元素按原子序数排列，并折成行（周期），使得列（族）中电子排布相似的元素对齐——因而化学性质相似。这种结构使反应性、半径和金属性等趋势变得可预测。',
      ja: '元素は原子番号順に並べ、行（周期）に折り返すことで、電子配置が似た元素が列（族）にそろい、化学的性質も似ます。この構造により反応性・大きさ・金属性などの傾向が予測できます。',
    },
    tips: [
      { en: 'Click an element to see its details in the embedded table.', zh: '在嵌入的周期表中点击元素查看其详情。', ja: '埋め込みの周期表で元素をクリックすると詳細が見られます。' },
      { en: 'Notice how colors group elements into families (metals, nonmetals, noble gases).', zh: '注意颜色如何把元素分成族类（金属、非金属、稀有气体）。', ja: '色が元素を族（金属・非金属・希ガスなど）に分けていることに注目しましょう。' },
      { en: 'Scan left-to-right to watch properties change across a period.', zh: '从左到右扫视，观察性质在一个周期内的变化。', ja: '左から右へ見ると、1 周期で性質が変化する様子が分かります。' },
    ],
  },
};
