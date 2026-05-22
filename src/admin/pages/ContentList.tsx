import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, Edit3, Plus, Search, Send, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { ConfirmBox } from "../components/ConfirmBox";
import { Empty, ErrorState, Loading } from "../components/Status";
import { useToast } from "../components/Toast";
import { api } from "../lib/api";
import { adminPath } from "../lib/routes";
import type { BulkPostAction, PostStatus, PostType, TermType } from "../types";
import { useState } from "react";
import { useI18n } from "../../framework/i18n";

const statuses: Array<{ labelKey: string; value: PostStatus | "" }> = [
  { labelKey: "content.all", value: "" },
  { labelKey: "status.published", value: "published" },
  { labelKey: "status.draft", value: "draft" },
  { labelKey: "status.pending_review", value: "pending_review" },
  { labelKey: "status.scheduled", value: "scheduled" },
  { labelKey: "status.archived", value: "archived" },
];

export function ContentList({ type }: { type: PostType }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<PostStatus | "">("");
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
        <Link className="button" to={`${basePath}/new`}>
          <Plus size={16} />
          {t("content.new", undefined, { title })}
        </Link>
      </div>

      <div className="toolbar">
        <label className="search-box">
          <Search size={16} />
          <input
            placeholder={t("content.search", undefined, { title })}
            value={q}
            onChange={(event) => {
              setQ(event.target.value);
              setPage(1);
            }}
          />
        </label>
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as PostStatus | "");
            setPage(1);
          }}
        >
          {statuses.map((item) => (
            <option key={item.value || "all"} value={item.value}>
              {t(item.labelKey)}
            </option>
          ))}
        </select>
        <select
          value={termType}
          onChange={(event) => {
            setTermType(event.target.value as TermType);
            setTermId("");
            setPage(1);
          }}
        >
          <option value="category">{t("content.category")}</option>
          <option value="tag">{t("content.tag")}</option>
        </select>
        <select
          value={termId}
          onChange={(event) => {
            setTermId(event.target.value);
            setPage(1);
          }}
        >
          <option value="">{termType === "category" ? t("content.all_category") : t("content.all_tag")}</option>
          {terms.data?.data.map((term) => (
            <option key={term.id} value={term.id}>
              {term.name}
            </option>
          ))}
        </select>
      </div>

      {selectedIds.length > 0 ? (
        <div className="bulk-bar">
          <span>{t("content.selected", undefined, { count: selectedIds.length, title })}</span>
          <button className="subtle" disabled={bulk.isPending} onClick={() => runBulk("publish")}>
            <Send size={16} />
            {t("content.bulk_publish")}
          </button>
          <button className="subtle" disabled={bulk.isPending} onClick={() => runBulk("archive")}>
            <Archive size={16} />
            {t("content.bulk_archive")}
          </button>
          <button className="danger" disabled={bulk.isPending} onClick={() => runBulk("delete")}>
            <Trash2 size={16} />
            {t("content.bulk_delete")}
          </button>
        </div>
      ) : null}

      {query.isLoading ? <Loading /> : null}
      {query.error ? <ErrorState error={query.error} /> : null}
      {query.data && query.data.data.length === 0 ? <Empty /> : null}
      {query.data && query.data.data.length > 0 ? (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={query.data.data.every((post) => selectedIds.includes(post.id))}
                    onChange={(event) => {
                      setSelectedIds(event.target.checked ? query.data.data.map((post) => post.id) : []);
                    }}
                  />
                </th>
                <th>{t("content.title")}</th>
                <th>Slug</th>
                <th>{t("content.status")}</th>
                <th>{t("content.updated_at")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {query.data.data.map((post) => (
                <tr key={post.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(post.id)}
                      onChange={(event) => {
                        setSelectedIds((current) =>
                          event.target.checked
                            ? [...current, post.id]
                            : current.filter((id) => id !== post.id),
                        );
                      }}
                    />
                  </td>
                  <td>
                    <strong>{post.title}</strong>
                    <small>{post.permalink}</small>
                    {post.status === "scheduled" && post.published_at ? (
                      <small className="schedule-hint">
                        {t("content.scheduled_at", undefined, { time: new Date(post.published_at).toLocaleString() })}
                      </small>
                    ) : null}
                  </td>
                  <td>{post.slug}</td>
                  <td>
                    <span className={`badge ${post.status}`}>{t(`status.${post.status}`, post.status)}</span>
                  </td>
                  <td>{new Date(post.updated_at).toLocaleString()}</td>
                  <td className="row-actions">
                    <Link className="icon-button" to={`${basePath}/${post.id}/edit`} title={t("content.edit")}>
                      <Edit3 size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={query.data.meta.page}
            totalPages={query.data.meta.total_pages}
            onPageChange={setPage}
          />
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

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="pagination-row">
      <button className="subtle" disabled={page <= 1} onClick={() => onPageChange(Math.max(1, page - 1))}>
        {t("action.previous")}
      </button>
      <span className="muted">
        {page} / {Math.max(1, totalPages)}
      </span>
      <button className="subtle" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        {t("action.next")}
      </button>
    </div>
  );
}
