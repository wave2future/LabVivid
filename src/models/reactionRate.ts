// Chemistry: Reaction Rate — collision theory (temperature, concentration, catalyst).
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, label } from './canvasUtils';

const R = 8.314;
const REF = Math.exp(-50000 / (R * 300)); // reference rate factor at 300 K, no catalyst

function kinetics(vars: Variables) {
  const T = vars.temperature as number;
  const conc = vars.concentration as number;
  const catalyst = vars.catalyst as boolean;
  const Ea = catalyst ? 30000 : 50000; // J/mol
  const rate = (conc * Math.exp(-Ea / (R * T))) / REF;
  return { T, conc, catalyst, Ea, rate };
}

function tri(u: number) { const f = ((u % 1) + 1) % 1; return Math.abs(f * 2 - 1); }

function compute(vars: Variables): ComputeResult {
  const r = kinetics(vars);
  const points: { x: number; y: number }[] = [];
  for (let T = 250; T <= 600; T += 5) {
    points.push({ x: T, y: (r.conc * Math.exp(-r.Ea / (R * T))) / REF });
  }
  return {
    data: [
      { key: 'rate', label: 'Relative rate', labelZh: '相对速率', value: r.rate, unit: '×', precision: 2 },
      { key: 'Ea', label: 'Activation energy', labelZh: '活化能', value: r.Ea / 1000, unit: 'kJ/mol', precision: 0 },
      { key: 'temp', label: 'Temperature', labelZh: '温度', value: r.T, unit: 'K', precision: 0 },
      { key: 'conc', label: 'Concentration', labelZh: '浓度', value: r.conc, unit: 'rel', precision: 2 },
    ],
    chart: {
      title: 'Reaction rate vs temperature', titleZh: '反应速率-温度',
      xLabel: 'T (K)', yLabel: 'relative rate',
      series: [{ name: 'rate', color: '#f59e0b', points }],
      marker: { x: r.T, y: r.rate },
    },
    render: { ...r },
  };
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark, t } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  const r = computed.render;

  // reaction vessel
  const bx = w * 0.12, by = h * 0.14, bw = w * 0.76, bh = h * 0.62;
  ctx.strokeStyle = p.axis; ctx.lineWidth = 2;
  ctx.strokeRect(bx, by, bw, bh);

  const count = Math.min(60, Math.max(6, Math.round(r.conc * 22)));
  const speed = 0.12 * Math.sqrt(r.T / 300);
  ctx.fillStyle = '#f59e0b';
  for (let i = 0; i < count; i++) {
    const sx = Math.abs((Math.sin(i * 12.9898) * 43758.5453) % 1);
    const sy = Math.abs((Math.sin(i * 78.233) * 12345.678) % 1);
    const px = bx + 6 + tri(sx + t * speed * (0.6 + sx)) * (bw - 12);
    const py = by + 6 + tri(sy + t * speed * (0.6 + sy)) * (bh - 12);
    ctx.beginPath(); ctx.arc(px, py, 3.5, 0, Math.PI * 2); ctx.fill();
  }

  label(ctx, `rate ×${r.rate.toFixed(2)}`, w / 2, by - 6, p.text, 'bold 15px system-ui', 'center');
  label(ctx, `${r.T} K · Ea ${(r.Ea / 1000).toFixed(0)} kJ/mol${r.catalyst ? ' · catalyst' : ''}`,
    w / 2, h - 12, p.subtle, '12px system-ui', 'center');
}

