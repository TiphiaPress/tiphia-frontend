import { Archive, Send, Trash2 } from "lucide-react";
import type { BulkPostAction } from "../../types";

interface ContentBulkBarProps {
  count: number;
  title: string;
  pending: boolean;
  onRun: (action: BulkPostAction) => void;
  t: (key: string, fallback?: string, vars?: Record<string, string | number>) => string;
}

export function ContentBulkBar({ count, title, pending, onRun, t }: ContentBulkBarProps) {
  if (count <= 0) {
    return null;
  }

  return (
    <div className="bulk-bar">
      <span>{t("content.selected", undefined, { count, title })}</span>
      <button className="subtle" disabled={pending} onClick={() => onRun("publish")}>
        <Send size={16} />
        {t("content.bulk_publish")}
      </button>
      <button className="subtle" disabled={pending} onClick={() => onRun("archive")}>
        <Archive size={16} />
        {t("content.bulk_archive")}
      </button>
      <button className="danger" disabled={pending} onClick={() => onRun("delete")}>
        <Trash2 size={16} />
        {t("content.bulk_delete")}
      </button>
    </div>
  );
}
