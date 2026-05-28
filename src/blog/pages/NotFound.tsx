import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useActiveThemeViews } from "../hooks/useActiveThemeViews";
import { useSeo } from "../hooks/useSeo";

export function notFoundPath(path: string) {
  return `/404?from=${encodeURIComponent(path)}`;
}

export function isNotFoundError(error: unknown) {
  if (!error) return false;
  const status = typeof error === "object" && error !== null && "status" in error ? Number((error as { status?: number }).status) : 0;
  const code = typeof error === "object" && error !== null && "code" in error ? String((error as { code?: string }).code) : "";
  const message = error instanceof Error ? error.message : String(error);
  return status === 404 || code === "not_found" || /not found|not_found|404/i.test(message);
}

export function NotFoundRedirect() {
  const location = useLocation();
  const from = `${location.pathname}${location.search}${location.hash}`;
  return <Navigate to={notFoundPath(from)} replace state={{ from }} />;
}

export function NotFoundPage() {
  const { NotFound } = useActiveThemeViews();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const stateFrom = typeof location.state === "object" && location.state && "from" in location.state ? String(location.state.from) : "";
  const from = searchParams.get("from") || stateFrom;

  useSeo({ title: "页面不存在" });

  return <NotFound path={from || ""} />;
}
