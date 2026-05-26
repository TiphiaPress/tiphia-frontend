import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { publicConfig, requestPasswordReset } from "./api";
import "./styles.css";

export function PasswordRecoveryEntry({ mode }: { mode?: string }) {
  const config = useQuery({ queryKey: ["comment-mail-push-public-config"], queryFn: publicConfig, retry: false });
  const [open, setOpen] = useState(false);

  if (mode && mode !== "login") return null;
  if (!config.data?.password_reset_enabled) return null;

  return (
    <div className={`mail-push-recovery${open ? " is-open" : ""}`}>
      <button className="mail-push-recovery-label" type="button" onClick={() => setOpen((value) => !value)}>
        忘记密码
      </button>
      {open ? <ForgotPasswordForm /> : null}
    </div>
  );
}

function ForgotPasswordForm() {
  const [account, setAccount] = useState("");
  const mutation = useMutation({ mutationFn: () => requestPasswordReset(account) });

  return (
    <div className="mail-push-inline-panel">
      <label className="field">
        <span>账号或邮箱</span>
        <input value={account} onChange={(event) => setAccount(event.target.value)} placeholder="username@example.com" />
      </label>
      <button type="button" disabled={!account.trim() || mutation.isPending} onClick={() => mutation.mutate()}>
        {mutation.isPending ? "发送中..." : "发送找回邮件"}
      </button>
      {mutation.isSuccess ? <p className="success-text">如果账号存在，找回密码邮件会发送到该账号邮箱。</p> : null}
      {mutation.error instanceof Error ? <p className="error-text">{mutation.error.message}</p> : null}
    </div>
  );
}
