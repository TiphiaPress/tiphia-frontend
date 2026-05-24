import { DefaultThemeLayout } from "./default";
import { DefaultThemeConfigPanel } from "./default/ThemeConfigPanel";
import defaultFaviconUrl from "./default/favicon.ico";
import { DefaultExternalWarningView } from "./default/ExternalWarningPage";
import { PostCard, PostStats } from "./default/components/PostCard";
import { State } from "./default/components/State";
import { PopularPosts, RecentComments } from "./default/components/Widgets";
import {
  DefaultArticleView,
  DefaultCommentFormView,
  DefaultCommentItemView,
  DefaultCommentsView,
  DefaultHomeView,
  DefaultPlainPageView,
  DefaultRegisterView,
  DefaultTermArchiveView,
  DefaultTermDirectoryView,
  DefaultTimelineView,
} from "./default/views";
import type { BlogTheme } from "./types";

const themes: Record<string, BlogTheme> = {
  default: {
    name: "default",
    faviconUrl: defaultFaviconUrl,
    ConfigPanel: DefaultThemeConfigPanel,
    Layout: DefaultThemeLayout,
    views: {
      State,
      PostCard,
      PostStats,
      PopularPosts,
      RecentComments,
      Home: DefaultHomeView,
      Article: DefaultArticleView,
      PlainPage: DefaultPlainPageView,
      TermDirectory: DefaultTermDirectoryView,
      TermArchive: DefaultTermArchiveView,
      Timeline: DefaultTimelineView,
      Register: DefaultRegisterView,
      Comments: DefaultCommentsView,
      CommentItem: DefaultCommentItemView,
      ExternalWarning: DefaultExternalWarningView,
      CommentForm: DefaultCommentFormView,
    },
  },
};

export function themeFor(name?: string | null) {
  return themes[name || ""] || themes.default;
}

export function registeredThemes() {
  return Object.values(themes);
}

