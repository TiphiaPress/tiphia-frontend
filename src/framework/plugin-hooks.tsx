import { Fragment, createContext, type ReactNode, useContext, useEffect, useMemo } from "react";
import { registerI18nResources, type I18nResources, type LocaleOption } from "./i18n";
import type { PluginConfigPanel } from "./plugin-config";

export type FrontendHook =
  | "admin.auth.captcha"
  | "admin.auth.form.before"
  | "admin.auth.form.after"
  | "admin.dashboard.before"
  | "admin.dashboard.after"
  | "admin.sidebar.nav.after"
  | "admin.topbar.after"
  | "admin.content.toolbar.after"
  | "admin.plugin.card.after"
  | "blog.head"
  | "blog.auth.register.captcha"
  | "blog.auth.register.form.before"
  | "blog.auth.register.form.after"
  | "blog.body.start"
  | "blog.body.end"
  | "blog.header.before"
  | "blog.header.after"
  | "blog.nav.after"
  | "blog.sidebar"
  | "blog.main.before"
  | "blog.main.after"
  | "blog.footer.before"
  | "blog.footer.after"
  | "blog.footer.filing"
  | "blog.home.before"
  | "blog.home.hero.after"
  | "blog.home.after"
  | "blog.post.list.before"
  | "blog.post.list.after"
  | "blog.post.card.before"
  | "blog.post.card.after"
  | "blog.post.content.before"
  | "blog.post.content.after"
  | "blog.post.meta.after"
  | "blog.archive.before"
  | "blog.archive.after"
  | "blog.search.before"
  | "blog.search.after"
  | "blog.custom-page.after"
  | `blog.custom-page.${string}`
  | "blog.comment.captcha"
  | "blog.comment.list.before"
  | "blog.comment.list.after"
  | "blog.comment.form.before"
  | "blog.comment.form.after";

export interface HookContext {
  [key: string]: unknown;
}

export interface HookContribution {
  hook: FrontendHook;
  order?: number;
  render: (context: HookContext) => ReactNode;
}

export interface HeadContribution {
  id: string;
  order?: number;
  run: (context: HookContext) => void | (() => void);
}

export interface FrontendPlugin {
  name: string;
  backendNames?: string[];
  adminConfigPanel?: PluginConfigPanel;
  hooks?: HookContribution[];
  head?: HeadContribution[];
  i18n?: {
    resources: I18nResources;
    locales?: LocaleOption[];
  };
}

const plugins = new Map<string, FrontendPlugin>();
const EnabledPluginsContext = createContext<Set<string> | null>(null);

export function registerFrontendPlugin(plugin: FrontendPlugin) {
  plugins.set(plugin.name, plugin);
  if (plugin.i18n) {
    registerI18nResources(
      plugin.i18n.resources,
      Object.fromEntries((plugin.i18n.locales || []).map((locale) => [locale.code, locale.label])),
    );
  }
}

export function frontendPlugin(name: string) {
  return plugins.get(name);
}

export function adminConfigPanelFor(name: string) {
  return frontendPlugin(name)?.adminConfigPanel;
}

export function FrontendPluginProvider({
  enabledPlugins,
  children,
}: {
  enabledPlugins: string[];
  children: ReactNode;
}) {
  const value = useMemo(() => new Set(enabledPlugins), [enabledPlugins.join("\n")]);
  return <EnabledPluginsContext.Provider value={value}>{children}</EnabledPluginsContext.Provider>;
}

export function FrontendHookSlot({ hook, context = {} }: { hook: FrontendHook; context?: HookContext }) {
  const enabledPlugins = useContext(EnabledPluginsContext);
  const contributions = Array.from(plugins.values())
    .filter((plugin) => isPluginEnabled(plugin, enabledPlugins))
    .flatMap((plugin) =>
      (plugin.hooks || [])
        .filter((item) => item.hook === hook)
        .map((item) => ({ ...item, plugin: plugin.name })),
    )
    .sort((left, right) => (left.order || 100) - (right.order || 100));

  if (contributions.length === 0) {
    return null;
  }

  return (
    <>
      {contributions.map((item) => (
        <Fragment key={`${item.plugin}:${item.hook}:${item.order || 100}`}>{item.render(context)}</Fragment>
      ))}
    </>
  );
}

export function useFrontendHeadEffects(context: HookContext = {}) {
  const enabledPlugins = useContext(EnabledPluginsContext);
  useEffect(() => {
    const cleanups = Array.from(plugins.values())
      .filter((plugin) => isPluginEnabled(plugin, enabledPlugins))
      .flatMap((plugin) =>
        (plugin.head || []).map((item) => ({
          ...item,
          plugin: plugin.name,
        })),
      )
      .sort((left, right) => (left.order || 100) - (right.order || 100))
      .map((item) => item.run({ ...context, plugin: item.plugin }))
      .filter((cleanup): cleanup is () => void => typeof cleanup === "function");

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [enabledPluginsKey(enabledPlugins), JSON.stringify(context)]);
}

function isPluginEnabled(plugin: FrontendPlugin, enabledPlugins: Set<string> | null) {
  return !enabledPlugins || enabledPlugins.size === 0 || [plugin.name, ...(plugin.backendNames || [])].some((name) => enabledPlugins.has(name));
}

function enabledPluginsKey(enabledPlugins: Set<string> | null) {
  return enabledPlugins ? Array.from(enabledPlugins).sort().join("\n") : "";
}
