import type { PostStatus } from "../../types";

export type PostStatusFilter = PostStatus | "";

export const postStatusFilters: Array<{ labelKey: string; value: PostStatusFilter }> = [
  { labelKey: "content.all", value: "" },
  { labelKey: "status.published", value: "published" },
  { labelKey: "status.draft", value: "draft" },
  { labelKey: "status.pending_review", value: "pending_review" },
  { labelKey: "status.scheduled", value: "scheduled" },
  { labelKey: "status.archived", value: "archived" },
];
