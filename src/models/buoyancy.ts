// Physics: Buoyancy (Archimedes' principle).
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, label } from './canvasUtils';

const G = 9.8;

function physics(vars: Variables) {
  const rhoObj = vars.objectDensity as number;
  const rhoFluid = vars.fluidDensity as number;
  const volL = vars.volume as number;
  const V = volL / 1000; // L → m³
  const weight = rhoObj * V * G;
  const floats = rhoObj <= rhoFluid;
  const submerged = floats ? rhoObj / rhoFluid : 1;
  const buoyant = (floats ? rhoObj : rhoFluid) * V * G;
  return { rhoObj, rhoFluid, volL, V, weight, floats, submerged, buoyant };
}

function compute(vars: Variables): ComputeResult {
  const r = physics(vars);
  return {
    data: [
      { key: 'state', label: 'Result', labelZh: '结果', value: r.floats ? 'floats' : 'sinks' },
      { key: 'submerged', label: 'Fraction submerged', labelZh: '没入比例', value: r.submerged * 100, unit: '%', precision: 0 },
      { key: 'buoyant', label: 'Buoyant force', labelZh: '浮力', value: r.buoyant, unit: 'N', precision: 2 },
      { key: 'weight', label: 'Weight', labelZh: '重力', value: r.weight, unit: 'N', precision: 2 },
    ],
    render: { ...r },
  };
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  const r = computed.render;

  // tank + fluid
  const tx = w * 0.12, tw = w * 0.76, tBot = h - 30, tTop = h * 0.22;
  const waterTop = tTop + (tBot - tTop) * 0.18;
  ctx.fillStyle = isDark ? `rgba(56,189,248,${0.10 + r.rhoFluid / 4000})` : `rgba(14,165,233,${0.08 + r.rhoFluid / 5000})`;
  ctx.fillRect(tx, waterTop, tw, tBot - waterTop);
  ctx.strokeStyle = p.axis; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(tx, tTop); ctx.lineTo(tx, tBot); ctx.lineTo(tx + tw, tBot); ctx.lineTo(tx + tw, tTop); ctx.stroke();
  ctx.strokeStyle = isDark ? 'rgba(125,211,252,0.6)' : 'rgba(2,132,199,0.6)';
  ctx.beginPath(); ctx.moveTo(tx, waterTop); ctx.lineTo(tx + tw, waterTop); ctx.stroke();

  // object: a box whose submerged fraction sits below the waterline
  const boxSize = Math.max(40, Math.min(120, 30 + r.volL * 4));
  const cx = tx + tw / 2;
  let topOfBox: number;
  if (r.floats) {
    // submerged fraction below the surface
    topOfBox = waterTop - boxSize * (1 - r.submerged);
  } else {
    // resting on the bottom
    topOfBox = tBot - boxSize - 4;
  }
  ctx.fillStyle = r.floats ? '#fbbf24' : '#f87171';
  ctx.fillRect(cx - boxSize / 2, topOfBox, boxSize, boxSize);
  ctx.strokeStyle = p.text; ctx.lineWidth = 1.5; ctx.strokeRect(cx - boxSize / 2, topOfBox, boxSize, boxSize);

  // force arrows: weight down, buoyancy up
  const mid = topOfBox + boxSize / 2;
  ctx.strokeStyle = '#f472b6'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(cx - 10, mid); ctx.lineTo(cx - 10, mid + 30); ctx.stroke();
  ctx.fillStyle = '#f472b6';
  ctx.beginPath(); ctx.moveTo(cx - 10, mid + 30); ctx.lineTo(cx - 15, mid + 22); ctx.lineTo(cx - 5, mid + 22); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#34d399'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(cx + 10, mid); ctx.lineTo(cx + 10, mid - 30); ctx.stroke();
  ctx.fillStyle = '#34d399';
  ctx.beginPath(); ctx.moveTo(cx + 10, mid - 30); ctx.lineTo(cx + 5, mid - 22); ctx.lineTo(cx + 15, mid - 22); ctx.closePath(); ctx.fill();

  label(ctx, r.floats ? `floats · ${(r.submerged * 100).toFixed(0)}% submerged` : 'sinks',
    w / 2, tTop - 8, r.floats ? '#34d399' : '#f87171', 'bold 14px system-ui', 'center');
  label(ctx, 'W', cx - 10, mid + 44, '#f472b6', '11px system-ui', 'center');
  label(ctx, 'F_b', cx + 14, mid - 34, '#34d399', '11px system-ui', 'center');
}

