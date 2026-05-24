import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useActiveThemeViews } from "../hooks/useActiveThemeViews";
import { useSeo } from "../hooks/useSeo";
import { api } from "../lib/api";
import { groupPostsByMonth } from "../lib/date";
import { absoluteUrl } from "../lib/url";

export function Timeline() {
  const { State, Timeline: TimelineView } = useActiveThemeViews();
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

  if (posts.isLoading) return <State text="加载时间线中..." />;
  if (posts.error) return <State text={posts.error.message} tone="error" />;

  return <TimelineView groups={groups} />;
}
