import { defaultHighlightConfig, type HighlightConfig, type HighlightStyle } from "./config";
import { enhanceBlock } from "./runtime/block";
import { getHighlightConfig } from "./runtime/configLoader";
import { loadPrism } from "./runtime/prismLoader";

export type { HighlightConfig, HighlightStyle } from "./config";

const HIGHLIGHT_SELECTOR = ".article .content pre";

export function enhanceCodeBlocks() {
  let cancelled = false;
  const run = () => {
    if (cancelled) return;
    getHighlightConfig()
      .then(async (config) => {
        await loadPrism(config);
        if (!cancelled) applyHighlight(config);
      })
      .catch(() => {
        if (!cancelled) applyHighlight(defaultHighlightConfig);
      });
  };

  run();
  const observer = new MutationObserver(run);
  observer.observe(document.body, { childList: true, subtree: true });

  return () => {
    cancelled = true;
    observer.disconnect();
  };
}

export async function enhancePreviewCodeBlock(pre: HTMLElement, config: HighlightConfig) {
  await loadPrism(config);
  enhanceBlock(pre, config, true);
}

function applyHighlight(config: HighlightConfig) {
  document.querySelectorAll<HTMLElement>(HIGHLIGHT_SELECTOR).forEach((pre) => enhanceBlock(pre, config));
}
