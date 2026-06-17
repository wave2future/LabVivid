// "Learn" panel: introduction, underlying principle, and understanding tips
// for a model, localized (with English fallback) via tLearn.
import type { ModelDefinition } from '../types/model';
import { useI18n } from '../i18n';
import { tLearn } from '../i18n/modelText';

export function LearnPanel({ model }: { model: ModelDefinition }) {
  const { t, lang } = useI18n();
  const learn = tLearn(lang, model);
  if (!learn) return null;
  return (
    <div className="panel-body learn">
      <section>
        <h4 className="learn-h">{t('learn.intro')}</h4>
        <p className="learn-p">{learn.intro}</p>
      </section>
      <section>
        <h4 className="learn-h">{t('learn.principle')}</h4>
        <p className="learn-p">{learn.principle}</p>
      </section>
      {learn.tips.length > 0 && (
        <section>
          <h4 className="learn-h">{t('learn.tips')}</h4>
          <ul className="learn-tips">
            {learn.tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
