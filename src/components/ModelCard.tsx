// Model library card with a live mini-preview thumbnail (PRD §16.1).
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { ModelDefinition } from '../types/model';
import { useI18n } from '../i18n';
import { tModelTitle, tModelDesc } from '../i18n/modelText';

const SUBJECT_COLOR: Record<string, string> = {
  physics: '#5eead4', chemistry: '#a78bfa', math: '#f472b6',
  biology: '#34d399', engineering: '#fbbf24',
};

export function ModelCard({ model, isDark }: { model: ModelDefinition; isDark: boolean }) {
  const { t, lang } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render a single static preview frame at a representative time.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const t0 = model.animated ? (model.duration?.(model.defaultVariables) ?? 1) * 0.5 : 0;
    const computed = model.compute(model.defaultVariables, t0);
    model.render({ ctx, width: w, height: h, dpr, vars: model.defaultVariables, t: t0, computed, isDark });
  }, [model, isDark]);

  return (
    <Link to={`/model/${model.meta.id}`} className="card">
      <div className="thumb"><canvas ref={canvasRef} /></div>
      <div className="body">
        <div className="meta-row">
          <span className="subject-dot" style={{ background: SUBJECT_COLOR[model.meta.subject] }} />
          {t(`subject.${model.meta.subject}`)} · {t(`difficulty.${model.meta.difficulty}`)}
        </div>
        <h3>{tModelTitle(lang, model)}</h3>
        <div className="desc">{tModelDesc(lang, model)}</div>
        <div className="tags">
          {model.meta.tags.slice(0, 3).map((tag) => <span className="tag" key={tag}>{tag}</span>)}
        </div>
      </div>
    </Link>
  );
}
