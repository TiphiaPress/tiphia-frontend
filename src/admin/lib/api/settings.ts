import type { SiteSettings, ThemeInfo } from "../../types";
import { put, request } from "./client";

export const settingsApi = {
  getSettings: () => request<SiteSettings>("/api/v1/settings"),
  updateSettings: (settings: SiteSettings) => request<SiteSettings>("/api/v1/settings", put(settings)),
  listThemes: () => request<ThemeInfo[]>("/api/v1/themes"),
};
