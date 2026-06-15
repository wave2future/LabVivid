// Physics: Magnetic Force on a moving charge (F = qvB, circular motion).
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, label } from './canvasUtils';

function physics(vars: Variables) {
  const q = vars.charge as number;
  const v = vars.velocity as number;
  const B = vars.field as number;
  const m = vars.mass as number;
  const F = q * v * B;
  const r = (m * v) / (q * B);
  const T = (2 * Math.PI * m) / (q * B);
  return { q, v, B, m, F, r, T };
}

function compute(vars: Variables, t: number): ComputeResult {
  const p = physics(vars);
  const theta = (2 * Math.PI * t) / p.T;
  return {
    data: [
      { key: 'force', label: 'Magnetic force', labelZh: '磁场力', value: p.F, unit: 'N', precision: 1 },
      { key: 'radius', label: 'Orbit radius', labelZh: '回旋半径', value: p.r, unit: 'm', precision: 2 },
      { key: 'period', label: 'Period', labelZh: '周期', value: p.T, unit: 's', precision: 2 },
    ],
    render: { ...p, theta },
  };
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  const r = computed.render;
  const cx = w / 2, cy = h / 2;
  const maxR = Math.min(w, h) * 0.36;
  const rPx = Math.max(18, Math.min(maxR, 10 + r.r * (maxR / 40)));

  // field into page (×) across the canvas
  ctx.fillStyle = p.grid;
  for (let x = 30; x < w - 10; x += 46) {
    for (let y = 30; y < h - 10; y += 46) {
      ctx.fillText('×', x, y);
    }
  }
  label(ctx, 'B into page', w - 12, 18, p.subtle, '11px system-ui', 'right');

  // circular path
  ctx.strokeStyle = p.axis; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(cx, cy, rPx, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);

  const px = cx + rPx * Math.cos(r.theta), py = cy + rPx * Math.sin(r.theta);
  // velocity (tangent) and force (toward centre)
  const tx = -Math.sin(r.theta), ty = Math.cos(r.theta);
  ctx.strokeStyle = '#34d399'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + tx * 34, py + ty * 34); ctx.stroke();
  label(ctx, 'v', px + tx * 40, py + ty * 40, '#34d399', '12px system-ui', 'center');
  const fx = cx - px, fy = cy - py; const fl = Math.hypot(fx, fy) || 1;
  ctx.strokeStyle = '#f472b6'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + (fx / fl) * 30, py + (fy / fl) * 30); ctx.stroke();
  label(ctx, 'F', px + (fx / fl) * 36, py + (fy / fl) * 36, '#f472b6', '12px system-ui', 'center');

  // charge
  ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(px, py, 9, 0, Math.PI * 2); ctx.fill();

  label(ctx, `F = ${r.F.toFixed(0)} N · r = ${r.r.toFixed(1)} m`, w / 2, h - 12, p.text, 'bold 14px system-ui', 'center');
}

export const magneticForce: ModelDefinition = {
  meta: {
    id: 'magnetic-force',
    title: 'Magnetic Force',
    titleZh: '磁场力',
    titleJa: '磁気力',
    subject: 'physics',
    description: 'Send a charge through a magnetic field and see why it curves into a circle (F = qvB).',
    descriptionZh: '让电荷穿过磁场，看它为何弯成圆形（F = qvB）。',
    descriptionJa: '電荷を磁場に通し、なぜ円を描くのかを見ます（F = qvB）。',
    difficulty: 'high-school',
    tags: ['magnetism', 'force', 'charge', 'circular motion'],
    accent: '#fbbf24',
  },
  controls: [
    { type: 'slider', key: 'charge', label: 'Charge q', labelZh: '电荷 q', min: 1, max: 5, step: 0.5, unit: 'C' },
    { type: 'slider', key: 'velocity', label: 'Speed v', labelZh: '速度 v', min: 1, max: 20, step: 1, unit: 'm/s' },
    { type: 'slider', key: 'field', label: 'Field B', labelZh: '磁感应强度 B', min: 0.5, max: 5, step: 0.5, unit: 'T' },
    { type: 'slider', key: 'mass', label: 'Mass m', labelZh: '质量 m', min: 1, max: 10, step: 0.5, unit: 'kg' },
  ],
  defaultVariables: { charge: 2, velocity: 10, field: 1, mass: 5 },
  presets: [
    { name: 'Default', nameZh: '默认', variables: { charge: 2, velocity: 10, field: 1, mass: 5 } },
    { name: 'Stronger field', nameZh: '更强磁场', variables: { charge: 2, velocity: 10, field: 4, mass: 5 } },
    { name: 'Faster charge', nameZh: '更快电荷', variables: { charge: 2, velocity: 20, field: 1, mass: 5 } },
  ],
  concepts: [
    'A magnetic field exerts a force F = qvB on a moving charge, perpendicular to its velocity.',
    'Because the force is always sideways, it bends the path into a circle.',
    'The radius is r = mv/(qB): a stronger field makes a tighter circle.',
    'The force does no work, so the speed never changes — only the direction.',
  ],
  conceptsZh: [
    '磁场对运动电荷施加力 F = qvB，方向垂直于速度。',
    '由于力始终侧向，它把路径弯成圆形。',
    '半径为 r = mv/(qB)：磁场越强，圆越小。',
    '该力不做功，所以速率不变——只改变方向。',
  ],
  formulas: [
    { tex: 'F = qvB', label: 'Magnetic force', labelZh: '磁场力' },
    { tex: 'r = \\dfrac{mv}{qB}', label: 'Orbit radius', labelZh: '回旋半径' },
  ],
  animated: true,
  supportsStep: true,
  duration: (vars) => physics(vars).T,
  compute,
  render,
  suggestedQuestions: [
    { en: 'Why does the charge move in a circle?', zh: '为什么电荷做圆周运动？' },
    { en: 'What makes the circle smaller?', zh: '什么会让圆变小？' },
    { en: 'Why does the speed stay constant?', zh: '为什么速率保持不变？' },
  ],
  learn: {
    intro: {
      en: 'A magnetic field steers moving charges sideways, which is how everything from particle accelerators to old TV tubes works.',
      zh: '磁场使运动电荷侧向偏转，从粒子加速器到老式电视显像管都基于这一原理。',
      ja: '磁場は動く電荷を横向きに曲げます。粒子加速器から昔のテレビのブラウン管まで、この原理で動きます。',
    },
    principle: {
      en: 'The magnetic force F = qvB always acts at right angles to the velocity, so it never speeds the charge up — it just continually turns it, tracing a circle of radius r = mv/(qB).',
      zh: '磁场力 F = qvB 始终与速度成直角，因此从不使电荷加速——它只是不断改变方向，画出半径 r = mv/(qB) 的圆。',
      ja: '磁気力 F = qvB は常に速度と直角にはたらくため、電荷を速くせず、向きだけを変え続けて半径 r = mv/(qB) の円を描きます。',
    },
    tips: [
      { en: 'Increase the field B and the circle tightens.', zh: '增大磁场 B，圆变得更小。', ja: '磁場 B を強めると円は小さくなります。' },
      { en: 'A faster or heavier charge sweeps a larger circle.', zh: '更快或更重的电荷画出更大的圆。', ja: '速い・重い電荷ほど大きな円になります。' },
      { en: 'The green velocity and pink force arrows always stay perpendicular.', zh: '绿色速度与粉色力箭头始终保持垂直。', ja: '緑の速度と桃色の力の矢印は常に直角を保ちます。' },
    ],
  },
};
