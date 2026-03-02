import { useState, useMemo } from "react";
import {
  TrendingUp, ChevronDown, ChevronUp, Loader2, RefreshCw,
  BarChart2, Flame, MapPin, AlertTriangle
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";

const SEV_COLOR = { HIGH: "#ef4444", MEDIUM: "#f59e0b", LOW: "#10b981" };
const TYPE_EMOJIS = {
  airstrike: "✈️", missile: "🚀", explosion: "💥", clash: "⚔️",
  threat: "⚠️", diplomatic: "🤝", cyberattack: "💻", naval: "🚢", other: "📍"
};

function buildTimelineData(events) {
  // Group by day (last 14 days)
  const days = {};
  const now = Date.now();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    const key = `${d.getMonth() + 1}/${d.getDate()}`;
    days[key] = { date: key, HIGH: 0, MEDIUM: 0, LOW: 0 };
  }
  events.forEach((e) => {
    if (!e.created_date) return;
    const d = new Date(e.created_date);
    const key = `${d.getMonth() + 1}/${d.getDate()}`;
    if (days[key]) days[key][e.severity] = (days[key][e.severity] || 0) + 1;
  });
  return Object.values(days);
}

function buildRegionData(events) {
  const map = {};
  events.forEach((e) => {
    const r = e.country || e.region || "Unknown";
    if (!map[r]) map[r] = { region: r, count: 0, high: 0 };
    map[r].count++;
    if (e.severity === "HIGH") map[r].high++;
  });
  return Object.values(map)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function buildTypeData(events) {
  const map = {};
  events.forEach((e) => {
    const t = e.event_type || "other";
    map[t] = (map[t] || 0) + 1;
  });
  return Object.entries(map)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0f1520", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "6px 10px", fontSize: 10 }}>
      <div style={{ color: "#94a3b8", marginBottom: 4 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: SEV_COLOR[p.name] || "#60a5fa", display: "flex", gap: 4 }}>
          <span>{p.name}:</span><span style={{ fontWeight: 700 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function TrendAnalysisPanel({ events }) {
  const [expanded, setExpanded] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const timelineData = useMemo(() => buildTimelineData(events), [events]);
  const regionData = useMemo(() => buildRegionData(events), [events]);
  const typeData = useMemo(() => buildTypeData(events), [events]);

  const escalationRate = useMemo(() => {
    if (!events.length) return 0;
    return Math.round((events.filter((e) => e.is_escalation).length / events.length) * 100);
  }, [events]);

  const generateInsights = async () => {
    setLoading(true);
    const summary = events.slice(0, 30).map((e) =>
      `[${e.severity}] ${e.title} | ${e.country || e.region || "Unknown"} | ${e.event_type || "other"} | ${e.created_date?.slice(0, 10) || "?"}`
    ).join("\n");

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a conflict intelligence analyst. Analyze these ${events.length} recent conflict events and identify patterns:\n\n${summary}\n\nProvide:\n1. Top 2 predicted future hotspots with brief reasoning\n2. A single key escalation trend sentence\n3. A risk forecast sentence (next 7 days outlook)`,
      response_json_schema: {
        type: "object",
        properties: {
          predicted_hotspots: { type: "array", items: { type: "object", properties: { region: { type: "string" }, reason: { type: "string" } } } },
          escalation_trend: { type: "string" },
          risk_forecast: { type: "string" },
        },
      },
    });
    setAiInsights(result);
    setLoading(false);
  };

  return (
    <div className="border-b border-white/[0.05]">
      {/* Header */}
      <div
        className="flex items-center gap-2 p-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-[11px] font-bold tracking-widest text-slate-300 uppercase">Trend Analysis</span>
        <div className="ml-auto flex items-center gap-2">
          {expanded && !loading && (
            <button
              onClick={(e) => { e.stopPropagation(); generateInsights(); }}
              className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              {aiInsights ? "Refresh" : "AI Insights"}
            </button>
          )}
          {expanded ? <ChevronUp className="w-3 h-3 text-slate-500" /> : <ChevronDown className="w-3 h-3 text-slate-500" />}
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 space-y-3">

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { label: "Total", value: events.length, color: "#60a5fa" },
              { label: "High Sev", value: events.filter(e => e.severity === "HIGH").length, color: "#ef4444" },
              { label: "Escalations", value: `${escalationRate}%`, color: "#f59e0b" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, padding: "6px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color, fontFamily: "monospace" }}>{value}</div>
                <div style={{ fontSize: 9, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* 14-day timeline */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <BarChart2 className="w-3 h-3 text-slate-500" />
              <span className="text-[9px] font-bold tracking-widest text-slate-500 uppercase">14-Day Activity</span>
            </div>
            <ResponsiveContainer width="100%" height={56}>
              <AreaChart data={timelineData} margin={{ top: 2, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="highGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="medGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 8, fill: "#334155" }} tickLine={false} axisLine={false} interval={3} />
                <YAxis tick={{ fontSize: 8, fill: "#334155" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="HIGH" stroke="#ef4444" strokeWidth={1.5} fill="url(#highGrad)" dot={false} />
                <Area type="monotone" dataKey="MEDIUM" stroke="#f59e0b" strokeWidth={1} fill="url(#medGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Top regions bar chart */}
          {regionData.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <MapPin className="w-3 h-3 text-slate-500" />
                <span className="text-[9px] font-bold tracking-widest text-slate-500 uppercase">Top Hotspots</span>
              </div>
              <ResponsiveContainer width="100%" height={72}>
                <BarChart data={regionData} layout="vertical" margin={{ top: 0, right: 4, left: 0, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 8, fill: "#334155" }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="region" tick={{ fontSize: 9, fill: "#64748b" }} tickLine={false} axisLine={false} width={70} />
                  <Tooltip content={({ active, payload }) => active && payload?.length ? (
                    <div style={{ background: "#0f1520", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "5px 8px", fontSize: 10, color: "#94a3b8" }}>
                      {payload[0]?.payload?.region}: <strong style={{ color: "#f1f5f9" }}>{payload[0]?.value}</strong> events
                    </div>
                  ) : null} />
                  <Bar dataKey="count" radius={[0, 3, 3, 0]}>
                    {regionData.map((entry, i) => (
                      <Cell key={i} fill={entry.high > 0 ? "#ef4444" : "#3b82f6"} fillOpacity={0.7} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Event types */}
          {typeData.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Flame className="w-3 h-3 text-slate-500" />
                <span className="text-[9px] font-bold tracking-widest text-slate-500 uppercase">Event Types</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {typeData.map(({ type, count }) => (
                  <div key={type} style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4, padding: "3px 7px" }}>
                    <span style={{ fontSize: 10 }}>{TYPE_EMOJIS[type] || "📍"}</span>
                    <span style={{ fontSize: 9, color: "#64748b", textTransform: "capitalize" }}>{type}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", fontFamily: "monospace" }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Insights */}
          {(loading || aiInsights) && (
            <div style={{ background: "rgba(147,51,234,0.05)", border: "1px solid rgba(147,51,234,0.2)", borderRadius: 6, padding: "8px 10px" }}>
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-3 h-3 text-purple-400" />
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#a855f7", textTransform: "uppercase" }}>AI Predictive Insights</span>
              </div>
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
                  <span style={{ fontSize: 10, color: "#64748b" }}>Analyzing patterns...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {aiInsights.predicted_hotspots?.map((h, i) => (
                    <div key={i} style={{ paddingLeft: 8, borderLeft: "2px solid rgba(239,68,68,0.4)" }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: "#fca5a5" }}>🎯 {h.region}</div>
                      <div style={{ fontSize: 9, color: "#64748b", marginTop: 2 }}>{h.reason}</div>
                    </div>
                  ))}
                  {aiInsights.escalation_trend && (
                    <p style={{ fontSize: 10, color: "#f59e0b", borderLeft: "2px solid rgba(245,158,11,0.4)", paddingLeft: 8 }}>
                      📈 {aiInsights.escalation_trend}
                    </p>
                  )}
                  {aiInsights.risk_forecast && (
                    <p style={{ fontSize: 10, color: "#94a3b8", borderLeft: "2px solid rgba(148,163,184,0.3)", paddingLeft: 8, fontStyle: "italic" }}>
                      🔮 {aiInsights.risk_forecast}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {!aiInsights && !loading && (
            <button
              onClick={generateInsights}
              style={{ width: "100%", fontSize: 10, fontWeight: 600, color: "#a855f7", background: "rgba(147,51,234,0.1)", border: "1px solid rgba(147,51,234,0.25)", borderRadius: 5, padding: "5px 0", cursor: "pointer" }}
            >
              ✨ Generate AI Predictions
            </button>
          )}
        </div>
      )}
    </div>
  );
}