// KaTeX formula rendering (FR-013).
import { useMemo } from 'react';
import katex from 'katex';
import type { FormulaSpec } from '../types/model';
import { useI18n, type Lang } from '../i18n';

export function Formula({ formulas }: { formulas: FormulaSpec[] }) {
  const { lang } = useI18n();
  return (
    <div className="formula-list">
      {formulas.map((f, i) => (
        <FormulaItem key={i} spec={f} lang={lang} />
      ))}
    </div>
  );
}

function FormulaItem({ spec, lang }: { spec: FormulaSpec; lang: Lang }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(spec.tex, { throwOnError: false, displayMode: true });
    } catch {
      return spec.tex;
    }
  }, [spec.tex]);
  return (
    <div className="formula-item">
      <div className="flabel">{lang === 'zh' ? spec.labelZh : spec.label}</div>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
