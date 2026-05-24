import { useQuery } from "@tanstack/react-query";
import { themeFor } from "../../themes";
import { api } from "../lib/api";

export function useActiveThemeViews() {
  const settings = useQuery({ queryKey: ["settings"], queryFn: api.settings });
  return themeFor(settings.data?.theme.active).views;
}
