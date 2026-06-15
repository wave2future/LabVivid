// Biology: Enzyme Kinetics (Michaelis–Menten).
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, label } from './canvasUtils';

const S_MAX = 100;

function kinetics(vars: Variables) {
  const vmax = vars.vmax as number;
  const kmBase = vars.km as number;
  const s = vars.substrate as number;
  const inhibitor = vars.inhibitor as boolean;
  const km = inhibitor ? kmBase * 2 : kmBase; // competitive inhibitor raises apparent Km
  const v = (vmax * s) / (km + s);
  return { vmax, km, kmBase, s, inhibitor, v };
}

function compute(vars: Variables): ComputeResult {
  const r = kinetics(vars);
  const points: { x: number; y: number }[] = [];
  for (let s = 0; s <= S_MAX; s += 2) points.push({ x: s, y: (r.vmax * s) / (r.km + s) });
  return {
    data: [
      { key: 'rate', label: 'Reaction rate v', labelZh: '反应速率 v', value: r.v, unit: 'µM/s', precision: 1 },
      { key: 'pct', label: 'Percent of Vmax', labelZh: '占 Vmax 比例', value: (r.v / r.vmax) * 100, unit: '%', precision: 0 },
      { key: 'km', label: 'Km (apparent)', labelZh: 'Km（表观）', value: r.km, unit: 'µM', precision: 1 },
      { key: 'vmax', label: 'Vmax', labelZh: 'Vmax', value: r.vmax, unit: 'µM/s', precision: 0 },
    ],
    render: { ...r, points },
  };
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  const r = computed.render;
  const pad = { l: 46, r: 16, t: 24, b: 34 };
  const yMax = r.vmax * 1.12;
  const toX = (s: number) => pad.l + (s / S_MAX) * (w - pad.l - pad.r);
  const toY = (v: number) => h - pad.b - (v / yMax) * (h - pad.t - pad.b);

  // axes
  ctx.strokeStyle = p.axis; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, h - pad.b); ctx.lineTo(w - pad.r, h - pad.b);
  ctx.stroke();
  label(ctx, '[S] (µM)', (w + pad.l) / 2, h - 8, p.subtle, '12px system-ui', 'center');
  label(ctx, 'v', 14, pad.t + 4, p.subtle, '12px system-ui', 'left');

  // Vmax asymptote
  ctx.strokeStyle = '#f472b6'; ctx.setLineDash([6, 5]); ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(pad.l, toY(r.vmax)); ctx.lineTo(w - pad.r, toY(r.vmax)); ctx.stroke();
  label(ctx, 'Vmax', w - pad.r, toY(r.vmax) - 6, '#f472b6', '11px system-ui', 'right');

  // Km guide (v = Vmax/2 at S = Km)
  ctx.strokeStyle = p.grid;
  ctx.beginPath(); ctx.moveTo(toX(r.km), h - pad.b); ctx.lineTo(toX(r.km), toY(r.vmax / 2)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(pad.l, toY(r.vmax / 2)); ctx.lineTo(toX(r.km), toY(r.vmax / 2)); ctx.stroke();
  ctx.setLineDash([]);
  label(ctx, 'Km', toX(r.km), h - pad.b + 14, p.subtle, '11px system-ui', 'center');

  // saturation curve
  ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 3; ctx.beginPath();
  r.points.forEach((pt: { x: number; y: number }, i: number) => {
    const X = toX(pt.x), Y = toY(pt.y);
    if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
  });
  ctx.stroke();

  // current point
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath(); ctx.arc(toX(r.s), toY(r.v), 6, 0, Math.PI * 2); ctx.fill();
  label(ctx, `v = ${r.v.toFixed(1)}`, toX(r.s), toY(r.v) - 12, p.text, 'bold 13px system-ui', 'center');
  if (r.inhibitor) label(ctx, 'competitive inhibitor', w / 2, pad.t - 8, '#f87171', '12px system-ui', 'center');
}

