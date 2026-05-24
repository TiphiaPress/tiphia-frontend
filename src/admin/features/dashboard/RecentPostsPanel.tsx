import { Clock3 } from "lucide-react";
import { Link } from "react-router-dom";
import { adminPath } from "../../lib/routes";
import type { PostResponse } from "../../types";

interface RecentPostsPanelProps {
  posts?: PostResponse[];
  t: (key: string, fallback?: string, vars?: Record<string, string | number>) => string;
}

export function RecentPostsPanel({ posts = [], t }: RecentPostsPanelProps) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>{t("dashboard.recent_posts")}</h2>
        <Link to={adminPath("/posts")}>{t("action.view_all")}</Link>
      </div>
      <div className="activity-list">
        {posts.length ? posts.map((post) => (
          <Link to={adminPath("/posts/" + post.id + "/edit")} key={post.id}>
            <span>
              <strong>{post.title}</strong>
              <small>{post.status} · {new Date(post.updated_at).toLocaleString()}</small>
            </span>
            <Clock3 size={16} />
          </Link>
        )) : <p className="muted">{t("dashboard.no_posts")}</p>}
      </div>
    </section>
  );
}
