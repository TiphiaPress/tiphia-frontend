import { normalizedAssetUrl } from "../lib/url";

export function SiteAvatar({
  avatarUrl,
  baseUrl,
  title,
  size = "large",
}: {
  avatarUrl?: string | null;
  baseUrl?: string | null;
  title: string;
  size?: "small" | "large";
}) {
  const href = normalizedAssetUrl(avatarUrl, baseUrl);
  if (!href) {
    return null;
  }

  return <img className={`site-avatar ${size}`} src={href} alt={title} loading="lazy" />;
}
