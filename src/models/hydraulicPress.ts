// Physics: Hydraulic Press — Pascal's principle and force multiplication.
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, label } from './canvasUtils';

function physics(vars: Variables) {
  const F1 = vars.inputForce as number;
  const r1 = vars.smallRadius as number;
  const r2 = vars.largeRadius as number;
  const A1 = Math.PI * r1 * r1;
  const A2 = Math.PI * r2 * r2;
  const P = F1 / A1;
  const F2 = P * A2;
  const MA = A2 / A1;
  return { F1, r1, r2, A1, A2, P, F2, MA };
}

function compute(vars: Variables): ComputeResult {
  const p = physics(vars);
  return {
    data: [
      { key: 'F2', label: 'Output force', labelZh: '输出力', value: p.F2, unit: 'N', precision: 0 },
      { key: 'MA', label: 'Force multiplier', labelZh: '力的放大倍数', value: p.MA, unit: '×', precision: 1 },
      { key: 'P', label: 'Pressure', labelZh: '压强', value: p.P, unit: 'N/cm²', precision: 2 },
      { key: 'F1', label: 'Input force', labelZh: '输入力', value: p.F1, unit: 'N', precision: 0 },
    ],
    render: { ...p },
  };
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  const r = computed.render;
  const baseY = h * 0.78;
  const maxPx = Math.min(w * 0.16, 80);
  const rmax = Math.max(r.r1, r.r2);
  const w1 = (r.r1 / rmax) * maxPx + 16;
  const w2 = (r.r2 / rmax) * maxPx + 16;
  const x1 = w * 0.26, x2 = w * 0.72;

  // fluid reservoir connecting the two cylinders
  ctx.fillStyle = isDark ? 'rgba(56,189,248,0.25)' : 'rgba(14,165,233,0.2)';
  ctx.fillRect(x1 - w1, baseY, x2 - x1 + w1 + w2, h * 0.12);
  ctx.fillRect(x1 - w1, baseY - h * 0.18, w1 * 2, h * 0.18);
  ctx.fillRect(x2 - w2, baseY - h * 0.28, w2 * 2, h * 0.28);

  // cylinders outline
  ctx.strokeStyle = p.axis; ctx.lineWidth = 2;
  ctx.strokeRect(x1 - w1, baseY - h * 0.18, w1 * 2, h * 0.18);
  ctx.strokeRect(x2 - w2, baseY - h * 0.28, w2 * 2, h * 0.28);

  // pistons
  ctx.fillStyle = p.subtle;
  ctx.fillRect(x1 - w1, baseY - h * 0.18 - 10, w1 * 2, 10);
  ctx.fillRect(x2 - w2, baseY - h * 0.28 - 10, w2 * 2, 10);

  // input force arrow (down) on small piston
  ctx.strokeStyle = '#f472b6'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x1, baseY - h * 0.18 - 50); ctx.lineTo(x1, baseY - h * 0.18 - 14); ctx.stroke();
  ctx.fillStyle = '#f472b6';
  ctx.beginPath(); ctx.moveTo(x1, baseY - h * 0.18 - 12); ctx.lineTo(x1 - 6, baseY - h * 0.18 - 22); ctx.lineTo(x1 + 6, baseY - h * 0.18 - 22); ctx.closePath(); ctx.fill();
  label(ctx, `F₁ ${r.F1} N`, x1, baseY - h * 0.18 - 58, '#f472b6', '12px system-ui', 'center');

  // output force arrow (up) + load on large piston
  ctx.strokeStyle = '#34d399'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x2, baseY - h * 0.28 - 50); ctx.lineTo(x2, baseY - h * 0.28 - 14); ctx.stroke();
  ctx.fillStyle = '#34d399';
  ctx.beginPath(); ctx.moveTo(x2, baseY - h * 0.28 - 52); ctx.lineTo(x2 - 6, baseY - h * 0.28 - 42); ctx.lineTo(x2 + 6, baseY - h * 0.28 - 42); ctx.closePath(); ctx.fill();
  label(ctx, `F₂ ${r.F2.toFixed(0)} N`, x2, baseY - h * 0.28 - 58, '#34d399', '12px system-ui', 'center');

  label(ctx, `same pressure → ${r.MA.toFixed(1)}× force`, w / 2, h - 12, p.text, 'bold 14px system-ui', 'center');
}

