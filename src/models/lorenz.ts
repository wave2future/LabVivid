// Physics: Lorenz Attractor (chaos / dynamical systems). Interactive visual is
// an embedded WebGL page; this supplies metadata, data, Learn content, and a 2D
// projection thumbnail for the library card.
import type { ModelDefinition, ComputeResult, RenderContext } from '../types/model';
import { clear } from './canvasUtils';

function compute(): ComputeResult {
  return {
    data: [
      { key: 'sigma', label: 'σ (Prandtl)', labelZh: 'σ（普朗特数）', value: 10, precision: 0 },
      { key: 'rho', label: 'ρ (Rayleigh)', labelZh: 'ρ（瑞利数）', value: 28, precision: 0 },
      { key: 'beta', label: 'β', labelZh: 'β', value: '8/3' },
    ],
    render: {},
  };
}

// 2D (x–z) projection of the attractor for the library-card thumbnail.
function render(rc: RenderContext): void {
  const { ctx, width: w, height: h } = rc;
  clear(ctx, w, h, '#05070f');
  const sigma = 10, rho = 28, beta = 8 / 3, dt = 0.006;
  let x = 0.1, y = 0, z = 0;
  // warm up
  for (let i = 0; i < 500; i++) {
    const dx = sigma * (y - x), dy = x * (rho - z) - y, dz = x * y - beta * z;
    x += dx * dt; y += dy * dt; z += dz * dt;
  }
  const sx = w / 60, sz = h / 55;
  const toX = (vx: number) => w / 2 + vx * sx;
  const toY = (vz: number) => h - 8 - vz * sz;
  ctx.lineWidth = 0.8;
  let prev: [number, number] | null = null;
  const N = 5000;
  for (let i = 0; i < N; i++) {
    const dx = sigma * (y - x), dy = x * (rho - z) - y, dz = x * y - beta * z;
    x += dx * dt; y += dy * dt; z += dz * dt;
    const px = toX(x), py = toY(z);
    if (prev) {
      const hue = 180 + (i / N) * 120; // cyan → violet
      ctx.strokeStyle = `hsla(${hue}, 85%, 60%, 0.7)`;
      ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(px, py); ctx.stroke();
    }
    prev = [px, py];
  }
}

export const lorenz: ModelDefinition = {
  meta: {
    id: 'lorenz-attractor',
    title: 'Lorenz Attractor',
    titleZh: '洛伦兹吸引子',
    titleJa: 'ローレンツ・アトラクター',
    subject: 'physics',
    description: 'Fly through the butterfly-shaped attractor — a classic picture of deterministic chaos.',
    descriptionZh: '穿行于蝴蝶状的吸引子——确定性混沌的经典图景。',
    descriptionJa: '蝶のような形のアトラクターを飛び回る——決定論的カオスの古典的な姿です。',
    difficulty: 'college',
    tags: ['chaos', 'dynamical systems', 'attractor', 'nonlinear'],
    accent: '#22d3ee',
  },
  controls: [],
  defaultVariables: {},
  presets: [],
  concepts: [
    'The Lorenz system is three simple coupled equations modeling convection.',
    'Its solutions never repeat yet stay on a bounded butterfly-shaped set.',
    'It shows deterministic chaos: tiny changes in start point diverge hugely.',
    'This sensitivity is the famous "butterfly effect".',
  ],
  conceptsZh: [
    '洛伦兹系统是描述对流的三个简单耦合方程。',
    '它的解从不重复，却始终停留在有界的蝴蝶状集合上。',
    '它展示确定性混沌：初始点的微小差异会巨大地发散。',
    '这种敏感性就是著名的“蝴蝶效应”。',
  ],
  formulas: [
    { tex: '\\dot{x} = \\sigma(y - x)', label: 'dx/dt', labelZh: 'dx/dt' },
    { tex: '\\dot{y} = x(\\rho - z) - y', label: 'dy/dt', labelZh: 'dy/dt' },
    { tex: '\\dot{z} = xy - \\beta z', label: 'dz/dt', labelZh: 'dz/dt' },
  ],
  animated: false,
  supportsStep: false,
  compute,
  render,
  suggestedQuestions: [
    { en: 'What is the butterfly effect?', zh: '什么是蝴蝶效应？' },
    { en: 'Why is this called chaos if the equations are fixed?', zh: '方程是确定的，为什么称为混沌？' },
    { en: 'What does the attractor represent?', zh: '吸引子代表什么？' },
  ],
  learn: {
    intro: {
      en: 'The Lorenz attractor is the trajectory of a simple weather-inspired model that became the icon of chaos theory.',
      zh: '洛伦兹吸引子是一个受天气启发的简单模型的轨迹，成为混沌理论的标志。',
      ja: 'ローレンツ・アトラクターは、気象に着想を得た単純なモデルの軌跡で、カオス理論の象徴になりました。',
    },
    principle: {
      en: 'Three coupled differential equations (with σ, ρ, β) feed back into each other. The motion is fully deterministic, yet it never settles or repeats — it loops forever around two wings, and two nearly identical starts soon diverge completely. That bounded-but-unpredictable behavior is deterministic chaos.',
      zh: '三个相互耦合的微分方程（含 σ、ρ、β）彼此反馈。运动完全确定，却从不稳定或重复——它永远绕着两个翼盘旋，两个几乎相同的初始点很快完全分离。这种有界却不可预测的行为就是确定性混沌。',
      ja: '3 つの結合した微分方程式（σ・ρ・β）が互いにフィードバックします。運動は完全に決定論的なのに、決して収束も反復もせず、2 つの翼の周りを永遠に回り、ほぼ同じ初期値でもすぐに完全に分かれます。この有界だが予測不能な振る舞いが決定論的カオスです。',
    },
    tips: [
      { en: 'Drag to orbit the 3D attractor and see both "wings" of the butterfly.', zh: '拖动以环绕 3D 吸引子，看蝴蝶的两个“翼”。', ja: 'ドラッグして 3D アトラクターを回し、蝶の両「翼」を見ましょう。' },
      { en: 'The path never crosses itself or repeats, yet stays bounded.', zh: '轨迹从不自相交或重复，却始终有界。', ja: '軌道は自己交差も反復もしませんが、有界に保たれます。' },
      { en: 'σ, ρ, β set the dynamics; the classic values are 10, 28, 8/3.', zh: 'σ、ρ、β 决定动力学；经典取值为 10、28、8/3。', ja: 'σ・ρ・β が動力学を決め、古典的な値は 10・28・8/3 です。' },
    ],
  },
};
