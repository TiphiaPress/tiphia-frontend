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
import { emptyPost, slugify } from "../features/content-editor/editorModel";
import type { PostType, Term, TermType } from "../types";

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
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [selectedTagNames, setSelectedTagNames] = useState<string[]>([]);
  const [saveAction, setSaveAction] = useState<"stay" | "return">("stay");
  const [previewRevisionId, setPreviewRevisionId] = useState<number | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<{ id: number; createdAt: string } | null>(null);

  const detail = useQuery({
    queryKey: ["content-detail", type, numericId],
    queryFn: () => api.getAdminPost(type, numericId),
    enabled: !isNew,
  });
  const categories = useQuery({
    queryKey: ["terms", "category", "all"],
    queryFn: () => fetchAllTerms("category"),
  });
  const tags = useQuery({
    queryKey: ["terms", "tag", "all"],
    queryFn: () => fetchAllTerms("tag"),
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
      setSelectedCategoryIds(boundTerms.data.filter((term) => term.term_type === "category").map((term) => term.id));
      setSelectedTagNames(uniqueNames(boundTerms.data.filter((term) => term.term_type === "tag").map((term) => term.name)));
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
      const tagIds = await resolveTagIds(selectedTagNames, tags.data || []);
      await api.syncPostTerms(type, savedId, [...selectedCategoryIds, ...tagIds]);
      await queryClient.invalidateQueries({ queryKey: ["content"] });
      await queryClient.invalidateQueries({ queryKey: ["content-terms"] });
      await queryClient.invalidateQueries({ queryKey: ["content-revisions"] });
      await queryClient.invalidateQueries({ queryKey: ["terms"] });
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
          categories={categories.data || []}
          tags={tags.data || []}
          selectedCategoryIds={selectedCategoryIds}
          selectedTagNames={selectedTagNames}
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
          onSelectedCategoryIdsChange={setSelectedCategoryIds}
          onSelectedTagNamesChange={setSelectedTagNames}
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

async function fetchAllTerms(termType: TermType) {
  const first = await api.listTerms({ page: 1, per_page: 100, term_type: termType });
  const pages = [first];
  for (let page = 2; page <= first.meta.total_pages; page += 1) {
    pages.push(await api.listTerms({ page, per_page: 100, term_type: termType }));
  }
  return pages.flatMap((page) => page.data);
}

async function resolveTagIds(names: string[], knownTags: TermLike[]) {
  const ids: number[] = [];
  let tagPool: TermLike[] = knownTags;
  for (const name of uniqueNames(names)) {
    let tag = findTagByName(tagPool, name);
    if (!tag) {
      try {
        tag = await api.createTerm({
          name,
          slug: slugify(name),
          term_type: "tag",
          description: "",
          parent_id: null,
          sort_order: 0,
        });
      } catch (error) {
        tagPool = await fetchAllTerms("tag");
        tag = findTagByName(tagPool, name);
        if (!tag) {
          throw error;
        }
      }
    }
    if (tag) {
      ids.push(tag.id);
    }
  }
  return Array.from(new Set(ids));
}

type TermLike = Pick<Term, "id" | "slug" | "name">;

function findTagByName(tags: TermLike[], name: string): TermLike | undefined {
  const normalized = normalizeName(name);
  const slug = slugify(name).toLowerCase();
  return tags.find((tag) => normalizeName(tag.name) === normalized || tag.slug.toLowerCase() === slug);
}

function uniqueNames(names: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const name of names) {
    const normalized = normalizeName(name);
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    result.push(name.trim().replace(/\s+/g, " "));
  }
  return result;
}

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}


