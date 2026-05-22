import { useEffect, useState } from "react";
import type { PluginConfigPanelProps } from "../../framework/plugin-config";

interface FilingConfig {
  icp_number: string;
  icp_url: string;
  police_html: string;
}

const defaultConfig: FilingConfig = {
  icp_number: "",
  icp_url: "https://beian.miit.gov.cn/",
  police_html: "",
};

export function FilingConfigPanel({ value, saving, error, onSubmit }: PluginConfigPanelProps) {
  const [form, setForm] = useState<FilingConfig>(() => readConfig(value));

  useEffect(() => {
    setForm(readConfig(value));
  }, [value]);

  return (
    <form
      className="plugin-config-panel"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSubmit({
          icp_number: form.icp_number.trim(),
          icp_url: form.icp_url.trim(),
          police_html: form.police_html.trim(),
        });
      }}
    >
      <div className="config-panel-header">
        <div>
          <h2>备案信息</h2>
          <p>博客前台会自动检测备案插件，并在页脚居中展示可用信息。</p>
        </div>
      </div>

      <label className="field">
        <span>ICP备案号</span>
        <input value={form.icp_number} onChange={(event) => setForm({ ...form, icp_number: event.target.value })} />
      </label>
      <label className="field">
        <span>ICP备案 URL</span>
        <input
          value={form.icp_url}
          placeholder="https://beian.miit.gov.cn/"
          onChange={(event) => setForm({ ...form, icp_url: event.target.value })}
        />
      </label>
      <label className="field">
        <span>公安备案 HTML</span>
        <textarea
          rows={5}
          value={form.police_html}
          placeholder={'<a href="..." target="_blank" rel="noreferrer">...</a>'}
          onChange={(event) => setForm({ ...form, police_html: event.target.value })}
        />
      </label>

      <section className="config-preview">
        <strong>页脚预览</strong>
        <div>
          {form.icp_number ? (
            <a href={form.icp_url || defaultConfig.icp_url} target="_blank" rel="noreferrer">
              {form.icp_number}
            </a>
          ) : (
            <span className="muted">未填写 ICP 备案号</span>
          )}
          {form.police_html ? <code>{form.police_html}</code> : null}
        </div>
      </section>

      {error instanceof Error ? <p className="error-text">{error.message}</p> : null}
      <div className="form-actions">
        <button type="submit" disabled={saving}>
          {saving ? "保存中..." : "保存配置"}
        </button>
      </div>
    </form>
  );
}

function readConfig(value: Record<string, unknown>): FilingConfig {
  return {
    icp_number: stringValue(value.icp_number),
    icp_url: stringValue(value.icp_url) || defaultConfig.icp_url,
    police_html: stringValue(value.police_html),
  };
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}
