import { useState } from "react";

const COMMENT_IDENTITY_KEY = "tiphia.comment.identity";

export interface CommentFormState {
  author_name: string;
  author_email: string;
  author_url: string;
  content: string;
}

export function useRememberedCommentForm() {
  const [form, setForm] = useState<CommentFormState>(() => ({
    author_name: "",
    author_email: "",
    author_url: "",
    content: "",
    ...readCommentIdentity(),
  }));
  return [form, setForm] as const;
}

export function rememberCommentIdentity(form: Pick<CommentFormState, "author_name" | "author_email" | "author_url">) {
  window.localStorage.setItem(
    COMMENT_IDENTITY_KEY,
    JSON.stringify({
      author_name: form.author_name,
      author_email: form.author_email,
      author_url: form.author_url,
    }),
  );
}

function readCommentIdentity() {
  try {
    const raw = window.localStorage.getItem(COMMENT_IDENTITY_KEY);
    if (!raw) {
      return {};
    }
    return JSON.parse(raw) as Partial<CommentFormState>;
  } catch {
    return {};
  }
}
