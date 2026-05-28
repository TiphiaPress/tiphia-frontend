import type { ComponentType, ReactNode } from "react";
import type { PublicUser } from "../admin/types";
import type { DefaultThemeLayoutProps } from "./default";
import type { CommentFormState } from "../blog/hooks/useRememberedCommentForm";
import type { ThemeNavPage } from "../blog/lib/theme";
import type { CommentNode, Page, PostResponse, RecentComment, SiteSettings, TermResponse } from "../blog/types";

export type BlogThemeLayout = ComponentType<DefaultThemeLayoutProps>;

export interface BlogThemeViews {
  State: ComponentType<{ text: string; tone?: "error" }>;
  PostCard: ComponentType<{ post: PostResponse }>;
  PostStats: ComponentType<{ post: PostResponse }>;
  PopularPosts: ComponentType<{ posts: PostResponse[]; loading: boolean }>;
  RecentComments: ComponentType<{ comments: RecentComment[]; loading: boolean }>;
  Home: ComponentType<{
    settings?: SiteSettings;
    q: string;
    onQueryChange: (value: string) => void;
    onSearch: () => void;
    posts: Page<PostResponse>;
    pinnedPosts?: PostResponse[];
    page: number;
    onPageChange: (page: number) => void;
    showPopularPosts: boolean;
    showRecentComments: boolean;
    popularPosts: PostResponse[];
    recentComments: RecentComment[];
    popularPostsLoading: boolean;
    recentCommentsLoading: boolean;
  }>;
  Article: ComponentType<{
    post: PostResponse;
    showComments?: boolean;
    comments?: ReactNode;
    customPage?: { slug: string; navPage?: ThemeNavPage };
  }>;
  PlainPage: ComponentType<{ post: PostResponse; slug: string; navPage?: ThemeNavPage; showComments?: boolean; comments?: ReactNode }>;
  TermDirectory: ComponentType<{ type: "category" | "tag"; terms: TermResponse[] }>;
  TermArchive: ComponentType<{
    term?: TermResponse;
    termId: number;
    posts: Page<PostResponse>;
    pinnedPosts?: PostResponse[];
    page: number;
    onPageChange: (page: number) => void;
  }>;
  Timeline: ComponentType<{ groups: Array<{ key: string; label: string; posts: PostResponse[] }> }>;
  Register: ComponentType<{
    registrationEnabled?: boolean;
    form: { username: string; email: string; display_name: string; password: string };
    onFormChange: (form: { username: string; email: string; display_name: string; password: string }) => void;
    onSubmit: () => void;
    pending: boolean;
    error?: Error | null;
    success: boolean;
    captchaRequired: boolean;
    captcha: Record<string, unknown> | null;
    onCaptcha: (value: Record<string, unknown> | null) => void;
  }>;
  Comments: ComponentType<{ postId: number; comments: CommentNode[]; children: ReactNode; form: ReactNode }>;
  CommentItem: ComponentType<{
    comment: CommentNode;
    replying: boolean;
    onToggleReply: () => void;
    replyForm?: ReactNode;
    children?: ReactNode;
    depth?: number;
    gravatarBaseUrl?: string | null;
  }>;
  ExternalWarning: ComponentType<{ target: string }>;
  NotFound: ComponentType<{ path: string }>;
  CommentForm: ComponentType<{
    title: string;
    form: CommentFormState;
    currentUser?: PublicUser | null;
    pending: boolean;
    error: unknown;
    successText: string;
    captchaRequired: boolean;
    captcha?: Record<string, unknown> | null;
    onCaptcha?: (value: Record<string, unknown> | null) => void;
    onFormChange: (form: CommentFormState) => void;
    onSubmit: () => void;
  }>;
}

export interface ThemeConfigPanelProps {
  theme: BlogTheme;
  value: Record<string, unknown>;
  saving: boolean;
  error?: unknown;
  onSubmit: (value: Record<string, unknown>) => Promise<void> | void;
}

export type ThemeConfigPanel = ComponentType<ThemeConfigPanelProps>;

export interface BlogTheme {
  name: string;
  faviconUrl?: string;
  ConfigPanel?: ThemeConfigPanel;
  BootstrapLoading?: ComponentType;
  Layout: BlogThemeLayout;
  views: BlogThemeViews;
}







