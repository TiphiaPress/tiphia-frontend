import type { CommentStatus } from "../../types";

export type CommentStatusFilter = CommentStatus | "";

export const commentStatusFilters: Array<{ labelKey: string; value: CommentStatusFilter }> = [
  { labelKey: "content.all", value: "" },
  { labelKey: "comment_status.pending", value: "pending" },
  { labelKey: "comment_status.approved", value: "approved" },
  { labelKey: "comment_status.spam", value: "spam" },
  { labelKey: "comment_status.trash", value: "trash" },
];
