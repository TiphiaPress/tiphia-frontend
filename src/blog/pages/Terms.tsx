import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useActiveThemeViews } from "../hooks/useActiveThemeViews";
import { useSeo } from "../hooks/useSeo";
import { api } from "../lib/api";
import { effectivePageSize } from "../lib/theme";
import { absoluteUrl } from "../lib/url";

export function TermDirectory({ type }: { type: "category" | "tag" }) {
  const { State, TermDirectory: TermDirectoryView } = useActiveThemeViews();
  const terms = useQuery({ queryKey: ["terms"], queryFn: api.terms });
  const filtered = useMemo(
    () => (terms.data?.data || []).filter((term) => term.term_type === type),
    [terms.data?.data, type],
  );
  const title = type === "category" ? "分类" : "标签";

  if (terms.isLoading) return <State text={`加载${title}中...`} />;
  if (terms.error) return <State text={terms.error.message} tone="error" />;

  return <TermDirectoryView type={type} terms={filtered} />;
}

export function TermArchive() {
  const { State, TermArchive: TermArchiveView } = useActiveThemeViews();
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

  if (posts.isLoading) return <State text="加载归档中..." />;
  if (posts.error) return <State text={posts.error.message} tone="error" />;
  if (!posts.data) return null;

  return <TermArchiveView term={term} termId={termId} posts={posts.data} page={page} onPageChange={setPage} />;
}
