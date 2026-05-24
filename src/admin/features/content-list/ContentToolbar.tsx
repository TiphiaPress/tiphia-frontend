import { Search } from "lucide-react";
import type { TermResponse, TermType } from "../../types";
import type { PostStatusFilter } from "./contentListModel";
import { postStatusFilters } from "./contentListModel";

interface ContentToolbarProps {
  q: string;
  status: PostStatusFilter;
  termType: TermType;
  termId: string;
  terms: TermResponse[];
  title: string;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: PostStatusFilter) => void;
  onTermTypeChange: (value: TermType) => void;
  onTermIdChange: (value: string) => void;
  t: (key: string, fallback?: string, vars?: Record<string, string | number>) => string;
}

export function ContentToolbar({ q, status, termType, termId, terms, title, onQueryChange, onStatusChange, onTermTypeChange, onTermIdChange, t }: ContentToolbarProps) {
  return (
    <div className="toolbar">
      <label className="search-box">
        <Search size={16} />
        <input placeholder={t("content.search", undefined, { title })} value={q} onChange={(event) => onQueryChange(event.target.value)} />
      </label>
      <select value={status} onChange={(event) => onStatusChange(event.target.value as PostStatusFilter)}>
        {postStatusFilters.map((item) => (
          <option key={item.value || "all"} value={item.value}>
            {t(item.labelKey)}
          </option>
        ))}
      </select>
      <select value={termType} onChange={(event) => onTermTypeChange(event.target.value as TermType)}>
        <option value="category">{t("content.category")}</option>
        <option value="tag">{t("content.tag")}</option>
      </select>
      <select value={termId} onChange={(event) => onTermIdChange(event.target.value)}>
        <option value="">{termType === "category" ? t("content.all_category") : t("content.all_tag")}</option>
        {terms.map((term) => (
          <option key={term.id} value={term.id}>{term.name}</option>
        ))}
      </select>
    </div>
  );
}
