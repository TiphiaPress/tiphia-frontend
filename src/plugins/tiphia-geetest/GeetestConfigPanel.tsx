import { useEffect, useState } from "react";
import type { PluginConfigPanelProps } from "../../framework/plugin-config";

interface GeetestConfig {
  captcha_id: string;
  captcha_key: string;
  verify_login: boolean;
  verify_register: boolean;
  verify_comment: boolean;
  product: "float" | "popup" | "bind";
  native_button_width: string;
  native_button_height: string;
  rem: string;
  language: string;
  protocol: "" | "http://" | "https://";
  timeout: string;
  next_width: string;
  mask_outside: boolean;
  mask_bg_color: string;
  hide_success: boolean;
  theme_mode: "system" | "light" | "dark";
}

const defaultConfig: GeetestConfig = {
  captcha_id: "",
  captcha_key: "",
  verify_login: true,
  verify_register: true,
  verify_comment: true,
  product: "float",
  native_button_width: "100%",
  native_button_height: "",
  rem: "",
  language: "",
  protocol: "",
  timeout: "30000",
  next_width: "",
  mask_outside: true,
  mask_bg_color: "#0000004d",
  hide_success: false,
  theme_mode: "system",
};

export function GeetestConfigPanel({ value, saving, error, onSubmit }: PluginConfigPanelProps) {
  const [form, setForm] = useState<GeetestConfig>(() => readConfig(value));
  const ready = form.captcha_id.trim().length > 0 && form.captcha_key.trim().length > 0;

  useEffect(() => {
    setForm(readConfig(value));
  }, [value]);

  return (
    <form
      className="plugin-config-panel"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSubmit({
          captcha_id: form.captcha_id.trim(),
          captcha_key: form.captcha_key.trim(),
          verify_login: form.verify_login,
          verify_register: form.verify_register,
          verify_comment: form.verify_comment,
          product: form.product,
          native_button_width: form.native_button_width.trim(),
          native_button_height: form.native_button_height.trim(),
          rem: numberOrNull(form.rem),
          language: form.language.trim(),
          protocol: form.protocol || null,
          timeout: numberOrNull(form.timeout),
          next_width: form.next_width.trim(),
          mask_outside: form.mask_outside,
          mask_bg_color: form.mask_bg_color.trim(),
          hide_success: form.hide_success,
          theme_mode: form.theme_mode,
        });
      }}
    >
      <div className="config-panel-header">
        <div>
          <h2>GeeTest 验证</h2>
          <p>只有插件启用且 Captcha ID / Key 都填写后，登录、注册和评论验证码才会生效。</p>
        </div>
        <span className={ready ? "badge approved" : "badge pending"}>{ready ? "配置完整" : "未生效"}</span>
      </div>

      <div className="config-grid">
        <label className="field">
          <span>Captcha ID</span>
          <input
            value={form.captcha_id}
            autoComplete="off"
            onChange={(event) => setForm({ ...form, captcha_id: event.target.value })}
          />
        </label>
        <label className="field">
          <span>Captcha Key</span>
          <input
            type="password"
            value={form.captcha_key}
            autoComplete="new-password"
            onChange={(event) => setForm({ ...form, captcha_key: event.target.value })}
          />
        </label>
      </div>

      <div className="check-list plain">
        <label className="check-row">
          <input
            type="checkbox"
            checked={form.verify_login}
            onChange={(event) => setForm({ ...form, verify_login: event.target.checked })}
          />
          后台登录验证
        </label>
        <label className="check-row">
          <input
            type="checkbox"
            checked={form.verify_register}
            onChange={(event) => setForm({ ...form, verify_register: event.target.checked })}
          />
          公开注册验证
        </label>
        <label className="check-row">
          <input
            type="checkbox"
            checked={form.verify_comment}
            onChange={(event) => setForm({ ...form, verify_comment: event.target.checked })}
          />
          博客评论验证
        </label>
      </div>

      <h2>展示参数</h2>
      <div className="config-grid">
        <label className="field">
          <span>展现形式</span>
          <select value={form.product} onChange={(event) => setForm({ ...form, product: event.target.value as GeetestConfig["product"] })}>
            <option value="float">float</option>
            <option value="popup">popup</option>
            <option value="bind">bind</option>
          </select>
        </label>
        <label className="field">
          <span>语言</span>
          <select value={form.language} onChange={(event) => setForm({ ...form, language: event.target.value })}>
            <option value="">浏览器默认</option>
            <option value="zho">简体中文</option>
            <option value="eng">English</option>
            <option value="zho-tw">繁体中文</option>
            <option value="jpn">日本語</option>
            <option value="kor">한국어</option>
            <option value="deu">Deutsch</option>
            <option value="fra">Français</option>
          </select>
        </label>
        <label className="field">
          <span>验证码主题</span>
          <select value={form.theme_mode} onChange={(event) => setForm({ ...form, theme_mode: event.target.value as GeetestConfig["theme_mode"] })}>
            <option value="system">跟随浏览器</option>
            <option value="light">浅色模式</option>
            <option value="dark">暗黑模式</option>
          </select>
        </label>
        <label className="field">
          <span>按钮宽度</span>
          <input value={form.native_button_width} placeholder="100%" onChange={(event) => setForm({ ...form, native_button_width: event.target.value })} />
        </label>
        <label className="field">
          <span>按钮高度</span>
          <input value={form.native_button_height} placeholder="50px" onChange={(event) => setForm({ ...form, native_button_height: event.target.value })} />
        </label>
        <label className="field">
          <span>缩放比例 rem</span>
          <input value={form.rem} placeholder="1" onChange={(event) => setForm({ ...form, rem: event.target.value })} />
        </label>
        <label className="field">
          <span>请求超时 ms</span>
          <input value={form.timeout} placeholder="30000" onChange={(event) => setForm({ ...form, timeout: event.target.value })} />
        </label>
        <label className="field">
          <span>协议</span>
          <select value={form.protocol} onChange={(event) => setForm({ ...form, protocol: event.target.value as GeetestConfig["protocol"] })}>
            <option value="">当前页面协议</option>
            <option value="https://">https://</option>
            <option value="http://">http://</option>
          </select>
        </label>
        <label className="field">
          <span>弹窗宽度</span>
          <input value={form.next_width} placeholder="360px" onChange={(event) => setForm({ ...form, next_width: event.target.value })} />
        </label>
        <label className="field">
          <span>遮罩背景色</span>
          <input value={form.mask_bg_color} placeholder="#0000004d" onChange={(event) => setForm({ ...form, mask_bg_color: event.target.value })} />
        </label>
      </div>
      <div className="check-list plain">
        <label className="check-row">
          <input type="checkbox" checked={form.mask_outside} onChange={(event) => setForm({ ...form, mask_outside: event.target.checked })} />
          点击验证码区域外关闭弹窗
        </label>
        <label className="check-row">
          <input type="checkbox" checked={form.hide_success} onChange={(event) => setForm({ ...form, hide_success: event.target.checked })} />
          bind 模式下隐藏验证成功弹窗
        </label>
      </div>

      {error instanceof Error ? <p className="error-text">{error.message}</p> : null}
      <div className="form-actions">
        <button type="submit" disabled={saving}>
          {saving ? "保存中..." : "保存配置"}
        </button>
      </div>
    </form>
  );
}

