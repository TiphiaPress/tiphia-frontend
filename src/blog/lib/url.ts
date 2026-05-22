import { apiBase } from "./api";

export function absoluteUrl(baseUrl?: string | null, path = "/") {
  if (!baseUrl) {
    return undefined;
  }
  return `${baseUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export function normalizedHttpUrl(value?: string | null) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.toString();
    }
  } catch {
    return null;
  }

  return null;
}

export function normalizedAssetUrl(value?: string | null, baseUrl?: string | null) {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const absolute = new URL(trimmed);
    if (absolute.protocol === "http:" || absolute.protocol === "https:") {
      return absolute.toString();
    }
    return null;
  } catch {
    const base = baseUrl || apiBase;
    try {
      return new URL(trimmed, `${base.replace(/\/$/, "")}/`).toString();
    } catch {
      return null;
    }
  }
}
