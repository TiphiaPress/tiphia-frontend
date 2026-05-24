export interface Page<T> {
  data: T[];
  meta: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface PostResponse {
  id: number;
  slug: string;
  title: string;
  markdown: string;
  html: string;
  excerpt?: string | null;
  status: "published" | "scheduled";
  post_type: "post" | "page";
  author_id: number;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  permalink: string;
  view_count: number;
  comment_count: number;
}

export interface RecentComment {
  id: number;
  post_id: number;
  parent_id?: number | null;
  author_name: string;
  author_url?: string | null;
  content: string;
  status: "approved";
  created_at: string;
  updated_at: string;
  post_slug: string;
  post_title: string;
}

export interface SiteSettings {
  title: string;
  description: string;
  avatar_url?: string | null;
  gravatar_base_url?: string | null;
  base_url?: string | null;
  timezone: string;
  default_page_size: number;
  comments_enabled: boolean;
  comment_moderation: boolean;
  registration_enabled: boolean;
  permalink_format: string;
  theme: {
    active: string;
    configs?: Record<string, Record<string, unknown>>;
    config: Record<string, unknown>;
    configs_migrated?: boolean;
  };
  seo: {
    meta_title_suffix?: string | null;
    meta_description?: string | null;
  };
}

export interface CommentNode {
  id: number;
  post_id: number;
  parent_id?: number | null;
  author_name: string;
  author_email: string;
  author_url?: string | null;
  content: string;
  status: "pending" | "approved" | "spam" | "trash";
  created_at: string;
  updated_at: string;
  children: CommentNode[];
}

export interface TermResponse {
  id: number;
  slug: string;
  name: string;
  description?: string | null;
  term_type: "category" | "tag";
  parent_id?: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  post_count: number;
}

export interface AuthStatus {
  initialized: boolean;
  registration_enabled: boolean;
}

export interface GeetestConfig {
  enabled: boolean;
  captcha_id?: string | null;
  verify_login: boolean;
  verify_register: boolean;
  verify_comment: boolean;
  product?: "float" | "popup" | "bind" | null;
  native_button_width?: string | null;
  native_button_height?: string | null;
  rem?: number | null;
  language?: string | null;
  protocol?: "http://" | "https://" | null;
  timeout?: number | null;
  next_width?: string | null;
  mask_outside?: boolean | null;
  mask_bg_color?: string | null;
  hide_success?: boolean | null;
}

export interface PluginInfo {
  manifest: {
    name: string;
    version: string;
    description: string;
    author: string;
  };
  health: {
    active: boolean;
  };
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_at: number;
  user: {
    id: number;
    username: string;
    email: string;
    display_name: string;
    role: "root" | "admin" | "editor" | "author";
    status: "active" | "disabled";
  };
}
