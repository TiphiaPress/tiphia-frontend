import { RefreshCw } from "lucide-react";
import type { CommentStatusFilter } from "./commentFilters";
import { commentStatusFilters } from "./commentFilters";

interface CommentToolbarProps {
  status: CommentStatusFilter;
  postId: string;
  fetching: boolean;
  onStatusChange: (status: CommentStatusFilter) => void;
  onPostIdChange: (postId: string) => void;
  onRefresh: () => void;
  t: (key: string, fallback?: string, vars?: Record<string, string | number>) => string;
}

export function CommentToolbar({ status, postId, fetching, onStatusChange, onPostIdChange, onRefresh, t }: CommentToolbarProps) {
  return (
    <div className="toolbar">
      <div className="filter-row">
        <select value={status} onChange={(event) => onStatusChange(event.target.value as CommentStatusFilter)}>
          {commentStatusFilters.map((item) => (
            <option key={item.value || "all"} value={item.value}>
              {t(item.labelKey)}
            </option>
          ))}
        </select>
        <input
          inputMode="numeric"
          placeholder={t("comments.filter_post")}
          value={postId}
          onChange={(event) => onPostIdChange(event.target.value.replace(/\D/g, ""))}
        />
      </div>
      <div className="filter-row compact">
        <span className="muted">
          {t("comments.current", undefined, {
            status: t(commentStatusFilters.find((item) => item.value === status)?.labelKey || "content.all"),
            post: postId ? t("comments.post_suffix", undefined, { postId }) : "",
          })}
        </span>
        <button className="subtle" type="button" onClick={onRefresh} disabled={fetching}>
          <RefreshCw size={16} />
          {t("action.refresh")}
        </button>
      </div>
    </div>
  );
}
