// Lightweight, dependency-free i18n. Locale-extensible: add a code to `LANGS`
// and a value to each string entry. English is the fallback (PRD §11.5).
import { createContext, useContext } from 'react';

export type Lang = 'en' | 'zh' | 'ja' | 'fr' | 'de' | 'ko' | 'pt' | 'es' | 'ar' | 'ru';

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'ko', label: '한국어' },
  { code: 'pt', label: 'Português' },
  { code: 'es', label: 'Español' },
  { code: 'ar', label: 'العربية' },
  { code: 'ru', label: 'Русский' },
];

/** Right-to-left languages. Arabic is currently the only one. */
export const RTL_LANGS: Lang[] = ['ar'];
export const isRTL = (lang: Lang): boolean => RTL_LANGS.includes(lang);

type Entry = {
  en: string; zh: string; ja: string; fr: string; de: string; ko: string; pt: string;
  es: string; ar: string; ru: string;
};
type Dict = Record<string, Entry>;

export const strings: Dict = {
  'app.name': { en: 'LabVivid', zh: 'LabVivid 科学实验室', ja: 'LabVivid サイエンスラボ', fr: 'LabVivid', de: 'LabVivid', ko: 'LabVivid', pt: 'LabVivid', es: 'LabVivid', ar: 'LabVivid', ru: 'LabVivid' },
  'app.tagline': { en: 'Interactive science simulations', zh: '交互式科学模拟', ja: 'インタラクティブな理科シミュレーション', fr: 'Simulations scientifiques interactives', de: 'Interaktive Wissenschaftssimulationen', ko: '인터랙티브 과학 시뮬레이션', pt: 'Simulações científicas interativas', es: 'Simulaciones científicas interactivas', ar: 'محاكاة علمية تفاعلية', ru: 'Интерактивные научные симуляции' },
  'nav.library': { en: 'Model Library', zh: '模型库', ja: 'モデルライブラリ', fr: 'Bibliothèque de modèles', de: 'Modellbibliothek', ko: '모델 라이브러리', pt: 'Biblioteca de modelos', es: 'Biblioteca de modelos', ar: 'مكتبة النماذج', ru: 'Библиотека моделей' },
  'nav.back': { en: 'Back to library', zh: '返回模型库', ja: 'ライブラリに戻る', fr: 'Retour à la bibliothèque', de: 'Zurück zur Bibliothek', ko: '라이브러리로 돌아가기', pt: 'Voltar à biblioteca', es: 'Volver a la biblioteca', ar: 'العودة إلى المكتبة', ru: 'Назад к библиотеке' },
  'nav.home': { en: 'Home', zh: '主页', ja: 'ホーム', fr: 'Accueil', de: 'Start', ko: '홈', pt: 'Início', es: 'Inicio', ar: 'الرئيسية', ru: 'Главная' },
  'nav.menu': { en: 'Menu', zh: '菜单', ja: 'メニュー', fr: 'Menu', de: 'Menü', ko: '메뉴', pt: 'Menu', es: 'Menú', ar: 'القائمة', ru: 'Меню' },
  'nav.models': { en: 'Models', zh: '模型', ja: 'モデル', fr: 'Modèles', de: 'Modelle', ko: '모델', pt: 'Modelos', es: 'Modelos', ar: 'النماذج', ru: 'Модели' },

  'lib.searchPlaceholder': { en: 'Search models…', zh: '搜索模型…', ja: 'モデルを検索…', fr: 'Rechercher des modèles…', de: 'Modelle suchen…', ko: '모델 검색…', pt: 'Pesquisar modelos…', es: 'Buscar modelos…', ar: 'البحث عن النماذج…', ru: 'Поиск моделей…' },
  'lib.all': { en: 'All', zh: '全部', ja: 'すべて', fr: 'Tous', de: 'Alle', ko: '전체', pt: 'Todos', es: 'Todos', ar: 'الكل', ru: 'Все' },
  'lib.noResults': { en: 'No models match your search.', zh: '没有匹配的模型。', ja: '該当するモデルがありません。', fr: 'Aucun modèle ne correspond à votre recherche.', de: 'Keine Modelle entsprechen deiner Suche.', ko: '검색과 일치하는 모델이 없습니다.', pt: 'Nenhum modelo corresponde à sua pesquisa.', es: 'Ningún modelo coincide con tu búsqueda.', ar: 'لا توجد نماذج تطابق بحثك.', ru: 'Нет моделей, соответствующих запросу.' },
  'lib.recent': { en: 'Continue recent experiment', zh: '继续最近的实验', ja: '最近の実験を続ける', fr: 'Reprendre l’expérience récente', de: 'Letztes Experiment fortsetzen', ko: '최근 실험 계속하기', pt: 'Continuar experimento recente', es: 'Continuar experimento reciente', ar: 'متابعة التجربة الأخيرة', ru: 'Продолжить недавний эксперимент' },
  'lib.openModel': { en: 'Open model', zh: '打开模型', ja: 'モデルを開く', fr: 'Ouvrir le modèle', de: 'Modell öffnen', ko: '모델 열기', pt: 'Abrir modelo', es: 'Abrir modelo', ar: 'فتح النموذج', ru: 'Открыть модель' },
  'lib.intro': { en: 'Manipulate models, observe outcomes, and learn through interaction.', zh: '操作模型，观察结果，在交互中学习。', ja: 'モデルを操作し、結果を観察し、対話しながら学びましょう。', fr: 'Manipulez des modèles, observez les résultats et apprenez en interagissant.', de: 'Modelle bedienen, Ergebnisse beobachten und durch Interaktion lernen.', ko: '모델을 조작하고 결과를 관찰하며 상호작용으로 배우세요.', pt: 'Manipule modelos, observe resultados e aprenda interagindo.', es: 'Manipula modelos, observa los resultados y aprende interactuando.', ar: 'تحكّم في النماذج، ولاحظ النتائج، وتعلّم من خلال التفاعل.', ru: 'Управляйте моделями, наблюдайте результаты и учитесь через взаимодействие.' },

  'subject.physics': { en: 'Physics', zh: '物理', ja: '物理', fr: 'Physique', de: 'Physik', ko: '물리', pt: 'Física', es: 'Física', ar: 'الفيزياء', ru: 'Физика' },
  'subject.chemistry': { en: 'Chemistry', zh: '化学', ja: '化学', fr: 'Chimie', de: 'Chemie', ko: '화학', pt: 'Química', es: 'Química', ar: 'الكيمياء', ru: 'Химия' },
  'subject.math': { en: 'Mathematics', zh: '数学', ja: '数学', fr: 'Mathématiques', de: 'Mathematik', ko: '수학', pt: 'Matemática', es: 'Matemáticas', ar: 'الرياضيات', ru: 'Математика' },
  'subject.biology': { en: 'Biology', zh: '生物', ja: '生物', fr: 'Biologie', de: 'Biologie', ko: '생물', pt: 'Biologia', es: 'Biología', ar: 'الأحياء', ru: 'Биология' },
  'subject.engineering': { en: 'Engineering', zh: '工程', ja: '工学', fr: 'Ingénierie', de: 'Technik', ko: '공학', pt: 'Engenharia', es: 'Ingeniería', ar: 'الهندسة', ru: 'Инженерия' },

  'difficulty.elementary': { en: 'Elementary', zh: '小学', ja: '小学', fr: 'Primaire', de: 'Grundschule', ko: '초등', pt: 'Fundamental I', es: 'Primaria', ar: 'ابتدائي', ru: 'Начальная школа' },
  'difficulty.middle-school': { en: 'Middle school', zh: '初中', ja: '中学', fr: 'Collège', de: 'Mittelstufe', ko: '중학교', pt: 'Fundamental II', es: 'Secundaria', ar: 'متوسط', ru: 'Средняя школа' },
  'difficulty.high-school': { en: 'High school', zh: '高中', ja: '高校', fr: 'Lycée', de: 'Oberstufe', ko: '고등학교', pt: 'Ensino médio', es: 'Bachillerato', ar: 'ثانوي', ru: 'Старшая школа' },
  'difficulty.college': { en: 'College', zh: '大学', ja: '大学', fr: 'Université', de: 'Universität', ko: '대학', pt: 'Universidade', es: 'Universidad', ar: 'جامعي', ru: 'Университет' },

  'ctrl.play': { en: 'Play', zh: '播放', ja: '再生', fr: 'Lecture', de: 'Start', ko: '재생', pt: 'Reproduzir', es: 'Reproducir', ar: 'تشغيل', ru: 'Запуск' },
  'ctrl.pause': { en: 'Pause', zh: '暂停', ja: '一時停止', fr: 'Pause', de: 'Pause', ko: '일시정지', pt: 'Pausar', es: 'Pausar', ar: 'إيقاف مؤقت', ru: 'Пауза' },
  'ctrl.reset': { en: 'Reset', zh: '重置', ja: 'リセット', fr: 'Réinitialiser', de: 'Zurücksetzen', ko: '초기화', pt: 'Redefinir', es: 'Reiniciar', ar: 'إعادة ضبط', ru: 'Сброс' },
  'ctrl.step': { en: 'Step', zh: '步进', ja: 'ステップ', fr: 'Pas à pas', de: 'Schritt', ko: '단계', pt: 'Passo', es: 'Paso', ar: 'خطوة', ru: 'Шаг' },
  'ctrl.presets': { en: 'Presets', zh: '预设', ja: 'プリセット', fr: 'Préréglages', de: 'Voreinstellungen', ko: '프리셋', pt: 'Predefinições', es: 'Ajustes', ar: 'إعدادات جاهزة', ru: 'Пресеты' },
  'ctrl.parameters': { en: 'Parameters', zh: '参数', ja: 'パラメータ', fr: 'Paramètres', de: 'Parameter', ko: '매개변수', pt: 'Parâmetros', es: 'Parámetros', ar: 'المعاملات', ru: 'Параметры' },

  'panel.data': { en: 'Data', zh: '数据', ja: 'データ', fr: 'Données', de: 'Daten', ko: '데이터', pt: 'Dados', es: 'Datos', ar: 'البيانات', ru: 'Данные' },
  'panel.chart': { en: 'Chart', zh: '图表', ja: 'グラフ', fr: 'Graphique', de: 'Diagramm', ko: '차트', pt: 'Gráfico', es: 'Gráfico', ar: 'الرسم البياني', ru: 'График' },
  'panel.formulas': { en: 'Formulas', zh: '公式', ja: '数式', fr: 'Formules', de: 'Formeln', ko: '공식', pt: 'Fórmulas', es: 'Fórmulas', ar: 'الصيغ', ru: 'Формулы' },
  'panel.ai': { en: 'AI Explanation', zh: 'AI 讲解', ja: 'AI 解説', fr: 'Explication IA', de: 'KI-Erklärung', ko: 'AI 설명', pt: 'Explicação de IA', es: 'Explicación con IA', ar: 'شرح بالذكاء الاصطناعي', ru: 'Объяснение ИИ' },
  'panel.notes': { en: 'Notes', zh: '实验笔记', ja: 'メモ', fr: 'Notes', de: 'Notizen', ko: '메모', pt: 'Notas', es: 'Notas', ar: 'الملاحظات', ru: 'Заметки' },
  'panel.learn': { en: 'Learn', zh: '学习', ja: '学習', fr: 'Apprendre', de: 'Lernen', ko: '학습', pt: 'Aprender', es: 'Aprender', ar: 'تعلّم', ru: 'Учиться' },
  'panel.periodicTable': { en: 'Periodic Table', zh: '元素周期表', ja: '周期表', fr: 'Tableau périodique', de: 'Periodensystem', ko: '주기율표', pt: 'Tabela periódica', es: 'Tabla periódica', ar: 'الجدول الدوري', ru: 'Периодическая таблица' },
  'learn.intro': { en: 'Introduction', zh: '介绍', ja: 'はじめに', fr: 'Introduction', de: 'Einführung', ko: '소개', pt: 'Introdução', es: 'Introducción', ar: 'مقدمة', ru: 'Введение' },
  'learn.principle': { en: 'How it works', zh: '原理', ja: 'しくみ', fr: 'Comment ça marche', de: 'So funktioniert es', ko: '원리', pt: 'Como funciona', es: 'Cómo funciona', ar: 'كيف يعمل', ru: 'Как это работает' },
  'learn.tips': { en: 'Tips for understanding', zh: '理解提示', ja: '理解のヒント', fr: 'Conseils pour comprendre', de: 'Tipps zum Verständnis', ko: '이해를 돕는 팁', pt: 'Dicas para entender', es: 'Consejos para entender', ar: 'نصائح للفهم', ru: 'Советы для понимания' },

  'share.share': { en: 'Share', zh: '分享', ja: '共有', fr: 'Partager', de: 'Teilen', ko: '공유', pt: 'Compartilhar', es: 'Compartir', ar: 'مشاركة', ru: 'Поделиться' },
  'share.copied': { en: 'Link copied!', zh: '链接已复制！', ja: 'リンクをコピーしました！', fr: 'Lien copié !', de: 'Link kopiert!', ko: '링크가 복사되었습니다!', pt: 'Link copiado!', es: '¡Enlace copiado!', ar: 'تم نسخ الرابط!', ru: 'Ссылка скопирована!' },
  'share.fullscreen': { en: 'Classroom', zh: '课堂模式', ja: '授業モード', fr: 'Classe', de: 'Unterricht', ko: '강의 모드', pt: 'Sala de aula', es: 'Aula', ar: 'وضع الصف', ru: 'Класс' },
  'share.exitFullscreen': { en: 'Exit classroom', zh: '退出课堂模式', ja: '授業モードを終了', fr: 'Quitter la classe', de: 'Unterricht verlassen', ko: '강의 모드 종료', pt: 'Sair da sala de aula', es: 'Salir del aula', ar: 'إنهاء وضع الصف', ru: 'Выйти из класса' },
  'share.screenshot': { en: 'Screenshot', zh: '截图', ja: 'スクリーンショット', fr: 'Capture', de: 'Screenshot', ko: '스크린샷', pt: 'Captura', es: 'Captura', ar: 'لقطة شاشة', ru: 'Снимок экрана' },

  'ai.ask': { en: 'Ask', zh: '提问', ja: '質問', fr: 'Demander', de: 'Fragen', ko: '질문', pt: 'Perguntar', es: 'Preguntar', ar: 'اسأل', ru: 'Спросить' },
  'ai.placeholder': { en: 'Ask about the current simulation…', zh: '询问当前模拟…', ja: '現在のシミュレーションについて質問…', fr: 'Posez une question sur la simulation…', de: 'Frage zur aktuellen Simulation…', ko: '현재 시뮬레이션에 대해 질문하기…', pt: 'Pergunte sobre a simulação atual…', es: 'Pregunta sobre la simulación actual…', ar: 'اسأل عن المحاكاة الحالية…', ru: 'Спросите о текущей симуляции…' },
  'ai.suggested': { en: 'Suggested questions', zh: '推荐问题', ja: 'おすすめの質問', fr: 'Questions suggérées', de: 'Vorgeschlagene Fragen', ko: '추천 질문', pt: 'Perguntas sugeridas', es: 'Preguntas sugeridas', ar: 'أسئلة مقترحة', ru: 'Предлагаемые вопросы' },
  'ai.thinking': { en: 'Thinking…', zh: '思考中…', ja: '考え中…', fr: 'Réflexion…', de: 'Denkt nach…', ko: '생각 중…', pt: 'Pensando…', es: 'Pensando…', ar: 'جارٍ التفكير…', ru: 'Думаю…' },
  'ai.disabled': { en: 'AI explanation is disabled.', zh: 'AI 讲解已关闭。', ja: 'AI 解説は無効です。', fr: 'L’explication IA est désactivée.', de: 'KI-Erklärung ist deaktiviert.', ko: 'AI 설명이 비활성화되어 있습니다.', pt: 'A explicação de IA está desativada.', es: 'La explicación con IA está desactivada.', ar: 'شرح الذكاء الاصطناعي معطّل.', ru: 'Объяснение ИИ отключено.' },
  'ai.enable': { en: 'Enable AI explanation', zh: '开启 AI 讲解', ja: 'AI 解説を有効にする', fr: 'Activer l’explication IA', de: 'KI-Erklärung aktivieren', ko: 'AI 설명 켜기', pt: 'Ativar explicação de IA', es: 'Activar explicación con IA', ar: 'تفعيل شرح الذكاء الاصطناعي', ru: 'Включить объяснение ИИ' },
  'ai.grounded': { en: 'Explanations are grounded in the current model state.', zh: '讲解基于当前模型状态生成。', ja: '解説は現在のモデルの状態に基づいています。', fr: 'Les explications se basent sur l’état actuel du modèle.', de: 'Erklärungen beruhen auf dem aktuellen Modellzustand.', ko: '설명은 현재 모델 상태를 기반으로 합니다.', pt: 'As explicações baseiam-se no estado atual do modelo.', es: 'Las explicaciones se basan en el estado actual del modelo.', ar: 'تستند الشروح إلى الحالة الحالية للنموذج.', ru: 'Объяснения основаны на текущем состоянии модели.' },
  'ai.error': { en: 'Could not generate an explanation right now.', zh: '暂时无法生成讲解。', ja: '現在、解説を生成できませんでした。', fr: 'Impossible de générer une explication pour le moment.', de: 'Es konnte gerade keine Erklärung erstellt werden.', ko: '지금은 설명을 생성할 수 없습니다.', pt: 'Não foi possível gerar uma explicação agora.', es: 'No se pudo generar una explicación ahora mismo.', ar: 'تعذّر إنشاء شرح في الوقت الحالي.', ru: 'Сейчас не удалось создать объяснение.' },

  'notes.add': { en: 'Save current experiment', zh: '保存当前实验', ja: '現在の実験を保存', fr: 'Enregistrer l’expérience', de: 'Experiment speichern', ko: '현재 실험 저장', pt: 'Salvar experimento atual', es: 'Guardar experimento actual', ar: 'حفظ التجربة الحالية', ru: 'Сохранить текущий эксперимент' },
  'notes.observation': { en: 'Observation (optional)', zh: '观察记录（可选）', ja: '観察（任意）', fr: 'Observation (facultatif)', de: 'Beobachtung (optional)', ko: '관찰 (선택)', pt: 'Observação (opcional)', es: 'Observación (opcional)', ar: 'ملاحظة (اختياري)', ru: 'Наблюдение (необязательно)' },
  'notes.empty': { en: 'No saved experiments yet.', zh: '还没有保存的实验。', ja: '保存された実験はまだありません。', fr: 'Aucune expérience enregistrée.', de: 'Noch keine gespeicherten Experimente.', ko: '저장된 실험이 없습니다.', pt: 'Nenhum experimento salvo ainda.', es: 'Aún no hay experimentos guardados.', ar: 'لا توجد تجارب محفوظة بعد.', ru: 'Пока нет сохранённых экспериментов.' },
  'notes.restore': { en: 'Restore', zh: '恢复', ja: '復元', fr: 'Restaurer', de: 'Wiederherstellen', ko: '복원', pt: 'Restaurar', es: 'Restaurar', ar: 'استعادة', ru: 'Восстановить' },
  'notes.delete': { en: 'Delete', zh: '删除', ja: '削除', fr: 'Supprimer', de: 'Löschen', ko: '삭제', pt: 'Excluir', es: 'Eliminar', ar: 'حذف', ru: 'Удалить' },
  'notes.saved': { en: 'Experiment saved.', zh: '实验已保存。', ja: '実験を保存しました。', fr: 'Expérience enregistrée.', de: 'Experiment gespeichert.', ko: '실험이 저장되었습니다.', pt: 'Experimento salvo.', es: 'Experimento guardado.', ar: 'تم حفظ التجربة.', ru: 'Эксперимент сохранён.' },

  'three.hint': { en: 'Drag to rotate · scroll to zoom', zh: '拖动旋转 · 滚轮缩放', ja: 'ドラッグで回転 · スクロールで拡大縮小', fr: 'Glissez pour pivoter · molette pour zoomer', de: 'Ziehen zum Drehen · Scrollen zum Zoomen', ko: '드래그하여 회전 · 스크롤하여 확대/축소', pt: 'Arraste para girar · role para ampliar', es: 'Arrastra para girar · desplaza para ampliar', ar: 'اسحب للتدوير · مرّر للتكبير', ru: 'Перетащите для вращения · колесо для масштаба' },
  'theme.toggle': { en: 'Toggle theme', zh: '切换主题', ja: 'テーマ切り替え', fr: 'Changer de thème', de: 'Thema wechseln', ko: '테마 전환', pt: 'Alternar tema', es: 'Cambiar tema', ar: 'تبديل المظهر', ru: 'Сменить тему' },
  'lang.label': { en: 'Language', zh: '语言', ja: '言語', fr: 'Langue', de: 'Sprache', ko: '언어', pt: 'Idioma', es: 'Idioma', ar: 'اللغة', ru: 'Язык' },
  'compare.title': { en: 'Compare runs', zh: '对比实验', ja: '実験を比較', fr: 'Comparer les essais', de: 'Läufe vergleichen', ko: '실행 비교', pt: 'Comparar execuções', es: 'Comparar ejecuciones', ar: 'مقارنة التجارب', ru: 'Сравнить запуски' },
  'compare.snapshot': { en: 'Snapshot A', zh: '快照 A', ja: 'スナップショット A', fr: 'Instantané A', de: 'Schnappschuss A', ko: '스냅샷 A', pt: 'Instantâneo A', es: 'Instantánea A', ar: 'لقطة أ', ru: 'Снимок A' },
  'compare.clear': { en: 'Clear', zh: '清除', ja: 'クリア', fr: 'Effacer', de: 'Löschen', ko: '지우기', pt: 'Limpar', es: 'Borrar', ar: 'مسح', ru: 'Очистить' },
};

export function translate(lang: Lang, key: string, fallback?: string): string {
  const entry = strings[key];
  if (!entry) return fallback ?? key;
  return entry[lang] ?? entry.en;
}

/** Pick a localized model field, falling back to English when a translation for
 *  the active language is not provided. Models carry en/zh/ja text; other
 *  languages fall back to English (richer text comes from modelText.ts). */
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
