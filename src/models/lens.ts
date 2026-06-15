// Physics: Converging Lens (thin lens ray diagram).
// Lens equation 1/f = 1/do + 1/di, magnification m = -di/do.
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, label } from './canvasUtils';

function optics(vars: Variables) {
  const f = vars.focalLength as number;
  const doIn = vars.objectDistance as number;
  const ho = vars.objectHeight as number;
  let di: number;
  if (Math.abs(doIn - f) < 1e-3) di = 1e6; // at the focal point: image at infinity
  else di = (f * doIn) / (doIn - f);
  const m = -di / doIn;
  const hi = m * ho;
  const real = di > 0 && di < 1e5;
  return { f, doIn, ho, di, m, hi, real };
}

function compute(vars: Variables): ComputeResult {
  const r = optics(vars);
  const typeStr = r.di >= 1e5
    ? 'image at infinity'
    : `${r.real ? 'real' : 'virtual'}, ${r.m < 0 ? 'inverted' : 'upright'}`;
  return {
    data: [
      { key: 'di', label: 'Image distance', labelZh: '像距', value: Math.abs(r.di) >= 1e5 ? Infinity : r.di, unit: 'cm', precision: 1 },
      { key: 'm', label: 'Magnification', labelZh: '放大率', value: r.m, precision: 2 },
      { key: 'hi', label: 'Image height', labelZh: '像高', value: r.hi, unit: 'cm', precision: 2 },
      { key: 'type', label: 'Image type', labelZh: '像的性质', value: typeStr },
    ],
    render: { ...r },
  };
}

