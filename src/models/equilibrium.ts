// Chemistry: Chemical Equilibrium (reversible reaction A ⇌ B).
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, label } from './canvasUtils';

const TOTAL = 100;

function kinetics(vars: Variables) {
  const kf = vars.kForward as number;
  const kr = vars.kReverse as number;
  const sum = kf + kr;
  const Aeq = (TOTAL * kr) / sum;
  const Beq = (TOTAL * kf) / sum;
  const K = kf / kr;
  const tMax = Math.max(3, Math.min(12, 5 / sum));
  const A = (t: number) => Aeq + (TOTAL - Aeq) * Math.exp(-sum * t);
  return { kf, kr, sum, Aeq, Beq, K, tMax, A };
}

function compute(vars: Variables, t: number): ComputeResult {
  const r = kinetics(vars);
  const tt = t % r.tMax;
  const a = r.A(tt), b = TOTAL - a;

  const aPts: { x: number; y: number }[] = [];
  const bPts: { x: number; y: number }[] = [];
  for (let i = 0; i <= 100; i++) {
    const ti = (r.tMax * i) / 100;
    const av = r.A(ti);
    aPts.push({ x: ti, y: av });
    bPts.push({ x: ti, y: TOTAL - av });
  }

  return {
    data: [
      { key: 'K', label: 'Equilibrium constant K', labelZh: '平衡常数 K', value: r.K, precision: 2 },
      { key: 'A', label: '[A] now', labelZh: '当前 [A]', value: a, unit: '%', precision: 1 },
      { key: 'B', label: '[B] now', labelZh: '当前 [B]', value: b, unit: '%', precision: 1 },
      { key: 'Beq', label: '[B] at equilibrium', labelZh: '平衡时 [B]', value: r.Beq, unit: '%', precision: 1 },
    ],
    chart: {
      title: 'Concentrations vs time', titleZh: '浓度-时间',
      xLabel: 't', yLabel: '%',
      series: [
        { name: '[A]', color: '#34d399', points: aPts },
        { name: '[B]', color: '#60a5fa', points: bPts },
      ],
      marker: { x: tt, y: a },
    },
    render: { ...r, a, b },
  };
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  const r = computed.render;
  const baseY = h - 50, topY = 40, scale = (baseY - topY) / TOTAL;
  const bw = w * 0.22;
  const ax = w * 0.28, bx = w * 0.6;

  const bar = (x: number, val: number, eq: number, color: string, name: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, baseY - val * scale, bw, val * scale);
    // equilibrium guide
    ctx.strokeStyle = '#fbbf24'; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x - 6, baseY - eq * scale); ctx.lineTo(x + bw + 6, baseY - eq * scale); ctx.stroke();
    ctx.setLineDash([]);
    label(ctx, name, x + bw / 2, baseY + 18, p.text, 'bold 14px system-ui', 'center');
    label(ctx, `${val.toFixed(0)}%`, x + bw / 2, baseY - val * scale - 8, p.text, '12px system-ui', 'center');
  };
  bar(ax, r.a, r.Aeq, '#34d399', 'A');
  bar(bx, r.b, r.Beq, '#60a5fa', 'B');

  label(ctx, `A ⇌ B   ·   K = ${r.K.toFixed(2)}`, w / 2, topY - 12, p.text, 'bold 15px system-ui', 'center');
  label(ctx, 'dashed line = equilibrium', w / 2, h - 14, p.subtle, '11px system-ui', 'center');
}

