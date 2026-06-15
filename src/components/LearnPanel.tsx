// "Learn" panel: introduction, underlying principle, and understanding tips
// for a model (localized, with English fallback).
import type { LearnContent } from '../types/model';
import { useI18n, pick } from '../i18n';

export function LearnPanel({ learn }: { learn: LearnContent }) {
  const { t, lang } = useI18n();
  return (
    <div className="panel-body learn">
      <section>
        <h4 className="learn-h">{t('learn.intro')}</h4>
        <p className="learn-p">{pick(lang, learn.intro.en, learn.intro.zh, learn.intro.ja)}</p>
      </section>
      <section>
        <h4 className="learn-h">{t('learn.principle')}</h4>
        <p className="learn-p">{pick(lang, learn.principle.en, learn.principle.zh, learn.principle.ja)}</p>
      </section>
      {learn.tips.length > 0 && (
        <section>
          <h4 className="learn-h">{t('learn.tips')}</h4>
          <ul className="learn-tips">
            {learn.tips.map((tip, i) => (
              <li key={i}>{pick(lang, tip.en, tip.zh, tip.ja)}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
