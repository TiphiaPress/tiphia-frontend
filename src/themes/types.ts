import type { ComponentType } from "react";
import type { DefaultThemeLayoutProps } from "./default";

export type BlogThemeLayout = ComponentType<DefaultThemeLayoutProps>;

export interface BlogTheme {
  name: string;
  Layout: BlogThemeLayout;
}
