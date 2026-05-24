import type { CommentStatus } from "../../types";

interface CommentBulkBarProps {
  count: number;
  pending: boolean;
  onModerate: (status: CommentStatus) => void;
  t: (key: string, fallback?: string, vars?: Record<string, string | number>) => string;
}

export function CommentBulkBar({ count, pending, onModerate, t }: CommentBulkBarProps) {
  if (count <= 0) {
    return null;
  }

  return (
    <div className="bulk-bar">
      <span>{t("comments.selected", undefined, { count })}</span>
      <button className="subtle" disabled={pending} onClick={() => onModerate("approved")}>
        {t("comments.bulk_approve")}
      </button>
      <button className="subtle" disabled={pending} onClick={() => onModerate("spam")}>
        {t("comments.bulk_spam")}
      </button>
      <button className="danger" disabled={pending} onClick={() => onModerate("trash")}>
        {t("comments.bulk_trash")}
      </button>
    </div>
  );
}
