import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ErrorState, Loading } from "../components/Status";
import { useToast } from "../components/Toast";
import { SettingsForm } from "../features/settings/SettingsForm";
import { defaultSiteSettings } from "../features/settings/settingsDefaults";
import { useI18n } from "../../framework/i18n";
import { api } from "../lib/api";
import type { SiteSettings } from "../types";

export function SettingsPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useI18n();
  const [form, setForm] = useState<SiteSettings>(defaultSiteSettings);
  const query = useQuery({ queryKey: ["settings"], queryFn: api.getSettings });
  const update = useMutation({
    mutationFn: () => api.updateSettings(form),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success(t("settings.saved"));
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t("settings.save_failed"));
    },
  });

  useEffect(() => {
    if (query.data) {
      setForm(query.data);
    }
  }, [query.data]);

  if (query.isLoading) {
    return <Loading />;
  }

  if (query.error) {
    return <ErrorState error={query.error} />;
  }

  return (
    <section className="page narrow">
      <div className="page-header">
        <div>
          <h1>{t("settings.title")}</h1>
          <p>{t("settings.subtitle")}</p>
        </div>
      </div>
      <SettingsForm
        form={form}
        pending={update.isPending}
        error={update.error}
        onChange={setForm}
        onSubmit={() => update.mutate()}
        t={t}
      />
    </section>
  );
}
