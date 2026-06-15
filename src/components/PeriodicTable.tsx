// Chemistry: interactive Periodic Table, embedded from a self-contained static
// page (public/periodic-table.html) via an iframe.
import { useI18n } from '../i18n';

export function PeriodicTable() {
  const { t } = useI18n();
  const src = `${import.meta.env.BASE_URL}periodic-table.html`;
  return (
    <div className="embed-stage">
      <iframe className="embed-frame" src={src} title={t('panel.periodicTable', 'Periodic Table')} loading="lazy" />
    </div>
  );
}
