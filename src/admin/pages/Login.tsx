import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { saveSession } from "../lib/auth";
import { adminPath } from "../lib/routes";
import { useToast } from "../components/Toast";
import { FrontendHookSlot } from "../../framework/plugin-hooks";
import { Brand } from "../components/Brand";

export function Login() {
  const navigate = useNavigate();
  const toast = useToast();
  const status = useQuery({ queryKey: ["auth-status"], queryFn: api.authStatus });
  const geetest = useQuery({
    queryKey: ["geetest-config"],
    queryFn: api.geetestConfig,
    retry: false,
  });
  const [mode, setMode] = useState<"login" | "bootstrap" | "register">("login");
  const [account, setAccount] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState<Record<string, unknown> | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const initialized = status.data?.initialized ?? true;
  const registrationEnabled = Boolean(status.data?.registration_enabled);
  const captchaRequired =
    Boolean(geetest.data?.enabled) &&
    ((mode === "login" && geetest.data?.verify_login) ||
      (mode === "register" && geetest.data?.verify_register));

  useEffect(() => {
    if (status.data && !status.data.initialized) {
      setMode("bootstrap");
    }
    if (status.data?.initialized && mode === "bootstrap") {
      setMode("login");
    }
  }, [mode, status.data]);

  const login = useMutation({
    mutationFn: () =>
      mode === "bootstrap"
        ? api.bootstrap({
          username: account,
          email,
          password,
          display_name: displayName,
        })
        : mode === "register"
          ? api.register({
            username: account,
            email,
            password,
            display_name: displayName,
            captcha,
            extensions: captcha ? { "tiphia-geetest": captcha } : {},
          })
          : api.login({
              account,
              password,
              captcha,
              extensions: {
                ...(captcha ? { "tiphia-geetest": captcha } : {}),
                ...(totpCode ? { "tiphia-authenticator": { totp_code: totpCode } } : {}),
              },
            }),
    onSuccess: (session) => {
      toast.success(mode === "bootstrap" ? "Root 已创建" : mode === "register" ? "注册成功" : "登录成功");
      if (!["root", "admin", "editor"].includes(session.user.role)) {
        toast.error("账号已创建，但当前角色不能进入管理后台");
        return;
      }
      saveSession(session.access_token, session.user);
      navigate(adminPath());
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "提交失败");
      setCaptcha(null);
    },
  });

  return (
    <main className="login-page">
      <section className="login-panel">
        <Brand subtitle={mode === "bootstrap" ? "初始化 Root" : mode === "register" ? "注册账号" : "管理后台"} />
        <div className="segmented">
          <button
            className={mode === "login" ? "" : "subtle"}
            type="button"
            onClick={() => setMode("login")}
          >
            登录
          </button>
          {!initialized ? (
            <button
              className={mode === "bootstrap" ? "" : "subtle"}
              type="button"
              onClick={() => setMode("bootstrap")}
            >
              初始化
            </button>
          ) : null}
          <button
            className={mode === "register" ? "" : "subtle"}
            type="button"
            onClick={() => setMode("register")}
          >
            注册
          </button>
        </div>
        {status.error ? <p className="error-text">无法读取认证状态，请确认后端服务已启动。</p> : null}
        {mode === "register" && !registrationEnabled ? (
          <p className="muted">当前站点未开放公开注册，请联系站点管理员开启注册。</p>
        ) : null}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (captchaRequired && !captcha) {
              toast.error("请先完成验证码");
              return;
            }
            login.mutate();
          }}
        >
          <label className="field">
            <span>账号</span>
            <input
              autoComplete="username"
              value={account}
              onChange={(event) => setAccount(event.target.value)}
            />
          </label>
          {mode === "bootstrap" || mode === "register" ? (
            <>
              <label className="field">
                <span>邮箱</span>
                <input
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <label className="field">
                <span>显示名</span>
                <input
                  autoComplete="name"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                />
              </label>
            </>
          ) : null}
          <label className="field">
            <span>密码</span>
            <input
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {mode === "login" ? <FrontendHookSlot hook="admin.auth.form.after" context={{ mode, onTotpChange: setTotpCode }} /> : null}
          <FrontendHookSlot hook="admin.auth.captcha" context={{ mode, onVerify: setCaptcha }} />
          {login.error ? <p className="error-text">{login.error.message}</p> : null}
          <button type="submit" disabled={login.isPending || (mode === "register" && !registrationEnabled)}>
            {login.isPending ? "提交中..." : mode === "bootstrap" ? "创建 Root" : mode === "register" ? "注册" : "登录"}
          </button>
        </form>
      </section>
    </main>
  );
}
