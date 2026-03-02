export default function SeverityBadge({ severity, small = false }) {
  const cfg = {
    HIGH: { label: "HIGH", cls: "severity-high", dot: "dot-high" },
    MEDIUM: { label: "MED", cls: "severity-medium", dot: "dot-medium" },
    LOW: { label: "LOW", cls: "severity-low", dot: "dot-low" },
  };
  const { label, cls, dot } = cfg[severity] || cfg["LOW"];

  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-bold tracking-widest ${cls} ${small ? "text-[9px]" : ""}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}