import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ConfirmBox } from "../components/ConfirmBox";
import { ConfigForm } from "../components/ConfigForm";
import { Empty, ErrorState, Loading } from "../components/Status";
import { useToast } from "../components/Toast";
import { ThemeCard } from "../features/themes/ThemeCard";
import { ThemeStatusPanel } from "../features/themes/ThemeStatusPanel";
import {
  deactivateTheme,
  deleteThemeConfig,
  readThemeConfigPayload,
  themeConfigFor,
  themeHasConfig,
  themeInfoFor,
  themeItems,
  writeThemeConfig,
} from "../features/themes/themeConfig";
import { api } from "../lib/api";
import { adminPath } from "../lib/routes";
import { useI18n } from "../../framework/i18n";
import { registeredThemes, themeFor } from "../../themes";

export function Themes() {
  const queryClient = useQueryClient();
  const settings = useQuery({ queryKey: ["settings"], queryFn: api.getSettings });
  const themes = useQuery({ queryKey: ["themes"], queryFn: api.listThemes });
  const toast = useToast();
  const { t } = useI18n();

  const deactivate = useMutation({
    mutationFn: async () => {
      const current = settings.data;
      if (!current) {
        throw new Error("站点设置尚未加载");
      }
      return api.updateSettings({
        ...current,
        theme: deactivateTheme(current.theme),
      });
    },
    onSuccess: async () => {
      await invalidateThemeQueries(queryClient);
      toast.success(t("themes.stopped"));
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t("themes.stop_failed"));
    },
  });

  const activate = useMutation({
    mutationFn: async (name: string) => {
      const current = settings.data;
      if (!current) {
        throw new Error("站点设置尚未加载");
      }
      const configs = {
        ...(current.theme.configs || {}),
        [name]: themeConfigFor(current.theme, name),
      };
      return api.updateSettings({
        ...current,
        theme: {
          active: name,
          configs,
          config: configs[name] || {},
        },
      });
    },
    onSuccess: async () => {
      await invalidateThemeQueries(queryClient);
      toast.success(t("themes.switched"));
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t("themes.switch_failed"));
    },
  });

  if (settings.isLoading || themes.isLoading) {
    return <Loading />;
  }
  if (settings.error || themes.error) {
    return <ErrorState error={settings.error || themes.error} />;
  }

  const items = themeItems(
    themes.data || [],
    settings.data?.theme,
    registeredThemes().map((theme) => theme.name),
  );

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>{t("themes.title")}</h1>
          <p>{t("themes.subtitle")}</p>
        </div>
      </div>
      <ThemeStatusPanel
        active={settings.data?.theme?.active}
        pending={deactivate.isPending}
        onDeactivate={() => deactivate.mutate()}
        t={t}
      />
      <div className="card-grid theme-grid">
        {items.map((theme) => (
          <ThemeCard
            key={theme.name}
            theme={theme}
            themeState={settings.data?.theme}
            activationPending={activate.isPending}
            onActivate={(name) => activate.mutate(name)}
            t={t}
          />
        ))}
      </div>
    </section>
  );
}

export function ThemeConfig() {
  const { name = "" } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const settings = useQuery({ queryKey: ["settings"], queryFn: api.getSettings });
  const themes = useQuery({ queryKey: ["themes"], queryFn: api.listThemes });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const update = useMutation({
    mutationFn: async (config: Record<string, unknown>) => {
      const current = settings.data;
      if (!current) {
        throw new Error("站点设置尚未加载");
      }
      return api.updateSettings({
        ...current,
        theme: writeThemeConfig(current.theme, name, readThemeConfigPayload({ config })),
      });
    },
    onSuccess: async () => {
      await invalidateThemeQueries(queryClient);
      toast.success("主题配置已保存");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "主题配置保存失败");
    },
  });

  const remove = useMutation({
    mutationFn: async () => {
      const current = settings.data;
      if (!current) {
        throw new Error("站点设置尚未加载");
      }
      return api.updateSettings({
        ...current,
        theme: deleteThemeConfig(current.theme, name),
      });
    },
    onSuccess: async () => {
      await invalidateThemeQueries(queryClient);
      toast.success("主题配置已删除");
      navigate(adminPath("/themes"));
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "主题配置删除失败");
    },
  });

  if (settings.isLoading || themes.isLoading) {
    return <Loading />;
  }
  if (settings.error || themes.error) {
    return <ErrorState error={settings.error || themes.error} />;
  }
  if (!name || name === "new") {
    return <Empty text="请选择一个已注册主题进行配置。" />;
  }

  const theme = themeInfoFor(themes.data || [], name);
  const frontendTheme = themeFor(name);
  const ConfigPanel = frontendTheme.ConfigPanel;
  const currentConfig = settings.data ? themeConfigFor(settings.data.theme, name) : {};
  const hasConfig = themeHasConfig(settings.data?.theme, name);

  return (
    <section className="page narrow">
      <div className="page-header">
        <div>
          <h1>{theme.name}</h1>
          <p>{theme.description}</p>
        </div>
        <Link className="button subtle" to={adminPath("/themes")}>
          返回主题
        </Link>
      </div>
      <section className="panel">
        {ConfigPanel ? (
          <ConfigPanel
            theme={frontendTheme}
            value={currentConfig}
            saving={update.isPending}
            error={update.error}
            onSubmit={async (value) => {
              await update.mutateAsync(value);
            }}
          />
        ) : theme.schema ? (
          <>
            <ConfigForm
              schema={theme.schema}
              value={{ config: currentConfig }}
              onSubmit={async (value) => {
                await update.mutateAsync(readThemeConfigPayload(value));
              }}
            />
            {update.error ? <p className="error-text">{update.error.message}</p> : null}
          </>
        ) : (
          <Empty text="这个主题没有提供配置面板。" />
        )}
        <div className="form-actions split-actions">
          <button className="button subtle" type="button" disabled={remove.isPending || !hasConfig} onClick={() => setConfirmDelete(true)}>
            删除这个主题配置
          </button>
        </div>
        <ConfirmBox
          open={confirmDelete}
          title="删除主题配置"
          description={"确定删除 " + name + " 的主题配置吗？主题本身不会被删除。"}
          confirmText="删除配置"
          tone="danger"
          pending={remove.isPending}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => {
            remove.mutate();
            setConfirmDelete(false);
          }}
        />
      </section>
    </section>
  );
}

async function invalidateThemeQueries(queryClient: ReturnType<typeof useQueryClient>) {
  await queryClient.invalidateQueries({ queryKey: ["settings"] });
  await queryClient.invalidateQueries({ queryKey: ["themes"] });
}


