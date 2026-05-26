import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Comments } from "../features/comments/Comments";
import { useActiveThemeViews } from "../hooks/useActiveThemeViews";
import { useSeo } from "../hooks/useSeo";
import { api } from "../lib/api";
import { stripHtml } from "../lib/text";
import { themeNavPages, type ThemeNavPage } from "../lib/theme";
import { absoluteUrl } from "../lib/url";
import type { PostResponse } from "../types";

export function PostDetail() {
  const { State, Article } = useActiveThemeViews();
  const { slug = "" } = useParams();
  const settings = useQuery({ queryKey: ["settings"], queryFn: api.settings });
  const post = useQuery({ queryKey: ["post", slug], queryFn: () => api.postBySlug(slug) });
  useSeo({
    title: post.data?.title,
    description: post.data?.excerpt || stripHtml(post.data?.html || "").slice(0, 160),
    siteTitle: settings.data?.title,
    suffix: settings.data?.seo.meta_title_suffix,
    canonical: absoluteUrl(settings.data?.base_url, `/posts/${post.data?.slug || slug}`),
    type: "article",
  });

  if (post.isLoading) return <State text="加载文章中..." />;
  if (post.error) return <State text={post.error.message} tone="error" />;
  if (!post.data) return null;

  return <Article post={post.data} showComments comments={<Comments postId={post.data.id} />} />;
}

export function PageDetail() {
  const { State, Article } = useActiveThemeViews();
  const { slug = "" } = useParams();
  const settings = useQuery({ queryKey: ["settings"], queryFn: api.settings });
  const page = useQuery({ queryKey: ["page", slug], queryFn: () => api.pageBySlug(slug) });
  useSeo({
    title: page.data?.title,
    description: page.data?.excerpt || stripHtml(page.data?.html || "").slice(0, 160),
    siteTitle: settings.data?.title,
    suffix: settings.data?.seo.meta_title_suffix,
    canonical: absoluteUrl(settings.data?.base_url, `/pages/${page.data?.slug || slug}`),
  });

  if (page.isLoading) return <State text="加载页面中..." />;
  if (page.error) return <State text={page.error.message} tone="error" />;
  if (!page.data) return null;

  return <Article post={page.data} showComments comments={<Comments postId={page.data.id} />} />;
}

export function CustomPageDetail({ fixedSlug }: { fixedSlug?: string }) {
  const { State } = useActiveThemeViews();
  const params = useParams();
  const slug = fixedSlug || params.slug || "";
  const settings = useQuery({ queryKey: ["settings"], queryFn: api.settings });
  const navPage = themeNavPages(settings.data?.theme.config).find((item) => item.slug === slug);
  const page = useQuery({
    queryKey: ["custom-page", slug],
    queryFn: () => api.pageBySlug(slug),
    enabled: Boolean(slug),
  });
  useSeo({
    title: page.data?.title || navPage?.label,
    description: page.data?.excerpt || stripHtml(page.data?.html || "").slice(0, 160),
    siteTitle: settings.data?.title,
    suffix: settings.data?.seo.meta_title_suffix,
    canonical: absoluteUrl(settings.data?.base_url, `/custom-pages/${slug}`),
  });

  if (page.isLoading) return <State text="加载页面中..." />;
  if (page.error) return <State text={page.error.message} tone="error" />;
  if (!page.data) return null;

  return <ThemePageRenderer post={page.data} navPage={navPage} slug={slug} />;
}

function ThemePageRenderer({ post, navPage, slug }: { post: PostResponse; navPage?: ThemeNavPage; slug: string }) {
  const { Article, PlainPage } = useActiveThemeViews();
  if (navPage?.display === "plain") {
    return <PlainPage post={post} navPage={navPage} slug={slug} showComments comments={<Comments postId={post.id} />} />;
  }
  return <Article post={post} customPage={{ slug, navPage }} showComments comments={<Comments postId={post.id} />} />;
}
