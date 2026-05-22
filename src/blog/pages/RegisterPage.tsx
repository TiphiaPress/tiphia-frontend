import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { FrontendHookSlot } from "../../framework/plugin-hooks";
import { State } from "../components/State";
import { useSeo } from "../hooks/useSeo";
import { api } from "../lib/api";
import { absoluteUrl } from "../lib/url";

export function RegisterPage() {
  const settings = useQuery({ queryKey: ["settings"], queryFn: api.settings });
  const authStatus = useQuery({ queryKey: ["auth-status"], queryFn: api.authStatus });
  const geetest = useQuery({
    queryKey: ["geetest-config"],
    queryFn: api.geetestConfig,
    retry: false,
  });
  const [form, setForm] = useState({
    username: "",
    email: "",
    display_name: "",
    password: "",
  });
  const [captcha, setCaptcha] = useState<Record<string, unknown> | null>(null);
  const captchaRequired = Boolean(geetest.data?.enabled && geetest.data.verify_register);
  const register = useMutation({
    mutationFn: () =>
      api.register({
        username: form.username,
        email: form.email,
        password: form.password,
        display_name: form.display_name || null,
        captcha,
      }),
    onError: () => setCaptcha(null),
  });
  useSeo({
    title: "注册",
    description: "注册站点账号",
    siteTitle: settings.data?.title,
    suffix: settings.data?.seo.meta_title_suffix,
    canonical: absoluteUrl(settings.data?.base_url, "/register"),
  });

  const registrationEnabled =
    authStatus.data?.registration_enabled ?? settings.data?.registration_enabled;

  return (
    <section className="auth-page">
      <div className="hero compact-hero">
        <Link className="back-link" to="/">返回首页</Link>
        <h1>注册</h1>
        <p>{registrationEnabled ? "创建一个新的站点账号" : "当前站点未开放公开注册"}</p>
      </div>
      {registrationEnabled === undefined ? (
        <State text="读取注册状态中..." />
      ) : !registrationEnabled ? (
        <State text="当前站点未开放公开注册，请联系站点管理员。" />
      ) : (
        <form
          className="auth-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (captchaRequired && !captcha) {
              register.reset();
              return;
            }
            register.mutate();
          }}
        >
          <label>
            <span>账号</span>
            <input
              autoComplete="username"
              value={form.username}
              onChange={(event) => setForm({ ...form, username: event.target.value })}
            />
          </label>
          <label>
            <span>邮箱</span>
            <input
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </label>
          <label>
            <span>显示名</span>
            <input
              autoComplete="name"
              value={form.display_name}
              onChange={(event) => setForm({ ...form, display_name: event.target.value })}
            />
          </label>
          <label>
            <span>密码</span>
            <input
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
          </label>
          <FrontendHookSlot hook="blog.auth.register.captcha" context={{ mode: "register", onVerify: setCaptcha }} />
          {captchaRequired && !captcha ? <p className="muted">请先完成验证码。</p> : null}
          {register.error ? <p className="error-text">{register.error.message}</p> : null}
          {register.isSuccess ? <p className="success-text">注册成功，请前往管理后台登录。</p> : null}
          <button type="submit" disabled={register.isPending}>
            {register.isPending ? "提交中..." : "注册"}
          </button>
        </form>
      )}
    </section>
  );
}

