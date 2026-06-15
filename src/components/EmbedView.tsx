// Generic embed: renders a self-contained static page (in /public) as a full
// interactive view via an iframe. Base-URL aware so it works under GitHub Pages.
import type { Variables } from '../types/model';

export function embedView(file: string, title: string) {
  return function Embed(_props: { vars: Variables; isDark: boolean }) {
    const src = `${import.meta.env.BASE_URL}${file}`;
    return (
      <div className="embed-stage">
        <iframe className="embed-frame" src={src} title={title} loading="lazy" />
      </div>
    );
  };
}