function readConfig(value: Record<string, unknown>): GeetestConfig {
  return {
    captcha_id: stringValue(value.captcha_id),
    captcha_key: stringValue(value.captcha_key),
    verify_login: booleanValue(value.verify_login, defaultConfig.verify_login),
    verify_register: booleanValue(value.verify_register, defaultConfig.verify_register),
    verify_comment: booleanValue(value.verify_comment, defaultConfig.verify_comment),
    product: productValue(value.product),
    native_button_width: stringValue(value.native_button_width) || defaultConfig.native_button_width,
    native_button_height: stringValue(value.native_button_height),
    rem: optionalNumberString(value.rem),
    language: stringValue(value.language),
    protocol: protocolValue(value.protocol),
    timeout: optionalNumberString(value.timeout) || defaultConfig.timeout,
    next_width: stringValue(value.next_width),
    mask_outside: booleanValue(value.mask_outside, defaultConfig.mask_outside),
    mask_bg_color: stringValue(value.mask_bg_color) || defaultConfig.mask_bg_color,
    hide_success: booleanValue(value.hide_success, defaultConfig.hide_success),
    theme_mode: themeModeValue(value.theme_mode),
  };
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function booleanValue(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function productValue(value: unknown): GeetestConfig["product"] {
  return value === "popup" || value === "bind" || value === "float" ? value : defaultConfig.product;
}

function themeModeValue(value: unknown): GeetestConfig["theme_mode"] {
  return value === "dark" || value === "light" || value === "system" ? value : defaultConfig.theme_mode;
}

function protocolValue(value: unknown): GeetestConfig["protocol"] {
  return value === "http://" || value === "https://" ? value : "";
}

function optionalNumberString(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? String(value) : stringValue(value);
}

function numberOrNull(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

