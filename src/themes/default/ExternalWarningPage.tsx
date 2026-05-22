import { Link, useSearchParams } from "react-router-dom";

export function ExternalWarningPage() {
  const [params] = useSearchParams();
  const target = params.get("target") || "";
  const url = safeUrl(target);

  return (
    <section className="external-warning-page">
      <div className="external-warning-panel">
        <strong>即将离开本站</strong>
        <h1>外部链接可能存在风险</h1>
        <p>你将访问的页面不属于本站，请确认目标地址可信后再继续。</p>
        <div className="external-target">
          <span>目标站点</span>
          <strong>{url?.hostname || "未知地址"}</strong>
          <code>{target || "未提供目标地址"}</code>
        </div>
        <div className="external-actions">
          <Link className="button subtle" to="/">
            返回首页
          </Link>
          {url ? (
            <a className="button" href={url.href} target="_blank" rel="noreferrer noopener">
              继续访问
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function safeUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}
