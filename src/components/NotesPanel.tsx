// Local experiment notes panel (FR-018). Save/restore/delete + compare.
import { useState } from 'react';
import type { ModelDefinition, Variables } from '../types/model';
import { addNote, deleteNote, type ExperimentNote } from '../runtime/notes';
import { useI18n } from '../i18n';

interface Props {
  model: ModelDefinition;
  vars: Variables;
  notes: ExperimentNote[];
  setNotes: (n: ExperimentNote[]) => void;
  onRestore: (vars: Variables) => void;
  onToast: (msg: string) => void;
}

function summarize(model: ModelDefinition, vars: Variables): string {
  return model.controls
    .map((c) => `${c.key}=${vars[c.key]}`)
    .join(', ');
}

export function NotesPanel({ model, vars, notes, setNotes, onRestore, onToast }: Props) {
  const { t, lang } = useI18n();
  const [obs, setObs] = useState('');

  const modelNotes = notes.filter((n) => n.modelId === model.meta.id);

  const save = () => {
    const next = addNote({
      modelId: model.meta.id,
      modelTitle: lang === 'zh' ? model.meta.titleZh : model.meta.title,
      variables: { ...vars },
      notes: obs.trim() || undefined,
    });
    setNotes(next);
    setObs('');
    onToast(t('notes.saved'));
  };

  return (
    <div className="panel-body">
      <textarea className="textarea" rows={2} placeholder={t('notes.observation')}
        value={obs} onChange={(e) => setObs(e.target.value)} />
      <button className="btn primary" style={{ width: '100%', marginTop: 8 }} onClick={save}>
        {t('notes.add')}
      </button>

      <div style={{ marginTop: 14 }}>
        {modelNotes.length === 0 && <p className="empty">{t('notes.empty')}</p>}
        {modelNotes.map((n) => (
          <div className="note-item" key={n.id}>
            <div className="nh">
              <strong style={{ fontSize: 13 }}>{n.modelTitle}</strong>
              <span className="nt">{new Date(n.timestamp).toLocaleString()}</span>
            </div>
            <div className="nv">{summarize(model, n.variables)}</div>
            {n.notes && <div className="nobs">{n.notes}</div>}
            <div className="note-actions">
              <button className="btn" onClick={() => onRestore(n.variables)}>{t('notes.restore')}</button>
              <button className="btn" onClick={() => setNotes(deleteNote(n.id))}>{t('notes.delete')}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
