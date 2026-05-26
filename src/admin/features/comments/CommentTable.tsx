import { Check, MessageSquareReply, ShieldAlert, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Comment, CommentStatus, Page } from "../../types";

interface CommentTableProps {
  page: Page<Comment>;
  selectedIds: number[];
  moderatePending: boolean;
  replyPending: boolean;
  onSelectedIdsChange: (updater: (current: number[]) => number[]) => void;
  onModerate: (id: number, next: CommentStatus) => void;
  onReply: (id: number, content: string) => void;
  t: (key: string, fallback?: string, vars?: Record<string, string | number>) => string;
}

export function CommentTable({ page, selectedIds, moderatePending, replyPending, onSelectedIdsChange, onModerate, onReply, t }: CommentTableProps) {
  const comments = page.data;
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>
            <input
              type="checkbox"
              checked={comments.every((comment) => selectedIds.includes(comment.id))}
              onChange={(event) => {
                onSelectedIdsChange(() => (event.target.checked ? comments.map((comment) => comment.id) : []));
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
        {comments.map((comment) => (
          <CommentRow
            key={comment.id}
            comment={comment}
            selected={selectedIds.includes(comment.id)}
            pending={moderatePending || replyPending}
            onSelect={(selected) => {
              onSelectedIdsChange((current) => selected ? [...current, comment.id] : current.filter((id) => id !== comment.id));
            }}
            onModerate={onModerate}
            onReply={onReply}
            t={t}
          />
        ))}
      </tbody>
    </table>
  );
}

function CommentRow({
  comment,
  selected,
  pending,
  onSelect,
  onModerate,
  onReply,
  t,
}: {
  comment: Comment;
  selected: boolean;
  pending: boolean;
  onSelect: (selected: boolean) => void;
  onModerate: (id: number, next: CommentStatus) => void;
  onReply: (id: number, content: string) => void;
  t: (key: string, fallback?: string, vars?: Record<string, string | number>) => string;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const canSubmitReply = replyContent.trim().length > 0 && !pending;

  return (
    <tr className={pending ? "mutating-row" : ""}>
      <td>
        <input type="checkbox" checked={selected} onChange={(event) => onSelect(event.target.checked)} />
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
        {replyOpen ? (
          <div className="comment-reply-box">
            <textarea
              rows={3}
              value={replyContent}
              onChange={(event) => setReplyContent(event.target.value)}
              placeholder={t("comments.reply_placeholder", "输入回复内容")}
            />
            <div>
              <button className="button" disabled={!canSubmitReply} onClick={() => {
                const content = replyContent.trim();
                if (!content) return;
                onReply(comment.id, content);
                setReplyContent("");
                setReplyOpen(false);
              }}>
                {t("comments.reply_submit", "发送回复")}
              </button>
              <button className="button subtle" type="button" onClick={() => setReplyOpen(false)}>
                {t("action.cancel", "取消")}
              </button>
            </div>
          </div>
        ) : null}
      </td>
      <td>
        <span className={"badge " + comment.status}>{t("comment_status." + comment.status, comment.status)}</span>
      </td>
      <td>{new Date(comment.created_at).toLocaleString()}</td>
      <td className="row-actions">
        <button
          className="icon-button"
          title={t("comments.reply", "回复")}
          disabled={pending}
          onClick={() => setReplyOpen((value) => !value)}
        >
          <MessageSquareReply size={16} />
        </button>
        <button
          className="icon-button"
          title={t("comments.approve")}
          disabled={pending || comment.status === "approved"}
          onClick={() => onModerate(comment.id, "approved")}
        >
          <Check size={16} />
        </button>
        <button
          className="icon-button"
          title={t("comments.mark_spam")}
          disabled={pending || comment.status === "spam"}
          onClick={() => onModerate(comment.id, "spam")}
        >
          <ShieldAlert size={16} />
        </button>
        <button
          className="icon-button"
          title={t("comments.move_trash")}
          disabled={pending || comment.status === "trash"}
          onClick={() => onModerate(comment.id, "trash")}
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
}
