import type { PublicUser } from "../types";
import { adminPath } from "./routes";

export type AdminSection =
  | "dashboard"
  | "posts"
  | "pages"
  | "comments"
  | "terms"
  | "users"
  | "plugins"
  | "themes"
  | "settings";

const permissions: Record<PublicUser["role"], AdminSection[]> = {
  root: ["dashboard", "posts", "pages", "comments", "terms", "users", "plugins", "themes", "settings"],
  admin: ["dashboard", "posts", "pages", "comments", "terms", "users", "plugins", "themes", "settings"],
  editor: ["dashboard", "posts", "pages", "comments", "terms"],
  author: [],
};

const sectionPaths: Record<AdminSection, string> = {
  dashboard: adminPath(),
  posts: adminPath("/posts"),
  pages: adminPath("/pages"),
  comments: adminPath("/comments"),
  terms: adminPath("/terms"),
  users: adminPath("/users"),
  plugins: adminPath("/plugins"),
  themes: adminPath("/themes"),
  settings: adminPath("/settings"),
};

export function canAccessAdminSection(user: PublicUser | null | undefined, section: AdminSection) {
  if (!user) {
    return false;
  }
  return permissions[user.role]?.includes(section) || false;
}

export function visibleAdminSections(user: PublicUser | null | undefined) {
  if (!user) {
    return [];
  }
  return permissions[user.role] || [];
}

export function firstAllowedAdminPath(user: PublicUser | null | undefined) {
  const section = visibleAdminSections(user)[0];
  return section ? sectionPaths[section] : adminPath("/login");
}
