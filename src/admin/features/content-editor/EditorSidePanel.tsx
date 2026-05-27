import { Save, Trash2, X } from "lucide-react";
import type { Dispatch, FocusEvent, KeyboardEvent, SetStateAction } from "react";
import { useMemo, useState } from "react";
import type { ContentEditorForm } from "./editorModel";
import { RevisionPanel } from "./RevisionPanel";
import type { PostRevision, PostStatus, TermResponse } from "../../types";

interface EditorSidePanelProps {
  form: ContentEditorForm;
  categories: TermResponse[];
  tags: TermResponse[];
  selectedCategoryIds: number[];
  selectedTagNames: string[];
  isNew: boolean;
  savePending: boolean;
  deletePending: boolean;
  restorePending: boolean;
  saveError?: Error | null;
  deleteError?: Error | null;
  revisions?: PostRevision[];
  revisionsLoading: boolean;
  previewRevisionId: number | null;
  onFormChange: (form: ContentEditorForm) => void;
  onSelectedCategoryIdsChange: Dispatch<SetStateAction<number[]>>;
  onSelectedTagNamesChange: Dispatch<SetStateAction<string[]>>;
  onSaveActionChange: (action: "stay" | "return") => void;
  onDelete: () => void;
  onPreviewRevision: Dispatch<SetStateAction<number | null>>;
  onRestoreRevision: (target: { id: number; createdAt: string }) => void;
  t: (key: string, fallback?: string, vars?: Record<string, string | number>) => string;
}

export function EditorSidePanel({
  form,
  categories,
  tags,
  selectedCategoryIds,
  selectedTagNames,
  isNew,
  savePending,
  deletePending,
  restorePending,
  saveError,
  deleteError,
  revisions,
  revisionsLoading,
  previewRevisionId,
  onFormChange,
  onSelectedCategoryIdsChange,
  onSelectedTagNamesChange,
  onSaveActionChange,
  onDelete,
  onPreviewRevision,
  onRestoreRevision,
  t,
}: EditorSidePanelProps) {
  return (
    <aside className="panel editor-side">
      <label className="field">
        <span>{t("content.status")}</span>
        <select value={form.status} onChange={(event) => onFormChange({ ...form, status: event.target.value as PostStatus })}>
          <option value="draft">{t("status.draft")}</option>
          <option value="pending_review">{t("status.pending_review")}</option>
          <option value="published">{t("status.published")}</option>
          <option value="scheduled">{t("status.scheduled")}</option>
          <option value="archived">{t("status.archived")}</option>
        </select>
      </label>
      <label className="field">
        <span>{t("editor.publish_time")}</span>
        <input
          placeholder="2026-06-01T00:00:00Z"
          value={form.published_at}
          onChange={(event) => onFormChange({ ...form, published_at: event.target.value })}
        />
      </label>
      <label className="field">
        <span>{t("editor.excerpt")}</span>
        <textarea rows={5} value={form.excerpt} onChange={(event) => onFormChange({ ...form, excerpt: event.target.value })} />
      </label>
      <CategoryPicker categories={categories} selectedCategoryIds={selectedCategoryIds} onSelectedCategoryIdsChange={onSelectedCategoryIdsChange} t={t} />
      <TagInput tags={tags} selectedTagNames={selectedTagNames} onSelectedTagNamesChange={onSelectedTagNamesChange} t={t} />
      {saveError || deleteError ? <p className="error-text">{(saveError || deleteError)?.message}</p> : null}
      <button type="submit" disabled={savePending} onClick={() => onSaveActionChange("stay")}>
        <Save size={16} />
        {t("action.save")}
      </button>
      <button className="subtle" type="submit" disabled={savePending} onClick={() => onSaveActionChange("return")}>
        {t("editor.save_return")}
      </button>
      {!isNew ? (
        <button className="danger" type="button" onClick={onDelete} disabled={deletePending}>
          <Trash2 size={16} />
          {t("action.delete")}
        </button>
      ) : null}
      {!isNew ? (
        <RevisionPanel
          revisions={revisions}
          loading={revisionsLoading}
          pending={restorePending}
          previewRevisionId={previewRevisionId}
          onPreviewRevision={onPreviewRevision}
          onRestore={onRestoreRevision}
          t={t}
        />
      ) : null}
    </aside>
  );
}

