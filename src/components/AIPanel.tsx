// AI explanation panel — optional, non-blocking, grounded (FR-019..023, §14).
import { useState } from 'react';
import type { ModelDefinition, Variables, ComputeResult } from '../types/model';
import { explain } from '../ai/explain';
import { useI18n } from '../i18n';

interface Msg { role: 'user' | 'bot'; text: string; }

interface Props {
  model: ModelDefinition;
  vars: Variables;
  computed: ComputeResult;
  enabled: boolean;
  onToggleEnabled: () => void;
}

export function AIPanel({ model, vars, computed, enabled, onToggleEnabled }: Props) {
  const { t, lang } = useI18n();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  const ask = async (question: string) => {
    if (!question.trim() || busy) return;
    setMsgs((m) => [...m, { role: 'user', text: question }]);
    setInput('');
    setBusy(true);
    try {
      const answer = await explain({ model, vars, computed, question, lang });
      setMsgs((m) => [...m, { role: 'bot', text: answer }]);
    } catch {
      setMsgs((m) => [...m, { role: 'bot', text: t('ai.error') }]);
    } finally {
      setBusy(false);
    }
  };

  if (!enabled) {
    return (
      <div className="panel-body">
        <p className="empty">{t('ai.disabled')}</p>
        <button className="btn" onClick={onToggleEnabled} style={{ width: '100%' }}>{t('ai.enable')}</button>
      </div>
    );
  }

  return (
    <div className="panel-body">
      {msgs.length > 0 && (
        <div className="ai-msgs">
          {msgs.map((m, i) => (
            <div key={i} className={`ai-msg ${m.role}`}>{m.text}</div>
          ))}
          {busy && <div className="ai-msg bot">{t('ai.thinking')}</div>}
        </div>
      )}
      <div className="suggested">
        {model.suggestedQuestions.map((q, i) => (
          <button key={i} onClick={() => ask(lang === 'zh' ? q.zh : q.en)} disabled={busy}>
            {lang === 'zh' ? q.zh : q.en}
          </button>
        ))}
      </div>
      <div className="ai-input">
        <input className="search" placeholder={t('ai.placeholder')} value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') ask(input); }} />
        <button className="btn primary" onClick={() => ask(input)} disabled={busy || !input.trim()}>
          {t('ai.ask')}
        </button>
      </div>
      <p className="hint">{t('ai.grounded')}</p>
    </div>
  );
}