export const hydraulicPress: ModelDefinition = {
  meta: {
    id: 'hydraulic-press',
    title: 'Hydraulic Press',
    titleZh: '液压机',
    titleJa: '油圧プレス',
    subject: 'physics',
    description: "Use Pascal's principle to turn a small force into a big one with two connected pistons.",
    descriptionZh: '利用帕斯卡原理，用两个连通的活塞把小力变成大力。',
    descriptionJa: 'パスカルの原理で、つながった 2 つのピストンによって小さな力を大きな力に変えます。',
    difficulty: 'high-school',
    tags: ['fluids', 'pressure', 'Pascal', 'mechanical advantage'],
    accent: '#38bdf8',
  },
  controls: [
    { type: 'slider', key: 'inputForce', label: 'Input force', labelZh: '输入力', min: 10, max: 200, step: 10, unit: 'N' },
    { type: 'slider', key: 'smallRadius', label: 'Small piston radius', labelZh: '小活塞半径', min: 1, max: 5, step: 0.5, unit: 'cm' },
    { type: 'slider', key: 'largeRadius', label: 'Large piston radius', labelZh: '大活塞半径', min: 2, max: 15, step: 0.5, unit: 'cm' },
  ],
  defaultVariables: { inputForce: 50, smallRadius: 2, largeRadius: 8 },
  presets: [
    { name: 'Default', nameZh: '默认', variables: { inputForce: 50, smallRadius: 2, largeRadius: 8 } },
    { name: 'Big multiplier', nameZh: '大放大倍数', variables: { inputForce: 30, smallRadius: 1.5, largeRadius: 12 } },
    { name: 'Equal pistons', nameZh: '等径活塞', variables: { inputForce: 50, smallRadius: 4, largeRadius: 4 } },
  ],
  concepts: [
    "Pascal's principle: pressure applied to a confined fluid is transmitted equally everywhere.",
    'Both pistons feel the same pressure, so the larger area gives a larger force.',
    'The force multiplier equals the ratio of the piston areas (proportional to radius squared).',
    'You trade distance for force: the big piston moves a smaller distance.',
  ],
  conceptsZh: [
    '帕斯卡原理：施加于封闭流体的压强会向各处等量传递。',
    '两个活塞受到相同的压强，因此面积更大的活塞产生更大的力。',
    '力的放大倍数等于活塞面积之比（与半径平方成正比）。',
    '以距离换力：大活塞移动的距离更短。',
  ],
  formulas: [
    { tex: '\\dfrac{F_1}{A_1} = \\dfrac{F_2}{A_2}', label: "Pascal's principle", labelZh: '帕斯卡原理' },
    { tex: 'F_2 = F_1\\dfrac{A_2}{A_1}', label: 'Output force', labelZh: '输出力' },
  ],
  animated: false,
  supportsStep: false,
  compute,
  render,
  suggestedQuestions: [
    { en: 'How does a small force lift a heavy car?', zh: '小力如何举起一辆重车？' },
    { en: 'What does the area ratio control?', zh: '面积比控制什么？' },
    { en: 'What do you give up to gain force?', zh: '为获得更大的力要付出什么代价？' },
  ],
  learn: {
    intro: {
      en: 'A hydraulic press multiplies force using a confined liquid — the idea behind car lifts and brakes.',
      zh: '液压机利用封闭液体放大力——这是汽车举升机和刹车背后的原理。',
      ja: '油圧プレスは閉じ込めた液体で力を増幅します。自動車のリフトやブレーキの原理です。',
    },
    principle: {
      en: 'Pressure pushed into a trapped fluid reaches every part equally. Since pressure is force per area, the same pressure on a bigger piston produces a proportionally bigger force — multiplied by the area ratio.',
      zh: '压入封闭流体的压强会等量到达每一处。由于压强是单位面积上的力，相同压强作用在更大的活塞上会产生成比例更大的力——按面积比放大。',
      ja: '閉じ込めた流体に加えた圧力は各部に等しく伝わります。圧力は単位面積あたりの力なので、同じ圧力でも大きいピストンほど面積比に比例した大きな力を生みます。',
    },
    tips: [
      { en: 'Make the large piston much bigger than the small one for a huge multiplier.', zh: '让大活塞远大于小活塞，获得很大的放大倍数。', ja: '大ピストンを小ピストンより大きくすると、倍率が大きくなります。' },
      { en: 'Equal pistons give a 1× multiplier — no force gain.', zh: '等径活塞放大倍数为 1×——没有增益。', ja: '同じ大きさのピストンでは 1× で、力は増えません。' },
      { en: 'The multiplier grows with the square of the radius ratio.', zh: '放大倍数随半径比的平方增长。', ja: '倍率は半径比の 2 乗で増えます。' },
    ],
  },
};
