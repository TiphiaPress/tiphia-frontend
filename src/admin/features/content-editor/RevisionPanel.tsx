import { History } from "lucide-react";
import type { PostRevision } from "../../types";

interface RevisionPanelProps {
  revisions?: PostRevision[];
  loading: boolean;
  pending: boolean;
  previewRevisionId: number | null;
  onPreviewRevision: (updater: (current: number | null) => number | null) => void;
  onRestore: (target: { id: number; createdAt: string }) => void;
  t: (key: string, fallback?: string, vars?: Record<string, string | number>) => string;
}

export function RevisionPanel({
  revisions,
  loading,
  pending,
  previewRevisionId,
  onPreviewRevision,
  onRestore,
  t,
}: RevisionPanelProps) {
  return (
    <section className="revision-panel">
      <h3>
        <History size={16} />
        {t("editor.revisions")}
      </h3>
      {loading ? <small>{t("state.loading")}</small> : null}
      {revisions?.length ? (
        <div className="revision-list">
          {revisions.slice(0, 6).map((revision) => (
            <div className="revision-row" key={revision.id}>
              <button
                className="subtle"
                type="button"
                onClick={() => onPreviewRevision((current) => (current === revision.id ? null : revision.id))}
              >
                {t("editor.revision_view", undefined, { time: new Date(revision.created_at).toLocaleString() })}
              </button>
              <button
                className="subtle"
                type="button"
                disabled={pending}
                onClick={() => onRestore({ id: revision.id, createdAt: revision.created_at })}
              >
                {t("action.restore")}
              </button>
              {previewRevisionId === revision.id ? (
                <article className="revision-preview">
                  <strong>{revision.title}</strong>
                  <small>{revision.status}</small>
                  <pre>{revision.markdown}</pre>
                </article>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <small>{t("editor.no_revisions")}</small>
      )}
    </section>
  );
}
