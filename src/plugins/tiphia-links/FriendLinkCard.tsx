import { normalizedAssetUrl, normalizedHttpUrl } from "../../blog/lib/url";
import type { FriendLink } from "./types";

export function FriendLinkCard({ link }: { link: FriendLink }) {
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
