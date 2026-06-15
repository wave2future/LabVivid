// Physics: Standing Waves on a string (harmonics).
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, label } from './canvasUtils';

function params(vars: Variables) {
  const n = Math.round(vars.harmonic as number);
  const L = vars.length as number;
  const v = vars.speed as number;
  const A = vars.amplitude as number;
  const f = (n * v) / (2 * L);     // f_n = n v / 2L
  const lambda = (2 * L) / n;
  const omega = 2 * Math.PI * f;
  return { n, L, v, A, f, lambda, omega };
}

function compute(vars: Variables, t: number): ComputeResult {
  const r = params(vars);
  return {
    data: [
      { key: 'freq', label: 'Frequency', labelZh: '频率', value: r.f, unit: 'Hz', precision: 2 },
      { key: 'wavelength', label: 'Wavelength', labelZh: '波长', value: r.lambda, unit: 'm', precision: 2 },
      { key: 'nodes', label: 'Nodes', labelZh: '波节数', value: r.n + 1, precision: 0 },
      { key: 'antinodes', label: 'Antinodes', labelZh: '波腹数', value: r.n, precision: 0 },
    ],
    render: { ...r, t },
  };
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  const r = computed.render;
  const padX = 40;
  const cy = h / 2;
  const len = w - padX * 2;
  const amp = Math.min(h * 0.32, r.A * (h / 200));
  const cosT = Math.cos(r.omega * r.t);

  // equilibrium
  ctx.strokeStyle = p.grid; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(padX, cy); ctx.lineTo(w - padX, cy); ctx.stroke();

  // envelope (faint), upper and lower
  ctx.strokeStyle = isDark ? 'rgba(34,211,238,0.25)' : 'rgba(8,145,178,0.25)'; ctx.lineWidth = 1.5;
  for (const sgn of [1, -1]) {
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const x = (len * i) / 200;
      const env = sgn * amp * Math.sin((r.n * Math.PI * x) / len);
      const X = padX + x, Y = cy - env;
      if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
    }
    ctx.stroke();
  }

  // current string shape: A sin(nπx/L) cos(ωt)
  ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 200; i++) {
    const x = (len * i) / 200;
    const y = amp * Math.sin((r.n * Math.PI * x) / len) * cosT;
    const X = padX + x, Y = cy - y;
    if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
  }
  ctx.stroke();

  // nodes
  ctx.fillStyle = '#f472b6';
  for (let k = 0; k <= r.n; k++) {
    const X = padX + (len * k) / r.n;
    ctx.beginPath(); ctx.arc(X, cy, 4, 0, Math.PI * 2); ctx.fill();
  }
  // fixed ends
  ctx.fillStyle = p.subtle;
  ctx.fillRect(padX - 4, cy - 24, 4, 48);
  ctx.fillRect(w - padX, cy - 24, 4, 48);

  label(ctx, `harmonic n = ${r.n}  ·  f = ${r.f.toFixed(2)} Hz`, w / 2, h - 12, p.text, 'bold 14px system-ui', 'center');
}

