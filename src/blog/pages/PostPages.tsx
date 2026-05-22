import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { PostStats } from "../components/PostCard";
import { State } from "../components/State";
import { FrontendHookSlot } from "../../framework/plugin-hooks";
import { Comments } from "../features/comments/Comments";
import { useSeo } from "../hooks/useSeo";
import { api } from "../lib/api";
import { stripHtml } from "../lib/text";
import { themeNavPages, type ThemeNavPage } from "../lib/theme";
import { absoluteUrl } from "../lib/url";
import type { PostResponse } from "../types";

export function PostDetail() {
  const { slug = "" } = useParams();
  const settings = useQuery({ queryKey: ["settings"], queryFn: api.settings });
  const post = useQuery({
    queryKey: ["post", slug],
    queryFn: () => api.postBySlug(slug),
  });
  useSeo({
    title: post.data?.title,
    description: post.data?.excerpt || stripHtml(post.data?.html || "").slice(0, 160),
    siteTitle: settings.data?.title,
    suffix: settings.data?.seo.meta_title_suffix,
    canonical: absoluteUrl(settings.data?.base_url, `/posts/${post.data?.slug || slug}`),
    type: "article",
  });

  if (post.isLoading) {
    return <State text="加载文章中..." />;
  }
  if (post.error) {
    return <State text={post.error.message} tone="error" />;
  }
  if (!post.data) {
    return null;
  }

  return <Article post={post.data} showComments />;
}

export function PageDetail() {
  const { slug = "" } = useParams();
  const settings = useQuery({ queryKey: ["settings"], queryFn: api.settings });
  const page = useQuery({
    queryKey: ["page", slug],
    queryFn: () => api.pageBySlug(slug),
  });
  useSeo({
    title: page.data?.title,
    description: page.data?.excerpt || stripHtml(page.data?.html || "").slice(0, 160),
    siteTitle: settings.data?.title,
    suffix: settings.data?.seo.meta_title_suffix,
    canonical: absoluteUrl(settings.data?.base_url, `/pages/${page.data?.slug || slug}`),
  });

  if (page.isLoading) {
    return <State text="加载页面中..." />;
  }
  if (page.error) {
    return <State text={page.error.message} tone="error" />;
  }
  if (!page.data) {
    return null;
  }

  return <Article post={page.data} />;
}

export function CustomPageDetail() {
  const { slug = "" } = useParams();
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

  if (page.isLoading) {
    return <State text="加载页面中..." />;
  }
  if (page.error) {
    return <State text={page.error.message} tone="error" />;
  }
  if (!page.data) {
    return null;
  }

  return (
    <ThemePageRenderer
      post={page.data}
      navPage={navPage}
      slug={slug}
    />
  );
}

function ThemePageRenderer({
  post,
  navPage,
  slug,
}: {
  post: PostResponse;
  navPage?: ThemeNavPage;
  slug: string;
}) {
  if (navPage?.display === "plain") {
    return (
      <article className="article theme-page plain">
        <Link to="/" className="back-link">
          返回首页
        </Link>
        <h1>{post.title}</h1>
        <div className="content">{stripHtml(post.html)}</div>
        <FrontendHookSlot hook="blog.custom-page.after" context={{ post, slug, navPage }} />
        <FrontendHookSlot hook={`blog.custom-page.${slug}`} context={{ post, slug, navPage }} />
      </article>
    );
  }

  return <Article post={post} customPage={{ slug, navPage }} />;
}

function Article({
  post,
  showComments = false,
  customPage,
}: {
  post: PostResponse;
  showComments?: boolean;
  customPage?: { slug: string; navPage?: ThemeNavPage };
}) {
  return (
    <article className="article">
      <Link to="/" className="back-link">
        返回首页
      </Link>
      <h1>{post.title}</h1>
      <time>{new Date(post.published_at || post.created_at).toLocaleString()}</time>
      <PostStats post={post} />
      <FrontendHookSlot hook="blog.post.content.before" context={{ post }} />
      <div className="content" dangerouslySetInnerHTML={{ __html: post.html }} />
      {customPage ? (
        <>
          <FrontendHookSlot hook="blog.custom-page.after" context={{ post, ...customPage }} />
          <FrontendHookSlot hook={`blog.custom-page.${customPage.slug}`} context={{ post, ...customPage }} />
        </>
      ) : null}
      <FrontendHookSlot hook="blog.post.content.after" context={{ post }} />
      {showComments ? <Comments postId={post.id} /> : null}
    </article>
  );
}

