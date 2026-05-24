export type PostStatus = "draft" | "pending_review" | "published" | "scheduled" | "archived";
export type PostType = "post" | "page";
export type TermType = "category" | "tag";
export type CommentStatus = "pending" | "approved" | "spam" | "trash";
export type UserRole = "root" | "admin" | "editor" | "author";
export type UserStatus = "active" | "disabled";

export interface Page<T> {
  data: T[];
  meta: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface PublicUser {
  id: number;
  username: string;
  email: string;
  display_name: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_at: number;
  user: PublicUser;
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

export interface Post {
  id: number;
  slug: string;
  title: string;
  markdown: string;
  html: string;
  excerpt?: string | null;
  status: PostStatus;
  post_type: PostType;
  author_id: number;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostResponse extends Post {
  permalink: string;
}

export interface PostRevision {
  id: number;
  post_id: number;
  title: string;
  markdown: string;
  html: string;
  excerpt?: string | null;
  status: PostStatus;
  author_id: number;
  created_at: string;
}

export type BulkPostAction = "publish" | "archive" | "delete";

export interface BulkPostActionResponse {
  action: BulkPostAction;
  affected: number;
  posts: Post[];
}

export interface CreatePostInput {
  slug: string;
  title: string;
  markdown: string;
  html?: string | null;
  excerpt?: string | null;
  status?: PostStatus;
  post_type?: PostType;
  published_at?: string | null;
}

export interface Term {
  id: number;
  slug: string;
  name: string;
  description?: string | null;
  term_type: TermType;
  parent_id?: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface TermResponse extends Term {
  post_count: number;
}

export interface Comment {
  id: number;
  post_id: number;
  parent_id?: number | null;
  author_name: string;
  author_email: string;
  author_url?: string | null;
  content: string;
  status: CommentStatus;
  created_at: string;
  updated_at: string;
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

export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  author: string;
}

export type ConfigFieldType = "text" | "textarea" | "number" | "boolean" | "json";

export interface ConfigField {
  key: string;
  label: string;
  field_type: ConfigFieldType;
  required: boolean;
  default?: unknown;
  help?: string | null;
}

export interface ConfigSchema {
  fields: ConfigField[];
}

export interface PluginInfo {
  manifest: PluginManifest;
  admin_menu: Array<{
    label: string;
    path: string;
    icon?: string | null;
    order: number;
  }>;
  config_schema?: ConfigSchema | null;
  hooks: Array<{
    hook: string;
    priority: number;
  }>;
  health: {
    installed: boolean;
    active: boolean;
    hook_count: number;
    admin_menu_count: number;
    configurable: boolean;
  };
}

export interface PluginConfigResponse {
  plugin: string;
  config: Record<string, unknown>;
}

export interface PluginStateResponse {
  plugin: string;
  enabled: boolean;
}

export interface ThemeInfo {
  name: string;
  version: string;
  description: string;
  author: string;
  preview: string;
  active: boolean;
  schema: ConfigSchema;
}
