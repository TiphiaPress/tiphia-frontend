import { useEffect, useRef, useState } from "react";
import type { PluginConfigPanelProps } from "../../framework/plugin-config";
import {
  defaultHighlightConfig,
  highlightStyleOptions,
  normalizeHighlightConfig,
  type HighlightConfig,
  type HighlightStyle,
} from "./config";
import { enhancePreviewCodeBlock } from "./runtime";

const previewCode = `export function hello() {
  const message = "TiphiaPress";
  // Code highlighting plugin
  return message;
}`;

export function HighlightConfigPanel({ value, saving, error, onSubmit }: PluginConfigPanelProps) {
  const [form, setForm] = useState<HighlightConfig>(() => normalizeHighlightConfig(value));
  const previewRef = useRef<HTMLPreElement | null>(null);

  useEffect(() => {
    setForm(normalizeHighlightConfig(value));
  }, [value]);

  useEffect(() => {
    if (previewRef.current) {
      enhancePreviewCodeBlock(previewRef.current, form);
    }
  }, [form]);

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
          <p>为博客文章和页面中的代码块添加高亮、语言标签、行号和 macOS 风格边框。</p>
        </div>
      </div>

      <label className="field highlight-style-field">
        <span>高亮样式</span>
        <select value={form.style} onChange={(event) => updateForm({ style: event.target.value as HighlightStyle })}>
          {highlightStyleOptions.map((style) => (
            <option key={style.value} value={style.value}>
              {style.label}
            </option>
          ))}
        </select>
        <small>{highlightStyleOptions.find((style) => style.value === form.style)?.description}</small>
      </label>

      <div className="checkbox-grid highlight-options">
        <Toggle
          checked={form.mac_window}
          label="启用 macOS 风格窗口边框"
          onChange={(mac_window) => updateForm({ mac_window })}
        />
        <Toggle
          checked={form.show_language}
          label="显示语言标签"
          onChange={(show_language) => updateForm({ show_language })}
        />
        <Toggle
          checked={form.line_numbers}
          label="显示行号"
          onChange={(line_numbers) => updateForm({ line_numbers })}
        />
        <Toggle
          checked={form.line_wrap}
          label="长代码自动换行"
          onChange={(line_wrap) => updateForm({ line_wrap })}
        />
      </div>

      <section className="highlight-preview-shell" aria-label="代码高亮预览">
        <pre ref={previewRef}>
          <code className="language-javascript">{previewCode}</code>
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

  function updateForm(patch: Partial<HighlightConfig>) {
    setForm((current) => normalizeHighlightConfig({ ...defaultHighlightConfig, ...current, ...patch }));
  }
}

function Toggle({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <label>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}