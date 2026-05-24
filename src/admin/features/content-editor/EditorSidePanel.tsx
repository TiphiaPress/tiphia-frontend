import { Save, Trash2 } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { ContentEditorForm } from "./editorModel";
import { RevisionPanel } from "./RevisionPanel";
import type { PostRevision, PostStatus, TermResponse, TermType } from "../../types";

interface EditorSidePanelProps {
  form: ContentEditorForm;
  terms: TermResponse[];
  selectedTermIds: number[];
  termType: TermType;
  isNew: boolean;
  savePending: boolean;
  deletePending: boolean;
  restorePending: boolean;
  saveError?: Error | null;
  deleteError?: Error | null;
  revisions?: PostRevision[];
  revisionsLoading: boolean;
  previewRevisionId: number | null;
  onFormChange: (form: ContentEditorForm) => void;
  onTermTypeChange: (type: TermType) => void;
  onSelectedTermIdsChange: Dispatch<SetStateAction<number[]>>;
  onSaveActionChange: (action: "stay" | "return") => void;
  onDelete: () => void;
  onPreviewRevision: Dispatch<SetStateAction<number | null>>;
  onRestoreRevision: (target: { id: number; createdAt: string }) => void;
  t: (key: string, fallback?: string, vars?: Record<string, string | number>) => string;
}

export function EditorSidePanel({
  form,
  terms,
  selectedTermIds,
  termType,
  isNew,
  savePending,
  deletePending,
  restorePending,
  saveError,
  deleteError,
  revisions,
  revisionsLoading,
  previewRevisionId,
  onFormChange,
  onTermTypeChange,
  onSelectedTermIdsChange,
  onSaveActionChange,
  onDelete,
  onPreviewRevision,
  onRestoreRevision,
  t,
}: EditorSidePanelProps) {
  return (
    <aside className="panel editor-side">
      <label className="field">
        <span>{t("content.status")}</span>
        <select value={form.status} onChange={(event) => onFormChange({ ...form, status: event.target.value as PostStatus })}>
          <option value="draft">{t("status.draft")}</option>
          <option value="pending_review">{t("status.pending_review")}</option>
          <option value="published">{t("status.published")}</option>
          <option value="scheduled">{t("status.scheduled")}</option>
          <option value="archived">{t("status.archived")}</option>
        </select>
      </label>
      <label className="field">
        <span>{t("editor.publish_time")}</span>
        <input
          placeholder="2026-06-01T00:00:00Z"
          value={form.published_at}
          onChange={(event) => onFormChange({ ...form, published_at: event.target.value })}
        />
      </label>
      <label className="field">
        <span>{t("editor.excerpt")}</span>
        <textarea rows={5} value={form.excerpt} onChange={(event) => onFormChange({ ...form, excerpt: event.target.value })} />
      </label>
      <TermPicker
        terms={terms}
        selectedTermIds={selectedTermIds}
        termType={termType}
        onTermTypeChange={onTermTypeChange}
        onSelectedTermIdsChange={onSelectedTermIdsChange}
        t={t}
      />
      {saveError || deleteError ? <p className="error-text">{(saveError || deleteError)?.message}</p> : null}
      <button type="submit" disabled={savePending} onClick={() => onSaveActionChange("stay")}>
        <Save size={16} />
        {t("action.save")}
      </button>
      <button className="subtle" type="submit" disabled={savePending} onClick={() => onSaveActionChange("return")}>
        {t("editor.save_return")}
      </button>
      {!isNew ? (
        <button className="danger" type="button" onClick={onDelete} disabled={deletePending}>
          <Trash2 size={16} />
          {t("action.delete")}
        </button>
      ) : null}
      {!isNew ? (
        <RevisionPanel
          revisions={revisions}
          loading={revisionsLoading}
          pending={restorePending}
          previewRevisionId={previewRevisionId}
          onPreviewRevision={onPreviewRevision}
          onRestore={onRestoreRevision}
          t={t}
        />
      ) : null}
    </aside>
  );
}

function TermPicker({
  terms,
  selectedTermIds,
  termType,
  onTermTypeChange,
  onSelectedTermIdsChange,
  t,
}: {
  terms: TermResponse[];
  selectedTermIds: number[];
  termType: TermType;
  onTermTypeChange: (type: TermType) => void;
  onSelectedTermIdsChange: Dispatch<SetStateAction<number[]>>;
  t: (key: string, fallback?: string, vars?: Record<string, string | number>) => string;
}) {
  return (
    <div className="field">
      <span>{t("terms.title")}</span>
      <div className="segmented compact">
        <button className={termType === "category" ? "" : "subtle"} type="button" onClick={() => onTermTypeChange("category")}>
          {t("terms.category")}
        </button>
        <button className={termType === "tag" ? "" : "subtle"} type="button" onClick={() => onTermTypeChange("tag")}>
          {t("terms.tag")}
        </button>
      </div>
      <div className="check-list">
        {terms.length ? (
          terms.map((term) => (
            <label key={term.id} className="check-row">
              <input
                type="checkbox"
                checked={selectedTermIds.includes(term.id)}
                onChange={(event) => {
                  onSelectedTermIdsChange((current) =>
                    event.target.checked ? [...current, term.id] : current.filter((id) => id !== term.id),
                  );
                }}
              />
              <span>{term.name}</span>
            </label>
          ))
        ) : (
          <small>{t("editor.no_terms", undefined, { type: termType === "category" ? t("terms.category") : t("terms.tag") })}</small>
        )}
      </div>
    </div>
  );
}
