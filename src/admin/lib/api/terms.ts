import type { Page, Term, TermResponse, TermType } from "../../types";
import { compactBody, post, put, query, request } from "./client";

export const termsApi = {
  listTerms: (params: { page?: number; per_page?: number; term_type?: TermType }) =>
    request<Page<TermResponse>>("/api/v1/terms" + query(params)),
  createTerm: (input: {
    slug: string;
    name: string;
    description?: string | null;
    term_type: TermType;
    parent_id?: number | null;
    sort_order?: number | null;
  }) => request<Term>("/api/v1/terms", post(compactBody(input))),
  updateTerm: (id: number, input: Partial<Term>) => request<Term>("/api/v1/terms/" + id, put(input)),
  deleteTerm: (id: number) => request<Term>("/api/v1/terms/" + id, { method: "DELETE" }),
};
