import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PostCard } from "../components/PostCard";
import { State } from "../components/State";
import { api } from "../lib/api";
import { absoluteUrl } from "../lib/url";
import { effectivePageSize } from "../lib/theme";
import { useSeo } from "../hooks/useSeo";

export function TermDirectory({ type }: { type: "category" | "tag" }) {
  const terms = useQuery({ queryKey: ["terms"], queryFn: api.terms });
  const filtered = useMemo(
    () => (terms.data?.data || []).filter((term) => term.term_type === type),
    [terms.data?.data, type],
  );
  const title = type === "category" ? "分类" : "标签";
  const description = type === "category" ? "按主题浏览文章集合" : "按关键词发现相关内容";

  if (terms.isLoading) {
    return <State text={`加载${title}中...`} />;
  }
  if (terms.error) {
    return <State text={terms.error.message} tone="error" />;
  }

  return (
    <section className="directory">
      <div className="hero compact-hero">
        <Link className="back-link" to="/">返回首页</Link>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {filtered.length ? (
        <div className="term-grid">
          {filtered.map((term) => (
            <Link key={term.id} className="term-tile" to={`/terms/${term.id}`}>
              <span>{term.name}</span>
              <small>{term.description || term.slug}</small>
              <strong>{term.post_count} 篇文章</strong>
            </Link>
          ))}
        </div>
      ) : (
        <State text={`还没有${title}`} />
      )}
    </section>
  );
}

export function TermArchive() {
  const { id = "" } = useParams();
  const termId = Number(id);
  const [page, setPage] = useState(1);
  const settings = useQuery({ queryKey: ["settings"], queryFn: api.settings });
  const terms = useQuery({ queryKey: ["terms"], queryFn: api.terms });
  const term = terms.data?.data.find((item) => item.id === termId);
  const posts = useQuery({
    queryKey: ["posts", "term", termId, page],
    queryFn: () => api.posts(page, effectivePageSize(settings.data), "", termId),
    enabled: Number.isFinite(termId),
  });
  useSeo({
    title: term?.name || `归档 #${termId}`,
    description: term?.description || "按分类或标签浏览文章",
    siteTitle: settings.data?.title,
    suffix: settings.data?.seo.meta_title_suffix,
    canonical: absoluteUrl(settings.data?.base_url, `/terms/${termId}`),
  });

  if (posts.isLoading) {
    return <State text="加载归档中..." />;
  }
  if (posts.error) {
    return <State text={posts.error.message} tone="error" />;
  }

  return (
    <section className="post-list">
      <div className="hero compact-hero">
        <Link className="back-link" to="/">返回首页</Link>
        <div className="term-heading">
          <span>{term?.term_type === "tag" ? "标签" : "分类"}</span>
          <h1>{term?.name || `归档 #${termId}`}</h1>
        </div>
        <p>{term?.description || "按分类或标签浏览文章"}</p>
      </div>
      {posts.data?.data.length ? (
        <>
          {posts.data.data.map((post) => <PostCard key={post.id} post={post} />)}
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
              上一页
            </button>
            <span>
              {posts.data.meta.page} / {Math.max(1, posts.data.meta.total_pages)}
            </span>
            <button disabled={page >= posts.data.meta.total_pages} onClick={() => setPage((current) => current + 1)}>
              下一页
            </button>
          </div>
        </>
      ) : (
        <State text="这个归档下还没有公开文章" />
      )}
    </section>
  );
}

