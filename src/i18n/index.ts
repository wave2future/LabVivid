// Minimal, dependency-free i18n with English + Chinese (PRD §11.5).
import { createContext, useContext } from 'react';

export type Lang = 'en' | 'zh';

type Dict = Record<string, { en: string; zh: string }>;

export const strings: Dict = {
  'app.name': { en: 'LabVivid', zh: 'LabVivid 科学实验室' },
  'app.tagline': {
    en: 'Interactive science simulations',
    zh: '交互式科学模拟',
  },
  'nav.library': { en: 'Model Library', zh: '模型库' },
  'nav.back': { en: 'Back to library', zh: '返回模型库' },
  'nav.home': { en: 'Home', zh: '主页' },
  'nav.menu': { en: 'Menu', zh: '菜单' },
  'nav.models': { en: 'Models', zh: '模型' },

  'lib.searchPlaceholder': { en: 'Search models…', zh: '搜索模型…' },
  'lib.all': { en: 'All', zh: '全部' },
  'lib.noResults': { en: 'No models match your search.', zh: '没有匹配的模型。' },
  'lib.recent': { en: 'Continue recent experiment', zh: '继续最近的实验' },
  'lib.openModel': { en: 'Open model', zh: '打开模型' },
  'lib.intro': {
    en: 'Manipulate models, observe outcomes, and learn through interaction.',
    zh: '操作模型，观察结果，在交互中学习。',
  },

  'subject.physics': { en: 'Physics', zh: '物理' },
  'subject.chemistry': { en: 'Chemistry', zh: '化学' },
  'subject.math': { en: 'Mathematics', zh: '数学' },
  'subject.biology': { en: 'Biology', zh: '生物' },
  'subject.engineering': { en: 'Engineering', zh: '工程' },

  'difficulty.elementary': { en: 'Elementary', zh: '小学' },
  'difficulty.middle-school': { en: 'Middle school', zh: '初中' },
  'difficulty.high-school': { en: 'High school', zh: '高中' },
  'difficulty.college': { en: 'College', zh: '大学' },

  'ctrl.play': { en: 'Play', zh: '播放' },
  'ctrl.pause': { en: 'Pause', zh: '暂停' },
  'ctrl.reset': { en: 'Reset', zh: '重置' },
  'ctrl.step': { en: 'Step', zh: '步进' },
  'ctrl.presets': { en: 'Presets', zh: '预设' },
  'ctrl.parameters': { en: 'Parameters', zh: '参数' },

  'panel.data': { en: 'Data', zh: '数据' },
  'panel.chart': { en: 'Chart', zh: '图表' },
  'panel.formulas': { en: 'Formulas', zh: '公式' },
  'panel.ai': { en: 'AI Explanation', zh: 'AI 讲解' },
  'panel.notes': { en: 'Notes', zh: '实验笔记' },

  'share.share': { en: 'Share', zh: '分享' },
  'share.copied': { en: 'Link copied!', zh: '链接已复制！' },
  'share.fullscreen': { en: 'Classroom', zh: '课堂模式' },
  'share.exitFullscreen': { en: 'Exit classroom', zh: '退出课堂模式' },
  'share.screenshot': { en: 'Screenshot', zh: '截图' },

  'ai.ask': { en: 'Ask', zh: '提问' },
  'ai.placeholder': { en: 'Ask about the current simulation…', zh: '询问当前模拟…' },
  'ai.suggested': { en: 'Suggested questions', zh: '推荐问题' },
  'ai.thinking': { en: 'Thinking…', zh: '思考中…' },
  'ai.disabled': { en: 'AI explanation is disabled.', zh: 'AI 讲解已关闭。' },
  'ai.enable': { en: 'Enable AI explanation', zh: '开启 AI 讲解' },
  'ai.grounded': {
    en: 'Explanations are grounded in the current model state.',
    zh: '讲解基于当前模型状态生成。',
  },
  'ai.error': {
    en: 'Could not generate an explanation right now.',
    zh: '暂时无法生成讲解。',
  },

  'notes.add': { en: 'Save current experiment', zh: '保存当前实验' },
  'notes.observation': { en: 'Observation (optional)', zh: '观察记录（可选）' },
  'notes.empty': { en: 'No saved experiments yet.', zh: '还没有保存的实验。' },
  'notes.restore': { en: 'Restore', zh: '恢复' },
  'notes.delete': { en: 'Delete', zh: '删除' },
  'notes.saved': { en: 'Experiment saved.', zh: '实验已保存。' },

  'theme.toggle': { en: 'Toggle theme', zh: '切换主题' },
  'lang.toggle': { en: '中文', zh: 'EN' },
  'compare.title': { en: 'Compare runs', zh: '对比实验' },
  'compare.snapshot': { en: 'Snapshot A', zh: '快照 A' },
  'compare.clear': { en: 'Clear', zh: '清除' },
};

export function translate(lang: Lang, key: string, fallback?: string): string {
  const entry = strings[key];
  if (!entry) return fallback ?? key;
  return entry[lang];
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
