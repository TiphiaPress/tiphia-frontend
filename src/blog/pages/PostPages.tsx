import { useQuery } from "@tanstack/react-query";
import { Navigate, useParams } from "react-router-dom";
import { Comments } from "../features/comments/Comments";
import { useActiveThemeViews } from "../hooks/useActiveThemeViews";
import { useSeo } from "../hooks/useSeo";
import { api } from "../lib/api";
import { stripHtml } from "../lib/text";
import { themeNavPages, type ThemeNavPage } from "../lib/theme";
import { absoluteUrl } from "../lib/url";
import type { PostResponse } from "../types";
import { isNotFoundError, notFoundPath } from "./NotFound";

export function PostDetail() {
  const { State, Article } = useActiveThemeViews();
  const { slug = "" } = useParams();
  const settings = useQuery({ queryKey: ["settings"], queryFn: api.settings });
  const post = useQuery({ queryKey: ["post", slug], queryFn: () => api.postBySlug(slug), enabled: Boolean(slug) });
  const currentPath = `/posts/${slug}`;
  useSeo({
    title: post.data?.title,
    description: post.data?.excerpt || stripHtml(post.data?.html || "").slice(0, 160),
    siteTitle: settings.data?.title,
    suffix: settings.data?.seo.meta_title_suffix,
    canonical: absoluteUrl(settings.data?.base_url, `/posts/${post.data?.slug || slug}`),
    type: "article",
  });

  if (!slug) return <Navigate to={notFoundPath(currentPath)} replace />;
  if (post.isLoading) return <State text="加载文章中..." />;
  if (post.error && isNotFoundError(post.error)) return <Navigate to={notFoundPath(currentPath)} replace />;
  if (post.error) return <State text={post.error.message} tone="error" />;
  if (!post.data) return <Navigate to={notFoundPath(currentPath)} replace />;

  return <Article post={post.data} showComments comments={<Comments postId={post.data.id} />} />;
}

export function PageDetail() {
  const { State, Article } = useActiveThemeViews();
  const { slug = "" } = useParams();
  const settings = useQuery({ queryKey: ["settings"], queryFn: api.settings });
  const page = useQuery({ queryKey: ["page", slug], queryFn: () => api.pageBySlug(slug), enabled: Boolean(slug) });
  const currentPath = `/pages/${slug}`;
  useSeo({
    title: page.data?.title,
    description: page.data?.excerpt || stripHtml(page.data?.html || "").slice(0, 160),
    siteTitle: settings.data?.title,
    suffix: settings.data?.seo.meta_title_suffix,
    canonical: absoluteUrl(settings.data?.base_url, `/pages/${page.data?.slug || slug}`),
  });

  if (!slug) return <Navigate to={notFoundPath(currentPath)} replace />;
  if (page.isLoading) return <State text="加载页面中..." />;
  if (page.error && isNotFoundError(page.error)) return <Navigate to={notFoundPath(currentPath)} replace />;
  if (page.error) return <State text={page.error.message} tone="error" />;
  if (!page.data) return <Navigate to={notFoundPath(currentPath)} replace />;

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
  const currentPath = fixedSlug === "links" ? "/links" : `/custom-pages/${slug}`;
  useSeo({
    title: page.data?.title || navPage?.label,
    description: page.data?.excerpt || stripHtml(page.data?.html || "").slice(0, 160),
    siteTitle: settings.data?.title,
    suffix: settings.data?.seo.meta_title_suffix,
    canonical: absoluteUrl(settings.data?.base_url, currentPath),
  });

  if (!slug) return <Navigate to={notFoundPath(currentPath)} replace />;
  if (page.isLoading) return <State text="加载页面中..." />;
  if (page.error && isNotFoundError(page.error)) return <Navigate to={notFoundPath(currentPath)} replace />;
  if (page.error) return <State text={page.error.message} tone="error" />;
  if (!page.data) return <Navigate to={notFoundPath(currentPath)} replace />;

  return <ThemePageRenderer post={page.data} navPage={navPage} slug={slug} />;
}

function ThemePageRenderer({ post, navPage, slug }: { post: PostResponse; navPage?: ThemeNavPage; slug: string }) {
  const { Article, PlainPage } = useActiveThemeViews();
  if (navPage?.display === "plain") {
    return <PlainPage post={post} navPage={navPage} slug={slug} showComments comments={<Comments postId={post.id} />} />;
  }
  return <Article post={post} customPage={{ slug, navPage }} showComments comments={<Comments postId={post.id} />} />;
}
