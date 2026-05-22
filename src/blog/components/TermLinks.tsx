import { Link } from "react-router-dom";
import type { TermResponse } from "../types";

export function TermLinks({ terms, showType = false }: { terms: TermResponse[]; showType?: boolean }) {
  if (terms.length === 0) {
    return null;
  }

  return (
    <div className="term-cloud">
      {terms.map((term) => (
        <Link key={term.id} to={`/terms/${term.id}`}>
          {showType ? <small>{term.term_type === "category" ? "分类" : "标签"}</small> : null}
          {term.name}
          <span>{term.post_count}</span>
        </Link>
      ))}
    </div>
  );
}
