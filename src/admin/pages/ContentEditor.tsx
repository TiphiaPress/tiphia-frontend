import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ConfirmBox } from "../components/ConfirmBox";
import { ErrorState, Loading } from "../components/Status";
import { useToast } from "../components/Toast";
import { useI18n } from "../../framework/i18n";
import { api } from "../lib/api";
import { adminPath } from "../lib/routes";
import { EditorMainPanel } from "../features/content-editor/EditorMainPanel";
import { EditorSidePanel } from "../features/content-editor/EditorSidePanel";
import { emptyPost } from "../features/content-editor/editorModel";
import type { PostType, TermType } from "../types";

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
        <EditorMainPanel form={form} onChange={setForm} t={t} />

        <EditorSidePanel
          form={form}
          terms={allTerms.data?.data || []}
          selectedTermIds={selectedTermIds}
          termType={termType}
          isNew={isNew}
          savePending={save.isPending}
          deletePending={remove.isPending}
          restorePending={restore.isPending}
          saveError={save.error}
          deleteError={remove.error}
          revisions={revisions.data}
          revisionsLoading={revisions.isLoading}
          previewRevisionId={previewRevisionId}
          onFormChange={setForm}
          onTermTypeChange={setTermType}
          onSelectedTermIdsChange={setSelectedTermIds}
          onSaveActionChange={setSaveAction}
          onDelete={() => remove.mutate()}
          onPreviewRevision={setPreviewRevisionId}
          onRestoreRevision={setRestoreTarget}
          t={t}
        />
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





