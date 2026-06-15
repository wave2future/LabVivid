// Parameter control system: sliders, toggles, numbers, selects, presets
// (FR-005, §13.3). Keyboard accessible (NFR §11.4).
import type { Control, Variables, Preset } from '../types/model';
import { useI18n, type Lang } from '../i18n';

interface Props {
  controls: Control[];
  presets: Preset[];
  vars: Variables;
  onChange: (key: string, value: number | string | boolean) => void;
  onPreset: (p: Preset) => void;
}

export function Controls({ controls, presets, vars, onChange, onPreset }: Props) {
  const { t, lang } = useI18n();
  return (
    <div>
      {presets.length > 0 && (
        <div className="control">
          <div className="row"><label>{t('ctrl.presets')}</label></div>
          <div className="presets">
            {presets.map((p) => (
              <button key={p.name} className="preset-btn" onClick={() => onPreset(p)}>
                {lang === 'zh' ? p.nameZh : p.name}
              </button>
            ))}
          </div>
        </div>
      )}
      {controls.map((c) => (
        <ControlInput key={c.key} control={c} value={vars[c.key]} onChange={onChange} lang={lang} />
      ))}
    </div>
  );
}

function ControlInput({
  control: c, value, onChange, lang,
}: { control: Control; value: number | string | boolean; onChange: Props['onChange']; lang: Lang }) {
  const label = lang === 'zh' ? c.labelZh : c.label;

  if (c.type === 'slider') {
    const v = Number(value);
    return (
      <div className="control">
        <div className="row">
          <label htmlFor={c.key}>{label}</label>
          <span className="val">{v}{c.unit ? ` ${c.unit}` : ''}</span>
        </div>
        <input id={c.key} type="range" min={c.min} max={c.max} step={c.step} value={v}
          aria-label={label}
          onChange={(e) => onChange(c.key, Number(e.target.value))} />
      </div>
    );
  }
  if (c.type === 'number') {
    return (
      <div className="control">
        <div className="row"><label htmlFor={c.key}>{label}</label>{c.unit && <span className="val">{c.unit}</span>}</div>
        <input id={c.key} className="num" type="number" min={c.min} max={c.max} step={c.step}
          value={Number(value)} aria-label={label}
          onChange={(e) => onChange(c.key, Number(e.target.value))} />
      </div>
    );
  }
  if (c.type === 'select') {
    return (
      <div className="control">
        <div className="row"><label htmlFor={c.key}>{label}</label></div>
        <select id={c.key} className="select" value={String(value)} aria-label={label}
          onChange={(e) => onChange(c.key, e.target.value)}>
          {c.options.map((o) => (
            <option key={o.value} value={o.value}>{lang === 'zh' ? o.labelZh : o.label}</option>
          ))}
        </select>
      </div>
    );
  }
  // toggle
  const on = Boolean(value);
  return (
    <div className="control">
      <button className={`switch${on ? ' on' : ''}`} role="switch" aria-checked={on} aria-label={label}
        onClick={() => onChange(c.key, !on)}>
        <span className="track"><span className="knob" /></span>
        <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 600 }}>{label}</span>
      </button>
    </div>
  );
}
