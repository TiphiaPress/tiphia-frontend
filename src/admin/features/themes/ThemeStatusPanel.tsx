import { PauseCircle } from "lucide-react";

interface ThemeStatusPanelProps {
  active?: string;
  pending: boolean;
  onDeactivate: () => void;
  t: (key: string, fallback?: string, vars?: Record<string, string | number>) => string;
}

export function ThemeStatusPanel({ active, pending, onDeactivate, t }: ThemeStatusPanelProps) {
  return (
    <section className="panel">
      <div className="theme-status-row">
        <p className="muted">
          {t("themes.current", undefined, { active: active || t("themes.none_active") })}
        </p>
        <button
          className="button subtle"
          type="button"
          disabled={!active || pending}
          onClick={onDeactivate}
        >
          <PauseCircle size={16} />
          {t("themes.stop")}
        </button>
      </div>
    </section>
  );
}
