import { resolveApiBase } from "./api-base";

export const publicApiBase = resolveApiBase();

export async function requestPublic<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${publicApiBase}${path}`, {
    ...init,
    headers,
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(body?.error?.message || response.statusText);
  }
  return body as T;
}
