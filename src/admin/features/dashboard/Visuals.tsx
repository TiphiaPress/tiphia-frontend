import type { CSSProperties } from "react";
import type { DistributionItem } from "./dashboardModel";

export function Distribution({ data, total }: { data: DistributionItem[]; total: number }) {
  return (
    <div className="distribution">
      <div className="distribution-bar" aria-label="状态分布">
        {data.map((item) => (
          <span
            className={"segment " + item.tone}
            key={item.label}
            style={{ width: (total > 0 ? Math.max(4, (item.valueCount / total) * 100) : 0) + "%" }}
            title={item.label + ": " + item.valueCount}
          />
        ))}
      </div>
      <div className="distribution-legend">
        {data.map((item) => (
          <span key={item.label}>
            <i className={"dot " + item.tone} />
            {item.label}
            <strong>{item.valueCount}</strong>
          </span>
        ))}
      </div>
    </div>
  );
}

export function Ring({ value, total, label, hint }: { value: number; total: number; label: string; hint: string }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="ring-panel">
      <div className="ring" style={{ "--ring-value": percent + "%" } as CSSProperties}>
        <strong>{percent}%</strong>
        <small>{label}</small>
      </div>
      <p className="muted">{hint}</p>
    </div>
  );
}
