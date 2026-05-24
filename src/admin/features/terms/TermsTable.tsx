import type { UseQueryResult } from "@tanstack/react-query";
import { useState } from "react";
import { Empty, ErrorState, Loading } from "../../components/Status";
import type { Page, TermResponse } from "../../types";
import type { TermUpdateInput } from "./termsModel";
import { TermRow } from "./TermRow";
import { TermsPagination } from "./TermsPagination";

interface TermsTableProps {
  title: string;
  query: UseQueryResult<Page<TermResponse>, Error>;
  page: number;
  onPageChange: (page: number) => void;
  onDelete: (id: number) => void;
  onSave: (id: number, input: TermUpdateInput) => void;
  t: (key: string, fallback?: string, vars?: Record<string, string | number>) => string;
}

export function TermsTable({ title, query, page, onPageChange, onDelete, onSave, t }: TermsTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <section className="terms-table-section">
      <div className="section-header">
        <div>
          <h2>{title}</h2>
          <p>{query.data?.meta.total || 0} items</p>
        </div>
      </div>
      {query.isLoading ? <Loading /> : null}
      {query.error ? <ErrorState error={query.error} /> : null}
      {query.data?.data.length === 0 ? <Empty /> : null}
      {query.data && query.data.data.length > 0 ? (
        <>
          <table className="data-table terms-data-table">
            <thead>
              <tr>
                <th>{t("terms.name")}</th>
                <th>{t("terms.slug")}</th>
                <th>{t("terms.description")}</th>
                <th>{t("terms.sort_order")}</th>
                <th>{t("terms.content_count", undefined, { count: "" }).replace("{count}", "")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {query.data.data.map((term) => (
                <TermRow
                  key={term.id}
                  term={term}
                  editing={editingId === term.id}
                  onEdit={() => setEditingId(term.id)}
                  onCancel={() => setEditingId(null)}
                  onDelete={() => onDelete(term.id)}
                  onSave={(input) => {
                    onSave(term.id, input);
                    setEditingId(null);
                  }}
                  t={t}
                />
              ))}
            </tbody>
          </table>
          <TermsPagination page={page} pageData={query.data} onPageChange={onPageChange} t={t} />
        </>
      ) : null}
    </section>
  );
}