function arrow(ctx: CanvasRenderingContext2D, x: number, yBase: number, yTip: number, color: string, dashed = false) {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 3;
  if (dashed) ctx.setLineDash([5, 4]);
  ctx.beginPath(); ctx.moveTo(x, yBase); ctx.lineTo(x, yTip); ctx.stroke();
  ctx.setLineDash([]);
  const dir = yTip < yBase ? -1 : 1;
  ctx.beginPath();
  ctx.moveTo(x, yTip);
  ctx.lineTo(x - 5, yTip + dir * 9);
  ctx.lineTo(x + 5, yTip + dir * 9);
  ctx.closePath(); ctx.fill();
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  const r = computed.render;
  const cx = w / 2, cy = h / 2;

  const diAbs = Math.min(Math.abs(r.di), 120);
  const extent = Math.max(r.doIn, diAbs, 2 * r.f) + 8;
  const xS = (w / 2 - 36) / extent;
  // Fixed vertical scale (px per cm) — independent of the object height so that
  // changing the object height actually changes its size in the diagram.
  const vS = (h * 0.30) / 11;

  // principal axis
  ctx.strokeStyle = p.axis; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();

  // lens (converging: vertical line with outward arrowheads)
  ctx.strokeStyle = isDark ? 'rgba(96,165,250,0.9)' : 'rgba(37,99,235,0.9)'; ctx.lineWidth = 2;
  const lensTop = cy - h * 0.4, lensBot = cy + h * 0.4;
  ctx.beginPath(); ctx.moveTo(cx, lensTop); ctx.lineTo(cx, lensBot); ctx.stroke();
  ctx.fillStyle = ctx.strokeStyle as string;
  [[lensTop, -1], [lensBot, 1]].forEach(([y, d]) => {
    ctx.beginPath(); ctx.moveTo(cx, y as number);
    ctx.lineTo(cx - 6, (y as number) - (d as number) * 9);
    ctx.lineTo(cx + 6, (y as number) - (d as number) * 9);
    ctx.closePath(); ctx.fill();
  });

  // focal points (±f) and 2f markers
  ctx.fillStyle = p.subtle;
  for (const sgn of [-1, 1]) {
    const fx = cx + sgn * r.f * xS;
    ctx.beginPath(); ctx.arc(fx, cy, 3, 0, Math.PI * 2); ctx.fill();
    label(ctx, 'F', fx, cy + 16, p.subtle, '11px system-ui', 'center');
  }

  // object (upright arrow on the left)
  const Ox = cx - r.doIn * xS;
  const Oy = cy - r.ho * vS;
  arrow(ctx, Ox, cy, Oy, '#fbbf24');
  label(ctx, 'object', Ox, cy + 16, p.subtle, '11px system-ui', 'center');

  // image point in screen coordinates (tip clamped so very magnified images
  // stay on the canvas)
  const Ix = cx + r.di * xS;
  const Iy = Math.max(10, Math.min(h - 10, cy - r.hi * vS));

  const L1 = { x: cx, y: Oy };               // ray 1 hits lens at object height
  const F2 = { x: cx + r.f * xS, y: cy };    // far focal point
  const drawRayTo = (from: { x: number; y: number }, through: { x: number; y: number }, color: string) => {
    const dx = through.x - from.x, dy = through.y - from.y;
    const tEdge = dx === 0 ? 9999 : (w - 4 - from.x) / dx;
    const ex = from.x + dx * tEdge, ey = from.y + dy * tEdge;
    ctx.strokeStyle = color; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(ex, ey); ctx.stroke();
  };

  // Ray 1: parallel to axis, then refracts through far focus
  ctx.strokeStyle = '#f472b6'; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(Ox, Oy); ctx.lineTo(L1.x, L1.y); ctx.stroke();
  drawRayTo(L1, F2, '#f472b6');
  // Ray 2: straight through the lens centre
  drawRayTo({ x: Ox, y: Oy }, { x: cx, y: cy }, '#34d399');

  // image (real = solid; virtual = dashed back-projection)
  if (r.real) {
    arrow(ctx, Ix, cy, Iy, '#60a5fa');
    label(ctx, 'image', Ix, cy + 16, '#60a5fa', '11px system-ui', 'center');
  } else if (Math.abs(r.di) < 1e5) {
    // virtual image: dashed extensions back to the apparent source
    ctx.strokeStyle = 'rgba(96,165,250,0.6)'; ctx.lineWidth = 1.4; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(L1.x, L1.y); ctx.lineTo(Ix, Iy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(Ix, Iy); ctx.stroke();
    ctx.setLineDash([]);
    arrow(ctx, Ix, cy, Iy, '#60a5fa', true);
    label(ctx, 'virtual image', Ix, cy + 16, '#60a5fa', '11px system-ui', 'center');
  }
}

export const lens: ModelDefinition = {
  meta: {
    id: 'converging-lens',
    title: 'Converging Lens',
    titleZh: '凸透镜',
    titleJa: '凸レンズ',
    subject: 'physics',
    description: 'Trace rays through a converging lens and see how object distance forms real or virtual images.',
    descriptionZh: '追踪通过凸透镜的光线，观察物距如何形成实像或虚像。',
    descriptionJa: '凸レンズを通る光線を作図し、物体距離が実像・虚像をどう作るかを見ます。',
    difficulty: 'high-school',
    tags: ['optics', 'lens', 'image', 'rays'],
    accent: '#60a5fa',
  },
  controls: [
    { type: 'slider', key: 'focalLength', label: 'Focal length', labelZh: '焦距', min: 5, max: 40, step: 1, unit: 'cm' },
    { type: 'slider', key: 'objectDistance', label: 'Object distance', labelZh: '物距', min: 5, max: 70, step: 1, unit: 'cm' },
    { type: 'slider', key: 'objectHeight', label: 'Object height', labelZh: '物高', min: 1, max: 10, step: 0.5, unit: 'cm' },
  ],
  defaultVariables: { focalLength: 15, objectDistance: 40, objectHeight: 6 },
  presets: [
    { name: 'Real, inverted', nameZh: '实像·倒立', variables: { focalLength: 15, objectDistance: 40, objectHeight: 6 } },
    { name: 'At 2F', nameZh: '在 2F 处', variables: { focalLength: 15, objectDistance: 30, objectHeight: 6 } },
    { name: 'Magnifier (inside F)', nameZh: '放大镜（焦内）', variables: { focalLength: 20, objectDistance: 12, objectHeight: 6 } },
  ],
  concepts: [
    'The thin-lens equation relates the distances: 1/f = 1/do + 1/di.',
    'An object beyond the focal length forms a real, inverted image on the far side.',
    'An object inside the focal length forms a virtual, upright, magnified image (a magnifying glass).',
    'Magnification m = -di/do; a negative m means the image is inverted.',
  ],
  conceptsZh: [
    '薄透镜公式联系各距离：1/f = 1/do + 1/di。',
    '物体在焦距之外时，在另一侧形成实的、倒立的像。',
    '物体在焦距之内时，形成虚的、正立的、放大的像（放大镜）。',
    '放大率 m = -di/do；m 为负表示像倒立。',
  ],
  formulas: [
    { tex: '\\dfrac{1}{f} = \\dfrac{1}{d_o} + \\dfrac{1}{d_i}', label: 'Thin-lens equation', labelZh: '薄透镜公式' },
    { tex: 'm = -\\dfrac{d_i}{d_o}', label: 'Magnification', labelZh: '放大率' },
  ],
  animated: false,
  supportsStep: false,
  compute,
  render,
  suggestedQuestions: [
    { en: 'When is the image real versus virtual?', zh: '什么时候成实像，什么时候成虚像？' },
    { en: 'What happens when the object is inside the focal length?', zh: '物体在焦距以内时会怎样？' },
    { en: 'How does magnification depend on object distance?', zh: '放大率如何随物距变化？' },
  ],
  learn: {
    intro: {
      en: 'A converging lens bends parallel light to a focus and can form real or virtual images.',
      zh: '凸透镜把平行光会聚到焦点，可以成实像或虚像。',
      ja: '凸レンズは平行光を焦点に集め、実像または虚像をつくります。',
    },
    principle: {
      en: 'The thin-lens equation (1/f = 1/do + 1/di) sets where the image forms: an object beyond the focal point gives a real, inverted image; inside it, a virtual, magnified one.',
      zh: '薄透镜公式（1/f = 1/do + 1/di）决定成像位置：物体在焦点之外成实的倒立像，在焦点之内成虚的放大像。',
      ja: '薄レンズの式（1/f = 1/do + 1/di）が像の位置を決めます。焦点より外なら実の倒立像、内側なら虚の拡大像です。',
    },
    tips: [
      { en: 'Move the object inside the focal length to turn it into a magnifying glass.', zh: '把物体移到焦距以内，它就变成了放大镜。', ja: '物体を焦点距離の内側に動かすと、虫めがねになります。' },
      { en: 'Place the object at 2F to get an image the same size, inverted.', zh: '把物体放在 2F 处，得到等大倒立的像。', ja: '物体を 2F に置くと、同じ大きさの倒立像ができます。' },
      { en: 'As the object approaches the focal point, the image races off to infinity.', zh: '当物体接近焦点时，像会移向无穷远。', ja: '物体が焦点に近づくと、像は無限遠へ遠ざかります。' },
    ],
  },
};
