// Generic embed: renders a self-contained static page (in /public) as a full
// interactive view via an iframe. Base-URL aware so it works under GitHub Pages.
// When `localize` is set, the current app language is passed as ?lang= and the
// iframe remounts on language change.
import type { Variables } from '../types/model';
import { useI18n } from '../i18n';

export function embedView(file: string, title: string, localize = false) {
  return function Embed(_props: { vars: Variables; isDark: boolean }) {
    const { lang } = useI18n();
    const src = `${import.meta.env.BASE_URL}${file}${localize ? `?lang=${lang}` : ''}`;
    return (
      <div className="embed-stage">
        <iframe
          key={localize ? lang : undefined}
          className="embed-frame"
          src={src}
          title={title}
          loading="lazy"
        />
      </div>
    );
  };
}
