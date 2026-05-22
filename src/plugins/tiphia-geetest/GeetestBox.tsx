import { useQuery } from "@tanstack/react-query";
import { useEffect, useId, useMemo, useState } from "react";
import { api as adminApi } from "../../admin/lib/api";
import type { GeetestHookContext, GeetestPublicConfig } from "./types";

export function GeetestHookBox({ mode, onVerify }: GeetestHookContext) {
  const geetest = useQuery({
    queryKey: ["geetest-config"],
    queryFn: adminApi.geetestConfig,
    retry: false,
  });
  const enabled = shouldRender(geetest.data as GeetestPublicConfig | undefined, mode);

  if (!enabled || !geetest.data?.captcha_id || !onVerify) {
    return null;
  }

  return (
    <>
      <GeetestBox config={geetest.data as GeetestPublicConfig} mode={mode} onVerify={onVerify} />
      <p className="muted">请先完成验证码。</p>
    </>
  );
}

function GeetestBox({
  config,
  mode,
  onVerify,
}: {
  config: GeetestPublicConfig;
  mode: string;
  onVerify: (value: Record<string, unknown> | null) => void;
}) {
  const generatedId = useId();
  const id = `geetest-${generatedId.replace(/:/g, "")}`;
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorText, setErrorText] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const options = useMemo(() => buildOptions(config), [config]);

  useEffect(() => {
    let cancelled = false;
    let captchaInstance: GeetestCaptcha | null = null;

    onVerify(null);
    setStatus("loading");
    setErrorText("");
    document.getElementById(id)?.replaceChildren();
    loadGeetestScript()
      .then(waitForGeetestReady)
      .then(() => {
        if (cancelled || !window.initGeetest4 || !config.captcha_id) {
          setStatus("error");
          setErrorText("GeeTest 脚本已加载，但 initGeetest4 不存在。");
          return;
        }
        window.initGeetest4({ captchaId: config.captcha_id, ...options }, (captcha) => {
          if (cancelled) {
            return;
          }
          captchaInstance = captcha;
          captcha.appendTo(`#${id}`);
          captcha.onReady(() => setStatus("ready"));
          captcha.onSuccess(() => onVerify(captcha.getValidate()));
          captcha.onError((error) => {
            console.warn("GeeTest captcha error", error);
            setStatus("error");
            setErrorText(formatGeetestError(error));
            onVerify(null);
          });
        });
      })
      .catch((error) => {
        console.warn("Failed to load GeeTest script", error);
        setStatus("error");
        setErrorText("无法加载 https://static.geetest.com/v4/gt4.js。");
        onVerify(null);
      });

    return () => {
      cancelled = true;
      captchaInstance?.reset();
    };
  }, [config.captcha_id, id, mode, onVerify, options, retryKey]);

  return (
    <div className="field">
      <span>验证码</span>
      <div id={id} className="geetest-box" />
      {status === "loading" ? <small>验证码加载中...</small> : null}
      {status === "ready" ? <small>完成验证码后再提交。</small> : null}
      {status === "error" ? (
        <>
          <small className="error-text">
            验证码加载失败：{errorText || "请检查 GeeTest 配置、网络或浏览器控制台。"}
          </small>
          <button className="text-button" type="button" onClick={() => setRetryKey((value) => value + 1)}>
            重新加载验证码
          </button>
        </>
      ) : null}
    </div>
  );
}

function shouldRender(config: GeetestPublicConfig | undefined, mode: GeetestHookContext["mode"]) {
  if (!config?.enabled || !config.captcha_id) {
    return false;
  }
  if (mode === "login") {
    return config.verify_login;
  }
  if (mode === "register") {
    return config.verify_register;
  }
  return config.verify_comment;
}

function buildOptions(config: GeetestPublicConfig) {
  return {
    product: config.product || "float",
    nativeButton: {
      width: config.native_button_width || "100%",
      height: config.native_button_height || undefined,
    },
    rem: config.rem || undefined,
    language: config.language || undefined,
    protocol: config.protocol || undefined,
    timeout: config.timeout || undefined,
    hideBar: config.hide_bar || undefined,
    mask: {
      outside: config.mask_outside ?? true,
      bgColor: config.mask_bg_color || "#0000004d",
    },
    nextWidth: config.next_width || undefined,
    hideSuccess: config.hide_success || undefined,
  };
}

function formatGeetestError(error: unknown) {
  if (!error) {
    return "请检查 captcha_id 是否正确，以及当前网络是否能访问 GeeTest。";
  }
  if (typeof error === "string") {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return "请检查 captcha_id 是否正确，以及当前网络是否能访问 GeeTest。";
  }
}

function waitForGeetestReady() {
  return new Promise<void>((resolve, reject) => {
    const startedAt = Date.now();
    const tick = () => {
      if (window.initGeetest4) {
        resolve();
        return;
      }
      if (Date.now() - startedAt > 5000) {
        reject(new Error("initGeetest4 timeout"));
        return;
      }
      window.setTimeout(tick, 50);
    };
    tick();
  });
}

function loadGeetestScript() {
  const src = "https://static.geetest.com/v4/gt4.js";
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
  if (existing) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("failed to load geetest"));
    document.head.appendChild(script);
  });
}
