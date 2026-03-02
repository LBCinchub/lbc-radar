import { useLang } from "../LanguageContext";

export default function SeverityBadge({ severity, small = false }) {
  const { t } = useLang();
  const cfg = {
    HIGH: { labelKey: "filterHigh", cls: "severity-high", dot: "dot-high" },
    MEDIUM: { labelKey: "filterMed", cls: "severity-medium", dot: "dot-medium" },
    LOW: { labelKey: "filterLow", cls: "severity-low", dot: "dot-low" },
  };
  const { labelKey, cls, dot } = cfg[severity] || cfg["LOW"];
  const label = t[labelKey];

  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-bold tracking-widest ${cls} ${small ? "text-[9px]" : ""}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}