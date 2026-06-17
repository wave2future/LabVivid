import { useCallback, useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { I18nContext, translate, LANGS, isRTL, type Lang } from './i18n';
import { LibraryPage } from './pages/LibraryPage';
import { ModelPage } from './pages/ModelPage';
import { Sidebar } from './components/Sidebar';

function usePersistentState<T extends string>(key: string, initial: T): [T, (v: T) => void] {
  const [val, setVal] = useState<T>(() => {
    try { return (localStorage.getItem(key) as T) || initial; } catch { return initial; }
  });
  const set = useCallback((v: T) => {
    setVal(v);
    try { localStorage.setItem(key, v); } catch { /* ignore */ }
  }, [key]);
  return [val, set];
}

export default function App() {
  const [lang, setLang] = usePersistentState<Lang>('labvivid.lang', 'en');
  const [theme, setTheme] = usePersistentState<'dark' | 'light'>('labvivid.theme', 'dark');
  const isDark = theme === 'dark';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Reflect the active language on <html> and switch document direction so
  // Arabic (and any future RTL locale) lays out right-to-left.
  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', isRTL(lang) ? 'rtl' : 'ltr');
  }, [lang]);

  const t = useCallback((key: string, fallback?: string) => translate(lang, key, fallback), [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      <HashRouter>
        <Shell
          lang={lang}
          setLang={setLang}
          isDark={isDark}
          onToggleTheme={() => setTheme(isDark ? 'light' : 'dark')}
        />
      </HashRouter>
    </I18nContext.Provider>
  );
}

function Shell({
  lang, setLang, isDark, onToggleTheme,
}: { lang: Lang; setLang: (l: Lang) => void; isDark: boolean; onToggleTheme: () => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close the mobile drawer whenever the route changes.
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  return (
    <div className="app">
      <TopBar
        lang={lang}
        setLang={setLang}
        isDark={isDark}
        onToggleTheme={onToggleTheme}
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
      />
      <div className="shell">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="main">
          <Routes>
            <Route path="/" element={<LibraryPage isDark={isDark} />} />
            <Route path="/model/:id" element={<ModelPage isDark={isDark} />} />
            <Route path="*" element={<LibraryPage isDark={isDark} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function TopBar({
  lang, setLang, isDark, onToggleTheme, onToggleSidebar,
}: {
  lang: Lang; setLang: (l: Lang) => void; isDark: boolean;
  onToggleTheme: () => void; onToggleSidebar: () => void;
}) {
  const t = (k: string) => translate(lang, k);
  return (
    <header className="topbar">
      <button className="iconbtn hamburger" onClick={onToggleSidebar} aria-label={t('nav.menu')}>
        ☰
      </button>
      <Link to="/" className="brand">
        <img className="logo" src="./favicon.svg" alt="" />
        <span>
          {t('app.name')}
          <small>{t('app.tagline')}</small>
        </span>
      </Link>
      <span className="spacer" />
      <select
        className="lang-select"
        value={lang}
        onChange={(e) => setLang(e.target.value as Lang)}
        aria-label={t('lang.label')}
      >
        {LANGS.map((l) => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>
      <button className="iconbtn" onClick={onToggleTheme} aria-label={t('theme.toggle')}>
        {isDark ? '☀' : '☾'}
      </button>
    </header>
  );
}
