// Physics: Doppler Effect — moving wave source and the frequency shift.
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, label } from './canvasUtils';

const C = 340;          // wave (sound) speed, m/s
const C_PX = 95;        // visual wave speed, px/s
const T_EMIT = 0.4;     // visual emission interval, s

function compute(vars: Variables, t: number): ComputeResult {
  const f0 = vars.frequency as number;
  const vs = vars.sourceSpeed as number;
  const ahead = (f0 * C) / Math.max(1, C - vs);
  const behind = (f0 * C) / (C + vs);
  return {
    data: [
      { key: 'ahead', label: 'Frequency ahead', labelZh: '前方频率', value: ahead, unit: 'Hz', precision: 0 },
      { key: 'behind', label: 'Frequency behind', labelZh: '后方频率', value: behind, unit: 'Hz', precision: 0 },
      { key: 'source', label: 'Source frequency', labelZh: '声源频率', value: f0, unit: 'Hz', precision: 0 },
      { key: 'mach', label: 'Speed ratio (v/c)', labelZh: '速度比 (v/c)', value: vs / C, precision: 2 },
    ],
    render: { f0, vs, t },
  };
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  const r = computed.render;
  const cy = h / 2;

  // visual source speed scaled to the same beta = v/c
  const beta = r.vs / C;
  const vsPx = beta * C_PX;
  const startX = w * 0.12;
  const sx = r.vs > 0 ? startX + vsPx * r.t : w / 2; // stationary → centre

  // wavefronts: circles emitted at past times, centred on source-then-position
  ctx.lineWidth = 1.6;
  const nEmit = Math.floor(r.t / T_EMIT);
  for (let m = 0; m <= nEmit; m++) {
    const te = m * T_EMIT;
    const age = r.t - te;
    if (age <= 0) continue;
    const radius = C_PX * age;
    if (radius > w * 1.2) continue;
    const ex = r.vs > 0 ? startX + vsPx * te : w / 2;
    ctx.strokeStyle = isDark ? 'rgba(94,234,212,0.55)' : 'rgba(13,148,136,0.5)';
    ctx.beginPath(); ctx.arc(ex, cy, radius, 0, Math.PI * 2); ctx.stroke();
  }

  // source
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath(); ctx.arc(sx, cy, 9, 0, Math.PI * 2); ctx.fill();
  if (r.vs > 0) {
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(sx, cy); ctx.lineTo(sx + 26, cy); ctx.stroke();
  }

  // observers
  ctx.fillStyle = p.subtle;
  label(ctx, '👂', w - 24, cy + 5, p.text, '16px system-ui', 'center');
  label(ctx, '👂', 22, cy + 5, p.text, '16px system-ui', 'center');

  label(ctx, `ahead ${((r.f0 * C) / Math.max(1, C - r.vs)).toFixed(0)} Hz`, w - 16, cy - 14, '#5eead4', '12px system-ui', 'right');
  label(ctx, `behind ${((r.f0 * C) / (C + r.vs)).toFixed(0)} Hz`, 16, cy - 14, '#f472b6', '12px system-ui', 'left');
  label(ctx, `source ${r.f0} Hz · v/c = ${(r.vs / C).toFixed(2)}`, w / 2, h - 12, p.text, 'bold 13px system-ui', 'center');
}

