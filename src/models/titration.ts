// Chemistry: Acid-Base Titration (PRD §9.3).
// Strong acid (fixed 50 mL in beaker) titrated with strong base.
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, label } from './canvasUtils';

const ACID_VOLUME_ML = 50; // volume of acid in the beaker

function phAt(Ca: number, Cb: number, Vbml: number) {
  const Va = ACID_VOLUME_ML / 1000;
  const Vb = Vbml / 1000;
  const nAcid = Ca * Va;
  const nBase = Cb * Vb;
  const totalV = Va + Vb;
  let pH: number;
  if (Math.abs(nAcid - nBase) < 1e-9) {
    pH = 7;
  } else if (nBase < nAcid) {
    const H = (nAcid - nBase) / totalV;
    pH = -Math.log10(Math.max(H, 1e-14));
  } else {
    const OH = (nBase - nAcid) / totalV;
    const pOH = -Math.log10(Math.max(OH, 1e-14));
    pH = 14 - pOH;
  }
  return Math.min(14, Math.max(0, pH));
}

// Indicator transition midpoints (approx).
const INDICATORS: Record<string, { lo: number; hi: number; acidColor: string; baseColor: string }> = {
  phenolphthalein: { lo: 8.2, hi: 10, acidColor: '#bfdbfe', baseColor: '#f472b6' },
  'bromothymol-blue': { lo: 6.0, hi: 7.6, acidColor: '#fde68a', baseColor: '#3b82f6' },
  'methyl-orange': { lo: 3.1, hi: 4.4, acidColor: '#f87171', baseColor: '#fbbf24' },
};

function indicatorColor(ind: string, pH: number): string {
  const cfg = INDICATORS[ind] ?? INDICATORS.phenolphthalein;
  if (pH <= cfg.lo) return cfg.acidColor;
  if (pH >= cfg.hi) return cfg.baseColor;
  return mix(cfg.acidColor, cfg.baseColor, (pH - cfg.lo) / (cfg.hi - cfg.lo));
}

function mix(a: string, b: string, t: number): string {
  const pa = hex(a), pb = hex(b);
  const r = Math.round(pa[0] + (pb[0] - pa[0]) * t);
  const g = Math.round(pa[1] + (pb[1] - pa[1]) * t);
  const bl = Math.round(pa[2] + (pb[2] - pa[2]) * t);
  return `rgb(${r},${g},${bl})`;
}
function hex(h: string): [number, number, number] {
  const m = h.replace('#', '');
  return [parseInt(m.slice(0, 2), 16), parseInt(m.slice(2, 4), 16), parseInt(m.slice(4, 6), 16)];
}

