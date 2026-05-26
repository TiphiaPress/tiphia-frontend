export type SmtpEncryption = "none" | "ssl" | "tls";

export const defaultCommentEmailTemplate = `<h2>收到新评论</h2>
<p><strong>文章：</strong><a href="{{post_url}}">{{post_title}}</a></p>
<p><strong>评论者：</strong>{{sender_name}} &lt;{{sender_email}}&gt;</p>
<p><strong>文章作者：</strong>{{post_author_name}}</p>
<p><strong>状态：</strong>{{comment_status}}</p>
<blockquote>{{comment_content}}</blockquote>`;

export const defaultCommentReplyEmailTemplate = `<h2>你的评论收到回复</h2>
<p>{{recipient_name}}，你好：</p>
<p>{{sender_name}} 回复了你在 <a href="{{post_url}}">{{post_title}}</a> 下的评论。</p>
<p><strong>你原来的评论：</strong></p>
<blockquote>{{replied_content}}</blockquote>
<p><strong>新的回复：</strong></p>
<blockquote>{{comment_content}}</blockquote>`;

export const defaultPasswordResetEmailTemplate = `<h2>找回密码</h2>
<p>你好，{{display_name}}：</p>
<p>请点击下面的链接重置密码。该链接将在 {{ttl_minutes}} 分钟后过期。</p>
<p><a href="{{reset_url}}">重置密码</a></p>
<p>如果不是你本人操作，可以忽略这封邮件。</p>`;

export interface CommentMailPushConfig {
  comment_push_enabled: boolean;
  comment_reply_enabled: boolean;
  notify_post_author_enabled: boolean;
  password_reset_enabled: boolean;
  reset_token_ttl_minutes: number;
  comment_notify_email: string;
  from_name: string;
  from_email: string;
  reply_to_email: string;
  password_reset_base_url: string;
  comment_email_template: string;
  comment_reply_email_template: string;
  password_reset_email_template: string;
  email_custom_css: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_auth_required: boolean;
  smtp_encryption: SmtpEncryption;
}

export const defaultConfig: CommentMailPushConfig = {
  comment_push_enabled: false,
  comment_reply_enabled: false,
  notify_post_author_enabled: false,
  password_reset_enabled: false,
  reset_token_ttl_minutes: 30,
  comment_notify_email: "",
  from_name: "TiphiaPress",
  from_email: "",
  reply_to_email: "",
  password_reset_base_url: "",
  comment_email_template: defaultCommentEmailTemplate,
  comment_reply_email_template: defaultCommentReplyEmailTemplate,
  password_reset_email_template: defaultPasswordResetEmailTemplate,
  email_custom_css: "",
  smtp_host: "",
  smtp_port: 587,
  smtp_username: "",
  smtp_password: "",
  smtp_auth_required: true,
  smtp_encryption: "tls",
};

export function normalizeConfig(value: unknown): CommentMailPushConfig {
  const source = typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
  const encryption = source.smtp_encryption === "none" || source.smtp_encryption === "ssl" || source.smtp_encryption === "tls"
    ? source.smtp_encryption
    : defaultConfig.smtp_encryption;
  return {
    comment_push_enabled: source.comment_push_enabled === true,
    comment_reply_enabled: source.comment_reply_enabled === true,
    notify_post_author_enabled: source.notify_post_author_enabled === true,
    password_reset_enabled: source.password_reset_enabled === true,
    reset_token_ttl_minutes: clampNumber(source.reset_token_ttl_minutes, 1, 1440, defaultConfig.reset_token_ttl_minutes),
    comment_notify_email: stringValue(source.comment_notify_email),
    from_name: stringValue(source.from_name) || defaultConfig.from_name,
    from_email: stringValue(source.from_email),
    reply_to_email: stringValue(source.reply_to_email),
    password_reset_base_url: stringValue(source.password_reset_base_url) || stringValue(source.recovery_base_url),
    comment_email_template: stringValue(source.comment_email_template) || defaultConfig.comment_email_template,
    comment_reply_email_template: stringValue(source.comment_reply_email_template) || defaultConfig.comment_reply_email_template,
    password_reset_email_template: stringValue(source.password_reset_email_template) || defaultConfig.password_reset_email_template,
    email_custom_css: stringValue(source.email_custom_css),
    smtp_host: stringValue(source.smtp_host),
    smtp_port: clampNumber(source.smtp_port, 1, 65535, defaultConfig.smtp_port),
    smtp_username: stringValue(source.smtp_username),
    smtp_password: stringValue(source.smtp_password),
    smtp_auth_required: source.smtp_auth_required !== false,
    smtp_encryption: encryption,
  };
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  const number = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
}
