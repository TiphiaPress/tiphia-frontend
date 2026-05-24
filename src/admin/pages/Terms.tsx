import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { TermCreateForm } from "../features/terms/TermCreateForm";
import { TermsTable } from "../features/terms/TermsTable";
import { TERMS_PER_PAGE, type TermUpdateInput } from "../features/terms/termsModel";
import { useToast } from "../components/Toast";
import { useI18n } from "../../framework/i18n";
import { api } from "../lib/api";
import type { TermType } from "../types";

export function Terms() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useI18n();
  const [termType, setTermType] = useState<TermType>("category");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryPage, setCategoryPage] = useState(1);
  const [tagPage, setTagPage] = useState(1);
  const categories = useTermsPage("category", categoryPage);
  const tags = useTermsPage("tag", tagPage);

  const create = useMutation({
    mutationFn: () => api.createTerm({ name, slug, term_type: termType, description: "", parent_id: null, sort_order: 0 }),
    onSuccess: async () => {
      setName("");
      setSlug("");
      termType === "category" ? setCategoryPage(1) : setTagPage(1);
      await queryClient.invalidateQueries({ queryKey: ["terms"] });
      toast.success(t("terms.created"));
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : t("terms.create_failed")),
  });

  const remove = useMutation({
    mutationFn: api.deleteTerm,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["terms"] });
      toast.success(t("terms.deleted"));
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : t("terms.delete_failed")),
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: TermUpdateInput }) => api.updateTerm(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["terms"] });
      toast.success(t("terms.saved"));
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : t("terms.save_failed")),
  });

  return (
    <section className="page terms-page">
      <div className="page-header">
        <div>
          <h1>{t("terms.title")}</h1>
          <p>{t("terms.subtitle")}</p>
        </div>
      </div>
      <TermCreateForm
        termType={termType}
        name={name}
        slug={slug}
        pending={create.isPending}
        error={create.error}
        onTermTypeChange={setTermType}
        onNameChange={setName}
        onSlugChange={setSlug}
        onSubmit={() => create.mutate()}
        t={t}
      />
      <TermsTable
        title={t("terms.category")}
        query={categories}
        page={categoryPage}
        onPageChange={setCategoryPage}
        onDelete={(id) => remove.mutate(id)}
        onSave={(id, input) => update.mutate({ id, input })}
        t={t}
      />
      <TermsTable
        title={t("terms.tag")}
        query={tags}
        page={tagPage}
        onPageChange={setTagPage}
        onDelete={(id) => remove.mutate(id)}
        onSave={(id, input) => update.mutate({ id, input })}
        t={t}
      />
    </section>
  );
}

function useTermsPage(type: TermType, page: number) {
  return useQuery({
    queryKey: ["terms", type, page, TERMS_PER_PAGE],
    queryFn: () => api.listTerms({ page, per_page: TERMS_PER_PAGE, term_type: type }),
  });
}