export const standingWave: ModelDefinition = {
  meta: {
    id: 'standing-wave',
    title: 'Standing Waves',
    titleZh: '驻波',
    titleJa: '定常波',
    subject: 'physics',
    description: 'Set up harmonics on a fixed string and explore nodes, antinodes, and resonant frequencies.',
    descriptionZh: '在两端固定的弦上建立谐波，探索波节、波腹和共振频率。',
    descriptionJa: '両端を固定した弦に倍音をつくり、節・腹・共振周波数を調べます。',
    difficulty: 'high-school',
    tags: ['waves', 'resonance', 'harmonics', 'standing wave'],
    accent: '#22d3ee',
  },
  controls: [
    { type: 'slider', key: 'harmonic', label: 'Harmonic (n)', labelZh: '谐波次数 (n)', min: 1, max: 6, step: 1 },
    { type: 'slider', key: 'length', label: 'String length', labelZh: '弦长', min: 0.5, max: 3, step: 0.1, unit: 'm' },
    { type: 'slider', key: 'speed', label: 'Wave speed', labelZh: '波速', min: 1, max: 30, step: 1, unit: 'm/s' },
    { type: 'slider', key: 'amplitude', label: 'Amplitude', labelZh: '振幅', min: 10, max: 80, step: 1, unit: 'cm' },
  ],
  defaultVariables: { harmonic: 2, length: 1.5, speed: 12, amplitude: 50 },
  presets: [
    { name: 'Fundamental', nameZh: '基频', variables: { harmonic: 1, length: 1.5, speed: 12, amplitude: 50 } },
    { name: '2nd harmonic', nameZh: '二次谐波', variables: { harmonic: 2, length: 1.5, speed: 12, amplitude: 50 } },
    { name: '4th harmonic', nameZh: '四次谐波', variables: { harmonic: 4, length: 1.5, speed: 12, amplitude: 50 } },
  ],
  concepts: [
    'A standing wave forms when two identical waves travel in opposite directions and interfere.',
    'Nodes stay still; antinodes oscillate with the largest amplitude.',
    'A string fixed at both ends only resonates at f_n = n·v / 2L.',
    'The nth harmonic has n antinodes and n+1 nodes.',
  ],
  conceptsZh: [
    '当两列相同的波反向传播并干涉时形成驻波。',
    '波节保持不动；波腹以最大振幅振动。',
    '两端固定的弦只在 f_n = n·v / 2L 处共振。',
    '第 n 次谐波有 n 个波腹、n+1 个波节。',
  ],
  formulas: [
    { tex: 'f_n = \\dfrac{n v}{2L}', label: 'Harmonic frequencies', labelZh: '谐波频率' },
    { tex: 'y = A\\sin\\!\\left(\\dfrac{n\\pi x}{L}\\right)\\cos(\\omega t)', label: 'Standing wave', labelZh: '驻波' },
  ],
  animated: true,
  supportsStep: true,
  duration: (vars) => {
    const r = params(vars);
    return r.f > 0 ? 1 / r.f : 1;
  },
  compute,
  render,
  suggestedQuestions: [
    { en: 'What is the difference between a node and an antinode?', zh: '波节和波腹有什么区别？' },
    { en: 'Why can a string only vibrate at certain frequencies?', zh: '为什么弦只能在某些频率振动？' },
    { en: 'How does the harmonic number change the pattern?', zh: '谐波次数如何改变波形？' },
  ],
  learn: {
    intro: {
      en: 'A standing wave is a vibration pattern that appears to stay in place, with fixed points that never move.',
      zh: '驻波是一种看起来停在原地的振动图样，其中某些点始终不动。',
      ja: '定常波は、その場に留まって見える振動パターンで、動かない点があります。',
    },
    principle: {
      en: 'When a wave reflects off a fixed end and overlaps the incoming wave, they reinforce only at special frequencies (f_n = n·v/2L). The result has motionless nodes and large-swinging antinodes.',
      zh: '当波从固定端反射并与入射波叠加时，只有在特定频率（f_n = n·v/2L）才相互加强。结果出现不动的波节和大幅摆动的波腹。',
      ja: '波が固定端で反射して入射波と重なると、特定の周波数（f_n = n·v/2L）だけで強め合います。その結果、動かない節と大きく振れる腹ができます。',
    },
    tips: [
      { en: 'Step the harmonic n up and count one more antinode each time.', zh: '逐级增大谐波次数 n，每次多一个波腹。', ja: '倍音 n を 1 ずつ上げると、腹が 1 つずつ増えます。' },
      { en: 'The pink dots mark nodes — they never move.', zh: '粉色圆点标记波节——它们始终不动。', ja: 'ピンクの点は節で、まったく動きません。' },
      { en: 'Higher harmonics resonate at higher frequencies on the same string.', zh: '同一根弦上，更高次谐波在更高频率共振。', ja: '同じ弦では、高い倍音ほど高い周波数で共振します。' },
    ],
  },
};
