import { Edit3, Save, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { TermResponse } from "../../types";
import type { TermUpdateInput } from "./termsModel";
import { slugify } from "./termsModel";

interface TermRowProps {
  term: TermResponse;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onSave: (input: TermUpdateInput) => void;
  t: (key: string, fallback?: string, vars?: Record<string, string | number>) => string;
}

export function TermRow({ term, editing, onEdit, onCancel, onDelete, onSave, t }: TermRowProps) {
  const [draft, setDraft] = useState({ name: term.name, slug: term.slug, description: term.description || "", sort_order: term.sort_order });

  if (editing) {
    return (
      <tr className="editing-row">
        <td><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></td>
        <td><input value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: slugify(event.target.value) })} /></td>
        <td><input value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></td>
        <td><input className="number-cell-input" type="number" value={draft.sort_order} onChange={(event) => setDraft({ ...draft, sort_order: Number(event.target.value) })} /></td>
        <td>{term.post_count}</td>
        <td className="row-actions">
          <button className="icon-button" type="button" onClick={() => onSave(draft)} title={t("action.save")}><Save size={16} /></button>
          <button className="icon-button" type="button" onClick={onCancel} title={t("action.cancel")}><X size={16} /></button>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td><strong>{term.name}</strong></td>
      <td>{term.slug}</td>
      <td><span className="muted line-clamp">{term.description || "-"}</span></td>
      <td>{term.sort_order}</td>
      <td>{term.post_count}</td>
      <td className="row-actions">
        <button className="icon-button" type="button" onClick={onEdit} title={t("content.edit")}><Edit3 size={16} /></button>
        <button className="icon-button" type="button" onClick={onDelete} title={t("action.delete")}><Trash2 size={16} /></button>
      </td>
    </tr>
  );
}
