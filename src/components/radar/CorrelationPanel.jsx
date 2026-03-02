import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { GitBranch, ChevronDown, ChevronRight, Loader2, RefreshCw, AlertTriangle, TrendingUp } from "lucide-react";

const PATTERN_COLORS = [
  { border: "rgba(239,68,68,0.4)", bg: "rgba(239,68,68,0.06)", text: "#ef4444", dot: "#ef4444" },
  { border: "rgba(245,158,11,0.4)", bg: "rgba(245,158,11,0.06)", text: "#f59e0b", dot: "#f59e0b" },
  { border: "rgba(139,92,246,0.4)", bg: "rgba(139,92,246,0.06)", text: "#a78bfa", dot: "#a78bfa" },
  { border: "rgba(59,130,246,0.4)", bg: "rgba(59,130,246,0.06)", text: "#60a5fa", dot: "#60a5fa" },
  { border: "rgba(16,185,129,0.4)", bg: "rgba(16,185,129,0.06)", text: "#10b981", dot: "#10b981" },
];

function CorrelationGroup({ group, index, onSelectEvent }) {
  const [open, setOpen] = useState(index === 0);
  const color = PATTERN_COLORS[index % PATTERN_COLORS.length];
  const isEscalating = group.risk_level === "HIGH" || group.risk_level === "CRITICAL";

  return (
    <div style={{ border: `1px solid ${color.border}`, background: color.bg, borderRadius: 6, marginBottom: 6 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 p-2.5 text-left"
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: color.dot, flexShrink: 0 }} />
        <span className="flex-1 text-[11px] font-bold text-slate-200 leading-tight">{group.pattern_name}</span>
        {isEscalating && <TrendingUp className="w-3 h-3 text-red-400 shrink-0" />}
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ color: color.text, background: `${color.dot}20` }}>
          {group.event_ids?.length || 0} events
        </span>
        {open ? (
          <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
        ) : (
          <ChevronRight className="w-3 h-3 text-slate-500 shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-2.5 pb-2.5">
          <p className="text-[10px] text-slate-400 leading-relaxed mb-2">{group.summary}</p>
          {group.risk_level && (
            <div className="flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-2.5 h-2.5" style={{ color: color.text }} />
              <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: color.text }}>
                Risk: {group.risk_level}
              </span>
            </div>
          )}
          <div className="flex flex-wrap gap-1">
            {(group.event_titles || []).map((title, i) => (
              <span
                key={i}
                onClick={() => onSelectEvent && onSelectEvent(group.event_ids?.[i])}
                className="text-[9px] text-slate-400 bg-slate-800/60 border border-white/[0.06] rounded px-1.5 py-0.5 cursor-pointer hover:text-slate-200 transition-colors truncate max-w-[120px]"
                title={title}
              >
                {title}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CorrelationPanel({ events, onSelectEventById, onGroupsChange }) {
  const [expanded, setExpanded] = useState(false);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastRun, setLastRun] = useState(null);

  const analyze = async () => {
    if (!events || events.length < 3) return;
    setLoading(true);
    const sample = events.slice(0, 80).map((e) => ({
      id: e.id,
      title: e.title,
      country: e.country,
      region: e.region,
      event_type: e.event_type,
      severity: e.severity,
      is_escalation: e.is_escalation,
      tags: e.tags,
    }));

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a conflict intelligence analyst. Analyze the following conflict events and identify correlation groups — clusters of events that appear related due to shared geography, actor involvement, event type progression, or escalation patterns. Each group should represent a distinct potential pattern or unfolding situation.

Return up to 6 groups. Only group events that are meaningfully correlated.

Events: ${JSON.stringify(sample)}

Return JSON only. No markdown.`,
      response_json_schema: {
        type: "object",
        properties: {
          groups: {
            type: "array",
            items: {
              type: "object",
              properties: {
                pattern_name: { type: "string" },
                summary: { type: "string" },
                risk_level: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
                event_ids: { type: "array", items: { type: "string" } },
                event_titles: { type: "array", items: { type: "string" } },
              },
            },
          },
        },
      },
    });

    setGroups(result?.groups || []);
    setLastRun(new Date());
    setLoading(false);
    setExpanded(true);
  };

  return (
    <div className="border-b border-white/[0.05]">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <GitBranch className="w-3.5 h-3.5 text-purple-400 shrink-0" />
        <span className="text-[11px] font-bold tracking-widest text-slate-300 uppercase flex-1">Correlations</span>
        <button
          onClick={analyze}
          disabled={loading}
          title="Run AI correlation analysis"
          className="text-slate-500 hover:text-purple-400 transition-colors"
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
          ) : (
            <RefreshCw className="w-3 h-3" />
          )}
        </button>
        <button onClick={() => setExpanded((v) => !v)} className="text-slate-500 hover:text-slate-300 transition-colors">
          {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>
      </div>

      {expanded && (
        <div className="px-2 pb-2 max-h-64 overflow-y-auto">
          {groups.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-5 gap-2">
              <GitBranch className="w-5 h-5 text-slate-700" />
              <p className="text-[10px] text-slate-600 text-center leading-relaxed">
                Click refresh to run AI<br />correlation analysis
              </p>
            </div>
          )}
          {groups.map((group, i) => (
            <CorrelationGroup
              key={i}
              group={group}
              index={i}
              onSelectEvent={onSelectEventById}
            />
          ))}
          {lastRun && (
            <div className="text-[9px] text-slate-700 text-right mt-1">
              Last analyzed {lastRun.toLocaleTimeString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}