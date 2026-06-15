// Biology: Genetics — monohybrid cross with a Punnett square.
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, label } from './canvasUtils';

function alleles(genotype: string): [string, string] {
  return [genotype[0], genotype[1]];
}
// Normalize a pair so the dominant (uppercase) allele comes first: 'aA' -> 'Aa'.
function norm(a: string, b: string): string {
  const up = (c: string) => c === c.toUpperCase();
  return up(a) === up(b) ? a + b : (up(a) ? a + b : b + a);
}

function cross(vars: Variables) {
  const [p1a, p1b] = alleles(String(vars.parent1));
  const [p2a, p2b] = alleles(String(vars.parent2));
  const cells = [
    norm(p1a, p2a), norm(p1a, p2b),
    norm(p1b, p2a), norm(p1b, p2b),
  ];
  let AA = 0, Aa = 0, aa = 0;
  for (const c of cells) {
    if (c === 'AA') AA++;
    else if (c === 'aa') aa++;
    else Aa++;
  }
  const dominant = AA + Aa;
  return { p1: [p1a, p1b] as [string, string], p2: [p2a, p2b] as [string, string], cells, AA, Aa, aa, dominant, recessive: aa };
}

function compute(vars: Variables): ComputeResult {
  const r = cross(vars);
  const pct = (n: number) => (n / 4) * 100;
  return {
    data: [
      { key: 'AA', label: 'AA (homozygous dom.)', labelZh: 'AA（纯合显性）', value: pct(r.AA), unit: '%', precision: 0 },
      { key: 'Aa', label: 'Aa (heterozygous)', labelZh: 'Aa（杂合）', value: pct(r.Aa), unit: '%', precision: 0 },
      { key: 'aa', label: 'aa (homozygous rec.)', labelZh: 'aa（纯合隐性）', value: pct(r.aa), unit: '%', precision: 0 },
      { key: 'pheno', label: 'Dominant : recessive', labelZh: '显性 : 隐性', value: `${r.dominant} : ${r.recessive}` },
    ],
    render: { ...r },
  };
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  const r = computed.render;
  const grid = Math.min(w, h) * 0.62;
  const cell = grid / 2;
  const gx = (w - grid) / 2 + 14;
  const gy = (h - grid) / 2 + 14;

  const domColor = isDark ? 'rgba(74,222,128,0.22)' : 'rgba(34,197,94,0.18)';
  const recColor = isDark ? 'rgba(248,113,113,0.22)' : 'rgba(239,68,68,0.16)';

  // parent allele headers
  label(ctx, `Parent 2: ${r.p2[0]}${r.p2[1]}`, gx + grid / 2, gy - 28, p.text, 'bold 13px system-ui', 'center');
  for (let c = 0; c < 2; c++) label(ctx, r.p2[c], gx + cell * c + cell / 2, gy - 8, p.subtle, 'bold 15px system-ui', 'center');
  ctx.save();
  ctx.translate(gx - 26, gy + grid / 2); ctx.rotate(-Math.PI / 2);
  label(ctx, `Parent 1: ${r.p1[0]}${r.p1[1]}`, 0, 0, p.text, 'bold 13px system-ui', 'center');
  ctx.restore();
  for (let rIdx = 0; rIdx < 2; rIdx++) label(ctx, r.p1[rIdx], gx - 10, gy + cell * rIdx + cell / 2 + 5, p.subtle, 'bold 15px system-ui', 'center');

  // cells
  for (let i = 0; i < 4; i++) {
    const cx = gx + (i % 2) * cell;
    const cy = gy + Math.floor(i / 2) * cell;
    const g = r.cells[i];
    ctx.fillStyle = g.includes('A') ? domColor : recColor;
    ctx.fillRect(cx, cy, cell, cell);
    ctx.strokeStyle = p.axis; ctx.lineWidth = 2; ctx.strokeRect(cx, cy, cell, cell);
    label(ctx, g, cx + cell / 2, cy + cell / 2 + 8, p.text, 'bold 26px system-ui', 'center');
  }

  label(ctx, `Dominant ${r.dominant} : ${r.recessive} Recessive`, w / 2, gy + grid + 26, p.subtle, '13px system-ui', 'center');
}

