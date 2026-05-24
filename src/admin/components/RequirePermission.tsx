import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useI18n } from "../../framework/i18n";
import { getStoredUser } from "../lib/auth";
import { type AdminSection, canAccessAdminSection, firstAllowedAdminPath } from "../lib/permissions";

export function RequirePermission({ section, children }: { section: AdminSection; children: ReactNode }) {
  const user = getStoredUser();
  if (!canAccessAdminSection(user, section)) {
    return <Forbidden />;
  }
  return <>{children}</>;
}

export function RedirectToAllowedAdminPage() {
  return <Navigate to={firstAllowedAdminPath(getStoredUser())} replace />;
}

function Forbidden() {
  const { t } = useI18n();
  return (
    <section className="page">
      <div className="state error-text">
        <strong>{t("permission.denied_title")}</strong>
        <p>{t("permission.denied_desc")}</p>
      </div>
    </section>
  );
}
