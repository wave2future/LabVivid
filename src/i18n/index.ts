// Lightweight, dependency-free i18n. Locale-extensible: add a new code to
// `LANGS` and a value to each string entry. English is the fallback (PRD §11.5).
import { createContext, useContext } from 'react';

export type Lang = 'en' | 'zh' | 'ja';

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
];

type Entry = { en: string; zh: string; ja: string };
type Dict = Record<string, Entry>;

export const strings: Dict = {
  'app.name': { en: 'LabVivid', zh: 'LabVivid 科学实验室', ja: 'LabVivid サイエンスラボ' },
  'app.tagline': {
    en: 'Interactive science simulations',
    zh: '交互式科学模拟',
    ja: 'インタラクティブな理科シミュレーション',
  },
  'nav.library': { en: 'Model Library', zh: '模型库', ja: 'モデルライブラリ' },
  'nav.back': { en: 'Back to library', zh: '返回模型库', ja: 'ライブラリに戻る' },
  'nav.home': { en: 'Home', zh: '主页', ja: 'ホーム' },
  'nav.menu': { en: 'Menu', zh: '菜单', ja: 'メニュー' },
  'nav.models': { en: 'Models', zh: '模型', ja: 'モデル' },

  'lib.searchPlaceholder': { en: 'Search models…', zh: '搜索模型…', ja: 'モデルを検索…' },
  'lib.all': { en: 'All', zh: '全部', ja: 'すべて' },
  'lib.noResults': { en: 'No models match your search.', zh: '没有匹配的模型。', ja: '該当するモデルがありません。' },
  'lib.recent': { en: 'Continue recent experiment', zh: '继续最近的实验', ja: '最近の実験を続ける' },
  'lib.openModel': { en: 'Open model', zh: '打开模型', ja: 'モデルを開く' },
  'lib.intro': {
    en: 'Manipulate models, observe outcomes, and learn through interaction.',
    zh: '操作模型，观察结果，在交互中学习。',
    ja: 'モデルを操作し、結果を観察し、対話しながら学びましょう。',
  },

  'subject.physics': { en: 'Physics', zh: '物理', ja: '物理' },
  'subject.chemistry': { en: 'Chemistry', zh: '化学', ja: '化学' },
  'subject.math': { en: 'Mathematics', zh: '数学', ja: '数学' },
  'subject.biology': { en: 'Biology', zh: '生物', ja: '生物' },
  'subject.engineering': { en: 'Engineering', zh: '工程', ja: '工学' },

  'difficulty.elementary': { en: 'Elementary', zh: '小学', ja: '小学' },
  'difficulty.middle-school': { en: 'Middle school', zh: '初中', ja: '中学' },
  'difficulty.high-school': { en: 'High school', zh: '高中', ja: '高校' },
  'difficulty.college': { en: 'College', zh: '大学', ja: '大学' },

  'ctrl.play': { en: 'Play', zh: '播放', ja: '再生' },
  'ctrl.pause': { en: 'Pause', zh: '暂停', ja: '一時停止' },
  'ctrl.reset': { en: 'Reset', zh: '重置', ja: 'リセット' },
  'ctrl.step': { en: 'Step', zh: '步进', ja: 'ステップ' },
  'ctrl.presets': { en: 'Presets', zh: '预设', ja: 'プリセット' },
  'ctrl.parameters': { en: 'Parameters', zh: '参数', ja: 'パラメータ' },

  'panel.data': { en: 'Data', zh: '数据', ja: 'データ' },
  'panel.chart': { en: 'Chart', zh: '图表', ja: 'グラフ' },
  'panel.formulas': { en: 'Formulas', zh: '公式', ja: '数式' },
  'panel.ai': { en: 'AI Explanation', zh: 'AI 讲解', ja: 'AI 解説' },
  'panel.notes': { en: 'Notes', zh: '实验笔记', ja: 'メモ' },
  'panel.learn': { en: 'Learn', zh: '学习', ja: '学習' },
  'learn.intro': { en: 'Introduction', zh: '介绍', ja: 'はじめに' },
  'learn.principle': { en: 'How it works', zh: '原理', ja: 'しくみ' },
  'learn.tips': { en: 'Tips for understanding', zh: '理解提示', ja: '理解のヒント' },

  'share.share': { en: 'Share', zh: '分享', ja: '共有' },
  'share.copied': { en: 'Link copied!', zh: '链接已复制！', ja: 'リンクをコピーしました！' },
  'share.fullscreen': { en: 'Classroom', zh: '课堂模式', ja: '授業モード' },
  'share.exitFullscreen': { en: 'Exit classroom', zh: '退出课堂模式', ja: '授業モードを終了' },
  'share.screenshot': { en: 'Screenshot', zh: '截图', ja: 'スクリーンショット' },

  'ai.ask': { en: 'Ask', zh: '提问', ja: '質問' },
  'ai.placeholder': { en: 'Ask about the current simulation…', zh: '询问当前模拟…', ja: '現在のシミュレーションについて質問…' },
  'ai.suggested': { en: 'Suggested questions', zh: '推荐问题', ja: 'おすすめの質問' },
  'ai.thinking': { en: 'Thinking…', zh: '思考中…', ja: '考え中…' },
  'ai.disabled': { en: 'AI explanation is disabled.', zh: 'AI 讲解已关闭。', ja: 'AI 解説は無効です。' },
  'ai.enable': { en: 'Enable AI explanation', zh: '开启 AI 讲解', ja: 'AI 解説を有効にする' },
  'ai.grounded': {
    en: 'Explanations are grounded in the current model state.',
    zh: '讲解基于当前模型状态生成。',
    ja: '解説は現在のモデルの状態に基づいています。',
  },
  'ai.error': { en: 'Could not generate an explanation right now.', zh: '暂时无法生成讲解。', ja: '現在、解説を生成できませんでした。' },

  'notes.add': { en: 'Save current experiment', zh: '保存当前实验', ja: '現在の実験を保存' },
  'notes.observation': { en: 'Observation (optional)', zh: '观察记录（可选）', ja: '観察（任意）' },
  'notes.empty': { en: 'No saved experiments yet.', zh: '还没有保存的实验。', ja: '保存された実験はまだありません。' },
  'notes.restore': { en: 'Restore', zh: '恢复', ja: '復元' },
  'notes.delete': { en: 'Delete', zh: '删除', ja: '削除' },
  'notes.saved': { en: 'Experiment saved.', zh: '实验已保存。', ja: '実験を保存しました。' },

  'theme.toggle': { en: 'Toggle theme', zh: '切换主题', ja: 'テーマ切り替え' },
  'lang.label': { en: 'Language', zh: '语言', ja: '言語' },
  'compare.title': { en: 'Compare runs', zh: '对比实验', ja: '実験を比較' },
  'compare.snapshot': { en: 'Snapshot A', zh: '快照 A', ja: 'スナップショット A' },
  'compare.clear': { en: 'Clear', zh: '清除', ja: 'クリア' },
};

export function translate(lang: Lang, key: string, fallback?: string): string {
  const entry = strings[key];
  if (!entry) return fallback ?? key;
  return entry[lang] ?? entry.en;
}

/** Pick a localized model field, falling back to English when a translation
 *  for the active language is not provided. */
export function pick(lang: Lang, en: string, zh: string, ja?: string): string {
  if (lang === 'ja') return ja ?? en;
  if (lang === 'zh') return zh;
  return en;
}

export interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, fallback?: string) => string;
}

export const I18nContext = createContext<I18nCtx>({
  lang: 'en',
  setLang: () => {},
  t: (k) => k,
});

export const useI18n = () => useContext(I18nContext);
