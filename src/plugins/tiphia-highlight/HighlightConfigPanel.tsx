import { useEffect, useState } from "react";
import type { PluginConfigPanelProps } from "../../framework/plugin-config";

interface HighlightConfig {
  style: HighlightStyle;
  mac_window: boolean;
  show_language: boolean;
  line_wrap: boolean;
}

type HighlightStyle = "github" | "one_light" | "dracula" | "solarized_dark";

const styles: Array<{ value: HighlightStyle; label: string; description: string }> = [
  { value: "github", label: "GitHub Light", description: "清爽的浅色代码块，适合文档和技术博客。" },
  { value: "one_light", label: "One Light", description: "偏编辑器风格的浅色主题。" },
  { value: "dracula", label: "Dracula", description: "高对比深色主题，适合夜间阅读。" },
  { value: "solarized_dark", label: "Solarized Dark", description: "柔和的深色主题，长代码阅读更稳。" },
];

const defaultConfig: HighlightConfig = {
  style: "github",
  mac_window: true,
  show_language: true,
  line_wrap: false,
};

export function HighlightConfigPanel({ value, saving, error, onSubmit }: PluginConfigPanelProps) {
  const [form, setForm] = useState<HighlightConfig>(() => readConfig(value));

  useEffect(() => {
    setForm(readConfig(value));
  }, [value]);

  return (
    <form
      className="plugin-config-panel highlight-config-panel"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSubmit({ ...form });
      }}
    >
      <div className="config-panel-header">
        <div>
          <h2>代码高亮</h2>
          <p>为博客文章和页面中的代码块添加高亮、语言标签和 macOS 风格边框。</p>
        </div>
      </div>

      <label className="field highlight-style-field">
        <span>高亮样式</span>
        <select value={form.style} onChange={(event) => setForm({ ...form, style: event.target.value as HighlightStyle })}>
          {styles.map((style) => (
            <option key={style.value} value={style.value}>
              {style.label}
            </option>
          ))}
        </select>
        <small>{styles.find((style) => style.value === form.style)?.description}</small>
      </label>

      <div className="checkbox-grid highlight-options">
        <label>
          <input
            type="checkbox"
            checked={form.mac_window}
            onChange={(event) => setForm({ ...form, mac_window: event.target.checked })}
          />
          <span>启用 macOS 风格窗口边框</span>
        </label>
        <label>
          <input
            type="checkbox"
            checked={form.show_language}
            onChange={(event) => setForm({ ...form, show_language: event.target.checked })}
          />
          <span>显示语言标签</span>
        </label>
        <label>
          <input
            type="checkbox"
            checked={form.line_wrap}
            onChange={(event) => setForm({ ...form, line_wrap: event.target.checked })}
          />
          <span>长代码自动换行</span>
        </label>
      </div>

      <section className={`tiphia-code-block tiphia-code-preview style-${form.style} ${form.mac_window ? "mac-window" : ""} ${form.line_wrap ? "wrap" : ""}`}>
        <div className="tiphia-code-header">
          {form.mac_window ? (
            <span className="tiphia-window-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          ) : (
            <span />
          )}
          {form.show_language ? <span className="tiphia-code-language">typescript</span> : null}
        </div>
        <pre>
          <code>
            <span className="token keyword">export</span> <span className="token keyword">function</span>{" "}
            <span className="token function">hello</span>() {"{"}{"\n"}
            {"  "}<span className="token keyword">const</span> message = <span className="token string">"TiphiaPress"</span>;{"\n"}
            {"  "}<span className="token comment">// Code highlighting plugin</span>{"\n"}
            {"  "}<span className="token keyword">return</span> message;{"\n"}
            {"}"}
          </code>
        </pre>
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

function readConfig(value: Record<string, unknown>): HighlightConfig {
  return {
    style: readStyle(value.style),
    mac_window: boolValue(value.mac_window, defaultConfig.mac_window),
    show_language: boolValue(value.show_language, defaultConfig.show_language),
    line_wrap: boolValue(value.line_wrap, defaultConfig.line_wrap),
  };
}

function readStyle(value: unknown): HighlightStyle {
  return styles.some((style) => style.value === value) ? (value as HighlightStyle) : defaultConfig.style;
}

function boolValue(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}
