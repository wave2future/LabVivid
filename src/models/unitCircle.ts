// Mathematics: Unit Circle & Trigonometry.
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, label } from './canvasUtils';

const DEG = Math.PI / 180;

function compute(vars: Variables): ComputeResult {
  const deg = vars.angle as number;
  const a = deg * DEG;
  const sin = Math.sin(a), cos = Math.cos(a);
  const nearVertical = Math.abs(cos) < 0.0087;
  const tanStr = nearVertical ? (sin >= 0 ? '+∞' : '−∞') : Math.tan(a).toFixed(3);

  const sinPts: { x: number; y: number }[] = [];
  const cosPts: { x: number; y: number }[] = [];
  for (let d = 0; d <= 360; d += 3) {
    sinPts.push({ x: d, y: Math.sin(d * DEG) });
    cosPts.push({ x: d, y: Math.cos(d * DEG) });
  }

  return {
    data: [
      { key: 'sin', label: 'sin θ', labelZh: 'sin θ', value: sin, precision: 3 },
      { key: 'cos', label: 'cos θ', labelZh: 'cos θ', value: cos, precision: 3 },
      { key: 'tan', label: 'tan θ', labelZh: 'tan θ', value: tanStr },
      { key: 'rad', label: 'Radians', labelZh: '弧度', value: a, unit: 'rad', precision: 3 },
    ],
    chart: {
      title: 'sin and cos vs angle', titleZh: 'sin 与 cos 随角度变化',
      xLabel: 'θ (°)', yLabel: 'value',
      series: [
        { name: 'sin', color: '#f472b6', points: sinPts },
        { name: 'cos', color: '#60a5fa', points: cosPts },
      ],
      marker: { x: deg, y: sin },
    },
    render: { a, sin, cos, deg },
  };
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  const r = computed.render;
  const cx = w / 2, cy = h / 2;
  const rad = Math.min(w, h) * 0.36;

  // axes
  ctx.strokeStyle = p.grid; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx - rad - 16, cy); ctx.lineTo(cx + rad + 16, cy);
  ctx.moveTo(cx, cy - rad - 16); ctx.lineTo(cx, cy + rad + 16); ctx.stroke();

  // unit circle
  ctx.strokeStyle = p.axis; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.stroke();

  const px = cx + rad * r.cos, py = cy - rad * r.sin;

  // cos projection (x), sin projection (y)
  ctx.strokeStyle = '#60a5fa'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, cy); ctx.stroke();
  ctx.strokeStyle = '#f472b6'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(px, cy); ctx.lineTo(px, py); ctx.stroke();

  // radius
  ctx.strokeStyle = p.text; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();

  // angle arc
  ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, 22, 0, -r.a, r.a <= 0); ctx.stroke();

  // point
  ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill();

  label(ctx, `cos = ${r.cos.toFixed(2)}`, cx + (r.cos >= 0 ? -8 : 8), cy + 16, '#60a5fa', '11px system-ui', r.cos >= 0 ? 'right' : 'left');
  label(ctx, `sin = ${r.sin.toFixed(2)}`, px + (r.cos >= 0 ? 8 : -8), py, '#f472b6', '11px system-ui', r.cos >= 0 ? 'left' : 'right');
  label(ctx, `θ = ${r.deg.toFixed(0)}°`, w / 2, h - 12, p.text, 'bold 14px system-ui', 'center');
}

export const unitCircle: ModelDefinition = {
  meta: {
    id: 'unit-circle',
    title: 'Unit Circle & Trig',
    titleZh: '单位圆与三角函数',
    titleJa: '単位円と三角関数',
    subject: 'math',
    description: 'Rotate around the unit circle and connect the angle to sine, cosine, and tangent.',
    descriptionZh: '在单位圆上旋转，把角度与正弦、余弦、正切联系起来。',
    descriptionJa: '単位円を回りながら、角度と正弦・余弦・正接の関係をつかみます。',
    difficulty: 'high-school',
    tags: ['trigonometry', 'sine', 'cosine', 'unit circle'],
    accent: '#f472b6',
  },
  controls: [
    { type: 'slider', key: 'angle', label: 'Angle', labelZh: '角度', min: 0, max: 360, step: 1, unit: '°' },
  ],
  defaultVariables: { angle: 45 },
  presets: [
    { name: '30°', nameZh: '30°', variables: { angle: 30 } },
    { name: '45°', nameZh: '45°', variables: { angle: 45 } },
    { name: '90°', nameZh: '90°', variables: { angle: 90 } },
    { name: '210°', nameZh: '210°', variables: { angle: 210 } },
  ],
  concepts: [
    'A point on the unit circle has coordinates (cos θ, sin θ).',
    'Sine is the vertical coordinate; cosine is the horizontal coordinate.',
    'tan θ = sin θ / cos θ, and is undefined where cos θ = 0.',
    'sin²θ + cos²θ = 1 for every angle.',
  ],
  conceptsZh: [
    '单位圆上的点坐标为 (cos θ, sin θ)。',
    '正弦是竖直坐标；余弦是水平坐标。',
    'tan θ = sin θ / cos θ，在 cos θ = 0 处无定义。',
    '对任意角，sin²θ + cos²θ = 1。',
  ],
  formulas: [
    { tex: '(\\cos\\theta,\\ \\sin\\theta)', label: 'Point on unit circle', labelZh: '单位圆上的点' },
    { tex: '\\sin^2\\theta + \\cos^2\\theta = 1', label: 'Pythagorean identity', labelZh: '勾股恒等式' },
  ],
  animated: false,
  supportsStep: false,
  compute,
  render,
  suggestedQuestions: [
    { en: 'Why is tan θ undefined at 90°?', zh: '为什么 tan θ 在 90° 无定义？' },
    { en: 'What does the sign of sine and cosine tell me?', zh: '正弦和余弦的符号说明了什么？' },
    { en: 'How does the unit circle relate to the sine wave?', zh: '单位圆与正弦曲线有什么关系？' },
  ],
  learn: {
    intro: {
      en: 'The unit circle is a circle of radius 1 that turns angles into coordinates and powers all of trigonometry.',
      zh: '单位圆是半径为 1 的圆，它把角度变成坐标，是整个三角学的基础。',
      ja: '単位円は半径 1 の円で、角度を座標に変え、三角関数すべての土台になります。',
    },
    principle: {
      en: 'For an angle θ measured from the positive x-axis, the point on the circle is (cos θ, sin θ). So cosine is the x-coordinate, sine is the y-coordinate, and their ratio is the tangent.',
      zh: '对于从 x 正半轴量起的角 θ，圆上的点为 (cos θ, sin θ)。因此余弦是 x 坐标，正弦是 y 坐标，二者之比是正切。',
      ja: 'x 軸の正の向きから測った角 θ では、円上の点は (cos θ, sin θ) です。余弦が x 座標、正弦が y 座標、その比が正接です。',
    },
    tips: [
      { en: 'Watch the pink (sin) and blue (cos) segments swap size as you rotate.', zh: '旋转时，观察粉色（sin）与蓝色（cos）线段大小此消彼长。', ja: '回すと、ピンク（sin）と青（cos）の長さが入れ替わります。' },
      { en: 'Past 180° the sine goes negative — the point drops below the axis.', zh: '超过 180° 后正弦变负——点落到坐标轴下方。', ja: '180° を超えると正弦は負になり、点は軸の下に来ます。' },
      { en: 'Open the chart to see the rotation unroll into a sine and cosine wave.', zh: '打开图表，看旋转展开成正弦和余弦波。', ja: 'グラフを開くと、回転が正弦・余弦の波に展開されます。' },
    ],
  },
};