function CategoryPicker({
  categories,
  selectedCategoryIds,
  onSelectedCategoryIdsChange,
  t,
}: {
  categories: TermResponse[];
  selectedCategoryIds: number[];
  onSelectedCategoryIdsChange: Dispatch<SetStateAction<number[]>>;
  t: (key: string, fallback?: string, vars?: Record<string, string | number>) => string;
}) {
  const [query, setQuery] = useState("");
  const selected = categories.filter((term) => selectedCategoryIds.includes(term.id));
  const filtered = categories.filter((term) => matchesTerm(term, query));
  const visible = mergeTerms(selected, filtered);

  return (
    <div className="field">
      <span>{t("terms.category")}</span>
      <input
        className="editor-term-search"
        value={query}
        placeholder={t("editor.categories_search", "搜索分类")}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="check-list editor-category-list">
        {visible.length ? (
          visible.map((term) => (
            <label key={term.id} className="check-row">
              <input
                type="checkbox"
                checked={selectedCategoryIds.includes(term.id)}
                onChange={(event) => {
                  onSelectedCategoryIdsChange((current) =>
                    event.target.checked ? Array.from(new Set([...current, term.id])) : current.filter((id) => id !== term.id),
                  );
                }}
              />
              <span>{term.name}</span>
            </label>
          ))
        ) : (
          <small>{t("editor.no_terms", undefined, { type: t("terms.category") })}</small>
        )}
      </div>
    </div>
  );
}

function TagInput({
  tags,
  selectedTagNames,
  onSelectedTagNamesChange,
  t,
}: {
  tags: TermResponse[];
  selectedTagNames: string[];
  onSelectedTagNamesChange: Dispatch<SetStateAction<string[]>>;
  t: (key: string, fallback?: string, vars?: Record<string, string | number>) => string;
}) {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const selectedKeys = useMemo(() => new Set(selectedTagNames.map(normalizeTagName)), [selectedTagNames]);
  const suggestions = useMemo(() => {
    const value = input.trim();
    return tags
      .filter((tag) => !selectedKeys.has(normalizeTagName(tag.name)))
      .filter((tag) => !value || matchesTerm(tag, value))
      .slice(0, 12);
  }, [input, selectedKeys, tags]);
  const showSuggestions = focused && suggestions.length > 0;

  function addTags(value: string) {
    const names = parseTagInput(value);
    if (names.length === 0) {
      return;
    }
    onSelectedTagNamesChange((current) => mergeTagNames(current, names));
    setInput("");
  }

  function addExistingTag(name: string) {
    onSelectedTagNamesChange((current) => mergeTagNames(current, [name]));
    setInput("");
  }

  function removeTag(name: string) {
    const key = normalizeTagName(name);
    onSelectedTagNamesChange((current) => current.filter((item) => normalizeTagName(item) !== key));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" && suggestions[0]) {
      event.preventDefault();
      addExistingTag(suggestions[0].name);
      return;
    }
    if (["Enter", "Tab", ",", "，"].includes(event.key)) {
      event.preventDefault();
      const exact = suggestions.find((tag) => normalizeTagName(tag.name) === normalizeTagName(input));
      addTags(exact?.name || input);
    }
    if (event.key === "Backspace" && !input && selectedTagNames.length > 0) {
      onSelectedTagNamesChange((current) => current.slice(0, -1));
    }
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }
    setFocused(false);
    addTags(input);
  }

  return (
    <div className="field editor-tag-field" onBlur={handleBlur}>
      <span>{t("terms.tag")}</span>
      <div className="editor-tag-input-wrap">
        <div className="editor-tag-chips" aria-label={t("terms.tag")}>
          {selectedTagNames.map((name) => (
            <button key={normalizeTagName(name)} type="button" className="editor-tag-chip" onClick={() => removeTag(name)} title={name}>
              <span>{name}</span>
              <X size={13} />
            </button>
          ))}
          <input
            value={input}
            placeholder={selectedTagNames.length ? t("editor.tags_add_placeholder", "继续添加标签") : t("editor.tags_placeholder", "输入标签后回车添加")}
            onChange={(event) => setInput(event.target.value)}
            onFocus={() => setFocused(true)}
            onKeyDown={handleKeyDown}
          />
        </div>
        {showSuggestions ? (
          <div className="editor-tag-suggestions" role="listbox">
            {suggestions.map((tag) => (
              <button key={tag.id} type="button" role="option" onMouseDown={(event) => event.preventDefault()} onClick={() => addExistingTag(tag.name)}>
                <span>{tag.name}</span>
                <small>{tag.slug}</small>
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <small>{t("editor.tags_hint", "输入标签名后按回车添加；已有标签会自动合并，不存在的标签会在保存时创建。")}</small>
    </div>
  );
}

function matchesTerm(term: TermResponse, value: string) {
  const query = normalizeSearch(value);
  return normalizeSearch(term.name).includes(query) || normalizeSearch(term.slug).includes(query);
}

function mergeTerms(first: TermResponse[], second: TermResponse[]) {
  const map = new Map<number, TermResponse>();
  [...first, ...second].forEach((term) => map.set(term.id, term));
  return Array.from(map.values());
}

function normalizeSearch(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function parseTagInput(value: string) {
  return value
    .split(/[，,\n]/)
    .map((item) => item.trim().replace(/\s+/g, " "))
    .filter(Boolean);
}

function mergeTagNames(current: string[], next: string[]) {
  const map = new Map<string, string>();
  [...current, ...next].forEach((name) => {
    const key = normalizeTagName(name);
    if (key && !map.has(key)) {
      map.set(key, name.trim().replace(/\s+/g, " "));
    }
  });
  return Array.from(map.values());
}

function normalizeTagName(name: string) {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}
