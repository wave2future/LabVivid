// Physics: Wormhole (Einstein–Rosen bridge). Interactive visual is an embedded
// WebGL page; this supplies metadata, Learn content, and a 2D funnel thumbnail.
import type { ModelDefinition, ComputeResult, RenderContext } from '../types/model';
import { clear } from './canvasUtils';

function compute(): ComputeResult {
  return {
    data: [
      { key: 'concept', label: 'Concept', labelZh: '概念', value: 'Einstein–Rosen bridge' },
      { key: 'status', label: 'Status', labelZh: '现状', value: 'hypothetical' },
      { key: 'geometry', label: 'Geometry', labelZh: '几何', value: 'curved spacetime tunnel' },
    ],
    render: {},
  };
}

// 2D embedding-diagram thumbnail: two funnels meeting at a throat.
function render(rc: RenderContext): void {
  const { ctx, width: w, height: h } = rc;
  clear(ctx, w, h, '#05070f');
  const cx = w / 2, cy = h / 2;
  const throat = w * 0.06;
  // nested "rings" forming the hyperbolic funnel (top and bottom halves)
  for (let i = 0; i < 9; i++) {
    const f = i / 8;
    const ry = (h * 0.46) * f;
    const rx = throat + (w * 0.42 - throat) * f * f;
    const hue = 175 + f * 110;
    ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${0.7 - f * 0.4})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(cx, cy - ry, rx, rx * 0.32, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cx, cy + ry, rx, rx * 0.32, 0, 0, Math.PI * 2); ctx.stroke();
  }
  // throat connectors
  ctx.strokeStyle = 'hsla(175,85%,65%,0.8)'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(cx - throat, cy - h * 0.46); ctx.lineTo(cx - throat, cy + h * 0.46);
  ctx.moveTo(cx + throat, cy - h * 0.46); ctx.lineTo(cx + throat, cy + h * 0.46); ctx.stroke();
}

export const wormhole: ModelDefinition = {
  meta: {
    id: 'wormhole',
    title: 'Wormhole',
    titleZh: '虫洞',
    titleJa: 'ワームホール',
    subject: 'physics',
    description: 'Fly around a wormhole — a theoretical tunnel through spacetime linking two distant regions.',
    descriptionZh: '环绕虫洞飞行——一种连接两个遥远区域、穿越时空的理论隧道。',
    descriptionJa: 'ワームホールの周りを飛ぶ——離れた 2 領域を結ぶ、時空を貫く理論上のトンネルです。',
    difficulty: 'college',
    tags: ['relativity', 'spacetime', 'gravity', 'astrophysics'],
    accent: '#22d3ee',
  },
  controls: [],
  defaultVariables: {},
  presets: [],
  concepts: [
    'A wormhole is a hypothetical shortcut connecting two separate points in spacetime.',
    'In general relativity it appears as an "Einstein–Rosen bridge".',
    'Its embedding diagram looks like two funnels joined at a narrow throat.',
    'No wormhole has been observed; keeping one open would require exotic matter.',
  ],
  conceptsZh: [
    '虫洞是连接时空中两个独立点的假想捷径。',
    '在广义相对论中它表现为“爱因斯坦-罗森桥”。',
    '它的嵌入图看起来像在狭窄喉部相连的两个漏斗。',
    '尚未观测到任何虫洞；维持其打开需要奇异物质。',
  ],
  formulas: [
    { tex: 'ds^2 = -c^2 dt^2 + dl^2 + (b_0^2 + l^2)\\,d\\Omega^2', label: 'Morris–Thorne metric', labelZh: '莫里斯-索恩度规' },
  ],
  animated: false,
  supportsStep: false,
  compute,
  render,
  suggestedQuestions: [
    { en: 'What is a wormhole?', zh: '什么是虫洞？' },
    { en: 'Are wormholes real?', zh: '虫洞真的存在吗？' },
    { en: 'What is an Einstein–Rosen bridge?', zh: '什么是爱因斯坦-罗森桥？' },
  ],
  learn: {
    intro: {
      en: 'A wormhole is a theoretical tunnel through spacetime that could connect two far-apart places — or even times.',
      zh: '虫洞是一种穿越时空的理论隧道，可能连接两个相距遥远的地方——甚至不同的时间。',
      ja: 'ワームホールは時空を貫く理論上のトンネルで、遠く離れた 2 つの場所——あるいは時間——を結ぶ可能性があります。',
    },
    principle: {
      en: "General relativity lets spacetime curve so steeply that a 'bridge' can join two regions through a narrow throat — the Einstein–Rosen bridge. The classic embedding picture shows two funnel-shaped sheets meeting at the throat. Such solutions are allowed by the equations, but keeping a traversable wormhole open would need exotic matter with negative energy, and none has ever been observed.",
      zh: '广义相对论允许时空弯曲得极为陡峭，使得一座“桥”能通过狭窄的喉部连接两个区域——即爱因斯坦-罗森桥。经典的嵌入图显示两片漏斗状曲面在喉部相接。这类解为方程所允许，但要维持可穿越的虫洞需要具有负能量的奇异物质，且从未被观测到。',
      ja: '一般相対論では時空が非常に急に曲がり、狭い喉を通じて 2 領域を結ぶ「橋」ができます——アインシュタイン・ローゼン橋です。古典的な埋め込み図は、喉で接する 2 つの漏斗状の面を示します。方程式は許しますが、通行可能に保つには負エネルギーの異種物質が必要で、観測例はありません。',
    },
    tips: [
      { en: 'Drag to orbit and look straight into the throat.', zh: '拖动环绕，正对喉部看进去。', ja: 'ドラッグして回り、喉をのぞき込みましょう。' },
      { en: 'Notice the two "mouths" connected by the narrow tunnel.', zh: '注意由狭窄隧道连接的两个“口”。', ja: '狭いトンネルでつながった 2 つの「口」に注目しましょう。' },
      { en: 'This is a visualization of the geometry, not an observed object.', zh: '这是对几何形状的可视化，而非已观测到的天体。', ja: 'これは幾何の可視化で、観測された天体ではありません。' },
    ],
  },
};
