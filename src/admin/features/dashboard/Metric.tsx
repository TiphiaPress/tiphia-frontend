import type { LucideIcon } from "lucide-react";

interface MetricProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

export function Metric({ icon: Icon, label, value }: MetricProps) {
  return (
    <div className="metric">
      <Icon size={20} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
