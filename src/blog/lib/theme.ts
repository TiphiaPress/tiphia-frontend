export interface ThemeNavPage {
  label: string;
  slug: string;
  display?: "article" | "plain";
}

export function effectivePageSize(settings?: { default_page_size: number; theme?: { config: Record<string, unknown> } }) {
  const raw = settings?.theme?.config?.posts_per_page;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return Math.min(100, Math.max(1, raw));
  }
  return settings?.default_page_size || 10;
}

export function themeBoolean(config: Record<string, unknown>, key: string) {
  return config[key] === true;
}

export function themeNumber(config: Record<string, unknown>, key: string, fallback: number) {
  const value = config[key];
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.min(20, Math.max(1, value));
  }
  return fallback;
}

export function themeNavPages(config?: Record<string, unknown>): ThemeNavPage[] {
  const raw = config?.nav_pages;
  if (!Array.isArray(raw)) {
    return [];
  }

  const pages: ThemeNavPage[] = [];
  raw.forEach((item) => {
    if (!item || typeof item !== "object") {
      return;
    }
    const value = item as Record<string, unknown>;
    const label = typeof value.label === "string" ? value.label.trim() : "";
    const slug = typeof value.slug === "string" ? value.slug.trim() : "";
    const display = value.display === "plain" ? "plain" : "article";
    if (!label || !slug) {
      return;
    }
    pages.push({ label, slug, display });
  });
  return pages;
}


export function themeStringArray(config: Record<string, unknown> | undefined, key: string) {
  const raw = config?.[key];
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.flatMap((item) => (typeof item === "string" && item.trim() ? [item.trim()] : []));
}

export function themeNumberArray(config: Record<string, unknown> | undefined, key: string) {
  const raw = config?.[key];
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.flatMap((item) => {
    const parsed = typeof item === "number" ? item : typeof item === "string" ? Number(item) : NaN;
    return Number.isInteger(parsed) && parsed > 0 ? [parsed] : [];
  });
}