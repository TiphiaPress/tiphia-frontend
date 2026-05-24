import { Distribution, Ring } from "./Visuals";
import type { DistributionItem } from "./dashboardModel";

interface DashboardVisualGridProps {
  canPosts: boolean;
  canComments: boolean;
  canPlugins: boolean;
  postTotal: number;
  commentTotal: number;
  activePlugins: number;
  pluginCount: number;
  commentModeration?: boolean;
  postStatusData: DistributionItem[];
  commentStatusData: DistributionItem[];
  t: (key: string, fallback?: string, vars?: Record<string, string | number>) => string;
}

export function DashboardVisualGrid({
  canPosts,
  canComments,
  canPlugins,
  postTotal,
  commentTotal,
  activePlugins,
  pluginCount,
  commentModeration,
  postStatusData,
  commentStatusData,
  t,
}: DashboardVisualGridProps) {
  return (
    <div className="dashboard-grid">
      {canPosts ? (
        <section className="panel visual-panel">
          <div className="panel-heading">
            <h2>{t("dashboard.post_status")}</h2>
            <small>{t("dashboard.posts_count", undefined, { count: postTotal })}</small>
          </div>
          <Distribution data={postStatusData} total={postTotal} />
        </section>
      ) : null}
      {canComments ? (
        <section className="panel visual-panel">
          <div className="panel-heading">
            <h2>{t("dashboard.comment_status")}</h2>
            <small>{commentModeration ? t("dashboard.moderation_mode") : t("dashboard.open_mode")}</small>
          </div>
          <Distribution data={commentStatusData} total={commentTotal} />
        </section>
      ) : null}
      {canPlugins ? (
        <section className="panel visual-panel">
          <div className="panel-heading">
            <h2>{t("dashboard.plugin_rate")}</h2>
            <small>{activePlugins} / {pluginCount} active</small>
          </div>
          <Ring value={activePlugins} total={pluginCount} label={t("nav.plugins")} hint={t("dashboard.plugin_hint")} />
        </section>
      ) : null}
    </div>
  );
}
