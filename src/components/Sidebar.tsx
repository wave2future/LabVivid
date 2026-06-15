// Left navigation column: model categories (subjects) + model names.
// On desktop it is always visible; on mobile it is a drawer toggled by the
// hamburger button in the top bar.
import { NavLink } from 'react-router-dom';
import { models } from '../models';
import { useI18n, pick } from '../i18n';
import type { Subject } from '../types/model';

const SUBJECT_ORDER: Subject[] = ['physics', 'chemistry', 'math', 'biology', 'engineering'];
const SUBJECT_COLOR: Record<string, string> = {
  physics: '#5eead4', chemistry: '#a78bfa', math: '#f472b6',
  biology: '#34d399', engineering: '#fbbf24',
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: Props) {
  const { t, lang } = useI18n();

  const grouped = SUBJECT_ORDER
    .map((subject) => ({ subject, items: models.filter((m) => m.meta.subject === subject) }))
    .filter((g) => g.items.length > 0);

  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" />}
      <aside className={`sidebar${open ? ' open' : ''}`} aria-label={t('nav.models')}>
        <NavLink to="/" end className={({ isActive }) => `side-home${isActive ? ' active' : ''}`} onClick={onClose}>
          ⌂ {t('nav.home')}
        </NavLink>
        {grouped.map((g) => (
          <div className="side-group" key={g.subject}>
            <div className="side-group-title">
              <span className="subject-dot" style={{ background: SUBJECT_COLOR[g.subject] }} />
              {t(`subject.${g.subject}`)}
            </div>
            <ul>
              {g.items.map((m) => (
                <li key={m.meta.id}>
                  <NavLink
                    to={`/model/${m.meta.id}`}
                    className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}
                    onClick={onClose}
                  >
                    {pick(lang, m.meta.title, m.meta.titleZh, m.meta.titleJa)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </aside>
    </>
  );
}
