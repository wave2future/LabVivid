// Model Library page (PRD §16.1, FR-001..004).
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { models } from '../models';
import { ModelCard } from '../components/ModelCard';
import { getLastModel } from '../runtime/notes';
import { getModel } from '../models';
import { useI18n } from '../i18n';
import type { Subject } from '../types/model';

const SUBJECTS: (Subject | 'all')[] = ['all', 'physics', 'chemistry', 'math', 'biology'];

export function LibraryPage({ isDark }: { isDark: boolean }) {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject | 'all'>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return models.filter((m) => {
      if (subject !== 'all' && m.meta.subject !== subject) return false;
      if (!q) return true;
      const hay = [
        m.meta.title, m.meta.titleZh, m.meta.description, m.meta.descriptionZh,
        ...m.meta.tags,
      ].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [subject, query]);

  const last = getLastModel();
  const lastModel = last ? getModel(last.modelId) : undefined;

  return (
    <div className="container">
      <div className="hero">
        <h1>{t('app.name')}</h1>
        <p>{t('lib.intro')}</p>
      </div>

      {lastModel && last && (
        <div className="recent-banner">
          <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
            {t('lib.recent')}: <strong style={{ color: 'var(--text)' }}>
              {lang === 'zh' ? lastModel.meta.titleZh : lastModel.meta.title}
            </strong>
          </span>
          <span style={{ flex: 1 }} />
          <button className="btn primary" onClick={() => navigate(`/model/${last.modelId}`)}>
            {t('lib.openModel')}
          </button>
        </div>
      )}

      <div className="toolbar">
        <input className="search" placeholder={t('lib.searchPlaceholder')}
          value={query} onChange={(e) => setQuery(e.target.value)} aria-label={t('lib.searchPlaceholder')} />
        <div className="chips">
          {SUBJECTS.map((s) => (
            <button key={s} className={`chip${subject === s ? ' active' : ''}`} onClick={() => setSubject(s)}>
              {s === 'all' ? t('lib.all') : t(`subject.${s}`)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="empty">{t('lib.noResults')}</p>
      ) : (
        <div className="grid">
          {filtered.map((m) => <ModelCard key={m.meta.id} model={m} isDark={isDark} />)}
        </div>
      )}
    </div>
  );
}
