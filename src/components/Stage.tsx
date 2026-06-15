// Presentational simulation stage + transport controls (FR-007/008).
import type { RefObject } from 'react';
import type { ModelDefinition, ComputeResult } from '../types/model';
import { useI18n, pick } from '../i18n';

interface Props {
  model: ModelDefinition;
  canvasRef: RefObject<HTMLCanvasElement>;
  playing: boolean;
  computed: ComputeResult;
  onToggle: () => void;
  onReset: () => void;
  onStep: () => void;
  classroom?: boolean;
}

export function Stage({ model, canvasRef, playing, computed, onToggle, onReset, onStep, classroom }: Props) {
  const { t, lang } = useI18n();
  return (
    <div className="stage">
      <canvas ref={canvasRef} aria-label={pick(lang, model.meta.title, model.meta.titleZh, model.meta.titleJa)} />
      {classroom && (
        <div style={{ position: 'absolute', top: 16, left: 16 }} className="big-data">
          {computed.data.slice(0, 3).map((d) => (
            <div key={d.key}>
              <div className="v">
                {typeof d.value === 'number'
                  ? (Number.isInteger(d.value) ? d.value : d.value.toFixed(d.precision ?? 2))
                  : d.value}
                {d.unit ? ` ${d.unit}` : ''}
              </div>
              <div className="k">{lang === 'zh' ? d.labelZh : d.label}</div>
            </div>
          ))}
        </div>
      )}
      <div className="transport">
        {model.animated && (
          <button className="btn primary" onClick={onToggle}>
            {playing ? `⏸ ${t('ctrl.pause')}` : `▶ ${t('ctrl.play')}`}
          </button>
        )}
        {model.supportsStep && (
          <button className="btn" onClick={onStep}>⏭ {t('ctrl.step')}</button>
        )}
        <button className="btn" onClick={onReset}>↺ {t('ctrl.reset')}</button>
        <div className="spacer" />
      </div>
    </div>
  );
}
