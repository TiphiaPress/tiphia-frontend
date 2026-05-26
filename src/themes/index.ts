import type { BlogTheme } from "./types";

type ThemeModule = {
  default?: BlogTheme;
  theme?: BlogTheme;
};

const themeModules = import.meta.glob<ThemeModule>(["./*/index.ts", "./*/index.tsx"], { eager: true });
const themeList = Object.values(themeModules)
  .map((module) => module.default || module.theme)
  .filter((theme): theme is BlogTheme => Boolean(theme?.name && theme.Layout && theme.views));

const themes: Record<string, BlogTheme> = Object.fromEntries(themeList.map((theme) => [theme.name, theme]));
const fallbackTheme = themes.default || themeList[0];

if (!fallbackTheme) {
  throw new Error("No Tiphia theme registered. Add a theme under src/themes/<name>/index.tsx.");
}

export function themeFor(name?: string | null) {
  return themes[name || ""] || fallbackTheme;
}

export function registeredThemes() {
  return Object.values(themes);
}