import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { State } from "../../components/State";
import { FrontendHookSlot } from "../../../framework/plugin-hooks";
import {
  type CommentFormState,
  rememberCommentIdentity,
  useRememberedCommentForm,
} from "../../hooks/useRememberedCommentForm";
import { api } from "../../lib/api";
import { normalizedHttpUrl } from "../../lib/url";
import type { CommentNode } from "../../types";

export function Comments({ postId }: { postId: number }) {
  const queryClient = useQueryClient();
  const settings = useQuery({ queryKey: ["settings"], queryFn: api.settings });
  const geetest = useQuery({
    queryKey: ["geetest-config"],
    queryFn: api.geetestConfig,
    retry: false,
  });
  const comments = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => api.comments(postId),
  });
  const [form, setForm] = useRememberedCommentForm();
  const [captcha, setCaptcha] = useState<Record<string, unknown> | null>(null);
  const [successText, setSuccessText] = useState("");
  const captchaRequired = Boolean(geetest.data?.enabled && geetest.data.verify_comment);
  const submit = useMutation({
    mutationFn: () =>
      api.createComment({
        post_id: postId,
        parent_id: null,
        author_name: form.author_name,
        author_email: form.author_email,
        author_url: form.author_url || null,
        content: form.content,
        captcha,
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

  if (comments.isLoading) {
    return <State text="加载评论中..." />;
  }
  if (comments.error) {
    return <State text={comments.error.message} tone="error" />;
  }

  return (
    <section className="comments">
      <h2>评论</h2>
      <FrontendHookSlot hook="blog.comment.list.before" context={{ postId, comments: comments.data || [] }} />
      {comments.data?.length ? comments.data.map((comment) => <CommentItem key={comment.id} comment={comment} postId={postId} />) : <p>暂无评论</p>}
      <FrontendHookSlot hook="blog.comment.list.after" context={{ postId, comments: comments.data || [] }} />
      <CommentForm
        title="发表评论"
        form={form}
        setForm={setForm}
        pending={submit.isPending}
        error={submit.error}
        successText={submit.isSuccess ? successText : ""}
        captchaId={captchaRequired ? geetest.data?.captcha_id || "" : ""}
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
    </section>
  );
}

function CommentItem({ comment, postId }: { comment: CommentNode; postId: number }) {
  const queryClient = useQueryClient();
  const geetest = useQuery({
    queryKey: ["geetest-config"],
    queryFn: api.geetestConfig,
    retry: false,
  });
  const [replying, setReplying] = useState(false);
  const [form, setForm] = useRememberedCommentForm();
  const [captcha, setCaptcha] = useState<Record<string, unknown> | null>(null);
  const [successText, setSuccessText] = useState("");
  const captchaRequired = Boolean(geetest.data?.enabled && geetest.data.verify_comment);
  const reply = useMutation({
    mutationFn: () =>
      api.createComment({
        post_id: postId,
        parent_id: comment.id,
        author_name: form.author_name,
        author_email: form.author_email,
        author_url: form.author_url || null,
        content: form.content,
        captcha,
      }),
    onSuccess: async (comment) => {
      setReplying(false);
      rememberCommentIdentity(form);
      setForm({ ...form, content: "" });
      setCaptcha(null);
      setSuccessText(
        comment.status === "approved" ? "回复已提交并显示。" : "回复已提交，等待审核后显示。",
      );
      await queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
    onError: () => setCaptcha(null),
  });

  return (
    <div className="comment">
      <CommentAuthor comment={comment} />
      <p>{comment.content}</p>
      <button className="text-button" type="button" onClick={() => setReplying((value) => !value)}>
        {replying ? "取消回复" : "回复"}
      </button>
      {replying ? (
        <CommentForm
          title={`回复 ${comment.author_name}`}
          form={form}
          setForm={setForm}
          pending={reply.isPending}
          error={reply.error}
          successText={reply.isSuccess ? successText : ""}
          captchaId={captchaRequired ? geetest.data?.captcha_id || "" : ""}
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
      ) : null}
      {comment.children.length ? (
        <div className="comment-children">
          {comment.children.map((child) => (
            <CommentItem key={child.id} comment={child} postId={postId} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CommentAuthor({ comment }: { comment: CommentNode }) {
  const href = normalizedHttpUrl(comment.author_url);
  if (!href) {
    return <strong>{comment.author_name}</strong>;
  }

  return (
    <a
      className="comment-author"
      href={href}
      target="_blank"
      rel="noreferrer noopener"
    >
      {comment.author_name}
    </a>
  );
}

function CommentForm({
  title,
  form,
  setForm,
  pending,
  error,
  successText,
  captchaId,
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
  captchaId?: string;
  captcha?: Record<string, unknown> | null;
  onCaptcha?: (value: Record<string, unknown> | null) => void;
  onSubmit: () => void;
}) {
  const captchaRequired = Boolean(captchaId && onCaptcha);
  return (
    <form
      className="comment-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <h3>{title}</h3>
      <FrontendHookSlot hook="blog.comment.form.before" context={{ title, form }} />
      <div className="form-row">
        <input
          placeholder="昵称"
          value={form.author_name}
          onChange={(event) => setForm({ ...form, author_name: event.target.value })}
        />
        <input
          placeholder="邮箱"
          type="email"
          value={form.author_email}
          onChange={(event) => setForm({ ...form, author_email: event.target.value })}
        />
      </div>
      <input
        placeholder="网址，可选"
        value={form.author_url}
        onChange={(event) => setForm({ ...form, author_url: event.target.value })}
      />
      <textarea
        placeholder="写下你的评论"
        rows={5}
        value={form.content}
        onChange={(event) => setForm({ ...form, content: event.target.value })}
      />
      {captchaRequired ? (
        <FrontendHookSlot hook="blog.comment.captcha" context={{ mode: "comment", title, form, onVerify: onCaptcha }} />
      ) : null}
      {captchaRequired && !captcha ? <p className="muted">请先完成验证码。</p> : null}
      {error ? <p className="error-text">{error instanceof Error ? error.message : "评论提交失败"}</p> : null}
      {successText ? <p className="success-text">{successText}</p> : null}
      <FrontendHookSlot hook="blog.comment.form.after" context={{ title, form }} />
      <button type="submit" disabled={pending}>
        {pending ? "提交中..." : "提交评论"}
      </button>
    </form>
  );
}
