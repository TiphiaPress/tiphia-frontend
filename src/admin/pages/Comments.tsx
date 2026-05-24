import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CommentBulkBar } from "../features/comments/CommentBulkBar";
import { CommentTable } from "../features/comments/CommentTable";
import { CommentToolbar } from "../features/comments/CommentToolbar";
import type { CommentStatusFilter } from "../features/comments/commentFilters";
import { Empty, ErrorState, Loading } from "../components/Status";
import { useToast } from "../components/Toast";
import { api } from "../lib/api";
import type { Comment, CommentStatus, Page } from "../types";
import { useI18n } from "../../framework/i18n";

export function Comments() {
  const [status, setStatus] = useState<CommentStatusFilter>("pending");
  const [postId, setPostId] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useI18n();
  const query = useQuery({
    queryKey: ["comments", status, postId, page],
    queryFn: () =>
      api.listComments({
        page,
        per_page: 50,
        status: status || undefined,
        post_id: postId ? Number(postId) : undefined,
      }),
  });
  const moderate = useMutation({
    mutationFn: ({ id, next }: { id: number; next: CommentStatus }) => api.moderateComment(id, next),
    onSuccess: async (updated, variables) => {
      queryClient.setQueriesData<Page<Comment>>({ queryKey: ["comments"] }, (current) => {
        if (!current) {
          return current;
        }

        const queryStatus = status || undefined;
        const shouldRemain = !queryStatus || updated.status === queryStatus;
        const exists = current.data.some((comment) => comment.id === variables.id);
        const data = shouldRemain
          ? current.data.map((comment) => (comment.id === variables.id ? updated : comment))
          : current.data.filter((comment) => comment.id !== variables.id);

        return {
          ...current,
          data,
          meta: {
            ...current.meta,
            total: exists && !shouldRemain ? Math.max(0, current.meta.total - 1) : current.meta.total,
          },
        };
      });
      await queryClient.invalidateQueries({ queryKey: ["comments"] });
      toast.success(t("comments.updated", undefined, { status: t("comment_status." + updated.status, updated.status) }));
      setSelectedIds((current) => current.filter((id) => id !== variables.id));
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t("comments.update_failed"));
    },
  });
  const bulkModerate = useMutation({
    mutationFn: async (next: CommentStatus) => {
      await Promise.all(selectedIds.map((id) => api.moderateComment(id, next)));
      return next;
    },
    onSuccess: async (next) => {
      setSelectedIds([]);
      await queryClient.invalidateQueries({ queryKey: ["comments"] });
      toast.success(t("comments.bulk_updated", undefined, { status: t("comment_status." + next, next) }));
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t("comments.bulk_failed"));
    },
  });

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>{t("comments.title")}</h1>
          <p>{t("comments.subtitle")}</p>
        </div>
      </div>
      <CommentToolbar
        status={status}
        postId={postId}
        fetching={query.isFetching}
        onStatusChange={(next) => {
          setStatus(next);
          setPage(1);
        }}
        onPostIdChange={(next) => {
          setPostId(next);
          setPage(1);
        }}
        onRefresh={() => query.refetch()}
        t={t}
      />
      <CommentBulkBar count={selectedIds.length} pending={bulkModerate.isPending} onModerate={(next) => bulkModerate.mutate(next)} t={t} />
      {query.isLoading ? <Loading /> : null}
      {query.error ? <ErrorState error={query.error} /> : null}
      {query.data?.data.length === 0 ? <Empty /> : null}
      {query.data && query.data.data.length > 0 ? (
        <>
          <CommentTable
            page={query.data}
            selectedIds={selectedIds}
            moderatePending={moderate.isPending}
            onSelectedIdsChange={setSelectedIds}
            onModerate={(id, next) => moderate.mutate({ id, next })}
            t={t}
          />
          <div className="pagination-row">
            <button className="subtle" disabled={query.data.meta.page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
              {t("action.previous")}
            </button>
            <span className="muted">
              {query.data.meta.page} / {Math.max(1, query.data.meta.total_pages)}
            </span>
            <button className="subtle" disabled={query.data.meta.page >= query.data.meta.total_pages} onClick={() => setPage((current) => current + 1)}>
              {t("action.next")}
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}
