// Physics: Projectile Motion (PRD §9.1).
import type { ModelDefinition, Variables, ComputeResult, RenderContext } from '../types/model';
import { palette, clear, label } from './canvasUtils';

const DEG = Math.PI / 180;

function physics(vars: Variables) {
  const angle = (vars.angle as number) * DEG;
  const speed = vars.speed as number;
  const g = vars.gravity as number;
  const vx = speed * Math.cos(angle);
  const vy = speed * Math.sin(angle);
  const flightTime = (2 * vy) / g;
  const range = vx * flightTime;
  const maxHeight = (vy * vy) / (2 * g);
  return { vx, vy, g, flightTime, range, maxHeight };
}

function compute(vars: Variables, t: number): ComputeResult {
  const { vx, vy, g, flightTime, range, maxHeight } = physics(vars);
  // current position (clamped to flight)
  const tt = Math.min(t, flightTime);
  const x = vx * tt;
  const y = Math.max(0, vy * tt - 0.5 * g * tt * tt);

  // trajectory chart points
  const points: { x: number; y: number }[] = [];
  const N = 60;
  for (let i = 0; i <= N; i++) {
    const ti = (flightTime * i) / N;
    points.push({ x: vx * ti, y: Math.max(0, vy * ti - 0.5 * g * ti * ti) });
  }

  return {
    data: [
      { key: 'range', label: 'Range', labelZh: '射程', value: range, unit: 'm', precision: 1 },
      { key: 'maxHeight', label: 'Max height', labelZh: '最大高度', value: maxHeight, unit: 'm', precision: 1 },
      { key: 'flightTime', label: 'Flight time', labelZh: '飞行时间', value: flightTime, unit: 's', precision: 2 },
      { key: 'vx', label: 'Horizontal velocity', labelZh: '水平速度', value: vx, unit: 'm/s', precision: 1 },
      { key: 'vy', label: 'Vertical velocity (initial)', labelZh: '竖直初速度', value: vy, unit: 'm/s', precision: 1 },
    ],
    chart: {
      title: 'Trajectory', titleZh: '轨迹',
      xLabel: 'x (m)', yLabel: 'y (m)',
      series: [{ name: 'Path', color: '#5eead4', points }],
      marker: { x, y, label: 't' },
    },
    render: { x, y, range, maxHeight, flightTime, tt, vx, vy, g },
  };
}

function render(rc: RenderContext): void {
  const { ctx, width: w, height: h, computed, isDark } = rc;
  const p = palette(isDark);
  clear(ctx, w, h, p.bg);
  const r = computed.render;
  const pad = 36;
  const range = Math.max(r.range, 1);
  const maxH = Math.max(r.maxHeight, 1);
  const worldW = range * 1.1;
  const worldH = maxH * 1.25;
  const sx = (w - pad * 2) / worldW;
  const sy = (h - pad * 2) / worldH;
  const toX = (xm: number) => pad + xm * sx;
  const toY = (ym: number) => h - pad - ym * sy;

  // ground
  ctx.strokeStyle = p.axis;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pad, toY(0));
  ctx.lineTo(w - pad, toY(0));
  ctx.stroke();

  // full trajectory (faint)
  const series = computed.chart!.series[0].points;
  ctx.strokeStyle = isDark ? 'rgba(94,234,212,0.35)' : 'rgba(13,148,136,0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  series.forEach((pt, i) => {
    const X = toX(pt.x), Y = toY(pt.y);
    if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
  });
  ctx.stroke();

  // travelled path (solid)
  ctx.strokeStyle = '#5eead4';
  ctx.lineWidth = 3;
  ctx.beginPath();
  const N = 40;
  for (let i = 0; i <= N; i++) {
    const ti = (r.tt * i) / N;
    const xm = r.vx * ti;
    const ym = Math.max(0, r.vy * ti - 0.5 * r.g * ti * ti);
    const X = toX(xm), Y = toY(ym);
    if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
  }
  ctx.stroke();

  // projectile
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(toX(r.x), toY(r.y), 7, 0, Math.PI * 2);
  ctx.fill();

  // launch marker + apex
  ctx.fillStyle = p.subtle;
  label(ctx, `x: ${r.x.toFixed(1)} m`, toX(r.x) + 10, toY(r.y) - 8, p.text, '12px system-ui');
  label(ctx, `y: ${r.y.toFixed(1)} m`, toX(r.x) + 10, toY(r.y) + 8, p.text, '12px system-ui');
  label(ctx, 'Range →', w - pad, toY(0) + 18, p.subtle, '12px system-ui', 'right');
}

export const projectileMotion: ModelDefinition = {
  meta: {
    id: 'projectile-motion',
    title: 'Projectile Motion',
    titleZh: '抛体运动',
    subject: 'physics',
    description: 'Launch a projectile and explore how angle, speed, and gravity shape its parabolic path.',
    descriptionZh: '发射一个物体，探索角度、速度和重力如何决定它的抛物线轨迹。',
    difficulty: 'middle-school',
    tags: ['kinematics', 'gravity', 'parabola', 'velocity'],
    accent: '#5eead4',
  },
  controls: [
    { type: 'slider', key: 'angle', label: 'Launch angle', labelZh: '发射角度', min: 0, max: 90, step: 1, unit: '°' },
    { type: 'slider', key: 'speed', label: 'Initial speed', labelZh: '初速度', min: 1, max: 100, step: 1, unit: 'm/s' },
    { type: 'slider', key: 'gravity', label: 'Gravity', labelZh: '重力加速度', min: 1, max: 20, step: 0.1, unit: 'm/s²' },
  ],
  defaultVariables: { angle: 45, speed: 20, gravity: 9.8 },
  presets: [
    { name: 'Default (45°)', nameZh: '默认 (45°)', variables: { angle: 45, speed: 20, gravity: 9.8 } },
    { name: 'Low angle, high speed', nameZh: '低角高速', variables: { angle: 20, speed: 35, gravity: 9.8 } },
    { name: 'High arc', nameZh: '高抛', variables: { angle: 70, speed: 25, gravity: 9.8 } },
    { name: 'Moon gravity', nameZh: '月球重力', variables: { angle: 45, speed: 20, gravity: 1.6 } },
  ],
  concepts: [
    'Range is maximized at 45° when air resistance is ignored.',
    'Horizontal velocity is constant; vertical velocity changes due to gravity.',
    'Max height depends only on the vertical velocity component and gravity.',
    'Lower gravity increases both range and flight time.',
  ],
  conceptsZh: [
    '忽略空气阻力时，45° 射程最大。',
    '水平速度恒定；竖直速度因重力而变化。',
    '最大高度只取决于竖直速度分量和重力。',
    '重力越小，射程和飞行时间都越大。',
  ],
  formulas: [
    { tex: 'R = \\dfrac{v^2 \\sin(2\\theta)}{g}', label: 'Range', labelZh: '射程' },
    { tex: 'H = \\dfrac{v^2 \\sin^2\\theta}{2g}', label: 'Max height', labelZh: '最大高度' },
    { tex: 't = \\dfrac{2v\\sin\\theta}{g}', label: 'Flight time', labelZh: '飞行时间' },
  ],
  animated: true,
  supportsStep: true,
  duration: (vars) => physics(vars).flightTime * 1.15,
  compute,
  render,
  suggestedQuestions: [
    { en: 'Why does the range change when I change the angle?', zh: '为什么改变角度时射程会变化？' },
    { en: 'What angle gives the maximum range?', zh: '什么角度射程最大？' },
    { en: 'How does lower gravity affect the flight?', zh: '更小的重力如何影响飞行？' },
  ],
};
