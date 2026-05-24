import { Save } from "lucide-react";
import type { SiteSettings } from "../../types";

interface SettingsFormProps {
  form: SiteSettings;
  pending: boolean;
  error?: Error | null;
  onChange: (form: SiteSettings) => void;
  onSubmit: () => void;
  t: (key: string, fallback?: string, vars?: Record<string, string | number>) => string;
}

export function SettingsForm({ form, pending, error, onChange, onSubmit, t }: SettingsFormProps) {
  return (
    <form
      className="panel form-grid"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <SiteIdentityFields form={form} onChange={onChange} t={t} />
      <SiteBehaviorFields form={form} onChange={onChange} t={t} />
      <SeoFields form={form} onChange={onChange} t={t} />
      {error ? <p className="error-text">{error.message}</p> : null}
      <div className="form-actions">
        <button type="submit" disabled={pending}>
          <Save size={16} />
          {t("settings.save")}
        </button>
      </div>
    </form>
  );
}

function SiteIdentityFields({ form, onChange, t }: FieldGroupProps) {
  return (
    <>
      <label className="field">
        <span>{t("settings.site_title")}</span>
        <input value={form.title} onChange={(event) => onChange({ ...form, title: event.target.value })} />
      </label>
      <label className="field">
        <span>{t("settings.description")}</span>
        <textarea rows={3} value={form.description} onChange={(event) => onChange({ ...form, description: event.target.value })} />
      </label>
      <label className="field">
        <span>{t("settings.avatar_url")}</span>
        <input
          placeholder="https://example.com/avatar.png"
          value={form.avatar_url || ""}
          onChange={(event) => onChange({ ...form, avatar_url: event.target.value || null })}
        />
      </label>
      <label className="field">
        <span>{t("settings.gravatar_base_url")}</span>
        <input
          placeholder="https://www.gravatar.com/avatar/"
          value={form.gravatar_base_url || ""}
          onChange={(event) => onChange({ ...form, gravatar_base_url: event.target.value || null })}
        />
      </label>
      <label className="field">
        <span>{t("settings.base_url")}</span>
        <input value={form.base_url || ""} onChange={(event) => onChange({ ...form, base_url: event.target.value })} />
      </label>
      <label className="field">
        <span>{t("settings.timezone")}</span>
        <input value={form.timezone} onChange={(event) => onChange({ ...form, timezone: event.target.value })} />
      </label>
    </>
  );
}

function SiteBehaviorFields({ form, onChange, t }: FieldGroupProps) {
  return (
    <>
      <label className="field">
        <span>{t("settings.default_page_size")}</span>
        <input type="number" value={form.default_page_size} onChange={(event) => onChange({ ...form, default_page_size: Number(event.target.value) })} />
      </label>
      <label className="field inline">
        <input type="checkbox" checked={form.comments_enabled} onChange={(event) => onChange({ ...form, comments_enabled: event.target.checked })} />
        <span>{t("settings.comments_enabled")}</span>
      </label>
      <label className="field inline">
        <input type="checkbox" checked={form.comment_moderation} onChange={(event) => onChange({ ...form, comment_moderation: event.target.checked })} />
        <span>{t("settings.comment_moderation")}</span>
      </label>
      <label className="field inline">
        <input type="checkbox" checked={form.registration_enabled} onChange={(event) => onChange({ ...form, registration_enabled: event.target.checked })} />
        <span>{t("settings.registration_enabled")}</span>
      </label>
      <label className="field">
        <span>{t("settings.permalink_format")}</span>
        <input value={form.permalink_format} onChange={(event) => onChange({ ...form, permalink_format: event.target.value })} />
      </label>
    </>
  );
}

function SeoFields({ form, onChange, t }: FieldGroupProps) {
  return (
    <>
      <label className="field">
        <span>{t("settings.seo_title_suffix")}</span>
        <input value={form.seo.meta_title_suffix || ""} onChange={(event) => onChange({ ...form, seo: { ...form.seo, meta_title_suffix: event.target.value } })} />
      </label>
      <label className="field">
        <span>{t("settings.seo_description")}</span>
        <textarea rows={3} value={form.seo.meta_description || ""} onChange={(event) => onChange({ ...form, seo: { ...form.seo, meta_description: event.target.value } })} />
      </label>
    </>
  );
}

interface FieldGroupProps {
  form: SiteSettings;
  onChange: (form: SiteSettings) => void;
  t: (key: string, fallback?: string, vars?: Record<string, string | number>) => string;
}
