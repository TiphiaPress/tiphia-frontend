export type ThemeState = {
  active: string;
  config: Record<string, unknown>;
  configs?: Record<string, Record<string, unknown>>;
};

export type ThemeInfo = {
  name: string;
  version: string;
  description: string;
  author: string;
  preview: string;
  active: boolean;
  schema: {
    fields: Array<{
      key: string;
      label: string;
      field_type: "text" | "textarea" | "number" | "boolean" | "json";
      required: boolean;
      default?: unknown;
      help?: string | null;
    }>;
  };
};

export function readThemeConfigPayload(value: Record<string, unknown>) {
  const config = value.config;
  if (config && typeof config === "object" && !Array.isArray(config)) {
    return config as Record<string, unknown>;
  }
  return {};
}

export function themeItems(knownThemes: ThemeInfo[], theme: ThemeState | undefined, frontendThemeNames: string[] = []) {
  const byName = new Map<string, ThemeInfo>();
  knownThemes.forEach((item) => byName.set(item.name, item));
  frontendThemeNames.forEach((name) => {
    if (!byName.has(name)) {
      byName.set(name, {
        name,
        version: "frontend",
        description: "Frontend registered theme.",
        author: "TiphiaPress",
        preview: name,
        active: false,
        schema: genericThemeSchema(),
      });
    }
  });
  return Array.from(byName.values()).map((item) => ({
    ...item,
    active: theme?.active === item.name,
  }));
}

export function themeInfoFor(knownThemes: ThemeInfo[], name: string): ThemeInfo {
  return (
    knownThemes.find((item) => item.name === name) || {
      name,
      version: "custom",
      description: "User-defined theme configuration.",
      author: "Custom",
      preview: name.slice(0, 12) || "Custom",
      active: false,
      schema: genericThemeSchema(),
    }
  );
}

export function themeHasConfig(theme: ThemeState | undefined, name: string) {
  return Boolean(theme?.configs?.[name]);
}

export function themeConfigFor(theme: ThemeState, name: string) {
  return theme.configs?.[name] || (theme.active === name ? theme.config : {});
}

export function writeThemeConfig(theme: ThemeState, name: string, config: Record<string, unknown>) {
  const configs = {
    ...(theme.configs || {}),
    [name]: config,
  };
  const active = theme.active || "";
  return {
    active,
    configs,
    config: configs[active] || {},
    configs_migrated: true,
  };
}

export function deleteThemeConfig(theme: ThemeState, name: string) {
  const configs = { ...(theme.configs || {}) };
  delete configs[name];
  const active = theme.active === name ? "" : theme.active || "";
  return {
    active,
    configs,
    config: configs[active] || {},
    configs_migrated: true,
  };
}

export function deactivateTheme(theme: ThemeState) {
  return {
    active: "",
    configs: theme.configs || {},
    config: {},
    configs_migrated: true,
  };
}

function genericThemeSchema() {
  return {
    fields: [
      {
        key: "config",
        label: "Theme JSON config",
        field_type: "json" as const,
        required: false,
        default: {},
        help: "Free-form JSON read by the active blog frontend.",
      },
    ],
  };
}