export const enzymeKinetics: ModelDefinition = {
  meta: {
    id: 'enzyme-kinetics',
    title: 'Enzyme Kinetics',
    titleZh: '酶动力学',
    titleJa: '酵素反応速度論',
    subject: 'biology',
    description: 'Explore Michaelis–Menten kinetics: how substrate concentration drives an enzyme toward Vmax.',
    descriptionZh: '探索米氏动力学：底物浓度如何使酶反应趋向 Vmax。',
    descriptionJa: 'ミカエリス・メンテン式を探究：基質濃度が酵素反応をどう Vmax に近づけるか。',
    difficulty: 'college',
    tags: ['enzyme', 'kinetics', 'Michaelis-Menten', 'biochemistry'],
    accent: '#4ade80',
  },
  controls: [
    { type: 'slider', key: 'vmax', label: 'Vmax', labelZh: 'Vmax', min: 10, max: 100, step: 5, unit: 'µM/s' },
    { type: 'slider', key: 'km', label: 'Km', labelZh: 'Km', min: 2, max: 50, step: 1, unit: 'µM' },
    { type: 'slider', key: 'substrate', label: 'Substrate [S]', labelZh: '底物浓度 [S]', min: 0, max: 100, step: 1, unit: 'µM' },
    { type: 'toggle', key: 'inhibitor', label: 'Competitive inhibitor', labelZh: '竞争性抑制剂' },
  ],
  defaultVariables: { vmax: 80, km: 15, substrate: 20, inhibitor: false },
  presets: [
    { name: 'Default', nameZh: '默认', variables: { vmax: 80, km: 15, substrate: 20, inhibitor: false } },
    { name: 'Saturated', nameZh: '饱和', variables: { vmax: 80, km: 15, substrate: 100, inhibitor: false } },
    { name: 'With inhibitor', nameZh: '加抑制剂', variables: { vmax: 80, km: 15, substrate: 20, inhibitor: true } },
    { name: 'High affinity (low Km)', nameZh: '高亲和（低 Km）', variables: { vmax: 80, km: 4, substrate: 20, inhibitor: false } },
  ],
  concepts: [
    'Rate rises with substrate but levels off as the enzyme becomes saturated (Vmax).',
    'Km is the substrate concentration that gives half of Vmax — a measure of affinity.',
    'A low Km means high affinity: the enzyme reaches half-speed with little substrate.',
    'A competitive inhibitor raises the apparent Km but leaves Vmax unchanged.',
  ],
  conceptsZh: [
    '速率随底物增大，但当酶饱和时趋于平稳（Vmax）。',
    'Km 是达到 Vmax 一半时的底物浓度——衡量亲和力。',
    'Km 越低亲和力越高：少量底物即可达到半速。',
    '竞争性抑制剂升高表观 Km，但不改变 Vmax。',
  ],
  formulas: [
    { tex: 'v = \\dfrac{V_{max}\\,[S]}{K_m + [S]}', label: 'Michaelis–Menten', labelZh: '米氏方程' },
  ],
  animated: false,
  supportsStep: false,
  compute,
  render,
  suggestedQuestions: [
    { en: 'What does Km tell me about an enzyme?', zh: 'Km 说明了酶的什么？' },
    { en: 'Why does the rate level off?', zh: '为什么速率会趋于平稳？' },
    { en: 'How does a competitive inhibitor change the curve?', zh: '竞争性抑制剂如何改变曲线？' },
  ],
  learn: {
    intro: {
      en: 'Enzyme kinetics describes how fast an enzyme converts substrate into product as conditions change.',
      zh: '酶动力学描述了在条件变化时酶将底物转化为产物的快慢。',
      ja: '酵素反応速度論は、条件が変わるときに酵素が基質を生成物に変える速さを表します。',
    },
    principle: {
      en: 'At low substrate the rate climbs almost linearly, but as every enzyme becomes busy it saturates at Vmax. Km — the substrate level for half-maximal rate — measures the enzyme’s affinity.',
      zh: '底物较少时速率几乎线性上升，但当所有酶都在工作时便在 Vmax 处饱和。Km（达到半最大速率所需的底物浓度）衡量酶的亲和力。',
      ja: '基質が少ないと速度はほぼ直線的に上がりますが、すべての酵素が働くと Vmax で頭打ちになります。Km（半分の速度になる基質濃度）は酵素の親和性を表します。',
    },
    tips: [
      { en: 'Push the substrate high and watch the rate flatten toward Vmax.', zh: '把底物调高，看速率趋平接近 Vmax。', ja: '基質を高くすると、速度は Vmax に向かって平らになります。' },
      { en: 'Lower Km and the curve rises more steeply — higher affinity.', zh: '降低 Km，曲线上升更陡——亲和力更高。', ja: 'Km を下げると曲線が急になり、親和性が高くなります。' },
      { en: 'Turn on the inhibitor: Km shifts right but Vmax stays the same.', zh: '开启抑制剂：Km 右移，但 Vmax 不变。', ja: '阻害剤を入れると Km は右に動きますが、Vmax は同じままです。' },
    ],
  },
};
