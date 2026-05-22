export const ADMIN_BASE = "/admin";

export function adminPath(path = "") {
  if (!path || path === "/") {
    return ADMIN_BASE;
  }
  return `${ADMIN_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}
