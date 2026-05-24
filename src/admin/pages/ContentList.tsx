import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ConfirmBox } from "../components/ConfirmBox";
import { Empty, ErrorState, Loading } from "../components/Status";
import { useToast } from "../components/Toast";
import { ContentBulkBar } from "../features/content-list/ContentBulkBar";
import { ContentPagination } from "../features/content-list/ContentPagination";
import { ContentTable } from "../features/content-list/ContentTable";
import { ContentToolbar } from "../features/content-list/ContentToolbar";
import type { PostStatusFilter } from "../features/content-list/contentListModel";
import { api } from "../lib/api";
import { adminPath } from "../lib/routes";
import type { BulkPostAction, PostType, TermType } from "../types";
import { useI18n } from "../../framework/i18n";

export function ContentList({ type }: { type: PostType }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<PostStatusFilter>("");
  const [page, setPage] = useState(1);
  const [termType, setTermType] = useState<TermType>("category");
  const [termId, setTermId] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useI18n();
  const title = type === "page" ? t("content.pages") : t("content.posts");
  const basePath = adminPath(type === "page" ? "/pages" : "/posts");
  const query = useQuery({
    queryKey: ["content", type, q, status, termId, page],
    queryFn: () =>
      api.listAdminPosts(type, {
        page,
        per_page: 30,
        q,
        status: status || undefined,
        term_id: termId ? Number(termId) : undefined,
      }),
  });
  const terms = useQuery({
    queryKey: ["terms", termType],
    queryFn: () => api.listTerms({ page: 1, per_page: 100, term_type: termType }),
  });
  const bulk = useMutation({
    mutationFn: (action: BulkPostAction) =>
      api.bulkPostAction(type, {
        ids: selectedIds,
        action,
      }),
    onSuccess: async (result) => {
      setSelectedIds([]);
      await queryClient.invalidateQueries({ queryKey: ["content"] });
      toast.success(t("content.bulk_done", undefined, { count: result.affected, title }));
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t("content.bulk_failed"));
    },
  });

  function runBulk(action: BulkPostAction) {
    if (selectedIds.length === 0) {
      toast.notify(t("content.select_first"));
      return;
    }
    if (action === "delete") {
      setConfirmBulkDelete(true);
      return;
    }
    bulk.mutate(action);
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>{title}</h1>
          <p>{t("content.manage", undefined, { title })}</p>
        </div>
        <Link className="button" to={basePath + "/new"}>
          <Plus size={16} />
          {t("content.new", undefined, { title })}
        </Link>
      </div>

      <ContentToolbar
        q={q}
        status={status}
        termType={termType}
        termId={termId}
        terms={terms.data?.data || []}
        title={title}
        onQueryChange={(value) => {
          setQ(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        onTermTypeChange={(value) => {
          setTermType(value);
          setTermId("");
          setPage(1);
        }}
        onTermIdChange={(value) => {
          setTermId(value);
          setPage(1);
        }}
        t={t}
      />

      <ContentBulkBar count={selectedIds.length} title={title} pending={bulk.isPending} onRun={runBulk} t={t} />

      {query.isLoading ? <Loading /> : null}
      {query.error ? <ErrorState error={query.error} /> : null}
      {query.data && query.data.data.length === 0 ? <Empty /> : null}
      {query.data && query.data.data.length > 0 ? (
        <>
          <ContentTable
            posts={query.data.data}
            selectedIds={selectedIds}
            basePath={basePath}
            onSelectedIdsChange={setSelectedIds}
            t={t}
          />
          <ContentPagination page={query.data.meta.page} totalPages={query.data.meta.total_pages} onPageChange={setPage} t={t} />
          <ConfirmBox
            open={confirmBulkDelete}
            title={t("content.delete_selected_title", undefined, { title })}
            description={t("content.delete_selected_desc", undefined, { count: selectedIds.length, title })}
            confirmText={t("action.delete")}
            tone="danger"
            pending={bulk.isPending}
            onCancel={() => setConfirmBulkDelete(false)}
            onConfirm={() => {
              bulk.mutate("delete");
              setConfirmBulkDelete(false);
            }}
          />
        </>
      ) : null}
    </section>
  );
}