export const genetics: ModelDefinition = {
  meta: {
    id: 'genetics-punnett',
    title: 'Genetics (Punnett Square)',
    titleZh: '遗传（庞纳特方格）',
    titleJa: '遺伝（パネットの方形）',
    subject: 'biology',
    description: 'Cross two parents and read off the genotype and phenotype ratios of their offspring.',
    descriptionZh: '让两个亲本杂交，读出后代的基因型与表现型比例。',
    descriptionJa: '2 つの親を交配させ、子の遺伝子型と表現型の比を読み取ります。',
    difficulty: 'middle-school',
    tags: ['genetics', 'inheritance', 'alleles', 'Punnett'],
    accent: '#4ade80',
  },
  controls: [
    {
      type: 'select', key: 'parent1', label: 'Parent 1 genotype', labelZh: '亲本1 基因型',
      options: [
        { value: 'AA', label: 'AA', labelZh: 'AA' },
        { value: 'Aa', label: 'Aa', labelZh: 'Aa' },
        { value: 'aa', label: 'aa', labelZh: 'aa' },
      ],
    },
    {
      type: 'select', key: 'parent2', label: 'Parent 2 genotype', labelZh: '亲本2 基因型',
      options: [
        { value: 'AA', label: 'AA', labelZh: 'AA' },
        { value: 'Aa', label: 'Aa', labelZh: 'Aa' },
        { value: 'aa', label: 'aa', labelZh: 'aa' },
      ],
    },
  ],
  defaultVariables: { parent1: 'Aa', parent2: 'Aa' },
  presets: [
    { name: 'Aa × Aa', nameZh: 'Aa × Aa', variables: { parent1: 'Aa', parent2: 'Aa' } },
    { name: 'AA × aa', nameZh: 'AA × aa', variables: { parent1: 'AA', parent2: 'aa' } },
    { name: 'Aa × aa', nameZh: 'Aa × aa', variables: { parent1: 'Aa', parent2: 'aa' } },
  ],
  concepts: [
    'Each parent passes one of its two alleles to each offspring.',
    'The Punnett square lists all equally likely allele combinations.',
    'A dominant allele (A) masks a recessive one (a) in the phenotype.',
    'Aa × Aa gives the classic 3 : 1 dominant-to-recessive ratio.',
  ],
  conceptsZh: [
    '每个亲本把自己两个等位基因之一传给后代。',
    '庞纳特方格列出所有等可能的等位基因组合。',
    '显性等位基因（A）在表现型上掩盖隐性等位基因（a）。',
    'Aa × Aa 给出经典的 3 : 1 显隐比例。',
  ],
  formulas: [
    { tex: 'Aa \\times Aa \\rightarrow 1\\,AA : 2\\,Aa : 1\\,aa', label: 'Monohybrid cross', labelZh: '单基因杂交' },
  ],
  animated: false,
  supportsStep: false,
  compute,
  render,
  suggestedQuestions: [
    { en: 'Why is the ratio 3 to 1 for Aa × Aa?', zh: '为什么 Aa × Aa 的比例是 3 比 1？' },
    { en: 'What is the difference between genotype and phenotype?', zh: '基因型和表现型有什么区别？' },
    { en: 'Can two Aa parents have an aa child?', zh: '两个 Aa 亲本会有 aa 的孩子吗？' },
  ],
  learn: {
    intro: {
      en: 'A Punnett square predicts the chances of each genetic combination when two parents have offspring.',
      zh: '庞纳特方格用来预测两个亲本产生后代时各种基因组合的概率。',
      ja: 'パネットの方形は、2 つの親から子が生まれるときの遺伝子の組み合わせの確率を予測します。',
    },
    principle: {
      en: 'Each parent contributes one allele per gene at random. Listing every combination shows the genotype ratios; a dominant allele determines the phenotype whenever it is present.',
      zh: '每个亲本随机贡献每个基因的一个等位基因。列出所有组合即得基因型比例；只要存在显性等位基因，就决定表现型。',
      ja: '各親は遺伝子ごとに 1 つの対立遺伝子をランダムに渡します。すべての組み合わせを並べると遺伝子型の比が分かり、優性遺伝子があれば表現型を決めます。',
    },
    tips: [
      { en: 'Cross Aa × Aa to see the famous 1 : 2 : 1 genotype, 3 : 1 phenotype result.', zh: '用 Aa × Aa，看经典的 1 : 2 : 1 基因型、3 : 1 表现型结果。', ja: 'Aa × Aa で、有名な 1 : 2 : 1 の遺伝子型・3 : 1 の表現型が見られます。' },
      { en: 'Green cells carry a dominant allele; red cells are purely recessive.', zh: '绿色格子带显性等位基因；红色格子为纯隐性。', ja: '緑のマスは優性遺伝子を持ち、赤のマスは純粋な劣性です。' },
      { en: 'Try AA × aa — every child is Aa, yet all show the dominant trait.', zh: '试试 AA × aa——每个后代都是 Aa，却都表现显性性状。', ja: 'AA × aa では、子はすべて Aa ですが、みな優性形質を示します。' },
    ],
  },
};