export const buoyancy: ModelDefinition = {
  meta: {
    id: 'buoyancy',
    title: 'Buoyancy',
    titleZh: '浮力',
    titleJa: '浮力',
    subject: 'physics',
    description: "Use Archimedes' principle to find whether an object floats or sinks, and how deep it sits.",
    descriptionZh: '用阿基米德原理判断物体是浮是沉，以及没入多深。',
    descriptionJa: 'アルキメデスの原理で、物体が浮くか沈むか、どこまで沈むかを調べます。',
    difficulty: 'high-school',
    tags: ['fluids', 'density', 'Archimedes', 'pressure'],
    accent: '#38bdf8',
  },
  controls: [
    { type: 'slider', key: 'objectDensity', label: 'Object density', labelZh: '物体密度', min: 100, max: 3000, step: 50, unit: 'kg/m³' },
    { type: 'slider', key: 'fluidDensity', label: 'Fluid density', labelZh: '液体密度', min: 500, max: 1500, step: 25, unit: 'kg/m³' },
    { type: 'slider', key: 'volume', label: 'Object volume', labelZh: '物体体积', min: 1, max: 20, step: 1, unit: 'L' },
  ],
  defaultVariables: { objectDensity: 600, fluidDensity: 1000, volume: 8 },
  presets: [
    { name: 'Wood in water', nameZh: '木头在水中', variables: { objectDensity: 600, fluidDensity: 1000, volume: 8 } },
    { name: 'Ice in water', nameZh: '冰在水中', variables: { objectDensity: 920, fluidDensity: 1000, volume: 8 } },
    { name: 'Steel sinks', nameZh: '钢铁下沉', variables: { objectDensity: 2700, fluidDensity: 1000, volume: 8 } },
    { name: 'Float in brine', nameZh: '盐水中上浮', variables: { objectDensity: 1100, fluidDensity: 1200, volume: 8 } },
  ],
  concepts: [
    "Archimedes' principle: buoyant force equals the weight of the fluid displaced.",
    'An object floats if its density is less than the fluid’s density.',
    'A floating object submerges by the fraction ρ_object / ρ_fluid.',
    'If it sinks, the buoyant force is less than the weight.',
  ],
  conceptsZh: [
    '阿基米德原理：浮力等于排开液体的重力。',
    '当物体密度小于液体密度时，它会上浮。',
    '漂浮物没入的比例为 ρ_物 / ρ_液。',
    '若下沉，则浮力小于重力。',
  ],
  formulas: [
    { tex: 'F_b = \\rho_{fluid}\\, V_{displaced}\\, g', label: 'Buoyant force', labelZh: '浮力' },
    { tex: '\\text{submerged} = \\dfrac{\\rho_{obj}}{\\rho_{fluid}}', label: 'Floating fraction', labelZh: '没入比例' },
  ],
  animated: false,
  supportsStep: false,
  compute,
  render,
  suggestedQuestions: [
    { en: 'Why do some objects float and others sink?', zh: '为什么有些物体浮、有些沉？' },
    { en: 'Why does ice float with most of it underwater?', zh: '为什么冰大部分没入水中还能浮？' },
    { en: 'How does salt water change floating?', zh: '盐水如何改变浮沉？' },
  ],
  learn: {
    intro: {
      en: 'Buoyancy is the upward push a fluid gives to anything placed in it — the reason boats float and balloons rise.',
      zh: '浮力是液体对放入其中物体施加的向上托力——这正是船能浮、气球能升的原因。',
      ja: '浮力は、流体が中の物体に与える上向きの力で、船が浮き気球が上がる理由です。',
    },
    principle: {
      en: "By Archimedes' principle, the upward buoyant force equals the weight of the fluid the object pushes aside. If the object is less dense than the fluid it floats, sinking just far enough to displace its own weight; if it is denser, it sinks.",
      zh: '根据阿基米德原理，向上的浮力等于物体排开液体的重力。若物体密度小于液体则上浮，恰好下沉到排开等于自身重量的液体；若密度更大则下沉。',
      ja: 'アルキメデスの原理では、上向きの浮力は押しのけた流体の重さに等しいです。物体が流体より低密度なら浮き、自分の重さ分だけ押しのける深さまで沈みます。高密度なら沈みます。',
    },
    tips: [
      { en: 'Set the object denser than the fluid and it drops to the bottom.', zh: '让物体密度大于液体，它就沉到底部。', ja: '物体を流体より高密度にすると、底まで沈みます。' },
      { en: 'Ice (920) in water (1000) floats with about 92% submerged.', zh: '冰（920）在水（1000）中漂浮，约 92% 没入。', ja: '氷（920）は水（1000）で約 92% 沈んで浮きます。' },
      { en: 'Raise the fluid density (like salt water) to float a denser object.', zh: '提高液体密度（如盐水），可让更重的物体上浮。', ja: '流体の密度を上げる（塩水など）と、より重い物体も浮きます。' },
    ],
  },
};
