import { apiBase } from "../../../blog/lib/api";
import { normalizeHighlightConfig, type HighlightConfig } from "../config";

let configCache: Promise<HighlightConfig> | null = null;

export function getHighlightConfig() {
  if (!configCache) {
    configCache = fetch(`${apiBase}/api/v1/highlight/config`)
      .then((response) => {
        if (!response.ok) throw new Error(response.statusText);
        return response.json() as Promise<Partial<HighlightConfig>>;
      })
      .then(normalizeHighlightConfig);
  }
  return configCache;
}
