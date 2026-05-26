import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "./api";
import "./styles.css";

export function PasswordResetPage() {
  const token = useMemo(() => new URLSearchParams(window.location.search).get("token") || "", []);

  return (
    <main className="mail-push-reset-page">
      <section className="mail-push-reset-card">
        <div>
          <p className="mail-push-reset-eyebrow">TiphiaPress</p>
          <h1>重置密码</h1>
          <p>请输入新密码。链接过期后需要重新发送找回密码邮件。</p>
        </div>
        {token ? <ResetPasswordForm token={token} /> : <p className="error-text">缺少重置 token，请重新申请找回密码邮件。</p>}
        <Link className="mail-push-login-link" to="/admin/login">返回登录</Link>
      </section>
    </main>
  );
}

function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const mutation = useMutation({ mutationFn: () => resetPassword(token, password) });
  const mismatch = Boolean(password && confirm && password !== confirm);

  return (
    <div className="mail-push-reset-form">
      <label className="field">
        <span>新密码</span>
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" />
      </label>
      <label className="field">
        <span>确认新密码</span>
        <input type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} autoComplete="new-password" />
      </label>
      {mismatch ? <p className="error-text">两次输入的密码不一致。</p> : null}
      <button type="button" disabled={password.length < 8 || mismatch || mutation.isPending} onClick={() => mutation.mutate()}>
        {mutation.isPending ? "重置中..." : "重置密码"}
      </button>
      {mutation.isSuccess ? <p className="success-text">密码已重置，请返回登录页使用新密码登录。</p> : null}
      {mutation.error instanceof Error ? <p className="error-text">{mutation.error.message}</p> : null}
    </div>
  );
}
