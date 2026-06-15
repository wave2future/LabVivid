// Lightweight dependency-free SVG line chart (FR-011).
import { useMemo } from 'react';
import type { ChartSpec } from '../types/model';
import { useI18n } from '../i18n';

interface Props {
  spec: ChartSpec;
  height?: number;
}

export function LineChart({ spec, height = 220 }: Props) {
  const { lang } = useI18n();
  const W = 480;
  const H = height;
  const pad = { l: 44, r: 14, t: 16, b: 34 };

  const { xMin, xMax, yMin, yMax } = useMemo(() => {
    let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
    for (const s of spec.series) {
      for (const p of s.points) {
        if (p.x < xMin) xMin = p.x; if (p.x > xMax) xMax = p.x;
        if (p.y < yMin) yMin = p.y; if (p.y > yMax) yMax = p.y;
      }
    }
    if (spec.marker) {
      xMin = Math.min(xMin, spec.marker.x); xMax = Math.max(xMax, spec.marker.x);
      yMin = Math.min(yMin, spec.marker.y); yMax = Math.max(yMax, spec.marker.y);
    }
    if (!Number.isFinite(xMin)) { xMin = 0; xMax = 1; yMin = 0; yMax = 1; }
    if (xMin === xMax) { xMax = xMin + 1; }
    if (yMin === yMax) { yMax = yMin + 1; }
    const padY = (yMax - yMin) * 0.08;
    return { xMin, xMax, yMin: yMin - padY, yMax: yMax + padY };
  }, [spec]);

  const px = (x: number) => pad.l + ((x - xMin) / (xMax - xMin)) * (W - pad.l - pad.r);
  const py = (y: number) => H - pad.b - ((y - yMin) / (yMax - yMin)) * (H - pad.t - pad.b);

  const ticks = (min: number, max: number, n: number) =>
    Array.from({ length: n + 1 }, (_, i) => min + ((max - min) * i) / n);

  const xt = ticks(xMin, xMax, 4);
  const yt = ticks(yMin, yMax, 4);
  const fmt = (v: number) => (Math.abs(v) >= 100 ? v.toFixed(0) : Math.abs(v) >= 1 ? v.toFixed(1) : v.toFixed(2));

  return (
    <div>
      <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 8, fontWeight: 600 }}>
        {lang === 'zh' ? spec.titleZh : spec.title}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }} role="img"
        aria-label={`${lang === 'zh' ? spec.titleZh : spec.title}. ${spec.xLabel} vs ${spec.yLabel}.`}>
        {/* grid + axes */}
        {yt.map((t, i) => (
          <g key={`y${i}`}>
            <line x1={pad.l} y1={py(t)} x2={W - pad.r} y2={py(t)} stroke="var(--border)" />
            <text x={pad.l - 6} y={py(t) + 4} fontSize="10" textAnchor="end" fill="var(--muted)">{fmt(t)}</text>
          </g>
        ))}
        {xt.map((t, i) => (
          <text key={`x${i}`} x={px(t)} y={H - pad.b + 16} fontSize="10" textAnchor="middle" fill="var(--muted)">{fmt(t)}</text>
        ))}
        <text x={(W) / 2} y={H - 4} fontSize="11" textAnchor="middle" fill="var(--text-2)">{spec.xLabel}</text>
        <text x={12} y={H / 2} fontSize="11" textAnchor="middle" fill="var(--text-2)" transform={`rotate(-90 12 ${H / 2})`}>{spec.yLabel}</text>

        {/* series */}
        {spec.series.map((s, si) => {
          const d = s.points
            .filter((p) => Number.isFinite(p.y))
            .map((p, i) => `${i === 0 ? 'M' : 'L'}${px(p.x).toFixed(1)},${py(p.y).toFixed(1)}`)
            .join(' ');
          return <path key={si} d={d} fill="none" stroke={s.color} strokeWidth={2.2} />;
        })}

        {/* marker */}
        {spec.marker && (
          <g>
            <line x1={px(spec.marker.x)} y1={pad.t} x2={px(spec.marker.x)} y2={H - pad.b}
              stroke="var(--amber)" strokeWidth={1} strokeDasharray="4 4" />
            <circle cx={px(spec.marker.x)} cy={py(spec.marker.y)} r={5} fill="var(--amber)" />
          </g>
        )}
      </svg>
      {spec.series.length > 1 && (
        <div style={{ display: 'flex', gap: 14, marginTop: 6, fontSize: 12, color: 'var(--text-2)' }}>
          {spec.series.map((s, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 12, height: 3, background: s.color, display: 'inline-block', borderRadius: 2 }} />
              {s.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
