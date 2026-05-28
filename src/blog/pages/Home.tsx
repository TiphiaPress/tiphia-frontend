import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useActiveThemeViews } from "../hooks/useActiveThemeViews";
import { api } from "../lib/api";
import { effectivePageSize, themeBoolean, themeNumber, themeNumberArray, themeStringArray } from "../lib/theme";

export function Home() {
  const { State, Home: HomeView } = useActiveThemeViews();
  const settings = useQuery({ queryKey: ["settings"], queryFn: api.settings });
  const [page, setPage] = useState(1);
  const [draftQ, setDraftQ] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const themeConfig = settings.data?.theme.config || {};
  const pinnedIds = themeNumberArray(themeConfig, "pinned_post_ids");
  const pinnedSlugs = themeStringArray(themeConfig, "pinned_post_slugs");
  const posts = useQuery({
    queryKey: ["posts", page, effectivePageSize(settings.data), searchQ],
    queryFn: () => api.posts(page, effectivePageSize(settings.data), searchQ),
    placeholderData: (previousData) => previousData,
  });
  const pinnedPosts = useQuery({
    queryKey: ["pinned-posts", pinnedIds.join(","), pinnedSlugs.join(",")],
    queryFn: () => api.pinnedPosts(pinnedIds, pinnedSlugs),
    enabled: pinnedIds.length > 0 || pinnedSlugs.length > 0,
  });
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
  if (!posts.data) {
    return null;
  }

  return (
    <HomeView
      settings={settings.data}
      q={draftQ}
      onQueryChange={setDraftQ}
      onSearch={() => {
        setPage(1);
        setSearchQ(draftQ.trim());
      }}
      posts={posts.data}
      pinnedPosts={page === 1 && !searchQ ? pinnedPosts.data || [] : []}
      page={page}
      onPageChange={setPage}
      showPopularPosts={showPopularPosts}
      showRecentComments={showRecentComments}
      popularPosts={popularPosts.data || []}
      recentComments={recentComments.data || []}
      popularPostsLoading={popularPosts.isLoading}
      recentCommentsLoading={recentComments.isLoading}
    />
  );
}
