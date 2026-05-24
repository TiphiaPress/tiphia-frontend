import { useQuery } from "@tanstack/react-query";
import { requestPublic } from "../../framework/public-api";
import { FriendLinkCard } from "./FriendLinkCard";
import { groupFriendLinks, visibleFriendLinks } from "./friendLinkUtils";
import type { FriendLink } from "./types";

export function LinksPageContent() {
  const links = useQuery({
    queryKey: ["friend-links"],
    queryFn: () => requestPublic<FriendLink[]>("/api/v1/links"),
    retry: false,
  });

  if (!links.data?.length) {
    return null;
  }

  return <FriendLinks links={links.data} />;
}

function FriendLinks({ links }: { links: FriendLink[] }) {
  const groups = groupFriendLinks(visibleFriendLinks(links));
  if (groups.length === 0) {
    return null;
  }

  return (
    <section className="friend-links">
      <h2>友情链接</h2>
      {groups.map((group) => (
        <div className="friend-link-group" key={group.category}>
          <h3>{group.category}</h3>
          <div className="friend-link-list">
            {group.links.map((link) => (
              <FriendLinkCard link={link} key={`${link.category || ""}:${link.name}:${link.url}`} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
