export function shouldWarnExternalLink(anchor: HTMLAnchorElement, siteBaseUrl?: string | null) {
  if (anchor.dataset.safeExternal === "true" || anchor.closest("[data-safe-external='true']")) {
    return false;
  }

  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }

  const target = safeUrl(href);
  if (!target) {
    return false;
  }

  const currentOrigin = window.location.origin;
  const configuredOrigin = siteBaseUrl ? safeUrl(siteBaseUrl)?.origin : undefined;
  return target.origin !== currentOrigin && target.origin !== configuredOrigin;
}

export function externalWarningPath(url: string) {
  return `/external-warning?target=${encodeURIComponent(url)}`;
}

function safeUrl(value: string) {
  try {
    return new URL(value, window.location.origin);
  } catch {
    return null;
  }
}
