import { Navigate, Outlet } from "react-router-dom";
import { getStoredUser, getToken } from "../lib/auth";
import { visibleAdminSections } from "../lib/permissions";
import { adminPath } from "../lib/routes";

export function RequireAuth() {
  if (!getToken()) {
    return <Navigate to={adminPath("/login")} replace />;
  }
  const user = getStoredUser();
  if (!user || visibleAdminSections(user).length === 0) {
    return <Navigate to={adminPath("/login")} replace />;
  }

  return <Outlet />;
}
