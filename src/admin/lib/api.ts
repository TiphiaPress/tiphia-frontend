import { clearSession, getToken } from "./auth";
import type {
  Comment,
  CommentStatus,
  CreatePostInput,
  GeetestConfig,
  BulkPostAction,
  BulkPostActionResponse,
  AuthStatus,
  Page,
  PluginConfigResponse,
  PluginInfo,
  PluginStateResponse,
  Post,
  PostResponse,
  PostRevision,
  PostStatus,
  PostType,
  PublicUser,
  SiteSettings,
  Term,
  TermResponse,
  TermType,
  ThemeInfo,
  TokenResponse,
  UserRole,
  UserStatus,
} from "../types";

const configuredBase = import.meta.env.VITE_TIPHIA_API_BASE as string | undefined;
export const apiBase = (configuredBase || "http://127.0.0.1:3000").replace(/\/$/, "");

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

type Query = Record<string, string | number | boolean | null | undefined>;

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getToken();

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    clearSession();
  }

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const error = body?.error;
    throw new ApiError(response.status, error?.message || response.statusText, error?.code);
  }

  return body as T;
}

function query(params: Query) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const raw = search.toString();
  return raw ? `?${raw}` : "";
}

export const api = {
  health: () => request<{ status: string; version: string; checked_at: string }>("/health"),
  openapi: () => request<Record<string, unknown>>("/openapi.json"),

  bootstrap: (input: {
    username: string;
    email: string;
    password: string;
    display_name?: string | null;
  }) => request<TokenResponse>("/api/v1/auth/bootstrap", post(input)),
  authStatus: () => request<AuthStatus>("/api/v1/auth/status"),
  geetestConfig: () => request<GeetestConfig>("/api/v1/geetest/config"),
  register: (input: {
    username: string;
    email: string;
    password: string;
    display_name?: string | null;
    captcha?: Record<string, unknown> | null;
  }) => request<TokenResponse>("/api/v1/auth/register", post(input)),
  login: (input: { account: string; password: string; captcha?: Record<string, unknown> | null }) =>
    request<TokenResponse>("/api/v1/auth/login", post(input)),
  me: () => request<PublicUser>("/api/v1/auth/me"),

  listPosts: (postType: PostType, params: { page?: number; per_page?: number; status?: PostStatus; q?: string }) =>
    request<Page<PostResponse>>(`/api/v1/${postType === "page" ? "pages" : "posts"}${query(params)}`),
  listAdminPosts: (postType: PostType, params: { page?: number; per_page?: number; status?: PostStatus; q?: string; term_id?: number }) =>
    request<Page<PostResponse>>(`/api/v1/${postType === "page" ? "pages" : "posts"}/admin${query(params)}`),
  getPost: (postType: PostType, id: number) =>
    request<PostResponse>(`/api/v1/${postType === "page" ? "pages" : "posts"}/${id}`),
  getAdminPost: (postType: PostType, id: number) =>
    request<PostResponse>(`/api/v1/${postType === "page" ? "pages" : "posts"}/admin/${id}`),
  createPost: (postType: PostType, input: CreatePostInput) =>
    request<Post>(
      `/api/v1/${postType === "page" ? "pages" : "posts"}`,
      post(compactBody({ ...input, post_type: postType })),
    ),
  updatePost: (postType: PostType, id: number, input: Partial<CreatePostInput>) =>
    request<Post>(`/api/v1/${postType === "page" ? "pages" : "posts"}/${id}`, put(input)),
  deletePost: (postType: PostType, id: number) =>
    request<Post>(`/api/v1/${postType === "page" ? "pages" : "posts"}/${id}`, { method: "DELETE" }),
  listRevisions: (postType: PostType, id: number) =>
    request<PostRevision[]>(`/api/v1/${postType === "page" ? "pages" : "posts"}/${id}/revisions`),
  restoreRevision: (postType: PostType, id: number, revisionId: number) =>
    request<Post>(`/api/v1/${postType === "page" ? "pages" : "posts"}/${id}/revisions/${revisionId}/restore`, put({})),
  bulkPostAction: (postType: PostType, input: { ids: number[]; action: BulkPostAction; published_at?: string | null }) =>
    request<BulkPostActionResponse>(`/api/v1/${postType === "page" ? "pages" : "posts"}/bulk`, put(input)),
  postTerms: (postType: PostType, id: number) =>
    request<Term[]>(`/api/v1/${postType === "page" ? "pages" : "posts"}/${id}/terms`),
  syncPostTerms: (postType: PostType, id: number, term_ids: number[]) =>
    request<Term[]>(`/api/v1/${postType === "page" ? "pages" : "posts"}/${id}/terms`, put({ term_ids })),

  listComments: (params: { page?: number; per_page?: number; status?: CommentStatus; post_id?: number }) =>
    request<Page<Comment>>(`/api/v1/comments${query(params)}`),
  moderateComment: (id: number, status: CommentStatus) =>
    request<Comment>(`/api/v1/comments/${id}/moderation`, put({ status })),

  listTerms: (params: { page?: number; per_page?: number; term_type?: TermType }) =>
    request<Page<TermResponse>>(`/api/v1/terms${query(params)}`),
  createTerm: (input: {
    slug: string;
    name: string;
    description?: string | null;
    term_type: TermType;
    parent_id?: number | null;
    sort_order?: number | null;
  }) => request<Term>("/api/v1/terms", post(compactBody(input))),
  updateTerm: (id: number, input: Partial<Term>) => request<Term>(`/api/v1/terms/${id}`, put(input)),
  deleteTerm: (id: number) => request<Term>(`/api/v1/terms/${id}`, { method: "DELETE" }),

  getSettings: () => request<SiteSettings>("/api/v1/settings"),
  updateSettings: (settings: SiteSettings) => request<SiteSettings>("/api/v1/settings", put(settings)),
  listThemes: () => request<ThemeInfo[]>("/api/v1/themes"),

  listUsers: (params: { page?: number; per_page?: number }) =>
    request<Page<PublicUser>>(`/api/v1/users${query(params)}`),
  createUser: (input: {
    username: string;
    email: string;
    password: string;
    display_name: string;
    role: UserRole;
  }) => request<PublicUser>("/api/v1/users", post(input)),
  updateUser: (id: number, input: { email?: string; display_name?: string; role?: UserRole; status?: UserStatus }) =>
    request<PublicUser>(`/api/v1/users/${id}`, put(input)),

  listPlugins: () => request<PluginInfo[]>("/api/v1/plugins"),
  pluginConfig: (name: string) => request<PluginConfigResponse>(`/api/v1/plugins/${name}/config`),
  updatePluginConfig: (name: string, config: Record<string, unknown>) =>
    request<PluginConfigResponse>(`/api/v1/plugins/${name}/config`, put({ config })),
  updatePluginState: (name: string, enabled: boolean) =>
    request<PluginStateResponse>(`/api/v1/plugins/${name}/state`, put({ enabled })),
};

function post(body: unknown): RequestInit {
  return {
    method: "POST",
    body: JSON.stringify(body),
  };
}

function put(body: unknown): RequestInit {
  return {
    method: "PUT",
    body: JSON.stringify(body),
  };
}

function compactBody<T extends Record<string, unknown>>(body: T): T {
  return Object.fromEntries(
    Object.entries(body).filter(([, value]) => value !== ""),
  ) as T;
}