function compute(vars: Variables): ComputeResult {
  const Ca = vars.acidConc as number;
  const Cb = vars.baseConc as number;
  const Vb = vars.addedVolume as number;
  const ind = String(vars.indicator);
  const pH = phAt(Ca, Cb, Vb);
  const eqVol = (Ca * ACID_VOLUME_ML) / Cb; // mL of base for equivalence

  const points: { x: number; y: number }[] = [];
  const maxV = Math.max(eqVol * 2, Vb * 1.2, 10);
  const N = 120;
  for (let i = 0; i <= N; i++) {
    const v = (maxV * i) / N;
    points.push({ x: v, y: phAt(Ca, Cb, v) });
  }

  return {
    data: [
      { key: 'pH', label: 'Current pH', labelZh: '当前 pH', value: pH, precision: 2 },
      { key: 'equivVolume', label: 'Equivalence volume', labelZh: '当量体积', value: eqVol, unit: 'mL', precision: 1 },
      { key: 'addedVolume', label: 'Base added', labelZh: '已加碱', value: Vb, unit: 'mL', precision: 1 },
      { key: 'acidVolume', label: 'Acid volume', labelZh: '酸体积', value: ACID_VOLUME_ML, unit: 'mL', precision: 0 },
    ],
    chart: {
      title: 'Titration curve (pH vs base added)', titleZh: '滴定曲线 (pH vs 加碱量)',
      xLabel: 'Base added (mL)', yLabel: 'pH',
      series: [{ name: 'pH', color: '#a78bfa', points }],
      marker: { x: Vb, y: pH, label: 'now' },
    },
    render: { pH, eqVol, Vb, ind, color: indicatorColor(ind, pH) },
  };
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  const r = computed.render;

  // Burette at top
  const bx = w * 0.5;
  ctx.strokeStyle = p.axis;
  ctx.lineWidth = 2;
  ctx.strokeRect(bx - 8, 10, 16, h * 0.28);
  // base level in burette (decreases as more added — purely illustrative)
  ctx.fillStyle = '#93c5fd';
  const buretteFill = Math.max(0.1, 1 - r.Vb / 100);
  const bH = (h * 0.28 - 4) * buretteFill;
  ctx.fillRect(bx - 7, 12 + (h * 0.28 - 4 - bH), 14, bH);

  // dripping drop
  const dripY = h * 0.30 + ((rc.t * 80) % (h * 0.12));
  ctx.fillStyle = '#60a5fa';
  ctx.beginPath();
  ctx.arc(bx, dripY, 3, 0, Math.PI * 2);
  ctx.fill();

  // Beaker
  const beakerW = w * 0.42, beakerH = h * 0.42;
  const beakerX = bx - beakerW / 2, beakerY = h - beakerH - 24;
  ctx.strokeStyle = p.axis;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(beakerX, beakerY);
  ctx.lineTo(beakerX, beakerY + beakerH);
  ctx.lineTo(beakerX + beakerW, beakerY + beakerH);
  ctx.lineTo(beakerX + beakerW, beakerY);
  ctx.stroke();

  // Liquid (height grows slightly with added volume)
  const fillFrac = Math.min(0.9, 0.5 + r.Vb / 200);
  const liqH = beakerH * fillFrac;
  ctx.fillStyle = r.color;
  ctx.globalAlpha = 0.85;
  ctx.fillRect(beakerX + 2, beakerY + beakerH - liqH, beakerW - 4, liqH - 2);
  ctx.globalAlpha = 1;
  // surface line
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(beakerX + 2, beakerY + beakerH - liqH);
  ctx.lineTo(beakerX + beakerW - 2, beakerY + beakerH - liqH);
  ctx.stroke();

  // Readouts
  label(ctx, `pH = ${r.pH.toFixed(2)}`, bx, beakerY - 10, p.text, 'bold 18px system-ui', 'center');
  label(ctx, `${r.Vb.toFixed(1)} mL added`, bx, h - 8, p.subtle, '12px system-ui', 'center');
  const near = Math.abs(r.Vb - r.eqVol) < r.eqVol * 0.05;
  if (near) label(ctx, 'Near equivalence point', bx, beakerY + 16, '#f472b6', 'bold 13px system-ui', 'center');
}

