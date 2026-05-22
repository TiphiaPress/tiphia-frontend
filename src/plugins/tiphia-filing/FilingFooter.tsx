import { useQuery } from "@tanstack/react-query";
import { requestPublic } from "../../framework/public-api";
import { normalizedHttpUrl } from "../../blog/lib/url";

interface FilingInfo {
  icp_number: string;
  icp_url: string;
  police_html: string;
}

export function FilingFooter() {
  const filing = useQuery({
    queryKey: ["filing"],
    queryFn: () => requestPublic<FilingInfo>("/api/v1/filing"),
    retry: false,
  });

  if (!filing.data || (!filing.data.icp_number && !filing.data.police_html)) {
    return null;
  }

  return (
    <div className="filing-info">
      {filing.data.icp_number ? (
        <a
          href={normalizedHttpUrl(filing.data.icp_url) || "https://beian.miit.gov.cn/"}
          target="_blank"
          rel="noreferrer noopener"
          data-safe-external="true"
        >
          {filing.data.icp_number}
        </a>
      ) : null}
      {filing.data.police_html ? (
        <span className="police-filing" data-safe-external="true" dangerouslySetInnerHTML={{ __html: filing.data.police_html }} />
      ) : null}
    </div>
  );
}
