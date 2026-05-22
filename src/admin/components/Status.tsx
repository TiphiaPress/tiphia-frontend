import { useI18n } from "../../framework/i18n";

export function Loading() {
  const { t } = useI18n();
  return <div className="state">{t("state.loading")}</div>;
}

export function Empty({ text }: { text?: string }) {
  const { t } = useI18n();
  return <div className="state muted">{text || t("state.empty")}</div>;
}

export function ErrorState({ error }: { error: unknown }) {
  const { t } = useI18n();
  const message = error instanceof Error ? error.message : t("state.error");
  return <div className="state error-text">{message}</div>;
}
