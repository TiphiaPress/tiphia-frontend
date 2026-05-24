import { Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { adminPath } from "../../lib/routes";
import type { ThemeInfo, ThemeState } from "./themeConfig";
import { themeHasConfig } from "./themeConfig";

interface ThemeCardProps {
  theme: ThemeInfo;
  themeState?: ThemeState;
  activationPending: boolean;
  onActivate: (name: string) => void;
  t: (key: string, fallback?: string, vars?: Record<string, string | number>) => string;
}

export function ThemeCard({ theme, themeState, activationPending, onActivate, t }: ThemeCardProps) {
  const configured = themeHasConfig(themeState, theme.name);
  return (
    <article className={"flat-card theme-card " + (theme.active ? "active" : "")}>
      <div className="theme-preview">{theme.preview}</div>
      <div className="theme-card-body">
        <div>
          <strong>{theme.name}</strong>
          <small>{theme.version} · {theme.author}</small>
          <p>{theme.description}</p>
          <div className="plugin-health">
            <span className={configured ? "badge approved" : "badge"}>
              {configured ? t("themes.configured") : t("themes.not_configured")}
            </span>
          </div>
        </div>
        <div className="card-actions">
          <button
            className={theme.active ? "button" : "button subtle"}
            disabled={theme.active || activationPending}
            onClick={() => onActivate(theme.name)}
          >
            {theme.active ? t("themes.enabled") : t("action.enable")}
          </button>
          <Link className="button subtle" to={adminPath("/themes/" + theme.name + "/config")}>
            <Settings size={16} />
            {configured ? t("themes.edit_config") : t("themes.new_config")}
          </Link>
        </div>
      </div>
    </article>
  );
}
