import { adminConfigPanelFor } from "../../../framework/plugin-hooks";

export function pluginConfigPanelFor(name: string) {
  return adminConfigPanelFor(name);
}
