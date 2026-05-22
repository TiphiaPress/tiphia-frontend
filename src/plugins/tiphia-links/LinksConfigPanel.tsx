import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { PluginConfigPanelProps } from "../../framework/plugin-config";

interface LinkItem {
  name: string;
  description: string;
  url: string;
  avatar_url: string;
  category: string;
}

const emptyLink: LinkItem = {
  name: "",
  description: "",
  url: "",
  avatar_url: "",
  category: "",
};

export function LinksConfigPanel({ value, saving, error, onSubmit }: PluginConfigPanelProps) {
  const [links, setLinks] = useState<LinkItem[]>(() => readLinks(value));

  useEffect(() => {
    setLinks(readLinks(value));
  }, [value]);

  const updateLink = (index: number, patch: Partial<LinkItem>) => {
    setLinks((items) => items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  };

  const removeLink = (index: number) => {
    setLinks((items) => items.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <form
      className="plugin-config-panel"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSubmit({
          links: links
            .map((item) => ({
              name: item.name.trim(),
              description: item.description.trim(),
              url: item.url.trim(),
              avatar_url: item.avatar_url.trim(),
              category: item.category.trim(),
            }))
            .filter((item) => item.name || item.url),
        });
      }}
    >
      <div className="config-panel-header">
        <div>
          <h2>友情链接</h2>
          <p>配置后，博客前台会在 slug 为 links 的页面下自动按归类展示卡片。</p>
        </div>
        <button type="button" className="button subtle" onClick={() => setLinks((items) => [...items, emptyLink])}>
          <Plus size={16} />
          添加友链
        </button>
      </div>

      <div className="config-list">
        {links.length === 0 ? <p className="muted">还没有友情链接。</p> : null}
        {links.map((item, index) => (
          <section className="editable-row" key={index}>
            <div className="config-grid">
              <label className="field">
                <span>名称</span>
                <input value={item.name} onChange={(event) => updateLink(index, { name: event.target.value })} />
              </label>
              <label className="field">
                <span>URL</span>
                <input
                  value={item.url}
                  placeholder="https://example.com"
                  onChange={(event) => updateLink(index, { url: event.target.value })}
                />
              </label>
              <label className="field">
                <span>头像 URL</span>
                <input
                  value={item.avatar_url}
                  placeholder="https://example.com/avatar.png"
                  onChange={(event) => updateLink(index, { avatar_url: event.target.value })}
                />
              </label>
              <label className="field">
                <span>归类</span>
                <input
                  value={item.category}
                  placeholder="朋友 / 技术 / 项目"
                  onChange={(event) => updateLink(index, { category: event.target.value })}
                />
              </label>
            </div>
            <label className="field">
              <span>描述</span>
              <textarea
                rows={2}
                value={item.description}
                onChange={(event) => updateLink(index, { description: event.target.value })}
              />
            </label>
            <div className="row-footer">
              <small>前台会优先按归类分组，未填写归类时显示在“未分类”。</small>
              <button type="button" className="button danger" onClick={() => removeLink(index)}>
                <Trash2 size={16} />
                删除
              </button>
            </div>
          </section>
        ))}
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

function readLinks(value: Record<string, unknown>): LinkItem[] {
  const raw = value.links;
  const source = Array.isArray(raw) ? raw : isRecord(raw) && Array.isArray(raw.links) ? raw.links : [];
  return source.map(normalizeLink);
}

function normalizeLink(value: unknown): LinkItem {
  if (!isRecord(value)) {
    return { ...emptyLink };
  }
  return {
    name: stringValue(value.name),
    description: stringValue(value.description),
    url: stringValue(value.url),
    avatar_url: stringValue(value.avatar_url),
    category: stringValue(value.category),
  };
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
