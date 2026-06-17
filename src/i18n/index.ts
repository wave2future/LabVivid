// Lightweight, dependency-free i18n. Locale-extensible: add a code to `LANGS`
// and a value to each string entry. English is the fallback (PRD §11.5).
import { createContext, useContext } from 'react';

export type Lang = 'en' | 'zh' | 'ja' | 'fr' | 'de' | 'ko' | 'pt';

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'ko', label: '한국어' },
  { code: 'pt', label: 'Português' },
];

type Entry = { en: string; zh: string; ja: string; fr: string; de: string; ko: string; pt: string };
type Dict = Record<string, Entry>;

export const strings: Dict = {
  'app.name': { en: 'LabVivid', zh: 'LabVivid 科学实验室', ja: 'LabVivid サイエンスラボ', fr: 'LabVivid', de: 'LabVivid', ko: 'LabVivid', pt: 'LabVivid' },
  'app.tagline': { en: 'Interactive science simulations', zh: '交互式科学模拟', ja: 'インタラクティブな理科シミュレーション', fr: 'Simulations scientifiques interactives', de: 'Interaktive Wissenschaftssimulationen', ko: '인터랙티브 과학 시뮬레이션', pt: 'Simulações científicas interativas' },
  'nav.library': { en: 'Model Library', zh: '模型库', ja: 'モデルライブラリ', fr: 'Bibliothèque de modèles', de: 'Modellbibliothek', ko: '모델 라이브러리', pt: 'Biblioteca de modelos' },
  'nav.back': { en: 'Back to library', zh: '返回模型库', ja: 'ライブラリに戻る', fr: 'Retour à la bibliothèque', de: 'Zurück zur Bibliothek', ko: '라이브러리로 돌아가기', pt: 'Voltar à biblioteca' },
  'nav.home': { en: 'Home', zh: '主页', ja: 'ホーム', fr: 'Accueil', de: 'Start', ko: '홈', pt: 'Início' },
  'nav.menu': { en: 'Menu', zh: '菜单', ja: 'メニュー', fr: 'Menu', de: 'Menü', ko: '메뉴', pt: 'Menu' },
  'nav.models': { en: 'Models', zh: '模型', ja: 'モデル', fr: 'Modèles', de: 'Modelle', ko: '모델', pt: 'Modelos' },

  'lib.searchPlaceholder': { en: 'Search models…', zh: '搜索模型…', ja: 'モデルを検索…', fr: 'Rechercher des modèles…', de: 'Modelle suchen…', ko: '모델 검색…', pt: 'Pesquisar modelos…' },
  'lib.all': { en: 'All', zh: '全部', ja: 'すべて', fr: 'Tous', de: 'Alle', ko: '전체', pt: 'Todos' },
  'lib.noResults': { en: 'No models match your search.', zh: '没有匹配的模型。', ja: '該当するモデルがありません。', fr: 'Aucun modèle ne correspond à votre recherche.', de: 'Keine Modelle entsprechen deiner Suche.', ko: '검색과 일치하는 모델이 없습니다.', pt: 'Nenhum modelo corresponde à sua pesquisa.' },
  'lib.recent': { en: 'Continue recent experiment', zh: '继续最近的实验', ja: '最近の実験を続ける', fr: 'Reprendre l’expérience récente', de: 'Letztes Experiment fortsetzen', ko: '최근 실험 계속하기', pt: 'Continuar experimento recente' },
  'lib.openModel': { en: 'Open model', zh: '打开模型', ja: 'モデルを開く', fr: 'Ouvrir le modèle', de: 'Modell öffnen', ko: '모델 열기', pt: 'Abrir modelo' },
  'lib.intro': { en: 'Manipulate models, observe outcomes, and learn through interaction.', zh: '操作模型，观察结果，在交互中学习。', ja: 'モデルを操作し、結果を観察し、対話しながら学びましょう。', fr: 'Manipulez des modèles, observez les résultats et apprenez en interagissant.', de: 'Modelle bedienen, Ergebnisse beobachten und durch Interaktion lernen.', ko: '모델을 조작하고 결과를 관찰하며 상호작용으로 배우세요.', pt: 'Manipule modelos, observe resultados e aprenda interagindo.' },

  'subject.physics': { en: 'Physics', zh: '物理', ja: '物理', fr: 'Physique', de: 'Physik', ko: '물리', pt: 'Física' },
  'subject.chemistry': { en: 'Chemistry', zh: '化学', ja: '化学', fr: 'Chimie', de: 'Chemie', ko: '화학', pt: 'Química' },
  'subject.math': { en: 'Mathematics', zh: '数学', ja: '数学', fr: 'Mathématiques', de: 'Mathematik', ko: '수학', pt: 'Matemática' },
  'subject.biology': { en: 'Biology', zh: '生物', ja: '生物', fr: 'Biologie', de: 'Biologie', ko: '생물', pt: 'Biologia' },
  'subject.engineering': { en: 'Engineering', zh: '工程', ja: '工学', fr: 'Ingénierie', de: 'Technik', ko: '공학', pt: 'Engenharia' },

  'difficulty.elementary': { en: 'Elementary', zh: '小学', ja: '小学', fr: 'Primaire', de: 'Grundschule', ko: '초등', pt: 'Fundamental I' },
  'difficulty.middle-school': { en: 'Middle school', zh: '初中', ja: '中学', fr: 'Collège', de: 'Mittelstufe', ko: '중학교', pt: 'Fundamental II' },
  'difficulty.high-school': { en: 'High school', zh: '高中', ja: '高校', fr: 'Lycée', de: 'Oberstufe', ko: '고등학교', pt: 'Ensino médio' },
  'difficulty.college': { en: 'College', zh: '大学', ja: '大学', fr: 'Université', de: 'Universität', ko: '대학', pt: 'Universidade' },

  'ctrl.play': { en: 'Play', zh: '播放', ja: '再生', fr: 'Lecture', de: 'Start', ko: '재생', pt: 'Reproduzir' },
  'ctrl.pause': { en: 'Pause', zh: '暂停', ja: '一時停止', fr: 'Pause', de: 'Pause', ko: '일시정지', pt: 'Pausar' },
  'ctrl.reset': { en: 'Reset', zh: '重置', ja: 'リセット', fr: 'Réinitialiser', de: 'Zurücksetzen', ko: '초기화', pt: 'Redefinir' },
  'ctrl.step': { en: 'Step', zh: '步进', ja: 'ステップ', fr: 'Pas à pas', de: 'Schritt', ko: '단계', pt: 'Passo' },
  'ctrl.presets': { en: 'Presets', zh: '预设', ja: 'プリセット', fr: 'Préréglages', de: 'Voreinstellungen', ko: '프리셋', pt: 'Predefinições' },
  'ctrl.parameters': { en: 'Parameters', zh: '参数', ja: 'パラメータ', fr: 'Paramètres', de: 'Parameter', ko: '매개변수', pt: 'Parâmetros' },

  'panel.data': { en: 'Data', zh: '数据', ja: 'データ', fr: 'Données', de: 'Daten', ko: '데이터', pt: 'Dados' },
  'panel.chart': { en: 'Chart', zh: '图表', ja: 'グラフ', fr: 'Graphique', de: 'Diagramm', ko: '차트', pt: 'Gráfico' },
  'panel.formulas': { en: 'Formulas', zh: '公式', ja: '数式', fr: 'Formules', de: 'Formeln', ko: '공식', pt: 'Fórmulas' },
  'panel.ai': { en: 'AI Explanation', zh: 'AI 讲解', ja: 'AI 解説', fr: 'Explication IA', de: 'KI-Erklärung', ko: 'AI 설명', pt: 'Explicação de IA' },
  'panel.notes': { en: 'Notes', zh: '实验笔记', ja: 'メモ', fr: 'Notes', de: 'Notizen', ko: '메모', pt: 'Notas' },
  'panel.learn': { en: 'Learn', zh: '学习', ja: '学習', fr: 'Apprendre', de: 'Lernen', ko: '학습', pt: 'Aprender' },
  'panel.periodicTable': { en: 'Periodic Table', zh: '元素周期表', ja: '周期表', fr: 'Tableau périodique', de: 'Periodensystem', ko: '주기율표', pt: 'Tabela periódica' },
  'learn.intro': { en: 'Introduction', zh: '介绍', ja: 'はじめに', fr: 'Introduction', de: 'Einführung', ko: '소개', pt: 'Introdução' },
  'learn.principle': { en: 'How it works', zh: '原理', ja: 'しくみ', fr: 'Comment ça marche', de: 'So funktioniert es', ko: '원리', pt: 'Como funciona' },
  'learn.tips': { en: 'Tips for understanding', zh: '理解提示', ja: '理解のヒント', fr: 'Conseils pour comprendre', de: 'Tipps zum Verständnis', ko: '이해를 돕는 팁', pt: 'Dicas para entender' },

  'share.share': { en: 'Share', zh: '分享', ja: '共有', fr: 'Partager', de: 'Teilen', ko: '공유', pt: 'Compartilhar' },
  'share.copied': { en: 'Link copied!', zh: '链接已复制！', ja: 'リンクをコピーしました！', fr: 'Lien copié !', de: 'Link kopiert!', ko: '링크가 복사되었습니다!', pt: 'Link copiado!' },
  'share.fullscreen': { en: 'Classroom', zh: '课堂模式', ja: '授業モード', fr: 'Classe', de: 'Unterricht', ko: '강의 모드', pt: 'Sala de aula' },
  'share.exitFullscreen': { en: 'Exit classroom', zh: '退出课堂模式', ja: '授業モードを終了', fr: 'Quitter la classe', de: 'Unterricht verlassen', ko: '강의 모드 종료', pt: 'Sair da sala de aula' },
  'share.screenshot': { en: 'Screenshot', zh: '截图', ja: 'スクリーンショット', fr: 'Capture', de: 'Screenshot', ko: '스크린샷', pt: 'Captura' },

  'ai.ask': { en: 'Ask', zh: '提问', ja: '質問', fr: 'Demander', de: 'Fragen', ko: '질문', pt: 'Perguntar' },
  'ai.placeholder': { en: 'Ask about the current simulation…', zh: '询问当前模拟…', ja: '現在のシミュレーションについて質問…', fr: 'Posez une question sur la simulation…', de: 'Frage zur aktuellen Simulation…', ko: '현재 시뮬레이션에 대해 질문하기…', pt: 'Pergunte sobre a simulação atual…' },
  'ai.suggested': { en: 'Suggested questions', zh: '推荐问题', ja: 'おすすめの質問', fr: 'Questions suggérées', de: 'Vorgeschlagene Fragen', ko: '추천 질문', pt: 'Perguntas sugeridas' },
  'ai.thinking': { en: 'Thinking…', zh: '思考中…', ja: '考え中…', fr: 'Réflexion…', de: 'Denkt nach…', ko: '생각 중…', pt: 'Pensando…' },
  'ai.disabled': { en: 'AI explanation is disabled.', zh: 'AI 讲解已关闭。', ja: 'AI 解説は無効です。', fr: 'L’explication IA est désactivée.', de: 'KI-Erklärung ist deaktiviert.', ko: 'AI 설명이 비활성화되어 있습니다.', pt: 'A explicação de IA está desativada.' },
  'ai.enable': { en: 'Enable AI explanation', zh: '开启 AI 讲解', ja: 'AI 解説を有効にする', fr: 'Activer l’explication IA', de: 'KI-Erklärung aktivieren', ko: 'AI 설명 켜기', pt: 'Ativar explicação de IA' },
  'ai.grounded': { en: 'Explanations are grounded in the current model state.', zh: '讲解基于当前模型状态生成。', ja: '解説は現在のモデルの状態に基づいています。', fr: 'Les explications se basent sur l’état actuel du modèle.', de: 'Erklärungen beruhen auf dem aktuellen Modellzustand.', ko: '설명은 현재 모델 상태를 기반으로 합니다.', pt: 'As explicações baseiam-se no estado atual do modelo.' },
  'ai.error': { en: 'Could not generate an explanation right now.', zh: '暂时无法生成讲解。', ja: '現在、解説を生成できませんでした。', fr: 'Impossible de générer une explication pour le moment.', de: 'Es konnte gerade keine Erklärung erstellt werden.', ko: '지금은 설명을 생성할 수 없습니다.', pt: 'Não foi possível gerar uma explicação agora.' },

  'notes.add': { en: 'Save current experiment', zh: '保存当前实验', ja: '現在の実験を保存', fr: 'Enregistrer l’expérience', de: 'Experiment speichern', ko: '현재 실험 저장', pt: 'Salvar experimento atual' },
  'notes.observation': { en: 'Observation (optional)', zh: '观察记录（可选）', ja: '観察（任意）', fr: 'Observation (facultatif)', de: 'Beobachtung (optional)', ko: '관찰 (선택)', pt: 'Observação (opcional)' },
  'notes.empty': { en: 'No saved experiments yet.', zh: '还没有保存的实验。', ja: '保存された実験はまだありません。', fr: 'Aucune expérience enregistrée.', de: 'Noch keine gespeicherten Experimente.', ko: '저장된 실험이 없습니다.', pt: 'Nenhum experimento salvo ainda.' },
  'notes.restore': { en: 'Restore', zh: '恢复', ja: '復元', fr: 'Restaurer', de: 'Wiederherstellen', ko: '복원', pt: 'Restaurar' },
  'notes.delete': { en: 'Delete', zh: '删除', ja: '削除', fr: 'Supprimer', de: 'Löschen', ko: '삭제', pt: 'Excluir' },
  'notes.saved': { en: 'Experiment saved.', zh: '实验已保存。', ja: '実験を保存しました。', fr: 'Expérience enregistrée.', de: 'Experiment gespeichert.', ko: '실험이 저장되었습니다.', pt: 'Experimento salvo.' },

  'three.hint': { en: 'Drag to rotate · scroll to zoom', zh: '拖动旋转 · 滚轮缩放', ja: 'ドラッグで回転 · スクロールで拡大縮小', fr: 'Glissez pour pivoter · molette pour zoomer', de: 'Ziehen zum Drehen · Scrollen zum Zoomen', ko: '드래그하여 회전 · 스크롤하여 확대/축소', pt: 'Arraste para girar · role para ampliar' },
  'theme.toggle': { en: 'Toggle theme', zh: '切换主题', ja: 'テーマ切り替え', fr: 'Changer de thème', de: 'Thema wechseln', ko: '테마 전환', pt: 'Alternar tema' },
  'lang.label': { en: 'Language', zh: '语言', ja: '言語', fr: 'Langue', de: 'Sprache', ko: '언어', pt: 'Idioma' },
  'compare.title': { en: 'Compare runs', zh: '对比实验', ja: '実験を比較', fr: 'Comparer les essais', de: 'Läufe vergleichen', ko: '실행 비교', pt: 'Comparar execuções' },
  'compare.snapshot': { en: 'Snapshot A', zh: '快照 A', ja: 'スナップショット A', fr: 'Instantané A', de: 'Schnappschuss A', ko: '스냅샷 A', pt: 'Instantâneo A' },
  'compare.clear': { en: 'Clear', zh: '清除', ja: 'クリア', fr: 'Effacer', de: 'Löschen', ko: '지우기', pt: 'Limpar' },
};

export function translate(lang: Lang, key: string, fallback?: string): string {
  const entry = strings[key];
  if (!entry) return fallback ?? key;
  return entry[lang] ?? entry.en;
}

/** Pick a localized model field, falling back to English when a translation for
 *  the active language is not provided. Models carry en/zh/ja text; other
 *  languages fall back to English. */
export function pick(lang: Lang, en: string, zh: string, ja?: string): string {
  if (lang === 'zh') return zh;
  if (lang === 'ja') return ja ?? en;
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