export const reactionRate: ModelDefinition = {
  meta: {
    id: 'reaction-rate',
    title: 'Reaction Rate',
    titleZh: '反应速率',
    titleJa: '反応速度',
    subject: 'chemistry',
    description: 'Use collision theory to see how temperature, concentration, and a catalyst speed up a reaction.',
    descriptionZh: '用碰撞理论观察温度、浓度和催化剂如何加快反应。',
    descriptionJa: '衝突理論で、温度・濃度・触媒が反応をどう速めるかを見ます。',
    difficulty: 'high-school',
    tags: ['kinetics', 'collision theory', 'catalyst', 'temperature'],
    accent: '#f59e0b',
  },
  controls: [
    { type: 'slider', key: 'temperature', label: 'Temperature', labelZh: '温度', min: 250, max: 600, step: 5, unit: 'K' },
    { type: 'slider', key: 'concentration', label: 'Concentration', labelZh: '浓度', min: 0.1, max: 2, step: 0.1, unit: 'rel' },
    { type: 'toggle', key: 'catalyst', label: 'Add catalyst', labelZh: '加入催化剂' },
  ],
  defaultVariables: { temperature: 300, concentration: 1, catalyst: false },
  presets: [
    { name: 'Room temperature', nameZh: '常温', variables: { temperature: 300, concentration: 1, catalyst: false } },
    { name: 'Heated', nameZh: '加热', variables: { temperature: 450, concentration: 1, catalyst: false } },
    { name: 'With catalyst', nameZh: '加催化剂', variables: { temperature: 300, concentration: 1, catalyst: true } },
    { name: 'Concentrated & hot', nameZh: '高浓高温', variables: { temperature: 450, concentration: 2, catalyst: false } },
  ],
  concepts: [
    'Reactions happen when particles collide with enough energy (the activation energy).',
    'Higher temperature gives faster particles and far more successful collisions.',
    'Higher concentration means more frequent collisions.',
    'A catalyst lowers the activation energy, speeding the reaction without being used up.',
  ],
  conceptsZh: [
    '当粒子以足够能量（活化能）碰撞时反应才会发生。',
    '温度越高粒子越快，成功碰撞大大增多。',
    '浓度越高碰撞越频繁。',
    '催化剂降低活化能，加快反应且自身不被消耗。',
  ],
  formulas: [
    { tex: 'k = A\\,e^{-E_a / RT}', label: 'Arrhenius equation', labelZh: '阿伦尼乌斯方程' },
  ],
  animated: true,
  supportsStep: false,
  duration: () => 6,
  compute,
  render,
  suggestedQuestions: [
    { en: 'Why does heating speed up a reaction?', zh: '为什么加热会加快反应？' },
    { en: 'How does a catalyst work?', zh: '催化剂是如何起作用的？' },
    { en: 'Why does concentration matter?', zh: '浓度为什么重要？' },
  ],
  learn: {
    intro: {
      en: 'Reaction rate is how fast reactants turn into products, explained by how often particles collide successfully.',
      zh: '反应速率是反应物转化为产物的快慢，由粒子成功碰撞的频率来解释。',
      ja: '反応速度は反応物が生成物に変わる速さで、粒子がうまく衝突する頻度で説明されます。',
    },
    principle: {
      en: 'By collision theory, a reaction needs particles to meet with at least the activation energy. Heat, concentration, and catalysts each increase the number of successful collisions per second.',
      zh: '根据碰撞理论，反应需要粒子以不低于活化能的能量相遇。升温、提高浓度和催化剂都会增加每秒成功碰撞的次数。',
      ja: '衝突理論では、反応には粒子が活性化エネルギー以上で出会う必要があります。加熱・濃度・触媒はいずれも毎秒の有効衝突数を増やします。',
    },
    tips: [
      { en: 'Raise the temperature and watch the rate climb steeply (it is exponential).', zh: '升高温度，看速率急剧上升（呈指数关系）。', ja: '温度を上げると速度が急激に（指数的に）上がります。' },
      { en: 'Toggle the catalyst to lower the activation energy and jump the rate.', zh: '开启催化剂，降低活化能，速率跃升。', ja: '触媒を入れると活性化エネルギーが下がり、速度が跳ね上がります。' },
      { en: 'More concentration means more particles colliding each second.', zh: '浓度越高，每秒碰撞的粒子越多。', ja: '濃度が高いほど、毎秒衝突する粒子が増えます。' },
    ],
  },
};
