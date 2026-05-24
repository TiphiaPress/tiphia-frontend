import { request } from "./client";

export const systemApi = {
  health: () => request<{ status: string; version: string; checked_at: string }>("/health"),
  openapi: () => request<Record<string, unknown>>("/openapi.json"),
};
