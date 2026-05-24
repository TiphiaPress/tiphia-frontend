import { BookOpen, MessageSquare, Server, Users } from "lucide-react";
import { Metric } from "./Metric";

interface DashboardMetricsProps {
  healthStatus?: string;
  postTotal: number;
  pageTotal: number;
  commentTotal: number;
  userTotal: number;
  canPosts: boolean;
  canPages: boolean;
  canComments: boolean;
  canUsers: boolean;
  t: (key: string, fallback?: string, vars?: Record<string, string | number>) => string;
}

export function DashboardMetrics({
  healthStatus,
  postTotal,
  pageTotal,
  commentTotal,
  userTotal,
  canPosts,
  canPages,
  canComments,
  canUsers,
  t,
}: DashboardMetricsProps) {
  return (
    <div className="stats-grid">
      <Metric icon={Server} label={t("dashboard.service_status")} value={healthStatus || "unknown"} />
      {canPosts || canPages ? <Metric icon={BookOpen} label={t("dashboard.posts_pages")} value={postTotal + " / " + pageTotal} /> : null}
      {canComments ? <Metric icon={MessageSquare} label={t("dashboard.comments")} value={String(commentTotal)} /> : null}
      {canUsers ? <Metric icon={Users} label={t("dashboard.users")} value={String(userTotal)} /> : null}
    </div>
  );
}
