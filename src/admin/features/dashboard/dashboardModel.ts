import type { CommentStatus, PostStatus } from "../../types";

export const postStatuses: Array<{ labelKey: string; value: PostStatus; tone: string }> = [
  { labelKey: "status.published", value: "published", tone: "success" },
  { labelKey: "status.draft", value: "draft", tone: "muted" },
  { labelKey: "status.pending_review", value: "pending_review", tone: "warning" },
  { labelKey: "status.scheduled", value: "scheduled", tone: "info" },
  { labelKey: "status.archived", value: "archived", tone: "danger" },
];

export const commentStatuses: Array<{ labelKey: string; value: CommentStatus; tone: string }> = [
  { labelKey: "comment_status.pending", value: "pending", tone: "warning" },
  { labelKey: "comment_status.approved", value: "approved", tone: "success" },
  { labelKey: "comment_status.spam", value: "spam", tone: "danger" },
  { labelKey: "comment_status.trash", value: "trash", tone: "muted" },
];

export type DistributionItem = {
  label: string;
  tone: string;
  valueCount: number;
};
