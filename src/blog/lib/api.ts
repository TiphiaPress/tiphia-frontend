import { resolveApiBase } from "../../framework/api-base";
import type {
  CommentNode,
  AuthStatus,
  GeetestConfig,
  Page,
  PluginInfo,
  PostResponse,
  RecentComment,
  SiteSettings,
  TermResponse,
  TokenResponse,
} from "../types";

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export const apiBase = resolveApiBase();

async function request<T>(path: string): Promise<T> {
  return requestWithInit<T>(path);
}

async function requestWithInit<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers,
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = body?.error?.message || response.statusText;
    throw new ApiRequestError(message, response.status, body?.error?.code);
  }
  return body as T;
}

export const api = {
  settings: () => request<SiteSettings>("/api/v1/settings"),
  posts: (page = 1, perPage = 10, q = "", termId?: number) => {
    const search = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
    });
    if (q.trim()) {
      search.set("q", q.trim());
    }
    if (termId) {
      search.set("term_id", String(termId));
    }
    return request<Page<PostResponse>>(`/api/v1/posts?${search.toString()}`);
  },
  pages: () => request<Page<PostResponse>>("/api/v1/pages?page=1&per_page=20"),
  popularPosts: (limit = 5) => request<PostResponse[]>(`/api/v1/posts/popular?limit=${limit}`),
  pinnedPosts: async (ids: number[] = [], slugs: string[] = []) => {
    const byId = await Promise.all(ids.map((id) => request<PostResponse>(`/api/v1/posts/${id}`).catch(() => null)));
    const bySlug = await Promise.all(slugs.map((slug) => request<PostResponse>(`/api/v1/posts/slug/${encodeURIComponent(slug)}`).catch(() => null)));
    const posts = [...byId, ...bySlug].filter((post): post is PostResponse => Boolean(post));
    return Array.from(new Map(posts.map((post) => [post.id, post])).values());
  },
  terms: () => request<Page<TermResponse>>("/api/v1/terms?page=1&per_page=100"),
  postBySlug: (slug: string) => request<PostResponse>(`/api/v1/posts/slug/${slug}`),
  pageBySlug: (slug: string) => request<PostResponse>(`/api/v1/pages/slug/${slug}`),
  comments: (postId: number) => request<CommentNode[]>(`/api/v1/comments/post/${postId}/tree`),
  recentComments: (limit = 5) => request<RecentComment[]>(`/api/v1/comments/recent?limit=${limit}`),
  authStatus: () => request<AuthStatus>("/api/v1/auth/status"),
  geetestConfig: () => request<GeetestConfig>("/api/v1/geetest/config"),
  plugins: () => request<PluginInfo[]>("/api/v1/plugins"),
  register: (input: {
    username: string;
    email: string;
    password: string;
    display_name?: string | null;
    captcha?: Record<string, unknown> | null;
    extensions?: Record<string, unknown>;
  }) =>
    requestWithInit<TokenResponse>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  createComment: (input: {
    post_id: number;
    parent_id?: number | null;
    author_name: string;
    author_email: string;
    author_url?: string | null;
    content: string;
    captcha?: Record<string, unknown> | null;
    extensions?: Record<string, unknown>;
  }) =>
    requestWithInit<CommentNode>("/api/v1/comments", {
      method: "POST",
      body: JSON.stringify(input),
    }),
};
