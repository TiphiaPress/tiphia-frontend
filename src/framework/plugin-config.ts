import type { ComponentType } from "react";
import type { PluginInfo } from "../admin/types";

export interface PluginConfigPanelProps {
  plugin: PluginInfo;
  value: Record<string, unknown>;
  saving: boolean;
  error?: unknown;
  onSubmit: (value: Record<string, unknown>) => Promise<void> | void;
}

export type PluginConfigPanel = ComponentType<PluginConfigPanelProps>;
