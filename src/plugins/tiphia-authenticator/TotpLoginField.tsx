export function TotpLoginField({ onChange }: { onChange?: (value: string) => void }) {
  return (
    <label className="field authenticator-login-field">
      <span>Authenticator 动态码</span>
      <input
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        placeholder="如果账号已绑定，请输入 6 位动态码"
        onChange={(event) => onChange?.(event.target.value.replace(/\D/g, "").slice(0, 6))}
      />
      <small>兼容 Google Authenticator 和 Microsoft Authenticator。</small>
    </label>
  );
}