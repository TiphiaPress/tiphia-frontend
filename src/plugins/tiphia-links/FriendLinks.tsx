import { useQuery } from "@tanstack/react-query";
import { requestPublic } from "../../framework/public-api";
import { normalizedAssetUrl, normalizedHttpUrl } from "../../blog/lib/url";

interface FriendLink {
  name: string;
  description?: string | null;
  url: string;
  avatar_url?: string | null;
  category?: string | null;
}

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
  const visibleLinks = links.filter((link) => normalizedHttpUrl(link.url));
  const groups = groupFriendLinks(visibleLinks);
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

function FriendLinkCard({ link }: { link: FriendLink }) {
  const avatarUrl = normalizedAssetUrl(link.avatar_url);

  return (
    <a
      className="friend-link"
      href={normalizedHttpUrl(link.url) || "#"}
      target="_blank"
      rel="noreferrer noopener"
    >
      {avatarUrl ? <img src={avatarUrl} alt="" loading="lazy" referrerPolicy="no-referrer" /> : null}
      <span>
        <strong>{link.name}</strong>
        {link.description ? <small>{link.description}</small> : null}
      </span>
    </a>
  );
}

function groupFriendLinks(links: FriendLink[]) {
  const groups = new Map<string, FriendLink[]>();
  links.forEach((link) => {
    const category = link.category?.trim() || "未分类";
    groups.set(category, [...(groups.get(category) || []), link]);
  });
  return Array.from(groups.entries()).map(([category, items]) => ({
    category,
    links: items,
  }));
}
