// Mathematics: Quadratic Function explorer — y = ax² + bx + c.
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, drawGrid, label } from './canvasUtils';

const WIN = 8; // x window half-width

function quad(vars: Variables) {
  const a0 = vars.a as number;
  const a = Math.abs(a0) < 1e-4 ? 1e-4 : a0; // avoid divide-by-zero at a = 0
  const b = vars.b as number;
  const c = vars.c as number;
  const vx = -b / (2 * a);
  const vy = c - (b * b) / (4 * a);
  const disc = b * b - 4 * a * c;
  let roots: number[] = [];
  if (disc > 0) roots = [(-b - Math.sqrt(disc)) / (2 * a), (-b + Math.sqrt(disc)) / (2 * a)];
  else if (Math.abs(disc) < 1e-9) roots = [-b / (2 * a)];
  return { a, b, c, vx, vy, disc, roots };
}

function compute(vars: Variables): ComputeResult {
  const r = quad(vars);
  const nRoots = r.disc > 1e-9 ? 2 : Math.abs(r.disc) <= 1e-9 ? 1 : 0;
  return {
    data: [
      { key: 'vertexX', label: 'Vertex x', labelZh: '顶点 x', value: r.vx, precision: 2 },
      { key: 'vertexY', label: 'Vertex y', labelZh: '顶点 y', value: r.vy, precision: 2 },
      { key: 'disc', label: 'Discriminant', labelZh: '判别式', value: r.disc, precision: 2 },
      { key: 'roots', label: 'Real roots', labelZh: '实根个数', value: nRoots === 0 ? 'none' : r.roots.map((x) => x.toFixed(2)).join(', ') },
    ],
    render: { ...r },
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

  // axes
  ctx.strokeStyle = p.axis; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
  ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke();

  // axis of symmetry
  ctx.strokeStyle = p.grid; ctx.setLineDash([5, 5]); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(toX(r.vx), 0); ctx.lineTo(toX(r.vx), h); ctx.stroke();
  ctx.setLineDash([]);

  // parabola
  ctx.strokeStyle = '#f472b6'; ctx.lineWidth = 3; ctx.beginPath();
  let started = false;
  for (let i = 0; i <= 240; i++) {
    const x = -WIN + (2 * WIN * i) / 240;
    const y = r.a * x * x + r.b * x + r.c;
    const Yv = toY(y);
    if (Yv < -h || Yv > 2 * h) { started = false; continue; }
    const Xv = toX(x);
    if (!started) { ctx.moveTo(Xv, Yv); started = true; } else ctx.lineTo(Xv, Yv);
  }
  ctx.stroke();

  // roots
  ctx.fillStyle = '#34d399';
  for (const x of r.roots) { ctx.beginPath(); ctx.arc(toX(x), toY(0), 6, 0, Math.PI * 2); ctx.fill(); }
  // vertex
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath(); ctx.arc(toX(r.vx), toY(r.vy), 6, 0, Math.PI * 2); ctx.fill();

  label(ctx, `y = ${r.a.toFixed(1)}x² + ${r.b.toFixed(1)}x + ${r.c.toFixed(1)}`, w / 2, 20, p.text, 'bold 14px system-ui', 'center');
  label(ctx, r.disc > 0 ? '2 real roots' : Math.abs(r.disc) < 1e-9 ? '1 real root' : 'no real roots',
    w / 2, h - 12, p.subtle, '12px system-ui', 'center');
}

export const quadratic: ModelDefinition = {
  meta: {
    id: 'quadratic-explorer',
    title: 'Quadratic Function',
    titleZh: '二次函数',
    titleJa: '二次関数',
    subject: 'math',
    description: 'Shape a parabola with a, b, and c and watch the vertex, roots, and discriminant respond.',
    descriptionZh: '用 a、b、c 调整抛物线，观察顶点、根和判别式的变化。',
    descriptionJa: 'a・b・c で放物線を変え、頂点・根・判別式の変化を見ます。',
    difficulty: 'high-school',
    tags: ['algebra', 'parabola', 'roots', 'discriminant'],
    accent: '#f472b6',
  },
  controls: [
    { type: 'slider', key: 'a', label: 'a (opening)', labelZh: 'a（开口）', min: -3, max: 3, step: 0.1 },
    { type: 'slider', key: 'b', label: 'b', labelZh: 'b', min: -6, max: 6, step: 0.1 },
    { type: 'slider', key: 'c', label: 'c', labelZh: 'c', min: -6, max: 6, step: 0.1 },
  ],
  defaultVariables: { a: 1, b: 0, c: -3 },
  presets: [
    { name: 'Two roots', nameZh: '两个根', variables: { a: 1, b: 0, c: -3 } },
    { name: 'One root (touch)', nameZh: '一个根（相切）', variables: { a: 1, b: -4, c: 4 } },
    { name: 'No real roots', nameZh: '无实根', variables: { a: 1, b: 0, c: 3 } },
    { name: 'Opens downward', nameZh: '开口向下', variables: { a: -1, b: 2, c: 2 } },
  ],
  concepts: [
    'a controls how wide the parabola is and whether it opens up (a>0) or down (a<0).',
    'The vertex sits at x = −b/2a, the lowest or highest point.',
    'The discriminant b²−4ac decides the number of real roots: 2, 1, or 0.',
    'Real roots are where the parabola crosses the x-axis.',
  ],
  conceptsZh: [
    'a 控制抛物线的宽窄以及开口向上（a>0）还是向下（a<0）。',
    '顶点位于 x = −b/2a，是最低点或最高点。',
    '判别式 b²−4ac 决定实根个数：2、1 或 0。',
    '实根就是抛物线与 x 轴的交点。',
  ],
  formulas: [
    { tex: 'x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', label: 'Quadratic formula', labelZh: '求根公式' },
    { tex: 'x_{vertex} = -\\dfrac{b}{2a}', label: 'Vertex', labelZh: '顶点' },
  ],
  animated: false,
  supportsStep: false,
  compute,
  render,
  suggestedQuestions: [
    { en: 'What does the discriminant tell me?', zh: '判别式告诉我什么？' },
    { en: 'How do I find the vertex?', zh: '如何求顶点？' },
    { en: 'Why does the parabola sometimes miss the x-axis?', zh: '为什么抛物线有时不与 x 轴相交？' },
  ],
  learn: {
    intro: {
      en: 'A quadratic function graphs as a parabola — a smooth U-shaped curve found everywhere from thrown balls to satellite dishes.',
      zh: '二次函数的图像是抛物线——一条平滑的 U 形曲线，从抛球到卫星天线随处可见。',
      ja: '二次関数のグラフは放物線——投げたボールからパラボラアンテナまで、いたるところにある U 字曲線です。',
    },
    principle: {
      en: 'The coefficient a sets the opening and width, the vertex is at x = −b/2a, and the discriminant b²−4ac tells you whether the curve crosses the x-axis twice, touches it once, or misses it entirely.',
      zh: '系数 a 决定开口方向和宽窄，顶点在 x = −b/2a，判别式 b²−4ac 告诉你曲线是与 x 轴相交两次、相切一次，还是完全不相交。',
      ja: '係数 a が開きと幅を決め、頂点は x = −b/2a にあり、判別式 b²−4ac は曲線が x 軸と 2 回交わるか、1 回接するか、交わらないかを教えます。',
    },
    tips: [
      { en: 'Slide c up and down to move the parabola past the x-axis and lose its roots.', zh: '上下调 c，让抛物线越过 x 轴而失去实根。', ja: 'c を上下させると、放物線が x 軸を越えて根を失います。' },
      { en: 'Flip the sign of a to make the parabola open downward.', zh: '改变 a 的符号，让抛物线开口向下。', ja: 'a の符号を変えると、放物線は下に開きます。' },
      { en: 'Watch the discriminant: it hits zero exactly when there is one repeated root.', zh: '观察判别式：恰好为零时只有一个重根。', ja: '判別式に注目：ちょうど 0 のとき重根が 1 つになります。' },
    ],
  },
};
