// Numeric data values panel (FR-012). Also provides a text summary for a11y.
import type { DataValue } from '../types/model';
import { useI18n } from '../i18n';

function fmt(d: DataValue): string {
  if (typeof d.value === 'number') {
    const p = d.precision ?? 2;
    return Number.isInteger(d.value) ? String(d.value) : d.value.toFixed(p);
  }
  return String(d.value);
}

export function DataPanel({ data }: { data: DataValue[] }) {
  const { lang } = useI18n();
  return (
    <div className="data-grid">
      {data.map((d) => (
        <div className="data-cell" key={d.key}>
          <div className="k">{lang === 'zh' ? d.labelZh : d.label}</div>
          <div className="v">
            {fmt(d)} {d.unit && <span className="u">{d.unit}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