export const equilibrium: ModelDefinition = {
  meta: {
    id: 'chemical-equilibrium',
    title: 'Chemical Equilibrium',
    titleZh: '化学平衡',
    titleJa: '化学平衡',
    subject: 'chemistry',
    description: 'Watch a reversible reaction A ⇌ B settle into equilibrium set by the forward and reverse rates.',
    descriptionZh: '观察可逆反应 A ⇌ B 在正逆反应速率的作用下达到平衡。',
    descriptionJa: '可逆反応 A ⇌ B が正・逆反応の速さで決まる平衡に落ち着く様子を観察します。',
    difficulty: 'high-school',
    tags: ['equilibrium', 'reversible', 'rate', 'Le Chatelier'],
    accent: '#34d399',
  },
  controls: [
    { type: 'slider', key: 'kForward', label: 'Forward rate (A→B)', labelZh: '正反应速率 (A→B)', min: 0.1, max: 2, step: 0.05 },
    { type: 'slider', key: 'kReverse', label: 'Reverse rate (B→A)', labelZh: '逆反应速率 (B→A)', min: 0.1, max: 2, step: 0.05 },
  ],
  defaultVariables: { kForward: 0.8, kReverse: 0.4 },
  presets: [
    { name: 'Favors products', nameZh: '偏向产物', variables: { kForward: 1.2, kReverse: 0.3 } },
    { name: 'Balanced (K=1)', nameZh: '平衡 (K=1)', variables: { kForward: 0.6, kReverse: 0.6 } },
    { name: 'Favors reactants', nameZh: '偏向反应物', variables: { kForward: 0.3, kReverse: 1.2 } },
  ],
  concepts: [
    'At equilibrium the forward and reverse reactions proceed at equal rates.',
    'Concentrations stop changing, though both reactions are still happening.',
    'The equilibrium constant K = k_forward / k_reverse sets the final ratio of B to A.',
    'A larger K means the products are favored.',
  ],
  conceptsZh: [
    '平衡时正反应和逆反应以相等的速率进行。',
    '浓度不再变化，尽管两个反应仍在发生。',
    '平衡常数 K = 正反应速率 / 逆反应速率，决定 B 与 A 的最终比例。',
    'K 越大，越偏向产物。',
  ],
  formulas: [
    { tex: 'K = \\dfrac{k_f}{k_r} = \\dfrac{[B]}{[A]}', label: 'Equilibrium constant', labelZh: '平衡常数' },
  ],
  animated: true,
  supportsStep: true,
  duration: (vars) => kinetics(vars).tMax,
  compute,
  render,
  suggestedQuestions: [
    { en: 'What does it mean to be at equilibrium?', zh: '处于平衡是什么意思？' },
    { en: 'How does K relate to the rates?', zh: 'K 与反应速率有什么关系？' },
    { en: 'What makes a reaction favor products?', zh: '什么使反应偏向产物？' },
  ],
  learn: {
    intro: {
      en: 'Many reactions are reversible: products turn back into reactants until the system reaches a steady balance called equilibrium.',
      zh: '许多反应是可逆的：产物会变回反应物，直到体系达到稳定的平衡状态。',
      ja: '多くの反応は可逆で、生成物が反応物に戻り、やがて平衡という安定した釣り合いに達します。',
    },
    principle: {
      en: 'Equilibrium is dynamic: both directions keep reacting, but at equal rates, so concentrations hold steady. Their ratio is fixed by the equilibrium constant K = k_f/k_r — bigger K pushes the balance toward products.',
      zh: '平衡是动态的：两个方向都在持续反应，但速率相等，因此浓度保持稳定。它们的比例由平衡常数 K = k_f/k_r 决定——K 越大越偏向产物。',
      ja: '平衡は動的です。両方向とも反応し続けますが速さが等しいため、濃度は一定に保たれます。その比は平衡定数 K = k_f/k_r で決まり、K が大きいほど生成物寄りになります。',
    },
    tips: [
      { en: 'Make the forward rate larger to push more A into B.', zh: '增大正反应速率，把更多 A 转化为 B。', ja: '正反応の速さを大きくすると、より多くの A が B になります。' },
      { en: 'Set both rates equal for K = 1 and a 50/50 split.', zh: '让两个速率相等，K = 1，各占一半。', ja: '両方の速さを等しくすると K = 1 で半々になります。' },
      { en: 'Notice the bars stop at the dashed equilibrium lines.', zh: '注意柱状条停在虚线的平衡位置。', ja: 'バーが破線の平衡線で止まることに注目しましょう。' },
    ],
  },
};
