import { useQuery } from "@tanstack/react-query";
import { Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardMetrics } from "../features/dashboard/DashboardMetrics";
import { DashboardVisualGrid } from "../features/dashboard/DashboardVisualGrid";
import { QuickActions } from "../features/dashboard/QuickActions";
import { RecentPostsPanel } from "../features/dashboard/RecentPostsPanel";
import { commentStatuses, postStatuses } from "../features/dashboard/dashboardModel";
import { ErrorState, Loading } from "../components/Status";
import { useI18n } from "../../framework/i18n";
import { api, apiBase } from "../lib/api";
import { getStoredUser } from "../lib/auth";
import { canAccessAdminSection } from "../lib/permissions";
import { adminPath } from "../lib/routes";

export function Dashboard() {
  const { t } = useI18n();
  const user = getStoredUser();
  const canPosts = canAccessAdminSection(user, "posts");
  const canPages = canAccessAdminSection(user, "pages");
  const canComments = canAccessAdminSection(user, "comments");
  const canUsers = canAccessAdminSection(user, "users");
  const canPlugins = canAccessAdminSection(user, "plugins");
  const canSettings = canAccessAdminSection(user, "settings");
  const canThemes = canAccessAdminSection(user, "themes");

  const health = useQuery({ queryKey: ["health"], queryFn: api.health });
  const settings = useQuery({ queryKey: ["settings"], queryFn: api.getSettings, enabled: canSettings || canComments });
  const plugins = useQuery({ queryKey: ["plugins"], queryFn: api.listPlugins, enabled: canPlugins });
  const posts = useQuery({
    queryKey: ["dashboard-posts"],
    queryFn: () => api.listAdminPosts("post", { page: 1, per_page: 5 }),
    enabled: canPosts,
  });
  const pages = useQuery({
    queryKey: ["dashboard-pages"],
    queryFn: () => api.listAdminPosts("page", { page: 1, per_page: 1 }),
    enabled: canPages,
  });
  const comments = useQuery({
    queryKey: ["dashboard-comments"],
    queryFn: () => api.listComments({ page: 1, per_page: 5 }),
    enabled: canComments,
  });
  const users = useQuery({
    queryKey: ["dashboard-users"],
    queryFn: () => api.listUsers({ page: 1, per_page: 1 }),
    enabled: canUsers,
  });
  const postStatusQueries = postStatuses.map((status) =>
    useQuery({
      queryKey: ["dashboard-post-status", status.value],
      queryFn: () => api.listAdminPosts("post", { page: 1, per_page: 1, status: status.value }),
      enabled: canPosts,
    }),
  );
  const commentStatusQueries = commentStatuses.map((status) =>
    useQuery({
      queryKey: ["dashboard-comment-status", status.value],
      queryFn: () => api.listComments({ page: 1, per_page: 1, status: status.value }),
      enabled: canComments,
    }),
  );

  const dashboardQueries = [
    health,
    canSettings || canComments ? settings : null,
    canPlugins ? plugins : null,
    canPosts ? posts : null,
    canPages ? pages : null,
    canComments ? comments : null,
    canUsers ? users : null,
  ].filter(Boolean);

  if (dashboardQueries.some((query) => query?.isLoading)) {
    return <Loading />;
  }

  const firstError = dashboardQueries.find((query) => query?.error)?.error;
  if (firstError) {
    return <ErrorState error={firstError} />;
  }

  const activePlugins = canPlugins ? plugins.data?.filter((plugin) => plugin.health.active).length || 0 : 0;
  const pluginCount = canPlugins ? plugins.data?.length || 0 : 0;
  const postTotal = canPosts ? posts.data?.meta.total || 0 : 0;
  const pageTotal = canPages ? pages.data?.meta.total || 0 : 0;
  const commentTotal = canComments ? comments.data?.meta.total || 0 : 0;
  const userTotal = canUsers ? users.data?.meta.total || 0 : 0;
  const postStatusData = postStatuses.map((status, index) => ({
    ...status,
    label: t(status.labelKey),
    valueCount: canPosts ? postStatusQueries[index].data?.meta.total || 0 : 0,
  }));
  const commentStatusData = commentStatuses.map((status, index) => ({
    ...status,
    label: t(status.labelKey),
    valueCount: canComments ? commentStatusQueries[index].data?.meta.total || 0 : 0,
  }));

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>{t("dashboard.title")}</h1>
          <p>{t("dashboard.subtitle", undefined, { apiBase })}</p>
        </div>
        {canSettings ? (
          <Link className="button subtle" to={adminPath("/settings")}>
            <Settings size={16} />
            {t("dashboard.site_settings")}
          </Link>
        ) : null}
      </div>

      <DashboardMetrics
        healthStatus={health.data?.status}
        postTotal={postTotal}
        pageTotal={pageTotal}
        commentTotal={commentTotal}
        userTotal={userTotal}
        canPosts={canPosts}
        canPages={canPages}
        canComments={canComments}
        canUsers={canUsers}
        t={t}
      />

      <DashboardVisualGrid
        canPosts={canPosts}
        canComments={canComments}
        canPlugins={canPlugins}
        postTotal={postTotal}
        commentTotal={commentTotal}
        activePlugins={activePlugins}
        pluginCount={pluginCount}
        commentModeration={settings.data?.comment_moderation}
        postStatusData={postStatusData}
        commentStatusData={commentStatusData}
        t={t}
      />

      <div className="split-grid">
        <QuickActions canPosts={canPosts} canPages={canPages} canComments={canComments} canThemes={canThemes} t={t} />
        {canPosts ? <RecentPostsPanel posts={posts.data?.data} t={t} /> : null}
      </div>
    </section>
  );
}
