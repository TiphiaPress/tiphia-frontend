import { useSearchParams } from "react-router-dom";
import { useActiveThemeViews } from "../hooks/useActiveThemeViews";

export function ExternalWarningPage() {
  const { ExternalWarning } = useActiveThemeViews();
  const [params] = useSearchParams();
  return <ExternalWarning target={params.get("target") || ""} />;
}
