// Mathematics: 2D Vector Addition (head-to-tail).
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, drawGrid, label } from './canvasUtils';

const WIN = 12; // coordinate half-range

function compute(vars: Variables): ComputeResult {
  const ax = vars.ax as number, ay = vars.ay as number;
  const bx = vars.bx as number, by = vars.by as number;
  const rx = ax + bx, ry = ay + by;
  const mag = Math.hypot(rx, ry);
  let ang = (Math.atan2(ry, rx) * 180) / Math.PI;
  if (ang < 0) ang += 360;
  return {
    data: [
      { key: 'rx', label: 'Resultant x', labelZh: '合矢量 x', value: rx, precision: 1 },
      { key: 'ry', label: 'Resultant y', labelZh: '合矢量 y', value: ry, precision: 1 },
      { key: 'mag', label: 'Magnitude |R|', labelZh: '大小 |R|', value: mag, precision: 2 },
      { key: 'angle', label: 'Direction', labelZh: '方向', value: ang, unit: '°', precision: 1 },
    ],
    render: { ax, ay, bx, by, rx, ry },
  };
}

function arrow(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string, width = 3) {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  const a = Math.atan2(y1 - y0, x1 - x0);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 - 11 * Math.cos(a - 0.4), y1 - 11 * Math.sin(a - 0.4));
  ctx.lineTo(x1 - 11 * Math.cos(a + 0.4), y1 - 11 * Math.sin(a + 0.4));
  ctx.closePath(); ctx.fill();
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  drawGrid(ctx, w, h, Math.max(24, w / 24), p.grid);
  const r = computed.render;
  const cx = w / 2, cy = h / 2;
  const s = Math.min(w, h) / (2 * WIN);
  const X = (x: number) => cx + x * s;
  const Y = (y: number) => cy - y * s;

  // axes
  ctx.strokeStyle = p.axis; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();

  // A from origin
  arrow(ctx, X(0), Y(0), X(r.ax), Y(r.ay), '#5eead4');
  // B head-to-tail from A's tip
  arrow(ctx, X(r.ax), Y(r.ay), X(r.rx), Y(r.ry), '#60a5fa');
  // resultant
  arrow(ctx, X(0), Y(0), X(r.rx), Y(r.ry), '#fbbf24', 3.5);

  label(ctx, 'A', X(r.ax / 2) + 8, Y(r.ay / 2), '#5eead4', 'bold 13px system-ui');
  label(ctx, 'B', X(r.ax + r.bx / 2) + 8, Y(r.ay + r.by / 2), '#60a5fa', 'bold 13px system-ui');
  label(ctx, 'R = A + B', X(r.rx / 2) + 8, Y(r.ry / 2) - 8, '#fbbf24', 'bold 13px system-ui');
}

export const vectorAddition: ModelDefinition = {
  meta: {
    id: 'vector-addition',
    title: 'Vector Addition',
    titleZh: '向量加法',
    titleJa: 'ベクトルの加法',
    subject: 'math',
    description: 'Add two vectors head-to-tail and read off the magnitude and direction of the resultant.',
    descriptionZh: '用首尾相接法将两个向量相加，读出合向量的大小和方向。',
    descriptionJa: '2 つのベクトルを先頭と末尾でつないで足し、合成ベクトルの大きさと向きを読み取ります。',
    difficulty: 'high-school',
    tags: ['vectors', 'geometry', 'resultant', 'components'],
    accent: '#fbbf24',
  },
  controls: [
    { type: 'slider', key: 'ax', label: 'A: x', labelZh: 'A：x', min: -10, max: 10, step: 0.5 },
    { type: 'slider', key: 'ay', label: 'A: y', labelZh: 'A：y', min: -10, max: 10, step: 0.5 },
    { type: 'slider', key: 'bx', label: 'B: x', labelZh: 'B：x', min: -10, max: 10, step: 0.5 },
    { type: 'slider', key: 'by', label: 'B: y', labelZh: 'B：y', min: -10, max: 10, step: 0.5 },
  ],
  defaultVariables: { ax: 5, ay: 2, bx: 2, by: 5 },
  presets: [
    { name: 'Right angle', nameZh: '直角', variables: { ax: 4, ay: 0, bx: 0, by: 3 } },
    { name: 'Same direction', nameZh: '同向', variables: { ax: 3, ay: 2, bx: 6, by: 4 } },
    { name: 'Opposite', nameZh: '反向', variables: { ax: 5, ay: 3, bx: -5, by: -3 } },
  ],
  concepts: [
    'Vectors add head-to-tail: place B’s tail at A’s tip; the resultant goes from start to finish.',
    'Components add separately: Rx = Ax + Bx and Ry = Ay + By.',
    'The magnitude is √(Rx² + Ry²); the direction is atan2(Ry, Rx).',
    'Opposite vectors cancel to give a zero resultant.',
  ],
  conceptsZh: [
    '向量首尾相接相加：把 B 的尾接在 A 的头上；合向量从起点指向终点。',
    '分量分别相加：Rx = Ax + Bx，Ry = Ay + By。',
    '大小为 √(Rx² + Ry²)；方向为 atan2(Ry, Rx)。',
    '方向相反的向量相互抵消，合向量为零。',
  ],
  formulas: [
    { tex: '\\vec{R} = \\vec{A} + \\vec{B}', label: 'Resultant', labelZh: '合向量' },
    { tex: '|\\vec{R}| = \\sqrt{R_x^2 + R_y^2}', label: 'Magnitude', labelZh: '大小' },
  ],
  animated: false,
  supportsStep: false,
  compute,
  render,
  suggestedQuestions: [
    { en: 'How do I add vectors head-to-tail?', zh: '如何用首尾相接法相加向量？' },
    { en: 'What happens when two vectors point opposite ways?', zh: '两个向量方向相反时会怎样？' },
    { en: 'How do I find the magnitude of the resultant?', zh: '如何求合向量的大小？' },
  ],
  learn: {
    intro: {
      en: 'A vector has both size and direction. Adding vectors combines pushes or movements into a single resultant.',
      zh: '向量既有大小又有方向。向量相加就是把多个推动或位移合成为一个合向量。',
      ja: 'ベクトルは大きさと向きを持ちます。ベクトルの加法は、複数の力や移動を 1 つの合成ベクトルにまとめます。',
    },
    principle: {
      en: 'Place the tail of the second vector at the head of the first; the resultant runs from the very start to the very end. Equivalently, just add the x-components and the y-components separately.',
      zh: '把第二个向量的尾接在第一个向量的头上；合向量从最初的起点指向最终的终点。等价地，只需把 x 分量和 y 分量分别相加。',
      ja: '2 番目のベクトルの末尾を 1 番目の先頭に置くと、合成ベクトルは最初の始点から最後の終点までになります。同じことを、x 成分と y 成分を別々に足すだけでも求められます。',
    },
    tips: [
      { en: 'Try the right-angle preset and check |R| with the Pythagorean theorem.', zh: '试试直角预设，用勾股定理验证 |R|。', ja: '直角のプリセットで、三平方の定理で |R| を確かめましょう。' },
      { en: 'Make B the opposite of A to collapse the resultant to zero.', zh: '让 B 与 A 相反，合向量缩为零。', ja: 'B を A の逆にすると、合成ベクトルはゼロになります。' },
      { en: 'The yellow resultant always closes the triangle from start to end.', zh: '黄色合向量总是从起点到终点闭合三角形。', ja: '黄色の合成ベクトルは、常に始点から終点へ三角形を閉じます。' },
    ],
  },
};
