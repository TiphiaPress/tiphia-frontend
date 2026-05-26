import { useEffect, useState } from "react";
import type { PluginConfigPanelProps } from "../../framework/plugin-config";
import { defaultConfig, normalizeConfig, type CommentMailPushConfig, type SmtpEncryption } from "./config";
import "./styles.css";

export function CommentMailPushConfigPanel({ value, saving, error, onSubmit }: PluginConfigPanelProps) {
  const [form, setForm] = useState<CommentMailPushConfig>(() => normalizeConfig(value));

  useEffect(() => {
    setForm(normalizeConfig(value));
  }, [value]);

  function patch(next: Partial<CommentMailPushConfig>) {
    setForm((current) => normalizeConfig({ ...defaultConfig, ...current, ...next }));
  }

  return (
    <form
      className="plugin-config-panel mail-push-config-panel"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSubmit({ ...form });
      }}
    >
      <div className="config-panel-header">
        <div>
          <h2>评论邮件推送</h2>
          <p>通过 SMTP 发送新评论通知，并为登录页提供找回密码入口。</p>
        </div>
      </div>

      <section className="mail-push-section">
        <h3>功能开关</h3>
        <div className="checkbox-grid">
          <Toggle checked={form.comment_push_enabled} label="启用评论邮件推送" onChange={(comment_push_enabled) => patch({ comment_push_enabled })} />
          <Toggle checked={form.comment_reply_enabled} label="启用评论回复通知" onChange={(comment_reply_enabled) => patch({ comment_reply_enabled })} />
          <Toggle checked={form.notify_post_author_enabled} label="自动通知文章/页面作者" onChange={(notify_post_author_enabled) => patch({ notify_post_author_enabled })} />
          <Toggle checked={form.password_reset_enabled} label="启用找回密码" onChange={(password_reset_enabled) => patch({ password_reset_enabled })} />
          <Toggle checked={form.smtp_auth_required} label="需要服务器验证" onChange={(smtp_auth_required) => patch({ smtp_auth_required })} />
        </div>
      </section>

      <section className="mail-push-section config-grid two-columns">
        <h3>邮件身份</h3>
        <Field label="发信人名称" value={form.from_name} onChange={(from_name) => patch({ from_name })} />
        <Field label="发件邮箱地址" type="email" value={form.from_email} onChange={(from_email) => patch({ from_email })} required />
        <Field label="邮件回复地址" type="email" value={form.reply_to_email} onChange={(reply_to_email) => patch({ reply_to_email })} help="为空时不设置 Reply-To。" />
        <Field label="评论通知收件邮箱" type="email" value={form.comment_notify_email} onChange={(comment_notify_email) => patch({ comment_notify_email })} help="为空时发送到发件邮箱。" />
        <Field label="找回密码页面地址" value={form.password_reset_base_url} onChange={(password_reset_base_url) => patch({ password_reset_base_url })} help="例如 https://blog.example.com/password-reset，插件会自动追加 token。" />
        <Field label="邮件过期时间（分钟）" type="number" value={String(form.reset_token_ttl_minutes)} onChange={(value) => patch({ reset_token_ttl_minutes: Number(value) })} min={1} max={1440} />
      </section>

      <section className="mail-push-section mail-push-template-section">
        <h3>邮件模板</h3>
        <TextArea
          label="评论通知 HTML 模板"
          value={form.comment_email_template}
          onChange={(comment_email_template) => patch({ comment_email_template })}
          help="通知指定收件邮箱/文章作者。可用：{{post_title}}、{{post_url}}、{{sender_name}}、{{sender_email}}、{{commenter_name}}、{{commenter_email}}、{{post_author_name}}、{{post_author_email}}、{{comment_status}}、{{comment_content}}。"
        />
        <TextArea
          label="评论回复 HTML 模板"
          value={form.comment_reply_email_template}
          onChange={(comment_reply_email_template) => patch({ comment_reply_email_template })}
          help="通知被回复的评论者。可用：{{post_title}}、{{post_url}}、{{sender_name}}、{{sender_email}}、{{recipient_name}}、{{recipient_email}}、{{replied_content}}、{{comment_content}}。"
        />
        <TextArea
          label="找回密码 HTML 模板"
          value={form.password_reset_email_template}
          onChange={(password_reset_email_template) => patch({ password_reset_email_template })}
          help="可用占位符：{{display_name}}、{{reset_url}}、{{ttl_minutes}}。"
        />
        <TextArea
          label="邮件自定义 CSS"
          value={form.email_custom_css}
          onChange={(email_custom_css) => patch({ email_custom_css })}
          help="会自动注入到邮件 HTML 中；模板里也可以使用 {{custom_css}} 指定注入位置。"
        />
      </section>
      <section className="mail-push-section config-grid two-columns">
        <h3>SMTP 设置</h3>
        <Field label="SMTP 地址" value={form.smtp_host} onChange={(smtp_host) => patch({ smtp_host })} required />
        <Field label="SMTP 端口" type="number" value={String(form.smtp_port)} onChange={(value) => patch({ smtp_port: Number(value) })} min={1} max={65535} />
        <Field label="SMTP 登录用户" value={form.smtp_username} onChange={(smtp_username) => patch({ smtp_username })} />
        <Field label="SMTP 登录密码" type="password" value={form.smtp_password} onChange={(smtp_password) => patch({ smtp_password })} />
        <label className="field">
          <span>SMTP 加密模式</span>
          <select value={form.smtp_encryption} onChange={(event) => patch({ smtp_encryption: event.target.value as SmtpEncryption })}>
            <option value="none">无安全加密</option>
            <option value="ssl">SSL 加密</option>
            <option value="tls">TLS 加密</option>
          </select>
          <small>常见配置：465 使用 SSL，587 使用 TLS，25 可选择无加密或 TLS。</small>
        </label>
      </section>

      {error instanceof Error ? <p className="error-text">{error.message}</p> : null}
      <div className="form-actions">
        <button type="submit" disabled={saving}>{saving ? "保存中..." : "保存配置"}</button>
      </div>
    </form>
  );
}

function Field({ label, value, onChange, type = "text", help, required, min, max }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  help?: string;
  required?: boolean;
  min?: number;
  max?: number;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={value} required={required} min={min} max={max} onChange={(event) => onChange(event.target.value)} />
      {help ? <small>{help}</small> : null}
    </label>
  );
}

function TextArea({ label, value, onChange, help }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  help?: string;
}) {
  return (
    <label className="field textarea-field">
      <span>{label}</span>
      <textarea rows={8} value={value} onChange={(event) => onChange(event.target.value)} />
      {help ? <small>{help}</small> : null}
    </label>
  );
}
function Toggle({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <label>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}





