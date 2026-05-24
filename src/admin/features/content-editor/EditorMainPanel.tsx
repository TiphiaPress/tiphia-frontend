import { Eye } from "lucide-react";
import type { ContentEditorForm } from "./editorModel";
import { slugify } from "./editorModel";

interface EditorMainPanelProps {
  form: ContentEditorForm;
  onChange: (form: ContentEditorForm) => void;
  t: (key: string, fallback?: string, vars?: Record<string, string | number>) => string;
}

export function EditorMainPanel({ form, onChange, t }: EditorMainPanelProps) {
  return (
    <section className="panel editor-main">
      <label className="field">
        <span>{t("content.title")}</span>
        <input
          value={form.title}
          onChange={(event) => onChange({ ...form, title: event.target.value })}
        />
      </label>
      <label className="field">
        <span>Slug</span>
        <input
          placeholder="my-first-post"
          pattern="[a-z0-9-]+"
          value={form.slug}
          onChange={(event) => onChange({ ...form, slug: slugify(event.target.value) })}
        />
        <small>{t("editor.slug_help")}</small>
      </label>
      <label className="field">
        <span>{t("editor.markdown")}</span>
        <textarea
          className="markdown-editor"
          value={form.markdown}
          onChange={(event) => onChange({ ...form, markdown: event.target.value })}
        />
      </label>
      <details className="preview-panel">
        <summary>
          <Eye size={16} />
          {t("editor.preview")}
        </summary>
        <article>
          <h1>{form.title || t("editor.untitled")}</h1>
          <p>{form.excerpt}</p>
          <pre>{form.markdown}</pre>
        </article>
      </details>
    </section>
  );
}
