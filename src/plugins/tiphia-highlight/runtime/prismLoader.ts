import { defaultHighlightConfig, highlightStyleUrls, type HighlightConfig, type HighlightStyle } from "../config";
import prismUrl from "../vendor/prism.full.js?url";
import "./prismTypes";

const PRISM_SCRIPT_ID = "tiphia-highlight-prism";
const PRISM_STYLE_ID = "tiphia-highlight-prism-style";

let prismLoad: Promise<void> | null = null;

export async function loadPrism(config: HighlightConfig) {
  setThemeStyle(config.style);
  if (window.Prism?.highlightElement) return;

  if (!prismLoad) {
    prismLoad = new Promise((resolve, reject) => {
      const existing = document.getElementById(PRISM_SCRIPT_ID) as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("failed to load Prism")), { once: true });
        return;
      }

      window.Prism = window.Prism || {};
      window.Prism.manual = true;
      const script = document.createElement("script");
      script.id = PRISM_SCRIPT_ID;
      script.src = prismUrl;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("failed to load Prism"));
      document.head.appendChild(script);
    });
  }

  await prismLoad;
}

function setThemeStyle(style: HighlightStyle) {
  const href = highlightStyleUrls[style] || highlightStyleUrls[defaultHighlightConfig.style];
  let link = document.getElementById(PRISM_STYLE_ID) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.id = PRISM_STYLE_ID;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  if (link.href !== new URL(href, window.location.href).href) {
    link.href = href;
  }
}
