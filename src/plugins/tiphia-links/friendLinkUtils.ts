import { normalizedHttpUrl } from "../../blog/lib/url";
import type { FriendLink, FriendLinkGroup } from "./types";

export function visibleFriendLinks(links: FriendLink[]) {
  return links.filter((link) => normalizedHttpUrl(link.url));
}

export function groupFriendLinks(links: FriendLink[]): FriendLinkGroup[] {
  const groups = new Map<string, FriendLink[]>();
  links.forEach((link) => {
    const category = link.category?.trim() || "默认分类";
    groups.set(category, [...(groups.get(category) || []), link]);
  });
  return Array.from(groups.entries()).map(([category, items]) => ({
    category,
    links: items,
  }));
}
