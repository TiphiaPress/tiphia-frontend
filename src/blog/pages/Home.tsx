import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SiteAvatar } from "../components/SiteAvatar";
import { State } from "../components/State";
import { PostCard } from "../components/PostCard";
import { TermLinks } from "../components/TermLinks";
import { PopularPosts, RecentComments } from "../components/Widgets";
import { FrontendHookSlot } from "../../framework/plugin-hooks";
import { api } from "../lib/api";
import { effectivePageSize, themeBoolean, themeNumber } from "../lib/theme";

export function Home() {
  const settings = useQuery({ queryKey: ["settings"], queryFn: api.settings });
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const posts = useQuery({
    queryKey: ["posts", page, effectivePageSize(settings.data), q],
    queryFn: () => api.posts(page, effectivePageSize(settings.data), q),
  });
  const terms = useQuery({ queryKey: ["terms"], queryFn: api.terms });
  const themeConfig = settings.data?.theme.config || {};
  const showPopularPosts = themeBoolean(themeConfig, "show_popular_posts");
  const showRecentComments = themeBoolean(themeConfig, "show_recent_comments");
  const popularPosts = useQuery({
    queryKey: ["popular-posts", themeNumber(themeConfig, "popular_posts_limit", 5)],
    queryFn: () => api.popularPosts(themeNumber(themeConfig, "popular_posts_limit", 5)),
    enabled: showPopularPosts,
  });
  const recentComments = useQuery({
    queryKey: ["recent-comments", themeNumber(themeConfig, "recent_comments_limit", 5)],
    queryFn: () => api.recentComments(themeNumber(themeConfig, "recent_comments_limit", 5)),
    enabled: showRecentComments,
  });

  if (posts.isLoading) {
    return <State text="加载文章中..." />;
  }
  if (posts.error) {
    return <State text={posts.error.message} tone="error" />;
  }

  return (
    <section className="post-list">
      <FrontendHookSlot hook="blog.home.before" context={{ settings: settings.data }} />
      <div className="hero">
        <SiteAvatar
          avatarUrl={settings.data?.avatar_url}
          baseUrl={settings.data?.base_url}
          title={settings.data?.title || "Tiphia"}
        />
        <h1>{settings.data?.title || "Tiphia"}</h1>
        <p>{settings.data?.description || "A Rust blog powered by Tiphia."}</p>
      </div>
      <FrontendHookSlot hook="blog.home.hero.after" context={{ settings: settings.data }} />
      <form
        className="search-form"
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          void posts.refetch();
        }}
      >
        <input
          placeholder="搜索文章"
          value={q}
          onChange={(event) => {
            setQ(event.target.value);
            setPage(1);
          }}
        />
        <button type="submit">搜索</button>
      </form>
      <FrontendHookSlot hook="blog.search.after" context={{ q }} />
      <TermLinks terms={terms.data?.data || []} showType />
      {showPopularPosts || showRecentComments ? (
        <aside className="home-widgets">
          {showPopularPosts ? <PopularPosts posts={popularPosts.data || []} loading={popularPosts.isLoading} /> : null}
          {showRecentComments ? <RecentComments comments={recentComments.data || []} loading={recentComments.isLoading} /> : null}
        </aside>
      ) : null}
      {posts.data?.data.length ? (
        <>
          <FrontendHookSlot hook="blog.post.list.before" context={{ posts: posts.data.data }} />
          {posts.data.data.map((post) => <PostCard key={post.id} post={post} />)}
          <FrontendHookSlot hook="blog.post.list.after" context={{ posts: posts.data.data }} />
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
              上一页
            </button>
            <span>
              {posts.data.meta.page} / {Math.max(1, posts.data.meta.total_pages)}
            </span>
            <button
              disabled={page >= posts.data.meta.total_pages}
              onClick={() => setPage((current) => current + 1)}
            >
              下一页
            </button>
          </div>
        </>
      ) : (
        <State text="还没有公开文章" />
      )}
      <FrontendHookSlot hook="blog.home.after" context={{ settings: settings.data }} />
    </section>
  );
}

