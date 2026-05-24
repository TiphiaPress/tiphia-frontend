import type { PluginConfigResponse, PluginInfo, PluginStateResponse } from "../../types";
import { put, request } from "./client";

export const pluginsApi = {
  listPlugins: () => request<PluginInfo[]>("/api/v1/plugins"),
  pluginConfig: (name: string) => request<PluginConfigResponse>("/api/v1/plugins/" + name + "/config"),
  updatePluginConfig: (name: string, config: Record<string, unknown>) =>
    request<PluginConfigResponse>("/api/v1/plugins/" + name + "/config", put({ config })),
  updatePluginState: (name: string, enabled: boolean) =>
    request<PluginStateResponse>("/api/v1/plugins/" + name + "/state", put({ enabled })),
};
