import type { Page, TermResponse } from "../../types";

interface TermsPaginationProps {
  page: number;
  pageData: Page<TermResponse>;
  onPageChange: (page: number) => void;
  t: (key: string, fallback?: string, vars?: Record<string, string | number>) => string;
}

export function TermsPagination({ page, pageData, onPageChange, t }: TermsPaginationProps) {
  const totalPages = Math.max(1, pageData.meta.total_pages);
  return (
    <div className="pagination-row">
      <button className="subtle" disabled={page <= 1} onClick={() => onPageChange(Math.max(1, page - 1))}>{t("action.previous")}</button>
      <span className="muted">{pageData.meta.page} / {totalPages}</span>
      <button className="subtle" disabled={page >= totalPages} onClick={() => onPageChange(Math.min(totalPages, page + 1))}>{t("action.next")}</button>
    </div>
  );
}
