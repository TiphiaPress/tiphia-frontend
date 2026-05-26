export function normalizeApiBase(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "/") {
    return "";
  }
  return trimmed.replace(/\/+$/, "");
}

export function resolveApiBase() {
  const runtimeBase =
    typeof window !== "undefined" && typeof window.__TIPHIA_API_BASE__ === "string"
      ? window.__TIPHIA_API_BASE__
      : "";
  const buildBase = import.meta.env.VITE_TIPHIA_API_BASE as string | undefined;
  return normalizeApiBase(runtimeBase || buildBase || "");
}

declare global {
  interface Window {
    __TIPHIA_API_BASE__?: string;
  }
}