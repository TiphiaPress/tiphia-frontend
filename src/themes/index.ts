import { DefaultThemeLayout } from "./default";
import type { BlogTheme } from "./types";

const themes: Record<string, BlogTheme> = {
  default: {
    name: "default",
    Layout: DefaultThemeLayout,
  },
};

export function themeFor(name?: string | null) {
  return themes[name || ""] || themes.default;
}

export function registeredThemes() {
  return Object.values(themes);
}
