import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useActiveThemeViews } from "../../hooks/useActiveThemeViews";
import {
  type CommentFormState,
  rememberCommentIdentity,
  useRememberedCommentForm,
} from "../../hooks/useRememberedCommentForm";
import { api } from "../../lib/api";
import type { CommentNode } from "../../types";

const MAX_COMMENT_DEPTH = 3;

export function Comments({ postId }: { postId: number }) {
  const { State, Comments: CommentsView, CommentForm } = useActiveThemeViews();
  const queryClient = useQueryClient();
  const settings = useQuery({ queryKey: ["settings"], queryFn: api.settings });
  const geetest = useQuery({ queryKey: ["geetest-config"], queryFn: api.geetestConfig, retry: false });
  const comments = useQuery({ queryKey: ["comments", postId], queryFn: () => api.comments(postId) });
  const [form, setForm] = useRememberedCommentForm();
  const [captcha, setCaptcha] = useState<Record<string, unknown> | null>(null);
  const [successText, setSuccessText] = useState("");
  const captchaRequired = Boolean(geetest.data?.enabled && geetest.data.verify_comment);
  const submit = useMutation({
    mutationFn: () => api.createComment({
      post_id: postId,
      parent_id: null,
      author_name: form.author_name,
      author_email: form.author_email,
      author_url: form.author_url || null,
      content: form.content,
      captcha,
      extensions: captcha ? { "tiphia-geetest": captcha } : {},
    }),
    onSuccess: async (comment) => {
      rememberCommentIdentity(form);
      setForm({ ...form, content: "" });
      setCaptcha(null);
      setSuccessText(
        comment.status === "approved" && !settings.data?.comment_moderation
          ? "评论已提交并显示。"
          : "评论已提交，等待审核后显示。",
      );
      await queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
    onError: () => setCaptcha(null),
  });

  if (comments.isLoading) return <State text="加载评论中..." />;
  if (comments.error) return <State text={comments.error.message} tone="error" />;

  return (
    <CommentsView
      postId={postId}
      comments={comments.data || []}
      form={
        <CommentForm
          title="发表评论"
          form={form}
          onFormChange={setForm}
          pending={submit.isPending}
          error={submit.error}
          successText={submit.isSuccess ? successText : ""}
          captchaRequired={captchaRequired}
          captcha={captcha}
          onCaptcha={setCaptcha}
          onSubmit={() => {
            if (captchaRequired && !captcha) {
              setSuccessText("");
              return;
            }
            submit.mutate();
          }}
        />
      }
    >
      {(comments.data || []).map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          postId={postId}
          depth={1}
          gravatarBaseUrl={settings.data?.gravatar_base_url}
        />
      ))}
    </CommentsView>
  );
}

function CommentItem({
  comment,
  postId,
  depth,
  gravatarBaseUrl,
  suppressChildren = false,
}: {
  comment: CommentNode;
  postId: number;
  depth: number;
  gravatarBaseUrl?: string | null;
  suppressChildren?: boolean;
}) {
  const { CommentItem: CommentItemView } = useActiveThemeViews();
  const queryClient = useQueryClient();
  const geetest = useQuery({ queryKey: ["geetest-config"], queryFn: api.geetestConfig, retry: false });
  const [replying, setReplying] = useState(false);
  const [form, setForm] = useRememberedCommentForm();
  const [captcha, setCaptcha] = useState<Record<string, unknown> | null>(null);
  const [successText, setSuccessText] = useState("");
  const captchaRequired = Boolean(geetest.data?.enabled && geetest.data.verify_comment);
  const reply = useMutation({
    mutationFn: () => api.createComment({
      post_id: postId,
      parent_id: comment.id,
      author_name: form.author_name,
      author_email: form.author_email,
      author_url: form.author_url || null,
      content: form.content,
      captcha,
      extensions: captcha ? { "tiphia-geetest": captcha } : {},
    }),
    onSuccess: async (comment) => {
      setReplying(false);
      rememberCommentIdentity(form);
      setForm({ ...form, content: "" });
      setCaptcha(null);
      setSuccessText(comment.status === "approved" ? "回复已提交并显示。" : "回复已提交，等待审核后显示。");
      await queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
    onError: () => setCaptcha(null),
  });

  return (
    <CommentItemView
      comment={comment}
      replying={replying}
      onToggleReply={() => setReplying((value) => !value)}
      depth={depth}
      gravatarBaseUrl={gravatarBaseUrl}
      replyForm={
        <ThemedCommentForm
          title={`回复 ${comment.author_name}`}
          form={form}
          setForm={setForm}
          pending={reply.isPending}
          error={reply.error}
          successText={reply.isSuccess ? successText : ""}
          captchaRequired={captchaRequired}
          captcha={captcha}
          onCaptcha={setCaptcha}
          onSubmit={() => {
            if (captchaRequired && !captcha) {
              setSuccessText("");
              return;
            }
            reply.mutate();
          }}
        />
      }
    >
      {!suppressChildren
        ? commentsForDepth(comment, depth).map((child) => (
            <CommentItem
              key={child.id}
              comment={child}
              postId={postId}
              depth={Math.min(depth + 1, MAX_COMMENT_DEPTH)}
              gravatarBaseUrl={gravatarBaseUrl}
              suppressChildren={depth >= MAX_COMMENT_DEPTH}
            />
          ))
        : null}
    </CommentItemView>
  );
}

function ThemedCommentForm({
  title,
  form,
  setForm,
  pending,
  error,
  successText,
  captchaRequired,
  captcha,
  onCaptcha,
  onSubmit,
}: {
  title: string;
  form: CommentFormState;
  setForm: (form: CommentFormState) => void;
  pending: boolean;
  error: unknown;
  successText: string;
  captchaRequired: boolean;
  captcha?: Record<string, unknown> | null;
  onCaptcha?: (value: Record<string, unknown> | null) => void;
  onSubmit: () => void;
}) {
  const { CommentForm } = useActiveThemeViews();
  return (
    <CommentForm
      title={title}
      form={form}
      onFormChange={setForm}
      pending={pending}
      error={error}
      successText={successText}
      captchaRequired={captchaRequired}
      captcha={captcha}
      onCaptcha={onCaptcha}
      onSubmit={onSubmit}
    />
  );
}

function commentsForDepth(comment: CommentNode, depth: number) {
  return depth >= MAX_COMMENT_DEPTH ? flattenCommentChildren(comment.children) : comment.children;
}

function flattenCommentChildren(comments: CommentNode[]): CommentNode[] {
  return comments.flatMap((comment) => [comment, ...flattenCommentChildren(comment.children)]);
}