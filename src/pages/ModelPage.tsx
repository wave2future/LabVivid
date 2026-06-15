// Model page — simulation + controls + data/chart + AI + notes + share
// (PRD §16.2, FR-005..023).
import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getModel } from '../models';
import { useSimulation } from '../runtime/useSimulation';
import { Stage } from '../components/Stage';
import { Controls } from '../components/Controls';
import { DataPanel } from '../components/DataPanel';
import { LineChart } from '../components/LineChart';
import { Formula } from '../components/Formula';
import { AIPanel } from '../components/AIPanel';
import { LearnPanel } from '../components/LearnPanel';
import { NotesPanel } from '../components/NotesPanel';
import { custom3D } from '../components/custom3d';
import { sanitizeVariables, decodeVariables, encodeVariables, buildShareUrl } from '../runtime/urlState';
import { loadNotes, setLastModel, type ExperimentNote } from '../runtime/notes';
import { useI18n, pick } from '../i18n';
import { FEATURES } from '../config';
import type { Variables, Preset, ModelDefinition } from '../types/model';

type MobileTab = 'data' | 'learn' | 'ai' | 'notes';

// Guard: resolve the model from the route, then mount the view so that the
// simulation hooks always run with a defined model (no conditional hooks).
export function ModelPage({ isDark }: { isDark: boolean }) {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const model = id ? getModel(id) : undefined;
  if (!model) {
    return (
      <div className="container">
        <p className="empty">Model not found.</p>
        <Link className="btn" to="/">← {t('nav.library')}</Link>
      </div>
    );
  }
  return <ModelView model={model} isDark={isDark} />;
}