export const titration: ModelDefinition = {
  meta: {
    id: 'acid-base-titration',
    title: 'Acid-Base Titration',
    titleZh: '酸碱滴定',
    titleJa: '酸塩基滴定',
    subject: 'chemistry',
    description: 'Add base to an acid and watch the pH curve, color change, and equivalence point.',
    descriptionZh: '向酸中加入碱，观察 pH 曲线、颜色变化和当量点。',
    descriptionJa: '酸に塩基を加え、pH 曲線・色の変化・当量点を観察します。',
    difficulty: 'high-school',
    tags: ['pH', 'neutralization', 'titration', 'indicator'],
    accent: '#a78bfa',
  },
  controls: [
    { type: 'slider', key: 'acidConc', label: 'Acid concentration', labelZh: '酸浓度', min: 0.05, max: 1, step: 0.05, unit: 'mol/L' },
    { type: 'slider', key: 'baseConc', label: 'Base concentration', labelZh: '碱浓度', min: 0.05, max: 1, step: 0.05, unit: 'mol/L' },
    { type: 'slider', key: 'addedVolume', label: 'Base added', labelZh: '加碱体积', min: 0, max: 100, step: 0.5, unit: 'mL' },
    {
      type: 'select', key: 'indicator', label: 'Indicator', labelZh: '指示剂',
      options: [
        { value: 'phenolphthalein', label: 'Phenolphthalein', labelZh: '酚酞' },
        { value: 'bromothymol-blue', label: 'Bromothymol blue', labelZh: '溴百里酚蓝' },
        { value: 'methyl-orange', label: 'Methyl orange', labelZh: '甲基橙' },
      ],
    },
  ],
  defaultVariables: { acidConc: 0.1, baseConc: 0.1, addedVolume: 25, indicator: 'phenolphthalein' },
  presets: [
    { name: 'Equal 0.1 M', nameZh: '等浓度 0.1 M', variables: { acidConc: 0.1, baseConc: 0.1, addedVolume: 25, indicator: 'phenolphthalein' } },
    { name: 'At equivalence', nameZh: '当量点', variables: { acidConc: 0.1, baseConc: 0.1, addedVolume: 50, indicator: 'phenolphthalein' } },
    { name: 'Strong base', nameZh: '浓碱', variables: { acidConc: 0.1, baseConc: 0.5, addedVolume: 10, indicator: 'bromothymol-blue' } },
  ],
  concepts: [
    'At the equivalence point, moles of acid equal moles of base; for strong acid/strong base pH = 7.',
    'The pH changes slowly far from equivalence and jumps sharply near it.',
    'Equivalence volume = (acid concentration × acid volume) / base concentration.',
    'A suitable indicator changes color across the pH jump near equivalence.',
  ],
  conceptsZh: [
    '当量点时酸的摩尔数等于碱的摩尔数；强酸强碱时 pH = 7。',
    '远离当量点时 pH 变化缓慢，接近时迅速突跃。',
    '当量体积 =（酸浓度 × 酸体积）/ 碱浓度。',
    '合适的指示剂在当量点附近的 pH 突跃范围内变色。',
  ],
  formulas: [
    { tex: '\\text{pH} = -\\log_{10}[\\text{H}^+]', label: 'pH definition', labelZh: 'pH 定义' },
    { tex: 'V_{eq} = \\dfrac{C_a V_a}{C_b}', label: 'Equivalence volume', labelZh: '当量体积' },
  ],
  animated: true,
  supportsStep: false,
  duration: () => 4,
  compute,
  render,
  suggestedQuestions: [
    { en: 'What is the equivalence point?', zh: '什么是当量点？' },
    { en: 'Why does the pH jump suddenly?', zh: '为什么 pH 会突然跳变？' },
    { en: 'Which indicator should I choose?', zh: '我应该选哪种指示剂？' },
  ],
  learn: {
    intro: {
      en: 'Titration finds an unknown concentration by adding a measured base to an acid until they exactly neutralize.',
      zh: '滴定通过向酸中加入定量的碱直到恰好中和，来测定未知浓度。',
      ja: '滴定は、酸に既知量の塩基を加えてちょうど中和させ、未知の濃度を求める方法です。',
    },
    principle: {
      en: 'Near the equivalence point a tiny amount of base causes a large pH jump, because almost all the acid has already been neutralized.',
      zh: '在当量点附近，极少量的碱就会引起 pH 的大幅跳变，因为此时酸几乎已被中和。',
      ja: '当量点付近では酸がほぼ中和されているため、ごくわずかな塩基で pH が大きく跳ね上がります。',
    },
    tips: [
      { en: 'Watch the pH curve stay flat, then jump sharply at the equivalence point.', zh: '观察 pH 曲线先平缓，然后在当量点急剧跳变。', ja: 'pH 曲線が平らなまま、当量点で急に跳ね上がるのを見てください。' },
      { en: 'Choose an indicator whose color change matches the pH jump.', zh: '选择变色范围与 pH 突跃匹配的指示剂。', ja: '色の変化が pH の跳びと一致する指示薬を選びましょう。' },
      { en: 'With equal concentrations, neutralization happens at equal volumes.', zh: '浓度相等时，等体积即可中和。', ja: '濃度が等しければ、同じ体積で中和します。' },
    ],
  },
};
