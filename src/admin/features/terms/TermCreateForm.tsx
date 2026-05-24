import { Plus } from "lucide-react";
import type { TermType } from "../../types";
import { slugify } from "./termsModel";

interface TermCreateFormProps {
  termType: TermType;
  name: string;
  slug: string;
  pending: boolean;
  error?: Error | null;
  onTermTypeChange: (type: TermType) => void;
  onNameChange: (name: string) => void;
  onSlugChange: (slug: string) => void;
  onSubmit: () => void;
  t: (key: string, fallback?: string, vars?: Record<string, string | number>) => string;
}

export function TermCreateForm({ termType, name, slug, pending, error, onTermTypeChange, onNameChange, onSlugChange, onSubmit, t }: TermCreateFormProps) {
  return (
    <section className="panel terms-create-panel compact">
      <form className="terms-create-form" onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
        <label className="field">
          <span>{t("terms.type")}</span>
          <select value={termType} onChange={(event) => onTermTypeChange(event.target.value as TermType)}>
            <option value="category">{t("terms.category")}</option>
            <option value="tag">{t("terms.tag")}</option>
          </select>
        </label>
        <label className="field">
          <span>{t("terms.name")}</span>
          <input value={name} onChange={(event) => onNameChange(event.target.value)} />
        </label>
        <label className="field">
          <span>{t("terms.slug")}</span>
          <input placeholder={t("terms.slug_placeholder")} value={slug} onChange={(event) => onSlugChange(slugify(event.target.value))} />
        </label>
        <button type="submit" disabled={pending}>
          <Plus size={16} />
          {t("action.create")}
        </button>
      </form>
      <small>{t("terms.slug_help")}</small>
      {error ? <p className="error-text">{error.message}</p> : null}
    </section>
  );
}
