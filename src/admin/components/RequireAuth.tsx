import { Navigate, Outlet } from "react-router-dom";
import { getStoredUser, getToken } from "../lib/auth";
import { adminPath } from "../lib/routes";

export function RequireAuth() {
  if (!getToken()) {
    return <Navigate to={adminPath("/login")} replace />;
  }
  const user = getStoredUser();
  if (!user || !["root", "admin", "editor"].includes(user.role)) {
    return <Navigate to={adminPath("/login")} replace />;
  }

  return <Outlet />;
}