function ModelView({ model, isDark }: { model: ModelDefinition; isDark: boolean }) {
  const { t, lang } = useI18n();

  // Read initial variables from the URL hash query (?v=...) for shared links.
  const initialVars = useMemo(() => {
    const raw = new URLSearchParams(window.location.hash.split('?')[1] || '').get('v');
    return sanitizeVariables(model, raw ? decodeVariables(raw) : null);
  }, [model]);

  const [vars, setVars] = useState<Variables>(initialVars);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [classroom, setClassroom] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('data');
  const [notes, setNotes] = useState<ExperimentNote[]>(() => loadNotes());
  const [toast, setToast] = useState<string | null>(null);
  const stageWrapRef = useRef<HTMLDivElement>(null);

  // Reset local var state when the model changes.
  useEffect(() => { setVars(initialVars); }, [initialVars]);

  const sim = useSimulation({ model, vars, isDark });

  // Keep URL + "last model" in sync with current variables (FR-015..017).
  useEffect(() => {
    const hash = `#/model/${model.meta.id}?v=${encodeVariables(vars)}`;
    window.history.replaceState(null, '', hash);
    setLastModel(model.meta.id, vars);
  }, [model, vars]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  }, []);

  const onChange = useCallback((key: string, value: number | string | boolean) => {
    setVars((v) => ({ ...v, [key]: value }));
  }, []);
  const onPreset = useCallback((p: Preset) => setVars({ ...p.variables }), []);
  const onRestore = useCallback((v: Variables) => { setVars({ ...v }); showToast(t('notes.saved')); }, [showToast, t]);

  const share = useCallback(async () => {
    const url = buildShareUrl(model.meta.id, vars);
    try {
      await navigator.clipboard.writeText(url);
      showToast(t('share.copied'));
    } catch {
      window.prompt('Copy link:', url);
    }
  }, [model, vars, showToast, t]);

  const screenshot = useCallback(() => {
    const canvas = sim.canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${model.meta.id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [sim.canvasRef, model]);

  const toggleClassroom = useCallback(() => {
    setClassroom((c) => {
      const next = !c;
      const el = stageWrapRef.current;
      if (next && el?.requestFullscreen) el.requestFullscreen().catch(() => {});
      else if (!next && document.fullscreenElement) document.exitFullscreen().catch(() => {});
      return next;
    });
  }, []);

  useEffect(() => {
    const onFs = () => { if (!document.fullscreenElement) setClassroom(false); };
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const Custom = custom3D[model.meta.id];
  // Custom views (interactive 3D / embedded pages) get a full-width layout.
  const fullBleed = !!Custom;
  const stage = (
    <div ref={stageWrapRef} className={classroom ? 'classroom' : ''}>
      <div className="panel" style={{ overflow: 'hidden' }}>
        {Custom ? (
          <Suspense fallback={<div className="three-stage"><div className="three-mount" /></div>}>
            <Custom vars={vars} isDark={isDark} />
          </Suspense>
        ) : (
          <Stage
            model={model}
            canvasRef={sim.canvasRef}
            playing={sim.playing}
            computed={sim.computed}
            onToggle={sim.toggle}
            onReset={sim.reset}
            onStep={sim.step}
            classroom={classroom}
          />
        )}
      </div>
      {classroom && (
        <div className="classroom-bar">
          <Controls controls={model.controls} presets={[]} vars={vars} onChange={onChange} onPreset={onPreset} />
          <span style={{ flex: 1 }} />
          <button className="btn" onClick={toggleClassroom}>{t('share.exitFullscreen')}</button>
        </div>
      )}
    </div>
  );

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Link className="iconbtn" to="/">← {t('nav.back')}</Link>
        <h2 style={{ margin: 0, fontSize: 20 }}>{pick(lang, model.meta.title, model.meta.titleZh, model.meta.titleJa)}</h2>
        <span style={{ flex: 1 }} />
        <button className="iconbtn" onClick={share}>🔗 {t('share.share')}</button>
        <button className="iconbtn" onClick={screenshot}>📷 {t('share.screenshot')}</button>
        <button className="iconbtn" onClick={toggleClassroom}>⛶ {t('share.fullscreen')}</button>
      </div>

      <div className={`model-page${fullBleed ? ' full' : ''}`}>
        <div className="sim-col">
          {stage}

          {/* Mobile tab switcher */}
          <div className="tabs mobile-only">
            <button className={mobileTab === 'data' ? 'active' : ''} onClick={() => setMobileTab('data')}>
              {t('panel.data')}
            </button>
            {model.learn && (
              <button className={mobileTab === 'learn' ? 'active' : ''} onClick={() => setMobileTab('learn')}>
                {t('panel.learn')}
              </button>
            )}
            {FEATURES.aiExplanation && (
              <button className={mobileTab === 'ai' ? 'active' : ''} onClick={() => setMobileTab('ai')}>
                {t('panel.ai')}
              </button>
            )}
            <button className={mobileTab === 'notes' ? 'active' : ''} onClick={() => setMobileTab('notes')}>
              {t('panel.notes')}
            </button>
          </div>

          <div className={`panel${mobileTab !== 'data' ? ' mobile-hidden' : ''}`}>
            <div className="panel-head">{t('panel.data')}</div>
            <div className="panel-body">
              <DataPanel data={sim.computed.data} />
              {sim.computed.chart && (
                <div style={{ marginTop: 16 }}>
                  <LineChart spec={sim.computed.chart} />
                </div>
              )}
            </div>
          </div>

          {model.formulas.length > 0 && (
            <div className={`panel${mobileTab !== 'data' ? ' mobile-hidden' : ''}`}>
              <div className="panel-head">{t('panel.formulas')}</div>
              <div className="panel-body"><Formula formulas={model.formulas} /></div>
            </div>
          )}
        </div>

        <div className="side-col">
          {model.controls.length > 0 && (
            <div className="panel">
              <div className="panel-head">{t('ctrl.parameters')}</div>
              <div className="panel-body">
                <Controls controls={model.controls} presets={model.presets} vars={vars}
                  onChange={onChange} onPreset={onPreset} />
              </div>
            </div>
          )}

          {model.learn && (
            <div className={`panel${mobileTab !== 'learn' ? ' mobile-hidden' : ''}`} data-tab="learn">
              <div className="panel-head">{t('panel.learn')}</div>
              <LearnPanel learn={model.learn} />
            </div>
          )}

          {FEATURES.aiExplanation && (
            <div className={`panel${mobileTab !== 'ai' ? ' mobile-hidden' : ''}`} data-tab="ai">
              <div className="panel-head">
                {t('panel.ai')}
                <button className="iconbtn" style={{ padding: '4px 8px', fontSize: 12 }}
                  onClick={() => setAiEnabled((a) => !a)}>
                  {aiEnabled ? 'On' : 'Off'}
                </button>
              </div>
              <AIPanel model={model} vars={vars} computed={sim.computed}
                enabled={aiEnabled} onToggleEnabled={() => setAiEnabled((a) => !a)} />
            </div>
          )}

          <div className={`panel${mobileTab !== 'notes' ? ' mobile-hidden' : ''}`} data-tab="notes">
            <div className="panel-head">{t('panel.notes')}</div>
            <NotesPanel model={model} vars={vars} notes={notes} setNotes={setNotes}
              onRestore={onRestore} onToast={showToast} />
          </div>
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
