import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Power, Settings } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { ConfigForm } from "../components/ConfigForm";
import { Empty, ErrorState, Loading } from "../components/Status";
import { useToast } from "../components/Toast";
import { pluginConfigPanelFor } from "../features/plugin-config";
import { api } from "../lib/api";
import { adminPath } from "../lib/routes";
import { useI18n } from "../../framework/i18n";

export function Plugins() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useI18n();
  const query = useQuery({ queryKey: ["plugins"], queryFn: api.listPlugins });
  const state = useMutation({
    mutationFn: ({ name, enabled }: { name: string; enabled: boolean }) =>
      api.updatePluginState(name, enabled),
    onSuccess: async (updated) => {
      await queryClient.invalidateQueries({ queryKey: ["plugins"] });
      toast.success(`${updated.plugin} 已${updated.enabled ? "启用" : "禁用"}`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t("plugins.state_failed"));
    },
  });

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>{t("plugins.title")}</h1>
          <p>{t("plugins.subtitle")}</p>
        </div>
      </div>
      {query.isLoading ? <Loading /> : null}
      {query.error ? <ErrorState error={query.error} /> : null}
      {query.data?.length === 0 ? <Empty /> : null}
      <div className="card-grid plugin-grid">
        {query.data?.map((plugin) => (
          <article className="flat-card plugin-card" key={plugin.manifest.name}>
            <div>
              <strong>{plugin.manifest.name}</strong>
              <small>{plugin.manifest.version} · {plugin.manifest.author}</small>
            </div>
            <p className="plugin-description">{plugin.manifest.description}</p>
            <div className="plugin-health">
              <span className={plugin.health.active ? "badge approved" : "badge trash"}>
                {plugin.health.active ? t("plugins.active") : t("plugins.inactive")}
              </span>
              <span>{plugin.health.hook_count} hooks</span>
              <span>{plugin.health.admin_menu_count} menus</span>
              <span>{plugin.health.configurable ? "configurable" : "no config"}</span>
            </div>
            {plugin.hooks.length ? (
              <details className="plugin-hooks">
                <summary>{t("plugins.view_hooks")}</summary>
                <div>
                  {plugin.hooks.map((hook) => (
                    <small key={`${hook.hook}-${hook.priority}`}>
                      {hook.hook} · priority {hook.priority}
                    </small>
                  ))}
                </div>
              </details>
            ) : null}
            <div className="card-actions plugin-card-actions">
              <button
                className={plugin.health.active ? "button subtle" : "button"}
                disabled={state.isPending}
                onClick={() =>
                  state.mutate({
                    name: plugin.manifest.name,
                    enabled: !plugin.health.active,
                  })
                }
              >
                <Power size={16} />
                {plugin.health.active ? t("action.disable") : t("action.enable")}
              </button>
              {plugin.config_schema ? (
                <Link className="button subtle" to={adminPath(`/plugins/${plugin.manifest.name}/config`)}>
                  <Settings size={16} />
                  {t("action.configure")}
                </Link>
              ) : (
                <span className="muted">{t("plugins.no_config")}</span>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function PluginConfig() {
  const { name = "" } = useParams();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useI18n();
  const plugins = useQuery({ queryKey: ["plugins"], queryFn: api.listPlugins });
  const config = useQuery({
    queryKey: ["plugin-config", name],
    queryFn: () => api.pluginConfig(name),
    enabled: Boolean(name),
  });
  const update = useMutation({
    mutationFn: (value: Record<string, unknown>) => api.updatePluginConfig(name, value),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["plugin-config", name] });
      toast.success(t("plugins.saved"));
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t("plugins.save_failed"));
    },
  });
  const plugin = plugins.data?.find((item) => item.manifest.name === name);
  const CustomConfigPanel = plugin ? pluginConfigPanelFor(plugin.manifest.name) : undefined;

  if (plugins.isLoading || config.isLoading) {
    return <Loading />;
  }
  if (plugins.error || config.error) {
    return <ErrorState error={plugins.error || config.error} />;
  }
  if (!plugin) {
    return <Empty text={t("plugins.not_found")} />;
  }
  if (!plugin?.config_schema && !CustomConfigPanel) {
    return <Empty text={t("plugins.no_schema")} />;
  }

  return (
    <section className="page narrow">
      <div className="page-header">
        <div>
          <h1>{plugin.manifest.name}</h1>
          <p>{plugin.manifest.description}</p>
        </div>
        <Link className="button subtle" to={adminPath("/plugins")}>
          {t("plugins.back")}
        </Link>
      </div>
      <section className="panel">
        {CustomConfigPanel ? (
          <CustomConfigPanel
            plugin={plugin}
            value={config.data?.config || {}}
            saving={update.isPending}
            error={update.error}
            onSubmit={async (value) => {
              await update.mutateAsync(value);
            }}
          />
        ) : plugin.config_schema ? (
          <>
            <ConfigForm
              schema={plugin.config_schema}
              value={config.data?.config || {}}
              onSubmit={async (value) => {
                await update.mutateAsync(value);
              }}
            />
            {update.error ? <p className="error-text">{update.error.message}</p> : null}
          </>
        ) : null}
      </section>
    </section>
  );
}
