import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, History, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ConfirmBox } from "../components/ConfirmBox";
import { ErrorState, Loading } from "../components/Status";
import { useToast } from "../components/Toast";
import { useI18n } from "../../framework/i18n";
import { api } from "../lib/api";
import { adminPath } from "../lib/routes";
import type { PostStatus, PostType, TermType } from "../types";

const emptyPost = {
  slug: "",
  title: "",
  markdown: "",
  excerpt: "",
  status: "draft" as PostStatus,
  published_at: "",
};

export function ContentEditor({ type }: { type: PostType }) {
  const { id } = useParams();
  const isNew = !id;
  const numericId = Number(id);
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const title = type === "page" ? t("content.page") : t("content.post");
  const basePath = adminPath(type === "page" ? "/pages" : "/posts");
  const [form, setForm] = useState(emptyPost);
  const [selectedTermIds, setSelectedTermIds] = useState<number[]>([]);
  const [termType, setTermType] = useState<TermType>("category");
  const [saveAction, setSaveAction] = useState<"stay" | "return">("stay");
  const [previewRevisionId, setPreviewRevisionId] = useState<number | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<{ id: number; createdAt: string } | null>(null);

  const detail = useQuery({
    queryKey: ["content-detail", type, numericId],
    queryFn: () => api.getAdminPost(type, numericId),
    enabled: !isNew,
  });
  const allTerms = useQuery({
    queryKey: ["terms", termType],
    queryFn: () => api.listTerms({ page: 1, per_page: 100, term_type: termType }),
  });
  const boundTerms = useQuery({
    queryKey: ["content-terms", type, numericId],
    queryFn: () => api.postTerms(type, numericId),
    enabled: !isNew,
  });
  const revisions = useQuery({
    queryKey: ["content-revisions", type, numericId],
    queryFn: () => api.listRevisions(type, numericId),
    enabled: !isNew,
  });

  useEffect(() => {
    if (detail.data) {
      setForm({
        slug: detail.data.slug,
        title: detail.data.title,
        markdown: detail.data.markdown,
        excerpt: detail.data.excerpt || "",
        status: detail.data.status,
        published_at: detail.data.published_at || "",
      });
    }
  }, [detail.data]);

  useEffect(() => {
    if (boundTerms.data) {
      setSelectedTermIds(boundTerms.data.map((term) => term.id));
    }
  }, [boundTerms.data]);

  const save = useMutation({
    mutationFn: () => {
      const input = {
        ...form,
        excerpt: form.excerpt || null,
        published_at: form.published_at || null,
      };
      return isNew ? api.createPost(type, input) : api.updatePost(type, numericId, input);
    },
    onSuccess: async (saved) => {
      const savedId = isNew ? saved.id : numericId;
      if (selectedTermIds.length > 0 || !isNew) {
        await api.syncPostTerms(type, savedId, selectedTermIds);
      }
      await queryClient.invalidateQueries({ queryKey: ["content"] });
      await queryClient.invalidateQueries({ queryKey: ["content-terms"] });
      await queryClient.invalidateQueries({ queryKey: ["content-revisions"] });
      toast.success(t("editor.saved", undefined, { title }));
      if (saveAction === "return") {
        navigate(basePath);
        return;
      }
      if (isNew) {
        navigate(`${basePath}/${savedId}/edit`, { replace: true });
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t("editor.save_failed", undefined, { title }));
    },
  });

  const remove = useMutation({
    mutationFn: () => api.deletePost(type, numericId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["content"] });
      toast.success(t("editor.deleted", undefined, { title }));
      navigate(basePath);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t("editor.delete_failed", undefined, { title }));
    },
  });
  const restore = useMutation({
    mutationFn: (revisionId: number) => api.restoreRevision(type, numericId, revisionId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["content-detail", type, numericId] });
      await queryClient.invalidateQueries({ queryKey: ["content-revisions", type, numericId] });
      toast.success(t("editor.revision_restored"));
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t("editor.revision_restore_failed"));
    },
  });

  if (detail.isLoading) {
    return <Loading />;
  }

  if (detail.error) {
    return <ErrorState error={detail.error} />;
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>{t(isNew ? "editor.new_title" : "editor.edit_title", undefined, { title })}</h1>
          <p>{t("editor.subtitle")}</p>
        </div>
        <Link className="button subtle" to={basePath}>
          {t("editor.back_list")}
        </Link>
      </div>

      <form
        className="editor-layout"
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate();
        }}
      >
        <section className="panel editor-main">
          <label className="field">
            <span>{t("content.title")}</span>
            <input
              value={form.title}
              onChange={(event) => {
                const title = event.target.value;
                setForm({
                  ...form,
                  title,
                });
              }}
            />
          </label>
          <label className="field">
            <span>Slug</span>
            <input
              placeholder="my-first-post"
              pattern="[a-z0-9-]+"
              value={form.slug}
              onChange={(event) => {
                setForm({ ...form, slug: slugify(event.target.value) });
              }}
            />
            <small>{t("editor.slug_help")}</small>
          </label>
          <label className="field">
            <span>{t("editor.markdown")}</span>
            <textarea
              className="markdown-editor"
              value={form.markdown}
              onChange={(event) => setForm({ ...form, markdown: event.target.value })}
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

        <aside className="panel editor-side">
          <label className="field">
            <span>{t("content.status")}</span>
            <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as PostStatus })}>
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
              onChange={(event) => setForm({ ...form, published_at: event.target.value })}
            />
          </label>
          <label className="field">
            <span>{t("editor.excerpt")}</span>
            <textarea rows={5} value={form.excerpt} onChange={(event) => setForm({ ...form, excerpt: event.target.value })} />
          </label>
          <div className="field">
            <span>{t("terms.title")}</span>
            <div className="segmented compact">
              <button
                className={termType === "category" ? "" : "subtle"}
                type="button"
                onClick={() => setTermType("category")}
              >
                {t("terms.category")}
              </button>
              <button
                className={termType === "tag" ? "" : "subtle"}
                type="button"
                onClick={() => setTermType("tag")}
              >
                {t("terms.tag")}
              </button>
            </div>
            <div className="check-list">
              {allTerms.data?.data.length ? (
                allTerms.data.data.map((term) => (
                  <label key={term.id} className="check-row">
                    <input
                      type="checkbox"
                      checked={selectedTermIds.includes(term.id)}
                      onChange={(event) => {
                        setSelectedTermIds((current) =>
                          event.target.checked
                            ? [...current, term.id]
                            : current.filter((id) => id !== term.id),
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
          {save.error || remove.error ? <p className="error-text">{(save.error || remove.error)?.message}</p> : null}
          <button type="submit" disabled={save.isPending} onClick={() => setSaveAction("stay")}>
            <Save size={16} />
            {t("action.save")}
          </button>
          <button
            className="subtle"
            type="submit"
            disabled={save.isPending}
            onClick={() => setSaveAction("return")}
          >
            {t("editor.save_return")}
          </button>
          {!isNew ? (
            <button className="danger" type="button" onClick={() => remove.mutate()} disabled={remove.isPending}>
              <Trash2 size={16} />
              {t("action.delete")}
            </button>
          ) : null}
          {!isNew ? (
            <section className="revision-panel">
              <h3>
                <History size={16} />
                {t("editor.revisions")}
              </h3>
              {revisions.isLoading ? <small>{t("state.loading")}</small> : null}
              {revisions.data?.length ? (
                <div className="revision-list">
                  {revisions.data.slice(0, 6).map((revision) => (
                    <div className="revision-row" key={revision.id}>
                      <button
                        className="subtle"
                        type="button"
                        onClick={() => setPreviewRevisionId((current) => (current === revision.id ? null : revision.id))}
                      >
                        {t("editor.revision_view", undefined, { time: new Date(revision.created_at).toLocaleString() })}
                      </button>
                      <button
                        className="subtle"
                        type="button"
                        disabled={restore.isPending}
                        onClick={() => setRestoreTarget({ id: revision.id, createdAt: revision.created_at })}
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
          ) : null}
        </aside>
      </form>
      <ConfirmBox
        open={Boolean(restoreTarget)}
        title={t("editor.restore_revision_title")}
        description={
          restoreTarget
            ? t("editor.restore_revision_desc", undefined, { time: new Date(restoreTarget.createdAt).toLocaleString() })
            : ""
        }
        confirmText={t("action.restore")}
        pending={restore.isPending}
        onCancel={() => setRestoreTarget(null)}
        onConfirm={() => {
          if (restoreTarget) {
            restore.mutate(restoreTarget.id);
          }
          setRestoreTarget(null);
        }}
      />
    </section>
  );
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}
