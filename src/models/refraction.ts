// Physics: Refraction — Snell's law at a boundary, with total internal reflection.
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, label } from './canvasUtils';

const DEG = Math.PI / 180;

function optics(vars: Variables) {
  const n1 = vars.n1 as number, n2 = vars.n2 as number;
  const thetaI = (vars.angle as number) * DEG;
  const sinR = (n1 * Math.sin(thetaI)) / n2;
  const tir = sinR > 1;
  const thetaR = tir ? NaN : Math.asin(sinR);
  const critical = n1 > n2 ? Math.asin(n2 / n1) : NaN;
  return { n1, n2, thetaI, thetaR, tir, critical };
}

function compute(vars: Variables): ComputeResult {
  const r = optics(vars);
  return {
    data: [
      { key: 'thetaR', label: 'Refraction angle', labelZh: '折射角', value: r.tir ? 'total internal reflection' : r.thetaR / DEG, unit: r.tir ? '' : '°', precision: 1 },
      { key: 'critical', label: 'Critical angle', labelZh: '临界角', value: Number.isFinite(r.critical) ? r.critical / DEG : '—', unit: Number.isFinite(r.critical) ? '°' : '', precision: 1 },
      { key: 'reflected', label: 'Reflection angle', labelZh: '反射角', value: r.thetaI / DEG, unit: '°', precision: 1 },
    ],
    render: { ...r },
  };
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  const r = computed.render;
  const cx = w / 2, cy = h / 2;
  const R = Math.min(w, h) * 0.4;

  // media tints (denser = more saturated)
  ctx.fillStyle = isDark ? 'rgba(96,165,250,0.06)' : 'rgba(37,99,235,0.05)';
  ctx.fillRect(0, 0, w, cy);
  ctx.fillStyle = isDark ? `rgba(96,165,250,${0.05 + r.n2 * 0.05})` : `rgba(37,99,235,${0.04 + r.n2 * 0.04})`;
  ctx.fillRect(0, cy, w, h - cy);

  // interface + normal
  ctx.strokeStyle = p.axis; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
  ctx.strokeStyle = p.grid; ctx.setLineDash([5, 5]); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke();
  ctx.setLineDash([]);

  const ray = (dx: number, dy: number, color: string, width = 2.5) => {
    ctx.strokeStyle = color; ctx.lineWidth = width;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + dx * R, cy + dy * R); ctx.stroke();
    // arrowhead
    const ex = cx + dx * R, ey = cy + dy * R;
    const a = Math.atan2(dy, dx);
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex - 9 * Math.cos(a - 0.4), ey - 9 * Math.sin(a - 0.4));
    ctx.lineTo(ex - 9 * Math.cos(a + 0.4), ey - 9 * Math.sin(a + 0.4));
    ctx.closePath(); ctx.fillStyle = color; ctx.fill();
  };

  // incident ray (from upper-left into O)
  ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx - Math.sin(r.thetaI) * R, cy - Math.cos(r.thetaI) * R);
  ctx.lineTo(cx, cy); ctx.stroke();
  label(ctx, 'incident', cx - Math.sin(r.thetaI) * R, cy - Math.cos(r.thetaI) * R - 6, '#fbbf24', '11px system-ui', 'center');

  // reflected ray (back into upper medium)
  ray(Math.sin(r.thetaI), -Math.cos(r.thetaI), '#f472b6', 2);

  // refracted ray or TIR note
  if (!r.tir) {
    ray(Math.sin(r.thetaR), Math.cos(r.thetaR), '#34d399');
    label(ctx, `θr = ${(r.thetaR / DEG).toFixed(1)}°`, cx + 12, cy + R * 0.7, '#34d399', '12px system-ui', 'left');
  } else {
    label(ctx, 'Total internal reflection', cx, cy + 24, '#f472b6', 'bold 14px system-ui', 'center');
  }

  label(ctx, `n₁ = ${r.n1.toFixed(2)}`, 12, cy - 10, p.subtle, '12px system-ui', 'left');
  label(ctx, `n₂ = ${r.n2.toFixed(2)}`, 12, cy + 18, p.subtle, '12px system-ui', 'left');
  label(ctx, `θi = ${(r.thetaI / DEG).toFixed(1)}°`, cx - 12, cy - R * 0.7, '#fbbf24', '12px system-ui', 'right');
}

