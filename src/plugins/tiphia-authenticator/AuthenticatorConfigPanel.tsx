import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, QrCode, ShieldCheck, ShieldOff } from "lucide-react";
import type { PluginConfigPanelProps } from "../../framework/plugin-config";
import { authenticatorDisable, authenticatorSetup, authenticatorStatus } from "./api";

export function AuthenticatorConfigPanel({ plugin, value, saving, error, onSubmit }: PluginConfigPanelProps) {
  const queryClient = useQueryClient();
  const active = Boolean(plugin.health.active);
  const status = useQuery({
    queryKey: ["authenticator-status"],
    queryFn: authenticatorStatus,
    retry: false,
    enabled: active,
  });
  const setup = useMutation({
    mutationFn: authenticatorSetup,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authenticator-status"] }),
  });
  const disable = useMutation({
    mutationFn: authenticatorDisable,
    onSuccess: () => {
      setup.reset();
      queryClient.invalidateQueries({ queryKey: ["authenticator-status"] });
    },
  });

  const issuer = readString(value.issuer) || "TiphiaPress";
  const enforce = readBoolean(value.enforce_for_all_users, true);
  const bound = Boolean(status.data?.bound);
  const errorMessage = error instanceof Error ? error.message : typeof error === "string" ? error : "";

  return (
    <div className="plugin-config-panel authenticator-config-panel">
      <section className="authenticator-hero">
        <div className="authenticator-hero-icon">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h3>Authenticator 双因素认证</h3>
          <p>使用基于时间的一次性动态码保护后台登录，兼容 Google Authenticator 和 Microsoft Authenticator。</p>
        </div>
        <span className={active ? "authenticator-state active" : "authenticator-state inactive"}>
          {active ? "插件已启用" : "插件未启用"}
        </span>
      </section>

      <div className="authenticator-grid">
        <section className="settings-card compact-card authenticator-card">
          <div className="authenticator-section-title">
            <KeyRound size={18} />
            <div>
              <h4>验证策略</h4>
              <p>控制验证器应用中展示的名称，以及已绑定账号的登录要求。</p>
            </div>
          </div>
          <label className="field">
            <span>Issuer</span>
            <input
              defaultValue={issuer}
              placeholder="TiphiaPress"
              onBlur={(event) => onSubmit({ ...value, issuer: event.target.value || "TiphiaPress", enforce_for_all_users: enforce })}
            />
          </label>
          <label className="authenticator-switch">
            <input
              type="checkbox"
              defaultChecked={enforce}
              onChange={(event) => onSubmit({ ...value, issuer, enforce_for_all_users: event.target.checked })}
            />
            <span>
              <strong>已绑定用户登录时必须输入动态码</strong>
              <small>关闭后不会在登录流程中强制校验 TOTP。</small>
            </span>
          </label>
          {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
          {saving ? <p className="muted">正在保存配置...</p> : null}
        </section>

        <section className="settings-card compact-card authenticator-card">
          <div className="authenticator-section-title">
            <QrCode size={18} />
            <div>
              <h4>当前账号绑定</h4>
              <p>生成二维码后用 Authenticator 扫描，保存后下次登录输入 6 位动态码。</p>
            </div>
          </div>
          {!active ? (
            <div className="authenticator-empty">
              <ShieldOff size={22} />
              <span>插件尚未启用。请先返回插件列表启用它，然后再生成二维码。</span>
            </div>
          ) : (
            <>
              <div className="authenticator-binding-row">
                <span className={bound ? "authenticator-state active" : "authenticator-state inactive"}>
                  {bound ? "当前账号已绑定" : "当前账号未绑定"}
                </span>
                <div className="button-row">
                  <button type="button" className="button" onClick={() => setup.mutate()} disabled={setup.isPending}>
                    {setup.isPending ? "生成中..." : bound ? "重新生成二维码" : "生成二维码"}
                  </button>
                  <button type="button" className="button subtle" onClick={() => disable.mutate()} disabled={disable.isPending || !bound}>
                    解除绑定
                  </button>
                </div>
              </div>
              {setup.error ? <p className="error-text">{setup.error instanceof Error ? setup.error.message : "生成失败"}</p> : null}
              {status.error ? <p className="error-text">无法读取绑定状态，请确认插件已启用并重启后端。</p> : null}
              {setup.data ? (
                <div className="authenticator-setup">
                  <div className="authenticator-qr-shell">
                    <div className="authenticator-qr" dangerouslySetInnerHTML={{ __html: setup.data.qr_svg }} />
                    <small>打开 Microsoft Authenticator，选择添加账号，然后扫描二维码。</small>
                  </div>
                  <label className="field authenticator-secret-field">
                    <span>手动密钥</span>
                    <input readOnly value={setup.data.secret} onFocus={(event) => event.currentTarget.select()} />
                    <small>如果无法扫码，可以手动输入该密钥。请不要公开分享。</small>
                  </label>
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function readBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}