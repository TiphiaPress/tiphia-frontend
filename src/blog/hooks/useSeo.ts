import { useEffect } from "react";

export function useSeo({
  title,
  description,
  siteTitle,
  suffix,
  canonical,
  apiBaseUrl,
  type = "website",
}: {
  title?: string;
  description?: string | null;
  siteTitle?: string;
  suffix?: string | null;
  canonical?: string;
  apiBaseUrl?: string;
  type?: "website" | "article";
}) {
  useEffect(() => {
    const cleanTitle = title || siteTitle || "Tiphia";
    const nextTitle = suffix && cleanTitle !== suffix ? `${cleanTitle} - ${suffix}` : cleanTitle;
    document.title = nextTitle;
    setMeta("description", description || "");
    setMeta("og:title", nextTitle, "property");
    setMeta("og:description", description || "", "property");
    setMeta("og:type", type, "property");
    if (canonical) {
      setCanonical(canonical);
      setMeta("og:url", canonical, "property");
    }
    if (apiBaseUrl) {
      setFeedLink("alternate", "application/rss+xml", `${apiBaseUrl}/feed.xml`, "RSS");
      setFeedLink("alternate", "application/atom+xml", `${apiBaseUrl}/atom.xml`, "Atom");
    }
  }, [apiBaseUrl, canonical, description, siteTitle, suffix, title, type]);
}

function setMeta(name: string, content: string, attr: "name" | "property" = "name") {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, name);
    document.head.appendChild(element);
  }
  element.content = content;
}

function setCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.rel = "canonical";
    document.head.appendChild(element);
  }
  element.href = href;
}

function setFeedLink(rel: string, type: string, href: string, title: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"][type="${type}"]`);
  if (!element) {
    element = document.createElement("link");
    element.rel = rel;
    element.type = type;
    document.head.appendChild(element);
  }
  element.href = href;
  element.title = title;
}
