import { useEffect } from "react";

export function useTheme(theme?: { active: string; config: Record<string, unknown> }) {
  useEffect(() => {
    const config = theme?.config || {};
    const root = document.documentElement;
    const accent = typeof config.accent === "string" ? config.accent : "#2563eb";
    const fontFamily = typeof config.font_family === "string" ? config.font_family : "";
    root.style.setProperty("--accent", accent);
    root.dataset.theme = theme?.active || "default";
    applyThemeVariables(root, config);
    applyCustomCss(typeof config.custom_css === "string" ? config.custom_css : "");
    applyFavicon(readOptionalString(config.favicon_url) || readOptionalString(config.favicon) || "/favicon.ico");
    if (fontFamily) {
      root.style.setProperty("--theme-font", fontFamily);
    } else {
      root.style.removeProperty("--theme-font");
    }
  }, [theme]);
}

function readOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function applyThemeVariables(root: HTMLElement, config: Record<string, unknown>) {
  Object.entries(config).forEach(([key, value]) => {
    if (!isThemeCssValue(value)) {
      return;
    }

    root.style.setProperty(`--theme-${toKebabCase(key)}`, String(value));
  });
}

function isThemeCssValue(value: unknown) {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

function toKebabCase(value: string) {
  return value.replace(/_/g, "-").replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function applyCustomCss(css: string) {
  const id = "tiphia-theme-custom-css";
  let element = document.getElementById(id) as HTMLStyleElement | null;
  if (!css.trim()) {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement("style");
    element.id = id;
    document.head.appendChild(element);
  }
  element.textContent = css;
}

function applyFavicon(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!element) {
    element = document.createElement("link");
    element.rel = "icon";
    document.head.appendChild(element);
  }
  element.href = href;
}
