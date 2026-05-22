import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { ErrorState, Loading } from "../components/Status";
import { useToast } from "../components/Toast";
import { useI18n } from "../../framework/i18n";
import { api } from "../lib/api";
import type { SiteSettings } from "../types";

const defaults: SiteSettings = {
  title: "Tiphia",
  description: "A Rust blog powered by Tiphia.",
  avatar_url: "",
  base_url: "http://127.0.0.1:3000",
  timezone: "UTC",
  default_page_size: 20,
  comments_enabled: true,
  comment_moderation: true,
  registration_enabled: false,
  permalink_format: "/archives/{slug}",
  theme: {
    active: "default",
    configs: {},
    config: {},
    configs_migrated: true,
  },
  seo: {
    meta_title_suffix: "Tiphia",
    meta_description: "A Rust blog powered by Tiphia.",
  },
};

export function SettingsPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useI18n();
  const [form, setForm] = useState<SiteSettings>(defaults);
  const query = useQuery({ queryKey: ["settings"], queryFn: api.getSettings });
  const update = useMutation({
    mutationFn: () => api.updateSettings(form),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success(t("settings.saved"));
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t("settings.save_failed"));
    },
  });

  useEffect(() => {
    if (query.data) {
      setForm(query.data);
    }
  }, [query.data]);

  if (query.isLoading) {
    return <Loading />;
  }

  if (query.error) {
    return <ErrorState error={query.error} />;
  }

  return (
    <section className="page narrow">
      <div className="page-header">
        <div>
          <h1>{t("settings.title")}</h1>
          <p>{t("settings.subtitle")}</p>
        </div>
      </div>
      <form
        className="panel form-grid"
        onSubmit={(event) => {
          event.preventDefault();
          update.mutate();
        }}
      >
        <label className="field">
          <span>{t("settings.site_title")}</span>
          <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
        </label>
        <label className="field">
          <span>{t("settings.description")}</span>
          <textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        </label>
        <label className="field">
          <span>{t("settings.avatar_url")}</span>
          <input
            placeholder="https://example.com/avatar.png"
            value={form.avatar_url || ""}
            onChange={(event) => setForm({ ...form, avatar_url: event.target.value || null })}
          />
        </label>
        <label className="field">
          <span>{t("settings.base_url")}</span>
          <input value={form.base_url || ""} onChange={(event) => setForm({ ...form, base_url: event.target.value })} />
        </label>
        <label className="field">
          <span>{t("settings.timezone")}</span>
          <input value={form.timezone} onChange={(event) => setForm({ ...form, timezone: event.target.value })} />
        </label>
        <label className="field">
          <span>{t("settings.default_page_size")}</span>
          <input
            type="number"
            value={form.default_page_size}
            onChange={(event) => setForm({ ...form, default_page_size: Number(event.target.value) })}
          />
        </label>
        <label className="field inline">
          <input
            type="checkbox"
            checked={form.comments_enabled}
            onChange={(event) => setForm({ ...form, comments_enabled: event.target.checked })}
          />
          <span>{t("settings.comments_enabled")}</span>
        </label>
        <label className="field inline">
          <input
            type="checkbox"
            checked={form.comment_moderation}
            onChange={(event) => setForm({ ...form, comment_moderation: event.target.checked })}
          />
          <span>{t("settings.comment_moderation")}</span>
        </label>
        <label className="field inline">
          <input
            type="checkbox"
            checked={form.registration_enabled}
            onChange={(event) => setForm({ ...form, registration_enabled: event.target.checked })}
          />
          <span>{t("settings.registration_enabled")}</span>
        </label>
        <label className="field">
          <span>{t("settings.permalink_format")}</span>
          <input value={form.permalink_format} onChange={(event) => setForm({ ...form, permalink_format: event.target.value })} />
        </label>
        <label className="field">
          <span>{t("settings.seo_title_suffix")}</span>
          <input
            value={form.seo.meta_title_suffix || ""}
            onChange={(event) => setForm({ ...form, seo: { ...form.seo, meta_title_suffix: event.target.value } })}
          />
        </label>
        <label className="field">
          <span>{t("settings.seo_description")}</span>
          <textarea
            rows={3}
            value={form.seo.meta_description || ""}
            onChange={(event) => setForm({ ...form, seo: { ...form.seo, meta_description: event.target.value } })}
          />
        </label>
        {update.error ? <p className="error-text">{update.error.message}</p> : null}
        <div className="form-actions">
          <button type="submit">
            <Save size={16} />
            {t("settings.save")}
          </button>
        </div>
      </form>
    </section>
  );
}
