import { useQuery } from "@tanstack/react-query";
import { FrontendPluginProvider } from "../../framework/plugin-hooks";
import { themeFor } from "../../themes";
import { useSeo } from "../hooks/useSeo";
import { useTheme } from "../hooks/useTheme";
import { api, apiBase } from "../lib/api";
import { themeNavPages } from "../lib/theme";

export function Layout() {
  const settings = useQuery({ queryKey: ["settings"], queryFn: api.settings });
  const terms = useQuery({ queryKey: ["terms"], queryFn: api.terms });
  const themeConfig = settings.data?.theme.config || {};
  const theme = themeFor(settings.data?.theme.active);
  const ThemeLayout = theme.Layout;
  const BootstrapLoading = theme.BootstrapLoading || themeFor("default").BootstrapLoading;
  const navPages = themeNavPages(themeConfig);
  const plugins = useQuery({
    queryKey: ["frontend-plugins"],
    queryFn: api.plugins,
    retry: false,
  });
  const activePlugins = plugins.data
    ?.filter((plugin) => plugin.health.active)
    .map((plugin) => plugin.manifest.name) || [];
  useTheme(settings.data?.theme);
  useSeo({
    title: settings.data?.title || "Tiphia",
    description: settings.data?.seo.meta_description || settings.data?.description,
    siteTitle: settings.data?.title,
    suffix: settings.data?.seo.meta_title_suffix,
    canonical: settings.data?.base_url || undefined,
    apiBaseUrl: apiBase,
  });

  if (BootstrapLoading && ((settings.isLoading && !settings.data) || (terms.isLoading && !terms.data))) {
    return <BootstrapLoading />;
  }

  return (
    <FrontendPluginProvider enabledPlugins={activePlugins}>
      <ThemeLayout
        title={settings.data?.title || "Tiphia"}
        description={settings.data?.description}
        avatarUrl={settings.data?.avatar_url}
        baseUrl={settings.data?.base_url}
        registrationEnabled={settings.data?.registration_enabled}
        navPages={navPages}
        terms={terms.data?.data || []}
        config={themeConfig}
      />
    </FrontendPluginProvider>
  );
}

