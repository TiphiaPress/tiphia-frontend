import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { State } from "../components/State";
import { useSeo } from "../hooks/useSeo";
import { api } from "../lib/api";
import { groupPostsByMonth } from "../lib/date";
import { absoluteUrl } from "../lib/url";

export function Timeline() {
  const settings = useQuery({ queryKey: ["settings"], queryFn: api.settings });
  const posts = useQuery({
    queryKey: ["posts", "timeline", settings.data?.default_page_size],
    queryFn: () => api.posts(1, 100),
  });
  const groups = useMemo(() => groupPostsByMonth(posts.data?.data || []), [posts.data?.data]);
  useSeo({
    title: "时间线",
    description: "按发布时间回看所有公开文章",
    siteTitle: settings.data?.title,
    suffix: settings.data?.seo.meta_title_suffix,
    canonical: absoluteUrl(settings.data?.base_url, "/timeline"),
  });

  if (posts.isLoading) {
    return <State text="加载时间线中..." />;
  }
  if (posts.error) {
    return <State text={posts.error.message} tone="error" />;
  }

  return (
    <section className="timeline">
      <div className="hero compact-hero">
        <Link className="back-link" to="/">返回首页</Link>
        <h1>时间线</h1>
        <p>按发布时间回看所有公开文章</p>
      </div>
      {groups.length ? (
        <div className="timeline-list">
          {groups.map((group) => (
            <section key={group.key} className="timeline-group">
              <h2>{group.label}</h2>
              <div>
                {group.posts.map((post) => (
                  <Link key={post.id} className="timeline-item" to={`/posts/${post.slug}`}>
                    <time>{new Date(post.published_at || post.created_at).toLocaleDateString()}</time>
                    <span>{post.title}</span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <State text="还没有公开文章" />
      )}
    </section>
  );
}

