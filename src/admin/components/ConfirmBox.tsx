import type { ReactNode } from "react";
import { useI18n } from "../../framework/i18n";

export interface ConfirmBoxProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  tone?: "default" | "danger";
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmBox({
  open,
  title,
  description,
  confirmText,
  cancelText,
  tone = "default",
  pending,
  onConfirm,
  onCancel,
}: ConfirmBoxProps) {
  const { t } = useI18n();
  if (!open) {
    return null;
  }

  return (
    <div className="confirm-backdrop" role="presentation" onMouseDown={onCancel}>
      <section
        className="confirm-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-title">{title}</h2>
        {description ? <div className="confirm-description">{description}</div> : null}
        <div className="confirm-actions">
          <button type="button" className="button subtle" disabled={pending} onClick={onCancel}>
            {cancelText || t("action.cancel")}
          </button>
          <button
            type="button"
            className={tone === "danger" ? "button danger solid" : "button"}
            disabled={pending}
            onClick={onConfirm}
          >
            {pending ? t("action.processing") : confirmText || t("action.confirm")}
          </button>
        </div>
      </section>
    </div>
  );
}
