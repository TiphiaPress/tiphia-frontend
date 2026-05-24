import type { PostStatus } from "../../types";

export interface ContentEditorForm {
  slug: string;
  title: string;
  markdown: string;
  excerpt: string;
  status: PostStatus;
  published_at: string;
}

export const emptyPost: ContentEditorForm = {
  slug: "",
  title: "",
  markdown: "",
  excerpt: "",
  status: "draft",
  published_at: "",
};

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}
