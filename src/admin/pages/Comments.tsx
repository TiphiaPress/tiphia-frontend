import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, RefreshCw, ShieldAlert, Trash2 } from "lucide-react";
import { useState } from "react";
import { Empty, ErrorState, Loading } from "../components/Status";
import { useToast } from "../components/Toast";
import { api } from "../lib/api";
import type { Comment, CommentStatus, Page } from "../types";
import { useI18n } from "../../framework/i18n";

const statuses: Array<{ labelKey: string; value: CommentStatus | "" }> = [
  { labelKey: "content.all", value: "" },
  { labelKey: "comment_status.pending", value: "pending" },
  { labelKey: "comment_status.approved", value: "approved" },
  { labelKey: "comment_status.spam", value: "spam" },
  { labelKey: "comment_status.trash", value: "trash" },
];

export function Comments() {
  const [status, setStatus] = useState<CommentStatus | "pending" | "">("pending");
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
      toast.success(t("comments.updated", undefined, { status: t(`comment_status.${updated.status}`, updated.status) }));
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
      toast.success(t("comments.bulk_updated", undefined, { status: t(`comment_status.${next}`, next) }));
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
      <div className="toolbar">
        <div className="filter-row">
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as CommentStatus | "");
              setPage(1);
            }}
          >
            {statuses.map((item) => (
              <option key={item.value || "all"} value={item.value}>
                {t(item.labelKey)}
              </option>
            ))}
          </select>
          <input
            inputMode="numeric"
            placeholder={t("comments.filter_post")}
            value={postId}
            onChange={(event) => {
              setPostId(event.target.value.replace(/\D/g, ""));
              setPage(1);
            }}
          />
        </div>
        <div className="filter-row compact">
          <span className="muted">
            {t("comments.current", undefined, {
              status: t(statuses.find((item) => item.value === status)?.labelKey || "content.all"),
              post: postId ? t("comments.post_suffix", undefined, { postId }) : "",
            })}
          </span>
          <button className="subtle" type="button" onClick={() => query.refetch()} disabled={query.isFetching}>
            <RefreshCw size={16} />
            {t("action.refresh")}
          </button>
        </div>
      </div>
      {selectedIds.length > 0 ? (
        <div className="bulk-bar">
          <span>{t("comments.selected", undefined, { count: selectedIds.length })}</span>
          <button className="subtle" disabled={bulkModerate.isPending} onClick={() => bulkModerate.mutate("approved")}>
            {t("comments.bulk_approve")}
          </button>
          <button className="subtle" disabled={bulkModerate.isPending} onClick={() => bulkModerate.mutate("spam")}>
            {t("comments.bulk_spam")}
          </button>
          <button className="danger" disabled={bulkModerate.isPending} onClick={() => bulkModerate.mutate("trash")}>
            {t("comments.bulk_trash")}
          </button>
        </div>
      ) : null}
      {query.isLoading ? <Loading /> : null}
      {query.error ? <ErrorState error={query.error} /> : null}
      {query.data?.data.length === 0 ? <Empty /> : null}
      {query.data && query.data.data.length > 0 ? (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={query.data.data.every((comment) => selectedIds.includes(comment.id))}
                    onChange={(event) => {
                      setSelectedIds(event.target.checked ? query.data.data.map((comment) => comment.id) : []);
                    }}
                  />
                </th>
                <th>{t("comments.author")}</th>
                <th>{t("comments.content")}</th>
                <th>{t("content.status")}</th>
                <th>{t("comments.time")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {query.data.data.map((comment) => (
                <tr key={comment.id} className={moderate.isPending ? "mutating-row" : ""}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(comment.id)}
                      onChange={(event) => {
                        setSelectedIds((current) =>
                          event.target.checked
                            ? [...current, comment.id]
                            : current.filter((id) => id !== comment.id),
                        );
                      }}
                    />
                  </td>
                  <td>
                    <strong>{comment.author_name}</strong>
                    <small>{comment.author_email}</small>
                  </td>
                  <td>
                    <details>
                      <summary>{comment.content.slice(0, 80)}{comment.content.length > 80 ? "..." : ""}</summary>
                      <p className="comment-detail">{comment.content}</p>
                    </details>
                    <small>{t("comments.post_id", undefined, { postId: comment.post_id })}</small>
                  </td>
                  <td>
                    <span className={`badge ${comment.status}`}>{t(`comment_status.${comment.status}`, comment.status)}</span>
                  </td>
                  <td>{new Date(comment.created_at).toLocaleString()}</td>
                  <td className="row-actions">
                    <button
                      className="icon-button"
                      title={t("comments.approve")}
                      disabled={moderate.isPending || comment.status === "approved"}
                      onClick={() => moderate.mutate({ id: comment.id, next: "approved" })}
                    >
                      <Check size={16} />
                    </button>
                    <button
                      className="icon-button"
                      title={t("comments.mark_spam")}
                      disabled={moderate.isPending || comment.status === "spam"}
                      onClick={() => moderate.mutate({ id: comment.id, next: "spam" })}
                    >
                      <ShieldAlert size={16} />
                    </button>
                    <button
                      className="icon-button"
                      title={t("comments.move_trash")}
                      disabled={moderate.isPending || comment.status === "trash"}
                      onClick={() => moderate.mutate({ id: comment.id, next: "trash" })}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
