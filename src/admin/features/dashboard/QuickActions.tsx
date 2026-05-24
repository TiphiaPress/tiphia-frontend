import { Link } from "react-router-dom";
import { adminPath } from "../../lib/routes";

interface QuickActionsProps {
  canPosts: boolean;
  canPages: boolean;
  canComments: boolean;
  canThemes: boolean;
  t: (key: string, fallback?: string, vars?: Record<string, string | number>) => string;
}

export function QuickActions({ canPosts, canPages, canComments, canThemes, t }: QuickActionsProps) {
  return (
    <section className="panel">
      <h2>{t("dashboard.quick_actions")}</h2>
      <div className="action-list">
        {canPosts ? <Link to={adminPath("/posts/new")}>{t("dashboard.new_post")}</Link> : null}
        {canPages ? <Link to={adminPath("/pages/new")}>{t("dashboard.new_page")}</Link> : null}
        {canComments ? <Link to={adminPath("/comments")}>{t("dashboard.review_comments")}</Link> : null}
        {canThemes ? <Link to={adminPath("/themes")}>{t("dashboard.switch_theme")}</Link> : null}
      </div>
    </section>
  );
}
