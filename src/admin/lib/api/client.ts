import { resolveApiBase } from "../../../framework/api-base";
import { clearSession, getToken } from "../auth";

export const apiBase = resolveApiBase();

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export type Query = Record<string, string | number | boolean | null | undefined>;

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getToken();

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", "Bearer " + token);
  }
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(apiBase + path, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    clearSession();
  }

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const error = body?.error;
    throw new ApiError(response.status, error?.message || response.statusText, error?.code);
  }

  return body as T;
}

export function query(params: Query) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const raw = search.toString();
  return raw ? "?" + raw : "";
}

export function post(body: unknown): RequestInit {
  return {
    method: "POST",
    body: JSON.stringify(body),
  };
}

export function put(body: unknown): RequestInit {
  return {
    method: "PUT",
    body: JSON.stringify(body),
  };
}

export function compactBody<T extends Record<string, unknown>>(body: T): T {
  return Object.fromEntries(Object.entries(body).filter(([, value]) => value !== "")) as T;
}
