import { useQuery } from "@tanstack/react-query";
import { BookOpen, Boxes, Clock3, MessageSquare, Server, Settings, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ErrorState, Loading } from "../components/Status";
import { useI18n } from "../../framework/i18n";
import { api, apiBase } from "../lib/api";
import { adminPath } from "../lib/routes";
import type { CommentStatus, PostStatus } from "../types";

const postStatuses: Array<{ labelKey: string; value: PostStatus; tone: string }> = [
  { labelKey: "status.published", value: "published", tone: "success" },
  { labelKey: "status.draft", value: "draft", tone: "muted" },
  { labelKey: "status.pending_review", value: "pending_review", tone: "warning" },
  { labelKey: "status.scheduled", value: "scheduled", tone: "info" },
  { labelKey: "status.archived", value: "archived", tone: "danger" },
];

const commentStatuses: Array<{ labelKey: string; value: CommentStatus; tone: string }> = [
  { labelKey: "comment_status.pending", value: "pending", tone: "warning" },
  { labelKey: "comment_status.approved", value: "approved", tone: "success" },
  { labelKey: "comment_status.spam", value: "spam", tone: "danger" },
  { labelKey: "comment_status.trash", value: "trash", tone: "muted" },
];

export function Dashboard() {
  const { t } = useI18n();
  const health = useQuery({ queryKey: ["health"], queryFn: api.health });
  const settings = useQuery({ queryKey: ["settings"], queryFn: api.getSettings });
  const plugins = useQuery({ queryKey: ["plugins"], queryFn: api.listPlugins });
  const posts = useQuery({
    queryKey: ["dashboard-posts"],
    queryFn: () => api.listAdminPosts("post", { page: 1, per_page: 5 }),
  });
  const pages = useQuery({
    queryKey: ["dashboard-pages"],
    queryFn: () => api.listAdminPosts("page", { page: 1, per_page: 1 }),
  });
  const comments = useQuery({
    queryKey: ["dashboard-comments"],
    queryFn: () => api.listComments({ page: 1, per_page: 5 }),
  });
  const users = useQuery({
    queryKey: ["dashboard-users"],
    queryFn: () => api.listUsers({ page: 1, per_page: 1 }),
  });
  const postStatusQueries = postStatuses.map((status) =>
    useQuery({
      queryKey: ["dashboard-post-status", status.value],
      queryFn: () => api.listAdminPosts("post", { page: 1, per_page: 1, status: status.value }),
    }),
  );
  const commentStatusQueries = commentStatuses.map((status) =>
    useQuery({
      queryKey: ["dashboard-comment-status", status.value],
      queryFn: () => api.listComments({ page: 1, per_page: 1, status: status.value }),
    }),
  );

  if (health.isLoading || settings.isLoading || plugins.isLoading || posts.isLoading || pages.isLoading || comments.isLoading || users.isLoading) {
    return <Loading />;
  }

  if (health.error || settings.error || plugins.error || posts.error || pages.error || comments.error || users.error) {
    return <ErrorState error={health.error || settings.error || plugins.error || posts.error || pages.error || comments.error || users.error} />;
  }

  const activePlugins = plugins.data?.filter((plugin) => plugin.health.active).length || 0;
  const pluginCount = plugins.data?.length || 0;
  const postStatusData = postStatuses.map((status, index) => ({
    ...status,
    label: t(status.labelKey),
    valueCount: postStatusQueries[index].data?.meta.total || 0,
  }));
  const commentStatusData = commentStatuses.map((status, index) => ({
    ...status,
    label: t(status.labelKey),
    valueCount: commentStatusQueries[index].data?.meta.total || 0,
  }));

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>{t("dashboard.title")}</h1>
          <p>{t("dashboard.subtitle", undefined, { apiBase })}</p>
        </div>
        <Link className="button subtle" to={adminPath("/settings")}>
          <Settings size={16} />
          {t("dashboard.site_settings")}
        </Link>
      </div>

      <div className="stats-grid">
        <Metric icon={Server} label={t("dashboard.service_status")} value={health.data?.status || "unknown"} />
        <Metric icon={BookOpen} label={t("dashboard.posts_pages")} value={`${posts.data?.meta.total || 0} / ${pages.data?.meta.total || 0}`} />
        <Metric icon={MessageSquare} label={t("dashboard.comments")} value={String(comments.data?.meta.total || 0)} />
        <Metric icon={Users} label={t("dashboard.users")} value={String(users.data?.meta.total || 0)} />
      </div>

      <div className="dashboard-grid">
        <section className="panel visual-panel">
          <div className="panel-heading">
            <h2>{t("dashboard.post_status")}</h2>
            <small>{t("dashboard.posts_count", undefined, { count: posts.data?.meta.total || 0 })}</small>
          </div>
          <Distribution data={postStatusData} total={posts.data?.meta.total || 0} />
        </section>
        <section className="panel visual-panel">
          <div className="panel-heading">
            <h2>{t("dashboard.comment_status")}</h2>
            <small>{settings.data?.comment_moderation ? t("dashboard.moderation_mode") : t("dashboard.open_mode")}</small>
          </div>
          <Distribution data={commentStatusData} total={comments.data?.meta.total || 0} />
        </section>
        <section className="panel visual-panel">
          <div className="panel-heading">
            <h2>{t("dashboard.plugin_rate")}</h2>
            <small>{activePlugins} / {pluginCount} active</small>
          </div>
          <Ring value={activePlugins} total={pluginCount} label={t("nav.plugins")} hint={t("dashboard.plugin_hint")} />
        </section>
      </div>

      <div className="split-grid">
        <section className="panel">
          <h2>{t("dashboard.quick_actions")}</h2>
          <div className="action-list">
            <Link to={adminPath("/posts/new")}>{t("dashboard.new_post")}</Link>
            <Link to={adminPath("/pages/new")}>{t("dashboard.new_page")}</Link>
            <Link to={adminPath("/comments")}>{t("dashboard.review_comments")}</Link>
            <Link to={adminPath("/themes")}>{t("dashboard.switch_theme")}</Link>
          </div>
        </section>
        <section className="panel">
          <div className="panel-heading">
            <h2>{t("dashboard.recent_posts")}</h2>
            <Link to={adminPath("/posts")}>{t("action.view_all")}</Link>
          </div>
          <div className="activity-list">
            {posts.data?.data.length ? posts.data.data.map((post) => (
              <Link to={adminPath(`/posts/${post.id}/edit`)} key={post.id}>
                <span>
                  <strong>{post.title}</strong>
                  <small>{post.status} · {new Date(post.updated_at).toLocaleString()}</small>
                </span>
                <Clock3 size={16} />
              </Link>
            )) : <p className="muted">{t("dashboard.no_posts")}</p>}
          </div>
        </section>
      </div>
    </section>
  );
}

function Distribution({
  data,
  total,
}: {
  data: Array<{ label: string; tone: string; valueCount: number }>;
  total: number;
}) {
  return (
    <div className="distribution">
      <div className="distribution-bar" aria-label="状态分布">
        {data.map((item) => (
          <span
            className={`segment ${item.tone}`}
            key={item.label}
            style={{ width: `${total > 0 ? Math.max(4, (item.valueCount / total) * 100) : 0}%` }}
            title={`${item.label}: ${item.valueCount}`}
          />
        ))}
      </div>
      <div className="distribution-legend">
        {data.map((item) => (
          <span key={item.label}>
            <i className={`dot ${item.tone}`} />
            {item.label}
            <strong>{item.valueCount}</strong>
          </span>
        ))}
      </div>
    </div>
  );
}

function Ring({ value, total, label, hint }: { value: number; total: number; label: string; hint: string }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="ring-panel">
      <div className="ring" style={{ "--ring-value": `${percent}%` } as CSSProperties}>
        <strong>{percent}%</strong>
        <small>{label}</small>
      </div>
      <p className="muted">{hint}</p>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="metric">
      <Icon size={20} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
