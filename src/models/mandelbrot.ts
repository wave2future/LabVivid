// Mathematics: Mandelbrot Set (complex-number fractal). The interactive visual
// is an embedded WebGL page; this supplies metadata, data, Learn content, and a
// 2D escape-time thumbnail for the library card.
import type { ModelDefinition, ComputeResult, RenderContext } from '../types/model';
import { clear } from './canvasUtils';

function compute(): ComputeResult {
  return {
    data: [
      { key: 'rule', label: 'Iteration rule', labelZh: '迭代规则', value: 'z → z² + c' },
      { key: 'escape', label: 'Escape radius', labelZh: '逃逸半径', value: 2, precision: 0 },
      { key: 'boundary', label: 'Boundary dimension', labelZh: '边界维数', value: '≈ 2' },
    ],
    render: {},
  };
}

// Low-resolution escape-time render for the library-card thumbnail.
function render(rc: RenderContext): void {
  const { ctx, width: w, height: h } = rc;
  clear(ctx, w, h, '#05070f');
  const cols = 90;
  const cell = w / cols;
  const rows = Math.ceil(h / cell);
  const maxIter = 60;
  for (let cyi = 0; cyi < rows; cyi++) {
    for (let cxi = 0; cxi < cols; cxi++) {
      const cx = -2.2 + ((cxi + 0.5) / cols) * 3.0;            // real: [-2.2, 0.8]
      const cy = -1.2 + ((cyi + 0.5) / rows) * 2.4;            // imag: [-1.2, 1.2]
      let zx = 0, zy = 0, n = 0;
      while (n < maxIter && zx * zx + zy * zy < 4) {
        const xt = zx * zx - zy * zy + cx;
        zy = 2 * zx * zy + cy;
        zx = xt; n++;
      }
      if (n >= maxIter) {
        ctx.fillStyle = '#000';
      } else {
        const tnorm = n / maxIter;
        const hue = 220 + tnorm * 140;
        ctx.fillStyle = `hsl(${hue}, 80%, ${30 + tnorm * 45}%)`;
      }
      ctx.fillRect(cxi * cell, cyi * cell, cell + 1, cell + 1);
    }
  }
}

export const mandelbrot: ModelDefinition = {
  meta: {
    id: 'mandelbrot-set',
    title: 'Mandelbrot Set',
    titleZh: '曼德博集合',
    titleJa: 'マンデルブロ集合',
    subject: 'math',
    description: 'Zoom endlessly into the most famous fractal, born from the simple rule z → z² + c.',
    descriptionZh: '无限缩放最著名的分形，它源自简单的规则 z → z² + c。',
    descriptionJa: '最も有名なフラクタルを無限に拡大。単純な規則 z → z² + c から生まれます。',
    difficulty: 'high-school',
    tags: ['fractal', 'complex numbers', 'iteration', 'chaos'],
    accent: '#a78bfa',
  },
  controls: [],
  defaultVariables: {},
  presets: [],
  concepts: [
    'A point c is in the set if iterating z → z² + c stays bounded forever.',
    'Points that escape are colored by how many steps they take to leave.',
    'The boundary is infinitely detailed — zooming in reveals endless new structure.',
    'It uses complex numbers: each pixel is a complex value c = x + iy.',
  ],
  conceptsZh: [
    '若迭代 z → z² + c 始终有界，则点 c 属于该集合。',
    '逃逸的点按其离开所需的步数着色。',
    '边界拥有无限细节——不断放大会显现源源不断的新结构。',
    '它使用复数：每个像素是一个复数 c = x + iy。',
  ],
  formulas: [
    { tex: 'z_{n+1} = z_n^2 + c,\\quad z_0 = 0', label: 'Iteration', labelZh: '迭代' },
    { tex: 'c \\in M \\iff |z_n| \\not\\to \\infty', label: 'Membership', labelZh: '归属条件' },
  ],
  animated: false,
  supportsStep: false,
  compute,
  render,
  suggestedQuestions: [
    { en: 'What makes a point part of the Mandelbrot set?', zh: '什么样的点属于曼德博集合？' },
    { en: 'Why do the colors appear?', zh: '颜色是怎么来的？' },
    { en: 'What is a fractal?', zh: '什么是分形？' },
  ],
  learn: {
    intro: {
      en: 'The Mandelbrot set is a fractal — an infinitely intricate shape produced by repeating one tiny rule on complex numbers.',
      zh: '曼德博集合是一种分形——通过对复数反复应用一条极简单的规则而产生的无限精细的图形。',
      ja: 'マンデルブロ集合はフラクタルで、複素数に一つの単純な規則を繰り返すことで生まれる無限に精緻な図形です。',
    },
    principle: {
      en: 'For each point c in the complex plane, repeatedly apply z → z² + c starting from z = 0. If the values stay bounded, c belongs to the set (drawn black); if they fly off to infinity, c is colored by how quickly it escaped. The set\'s boundary is endlessly detailed, so you can zoom forever and keep finding new patterns.',
      zh: '对复平面上的每个点 c，从 z = 0 开始反复应用 z → z² + c。若数值始终有界，则 c 属于集合（画为黑色）；若发散到无穷，则按其逃逸的快慢着色。集合的边界具有无限细节，因此可以一直放大、不断发现新图案。',
      ja: '複素平面上の各点 c について、z = 0 から z → z² + c を繰り返します。値が有界なら c は集合に属し（黒で描画）、無限大へ発散するなら逃げる速さで色付けします。境界は無限に細かく、いくらでも拡大して新しい模様を見つけられます。',
    },
    tips: [
      { en: 'Scroll to zoom into the boundary — detail never runs out.', zh: '滚动缩放进入边界——细节永无止境。', ja: 'スクロールして境界を拡大——細部は尽きません。' },
      { en: 'Drag to move toward the curling “seahorse” and spiral regions.', zh: '拖动移动到卷曲的“海马”和螺旋区域。', ja: 'ドラッグして渦巻く「タツノオトシゴ」やらせん領域へ移動しましょう。' },
      { en: 'Black points stay bounded forever; colored points escaped.', zh: '黑色点永远有界；彩色点已逃逸。', ja: '黒い点は永遠に有界、色付きの点は逃げ出した点です。' },
    ],
  },
};
