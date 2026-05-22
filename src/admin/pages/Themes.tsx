import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PauseCircle, Plus, Settings, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ConfirmBox } from "../components/ConfirmBox";
import { ConfigForm } from "../components/ConfigForm";
import { Empty, ErrorState, Loading } from "../components/Status";
import { useToast } from "../components/Toast";
import { api } from "../lib/api";
import { adminPath } from "../lib/routes";
import { useI18n } from "../../framework/i18n";

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
      await queryClient.invalidateQueries({ queryKey: ["settings"] });
      await queryClient.invalidateQueries({ queryKey: ["themes"] });
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
      if (!themeHasConfig(current.theme, name)) {
        throw new Error(t("themes.must_save_first"));
      }
      return api.updateSettings({
        ...current,
        theme: {
          active: name,
          configs: current.theme.configs || {},
          config: themeConfigFor(current.theme, name),
        },
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["settings"] });
      await queryClient.invalidateQueries({ queryKey: ["themes"] });
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

  const items = themeItems(themes.data || [], settings.data?.theme);

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>{t("themes.title")}</h1>
          <p>{t("themes.subtitle")}</p>
        </div>
        <Link className="button" to={adminPath("/themes/new/config")}>
          <Plus size={16} />
          {t("themes.add")}
        </Link>
      </div>
      <section className="panel">
        <div className="theme-status-row">
          <p className="muted">
            {t("themes.current", undefined, { active: settings.data?.theme?.active || t("themes.none_active") })}
          </p>
          <button
            className="button subtle"
            type="button"
            disabled={!settings.data?.theme?.active || deactivate.isPending}
            onClick={() => deactivate.mutate()}
          >
            <PauseCircle size={16} />
            {t("themes.stop")}
          </button>
        </div>
      </section>
      <div className="card-grid theme-grid">
        {items.map((theme) => (
          <article className={`flat-card theme-card ${theme.active ? "active" : ""}`} key={theme.name}>
            <div className="theme-preview">{theme.preview}</div>
            <div className="theme-card-body">
              <div>
                <strong>{theme.name}</strong>
                <small>{theme.version} · {theme.author}</small>
                <p>{theme.description}</p>
                <div className="plugin-health">
                  <span className={themeHasConfig(settings.data?.theme, theme.name) ? "badge approved" : "badge"}>
                    {themeHasConfig(settings.data?.theme, theme.name) ? t("themes.configured") : t("themes.not_configured")}
                  </span>
                </div>
              </div>
              <div className="card-actions">
                <button
                  className={theme.active ? "button" : "button subtle"}
                  disabled={theme.active || activate.isPending}
                  onClick={() => activate.mutate(theme.name)}
                >
                  {theme.active ? t("themes.enabled") : t("action.enable")}
                </button>
                <Link className="button subtle" to={adminPath(`/themes/${theme.name}/config`)}>
                  <Settings size={16} />
                  {themeHasConfig(settings.data?.theme, theme.name) ? t("themes.edit_config") : t("themes.new_config")}
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ThemeConfig() {
  const { name = "" } = useParams();
  const navigate = useNavigate();
  const [customName, setCustomName] = useState("");
  const [newConfigName, setNewConfigName] = useState("");
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const toast = useToast();
  const queryClient = useQueryClient();
  const settings = useQuery({ queryKey: ["settings"], queryFn: api.getSettings });
  const themes = useQuery({ queryKey: ["themes"], queryFn: api.listThemes });
  const selectedName = name === "new" ? newConfigName : name;
  const theme = themeInfoFor(themes.data || [], selectedName);
  const canEditConfig = Boolean(selectedName);
  const update = useMutation({
    mutationFn: async (config: Record<string, unknown>) => {
      const current = settings.data;
      if (!current) {
        throw new Error("站点设置尚未加载");
      }
      return api.updateSettings({
        ...current,
        theme: writeThemeConfig(current.theme, selectedName, readThemeConfigPayload(config)),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["settings"] });
      await queryClient.invalidateQueries({ queryKey: ["themes"] });
      setSaved(true);
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
        theme: deleteThemeConfig(current.theme, selectedName),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["settings"] });
      await queryClient.invalidateQueries({ queryKey: ["themes"] });
      setSaved(false);
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
  if (!canEditConfig) {
    return (
      <section className="page narrow">
        <div className="page-header">
          <div>
            <h1>新增主题配置</h1>
            <p>输入主题配置名。主题本身由独立前端决定如何加载和解释。</p>
          </div>
          <Link className="button subtle" to={adminPath("/themes")}>
            返回主题
          </Link>
        </div>
        <section className="panel">
          <label className="field">
            <span>主题配置名</span>
            <input
              placeholder="例如 default、minimal、my-theme"
              value={customName}
              onChange={(event) => setCustomName(event.target.value)}
            />
          </label>
          <p className="muted">配置名只用于保存和启用配置，不代表核心框架拥有这个主题。</p>
          <div className="form-actions">
            <button
              className="button"
              type="button"
              disabled={!customName.trim()}
              onClick={() => setNewConfigName(customName.trim())}
            >
              继续编辑 JSON 配置
            </button>
          </div>
        </section>
      </section>
    );
  }

  const currentConfig =
    settings.data ? themeConfigFor(settings.data.theme, selectedName) : {};

  return (
    <section className="page narrow">
      <div className="page-header">
        <div>
          <h1>{name === "new" ? "新增主题配置" : selectedName}</h1>
          <p>{selectedName} 的 JSON 配置会保存到后端，但不会自动启用。</p>
        </div>
        <Link className="button subtle" to={adminPath("/themes")}>
          返回主题
        </Link>
      </div>
      <section className="panel">
        <ConfigForm
          schema={theme.schema}
          value={{ config: currentConfig }}
          onSubmit={async (value) => {
            await update.mutateAsync(value);
          }}
        />
        {update.error ? <p className="error-text">{update.error.message}</p> : null}
        {remove.error ? <p className="error-text">{remove.error.message}</p> : null}
        {saved ? <p className="success-text">主题配置已保存</p> : null}
        <div className="form-actions split-actions">
          <button
            className="button subtle"
            type="button"
            disabled={remove.isPending || !themeHasConfig(settings.data?.theme, selectedName)}
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 size={16} />
            删除这个主题配置
          </button>
        </div>
        <ConfirmBox
          open={confirmDelete}
          title="删除主题配置"
          description={`确定删除 ${selectedName} 的主题配置吗？主题本身不会被删除。`}
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

function readThemeConfigPayload(value: Record<string, unknown>) {
  const config = value.config;
  if (config && typeof config === "object" && !Array.isArray(config)) {
    return config as Record<string, unknown>;
  }
  return {};
}

type ThemeState = {
  active: string;
  config: Record<string, unknown>;
  configs?: Record<string, Record<string, unknown>>;
};

type ThemeInfo = {
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

function themeItems(knownThemes: ThemeInfo[], theme: ThemeState | undefined) {
  const byName = new Map<string, ThemeInfo>();
  knownThemes.forEach((item) => byName.set(item.name, { ...item, active: theme?.active === item.name }));
  Object.keys(theme?.configs || {}).forEach((name) => {
    byName.set(name, {
      ...themeInfoFor(knownThemes, name),
      active: theme?.active === name,
    });
  });
  if (theme?.active && !byName.has(theme.active)) {
    byName.set(theme.active, {
      ...themeInfoFor(knownThemes, theme.active),
      active: true,
    });
  }
  return Array.from(byName.values());
}

function themeInfoFor(knownThemes: ThemeInfo[], name: string): ThemeInfo {
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

function themeHasConfig(theme: ThemeState | undefined, name: string) {
  return Boolean(theme?.configs?.[name]);
}

function themeConfigFor(theme: ThemeState, name: string) {
  return theme.configs?.[name] || (theme.active === name ? theme.config : {});
}

function writeThemeConfig(theme: ThemeState, name: string, config: Record<string, unknown>) {
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

function deleteThemeConfig(theme: ThemeState, name: string) {
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

function deactivateTheme(theme: ThemeState) {
  return {
    active: "",
    configs: theme.configs || {},
    config: {},
    configs_migrated: true,
  };
}