export const refraction: ModelDefinition = {
  meta: {
    id: 'refraction-snell',
    title: 'Refraction (Snell’s Law)',
    titleZh: '折射（斯涅尔定律）',
    titleJa: '屈折（スネルの法則）',
    subject: 'physics',
    description: 'Bend a light ray between two media and find the angle of refraction and total internal reflection.',
    descriptionZh: '让光线在两种介质间弯折，求折射角并观察全反射。',
    descriptionJa: '2 つの媒質の境界で光を屈折させ、屈折角と全反射を調べます。',
    difficulty: 'high-school',
    tags: ['optics', 'refraction', 'light', 'Snell'],
    accent: '#34d399',
  },
  controls: [
    { type: 'slider', key: 'n1', label: 'Index n₁ (top)', labelZh: '折射率 n₁（上）', min: 1, max: 2.5, step: 0.01 },
    { type: 'slider', key: 'n2', label: 'Index n₂ (bottom)', labelZh: '折射率 n₂（下）', min: 1, max: 2.5, step: 0.01 },
    { type: 'slider', key: 'angle', label: 'Angle of incidence', labelZh: '入射角', min: 0, max: 89, step: 1, unit: '°' },
  ],
  defaultVariables: { n1: 1, n2: 1.5, angle: 40 },
  presets: [
    { name: 'Air → glass', nameZh: '空气→玻璃', variables: { n1: 1, n2: 1.5, angle: 40 } },
    { name: 'Glass → air (TIR)', nameZh: '玻璃→空气（全反射）', variables: { n1: 1.5, n2: 1, angle: 60 } },
    { name: 'Air → water', nameZh: '空气→水', variables: { n1: 1, n2: 1.33, angle: 45 } },
  ],
  concepts: [
    "Snell's law: n₁ sinθ₁ = n₂ sinθ₂.",
    'Light bends toward the normal when entering a denser (higher-n) medium.',
    'Going to a less dense medium, beyond the critical angle gives total internal reflection.',
    'The angle of reflection always equals the angle of incidence.',
  ],
  conceptsZh: [
    '斯涅尔定律：n₁ sinθ₁ = n₂ sinθ₂。',
    '进入更密（折射率更高）的介质时，光向法线偏折。',
    '进入较稀疏介质时，超过临界角会发生全反射。',
    '反射角始终等于入射角。',
  ],
  formulas: [
    { tex: 'n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2', label: "Snell's law", labelZh: '斯涅尔定律' },
    { tex: '\\theta_c = \\arcsin\\!\\left(\\dfrac{n_2}{n_1}\\right)', label: 'Critical angle', labelZh: '临界角' },
  ],
  animated: false,
  supportsStep: false,
  compute,
  render,
  suggestedQuestions: [
    { en: 'Why does light bend toward the normal in glass?', zh: '为什么光在玻璃中向法线偏折？' },
    { en: 'What is total internal reflection?', zh: '什么是全反射？' },
    { en: 'When does the critical angle exist?', zh: '临界角在什么情况下存在？' },
  ],
  learn: {
    intro: {
      en: 'Refraction is the bending of light as it passes from one transparent material into another.',
      zh: '折射是光从一种透明介质进入另一种介质时发生的弯折。',
      ja: '屈折は、光がある透明な物質から別の物質へ進むときに曲がる現象です。',
    },
    principle: {
      en: "Snell's law (n₁sinθ₁ = n₂sinθ₂) links the angles to the refractive indices; light slows and bends toward the normal in a denser medium, and beyond the critical angle it reflects entirely.",
      zh: '斯涅尔定律（n₁sinθ₁ = n₂sinθ₂）把角度与折射率联系起来；光在更密介质中变慢并向法线偏折，超过临界角则发生全反射。',
      ja: 'スネルの法則（n₁sinθ₁ = n₂sinθ₂）が角度と屈折率を結びます。密な媒質では光は遅くなり法線側に曲がり、臨界角を超えると全反射します。',
    },
    tips: [
      { en: 'Increase n₂ and the refracted ray bends closer to the normal.', zh: '增大 n₂，折射光线更靠近法线。', ja: 'n₂ を大きくすると、屈折光は法線に近づきます。' },
      { en: 'Try the glass → air preset and raise the angle to trigger total internal reflection.', zh: '试试玻璃→空气预设并增大角度，触发全反射。', ja: 'ガラス→空気のプリセットで角度を上げると全反射が起きます。' },
      { en: 'The reflected ray is always present and mirrors the incident angle.', zh: '反射光线始终存在，并与入射角对称。', ja: '反射光は常に存在し、入射角と対称になります。' },
    ],
  },
};