export const doppler: ModelDefinition = {
  meta: {
    id: 'doppler-effect',
    title: 'Doppler Effect',
    titleZh: '多普勒效应',
    titleJa: 'ドップラー効果',
    subject: 'physics',
    description: 'Move a wave source and see why the pitch is higher ahead of it and lower behind it.',
    descriptionZh: '移动一个波源，看看为什么它前方音调更高、后方更低。',
    descriptionJa: '波源を動かし、前方で音が高く後方で低くなる理由を見ます。',
    difficulty: 'high-school',
    tags: ['waves', 'sound', 'frequency', 'Doppler'],
    accent: '#5eead4',
  },
  controls: [
    { type: 'slider', key: 'frequency', label: 'Source frequency', labelZh: '声源频率', min: 100, max: 1000, step: 10, unit: 'Hz' },
    { type: 'slider', key: 'sourceSpeed', label: 'Source speed', labelZh: '声源速度', min: 0, max: 300, step: 5, unit: 'm/s' },
  ],
  defaultVariables: { frequency: 440, sourceSpeed: 120 },
  presets: [
    { name: 'Stationary', nameZh: '静止', variables: { frequency: 440, sourceSpeed: 0 } },
    { name: 'Passing car', nameZh: '驶过的车', variables: { frequency: 440, sourceSpeed: 120 } },
    { name: 'Near sound barrier', nameZh: '接近音障', variables: { frequency: 440, sourceSpeed: 300 } },
  ],
  concepts: [
    'A moving source crowds its wavefronts together ahead and spreads them out behind.',
    'Crowded waves mean a higher frequency (pitch) for an observer ahead.',
    'An observer behind hears a lower frequency.',
    'The faster the source, the bigger the shift; near the wave speed it becomes extreme.',
  ],
  conceptsZh: [
    '运动的波源使前方的波前挤在一起、后方的波前散开。',
    '波前密集意味着前方观察者听到更高的频率（音调）。',
    '后方的观察者听到更低的频率。',
    '波源越快，频移越大；接近波速时变得极端。',
  ],
  formulas: [
    { tex: 'f_{ahead} = f_0\\dfrac{c}{c - v_s}', label: 'Approaching', labelZh: '靠近' },
    { tex: 'f_{behind} = f_0\\dfrac{c}{c + v_s}', label: 'Receding', labelZh: '远离' },
  ],
  animated: true,
  supportsStep: false,
  duration: (vars) => {
    const vs = vars.sourceSpeed as number;
    if (vs <= 0) return 6;
    const vsPx = (vs / C) * C_PX;
    return Math.max(4, Math.min(10, (1000 * 0.8) / vsPx));
  },
  compute,
  render,
  suggestedQuestions: [
    { en: 'Why does an ambulance siren change pitch as it passes?', zh: '为什么救护车经过时警笛音调会变化？' },
    { en: 'What happens to the waves in front of the source?', zh: '波源前方的波会发生什么？' },
    { en: 'What if the source moves at the speed of sound?', zh: '如果声源以声速运动会怎样？' },
  ],
  learn: {
    intro: {
      en: 'The Doppler effect is the change in a wave’s observed frequency when the source moves relative to the listener.',
      zh: '多普勒效应是当波源相对于听者运动时，观察到的波频率发生的变化。',
      ja: 'ドップラー効果は、波源が聞き手に対して動くときに観測される波の振動数が変わる現象です。',
    },
    principle: {
      en: 'As the source moves, each new wavefront is emitted from a slightly different place. Ahead of the source the fronts bunch up (higher frequency); behind, they stretch apart (lower frequency) — which is why a passing siren drops in pitch.',
      zh: '波源运动时，每个新波前都从略微不同的位置发出。波源前方波前挤在一起（频率更高）；后方拉开（频率更低）——这就是警笛驶过时音调下降的原因。',
      ja: '波源が動くと、新しい波面はそれぞれ少しずつ違う場所から出ます。前方では波面が詰まり（高い振動数）、後方では広がります（低い振動数）。だからサイレンは通り過ぎると音が下がります。',
    },
    tips: [
      { en: 'Set the speed to 0 for evenly spaced circles and no shift.', zh: '把速度设为 0，圆环均匀分布、没有频移。', ja: '速度を 0 にすると円は等間隔で、ずれは生じません。' },
      { en: 'Raise the speed and watch the circles pile up in front.', zh: '提高速度，看圆环在前方堆叠。', ja: '速度を上げると、前方で円が詰まっていきます。' },
      { en: 'Compare the “ahead” and “behind” frequencies as the speed grows.', zh: '随着速度增大，比较“前方”和“后方”的频率。', ja: '速度が上がるにつれ、「前方」と「後方」の振動数を比べましょう。' },
    ],
  },
};
