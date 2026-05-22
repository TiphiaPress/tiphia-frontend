import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { Empty, ErrorState, Loading } from "../components/Status";
import { useToast } from "../components/Toast";
import { useI18n } from "../../framework/i18n";
import { api } from "../lib/api";
import type { TermResponse, TermType } from "../types";

type TermUpdateInput = {
  name: string;
  slug: string;
  description: string;
  sort_order: number;
};

export function Terms() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useI18n();
  const [termType, setTermType] = useState<TermType>("category");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const query = useQuery({
    queryKey: ["terms", termType],
    queryFn: () => api.listTerms({ page: 1, per_page: 50, term_type: termType }),
  });
  const create = useMutation({
    mutationFn: () =>
      api.createTerm({
        name,
        slug,
        term_type: termType,
        description: "",
        parent_id: null,
        sort_order: 0,
      }),
    onSuccess: async () => {
      setName("");
      setSlug("");
      await queryClient.invalidateQueries({ queryKey: ["terms"] });
      toast.success(t("terms.created"));
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t("terms.create_failed"));
    },
  });
  const remove = useMutation({
    mutationFn: api.deleteTerm,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["terms"] });
      toast.success(t("terms.deleted"));
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t("terms.delete_failed"));
    },
  });
  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: TermUpdateInput }) =>
      api.updateTerm(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["terms"] });
      toast.success(t("terms.saved"));
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t("terms.save_failed"));
    },
  });

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>{t("terms.title")}</h1>
          <p>{t("terms.subtitle")}</p>
        </div>
      </div>
      <div className="split-grid">
        <section className="panel">
          <h2>{t("terms.new")}</h2>
          <form
            className="form-grid"
            onSubmit={(event) => {
              event.preventDefault();
              create.mutate();
            }}
          >
            <label className="field">
              <span>{t("terms.type")}</span>
              <select value={termType} onChange={(event) => setTermType(event.target.value as TermType)}>
                <option value="category">{t("terms.category")}</option>
                <option value="tag">{t("terms.tag")}</option>
              </select>
            </label>
            <label className="field">
              <span>{t("terms.name")}</span>
              <input value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label className="field">
              <span>{t("terms.slug")}</span>
              <input
                placeholder={t("terms.slug_placeholder")}
                value={slug}
                onChange={(event) => setSlug(slugify(event.target.value))}
              />
              <small>{t("terms.slug_help")}</small>
            </label>
            {create.error ? <p className="error-text">{create.error.message}</p> : null}
            <button type="submit">
              <Plus size={16} />
              {t("action.create")}
            </button>
          </form>
        </section>
        <section className="panel">
          <h2>{t("terms.list")}</h2>
          {query.isLoading ? <Loading /> : null}
          {query.error ? <ErrorState error={query.error} /> : null}
          {query.data?.data.length === 0 ? <Empty /> : null}
          {query.data?.data.map((term) => (
            <EditableTerm
              key={term.id}
              term={term}
              onDelete={() => remove.mutate(term.id)}
              onSave={(input) => update.mutate({ id: term.id, input })}
            />
          ))}
        </section>
      </div>
    </section>
  );
}

function EditableTerm({
  term,
  onDelete,
  onSave,
}: {
  term: TermResponse;
  onDelete: () => void;
  onSave: (input: TermUpdateInput) => void;
}) {
  const { t } = useI18n();
  const [draft, setDraft] = useState({
    name: term.name,
    slug: term.slug,
    description: term.description || "",
    sort_order: term.sort_order,
  });

  return (
    <div className="editable-row">
      <div className="term-edit-grid">
        <label className="field">
          <span>{t("terms.name")}</span>
          <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
        </label>
        <label className="field">
          <span>{t("terms.slug")}</span>
          <input value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: slugify(event.target.value) })} />
        </label>
        <label className="field">
          <span>{t("terms.sort_order")}</span>
          <input
            type="number"
            value={draft.sort_order}
            onChange={(event) => setDraft({ ...draft, sort_order: Number(event.target.value) })}
          />
        </label>
      </div>
      <label className="field">
        <span>{t("terms.description")}</span>
        <textarea
          rows={2}
          value={draft.description}
          onChange={(event) => setDraft({ ...draft, description: event.target.value })}
        />
      </label>
      <div className="row-footer">
        <small>{t("terms.content_count", undefined, { count: term.post_count })}</small>
        <div className="row-actions">
          <button className="icon-button" type="button" onClick={() => onSave(draft)} title={t("action.save")}>
            <Save size={16} />
          </button>
          <button className="icon-button" type="button" onClick={onDelete} title={t("action.delete")}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}
