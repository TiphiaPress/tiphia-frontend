import blackMacStyleUrl from "./vendor/styles/BlackMac.css?url";
import coyStyleUrl from "./vendor/styles/coy.css?url";
import darkStyleUrl from "./vendor/styles/dark.css?url";
import defaultStyleUrl from "./vendor/styles/default.css?url";
import grayMacStyleUrl from "./vendor/styles/GrayMac.css?url";
import solarizedLightStyleUrl from "./vendor/styles/solarized-light.css?url";
import tomorrowNightStyleUrl from "./vendor/styles/tomorrow-night.css?url";
import twilightStyleUrl from "./vendor/styles/twilight.css?url";
import whiteMacStyleUrl from "./vendor/styles/WhiteMac.css?url";

export type HighlightStyle =
  | "BlackMac.css"
  | "coy.css"
  | "dark.css"
  | "default.css"
  | "GrayMac.css"
  | "solarized-light.css"
  | "tomorrow-night.css"
  | "twilight.css"
  | "WhiteMac.css";

export interface HighlightConfig {
  style: HighlightStyle;
  mac_window: boolean;
  show_language: boolean;
  line_wrap: boolean;
  line_numbers: boolean;
}

export interface HighlightStyleOption {
  value: HighlightStyle;
  label: string;
  description: string;
}

export const defaultHighlightConfig: HighlightConfig = {
  style: "GrayMac.css",
  mac_window: true,
  show_language: true,
  line_wrap: false,
  line_numbers: false,
};

export const highlightStyleOptions: HighlightStyleOption[] = [
  { value: "GrayMac.css", label: "Gray Mac", description: "macOS 风格灰色窗口，适合多数博客。" },
  { value: "WhiteMac.css", label: "White Mac", description: "浅色 macOS 风格窗口。" },
  { value: "BlackMac.css", label: "Black Mac", description: "深色 macOS 风格窗口。" },
  { value: "default.css", label: "Prism Default", description: "Prism 默认浅色主题。" },
  { value: "coy.css", label: "Coy", description: "纸张质感浅色主题。" },
  { value: "dark.css", label: "Dark", description: "Prism 深色主题。" },
  { value: "solarized-light.css", label: "Solarized Light", description: "柔和浅色主题。" },
  { value: "tomorrow-night.css", label: "Tomorrow Night", description: "高对比深色主题。" },
  { value: "twilight.css", label: "Twilight", description: "经典深色主题。" },
];

export const highlightStyleUrls: Record<HighlightStyle, string> = {
  "BlackMac.css": blackMacStyleUrl,
  "coy.css": coyStyleUrl,
  "dark.css": darkStyleUrl,
  "default.css": defaultStyleUrl,
  "GrayMac.css": grayMacStyleUrl,
  "solarized-light.css": solarizedLightStyleUrl,
  "tomorrow-night.css": tomorrowNightStyleUrl,
  "twilight.css": twilightStyleUrl,
  "WhiteMac.css": whiteMacStyleUrl,
};

export function normalizeHighlightConfig(value: Record<string, unknown> | Partial<HighlightConfig>): HighlightConfig {
  return {
    style: readHighlightStyle(value.style),
    mac_window: readBoolean(value.mac_window, defaultHighlightConfig.mac_window),
    show_language: readBoolean(value.show_language, defaultHighlightConfig.show_language),
    line_wrap: readBoolean(value.line_wrap, defaultHighlightConfig.line_wrap),
    line_numbers: readBoolean(value.line_numbers, defaultHighlightConfig.line_numbers),
  };
}

export function readHighlightStyle(value: unknown): HighlightStyle {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (normalized in highlightStyleUrls) {
    return normalized as HighlightStyle;
  }
  switch (normalized) {
    case "github":
    case "one_light":
      return "default.css";
    case "dracula":
      return "tomorrow-night.css";
    case "solarized_dark":
      return "twilight.css";
    default:
      return defaultHighlightConfig.style;
  }
}

export function highlightStyleClass(style: HighlightStyle) {
  return style.replace(/\.css$/, "").replace(/[^a-z0-9_-]/gi, "-").toLowerCase();
}

function readBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}