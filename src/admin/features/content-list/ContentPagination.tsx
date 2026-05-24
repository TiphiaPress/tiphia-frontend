interface ContentPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  t: (key: string, fallback?: string, vars?: Record<string, string | number>) => string;
}

export function ContentPagination({ page, totalPages, onPageChange, t }: ContentPaginationProps) {
  return (
    <div className="pagination-row">
      <button className="subtle" disabled={page <= 1} onClick={() => onPageChange(Math.max(1, page - 1))}>
        {t("action.previous")}
      </button>
      <span className="muted">{page} / {Math.max(1, totalPages)}</span>
      <button className="subtle" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        {t("action.next")}
      </button>
    </div>
  );
}
