import { useState } from "react";
import { Brain, Loader2, RefreshCw, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { base44 } from "@/api/base44Client";

const THREAT_COLORS = {
  CRITICAL: "text-red-400 border-red-500/40 bg-red-900/10",
  HIGH: "text-orange-400 border-orange-500/40 bg-orange-900/10",
  ELEVATED: "text-amber-400 border-amber-500/40 bg-amber-900/10",
  MODERATE: "text-yellow-400 border-yellow-500/40 bg-yellow-900/10",
  LOW: "text-green-400 border-green-500/40 bg-green-900/10",
};

export default function SmartDigestPanel({ events }) {
  const [digest, setDigest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const generateDigest = async () => {
    setLoading(true);
    const summary = events.slice(0, 20).map((e) => `[${e.severity}] ${e.title} (${e.region || e.country || "Unknown"})`).join("\n");
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are LBC RADAR, an elite global conflict intelligence AI. Analyze these recent security events and generate a concise, professional intelligence digest for analysts:\n\n${summary}\n\nProvide:\n1. Overall threat assessment (CRITICAL/HIGH/ELEVATED/MODERATE/LOW)\n2. Key hotspots (2-3 regions)\n3. 3-4 sentence executive summary\n4. Notable escalation trends`,
      response_json_schema: {
        type: "object",
        properties: {
          threat_level: { type: "string" },
          hotspots: { type: "array", items: { type: "string" } },
          summary: { type: "string" },
          trends: { type: "string" },
        },
      },
    });
    setDigest(result);
    setLoading(false);
  };

  return (
    <div className="border-b border-white/[0.05]">
      <div
        className="flex items-center gap-2 p-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <Brain className="w-3.5 h-3.5 text-blue-400" />
        <span className="text-[11px] font-bold tracking-widest text-slate-300 uppercase">Smart Digest</span>
        <div className="ml-auto flex items-center gap-2">
          {!loading && (
            <button
              onClick={(e) => { e.stopPropagation(); generateDigest(); }}
              className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              {digest ? "Refresh" : "Generate"}
            </button>
          )}
          {expanded ? <ChevronUp className="w-3 h-3 text-slate-500" /> : <ChevronDown className="w-3 h-3 text-slate-500" />}
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3">
          {loading ? (
            <div className="flex items-center gap-2 text-[11px] text-slate-500 py-2">
              <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
              Analyzing {events.length} events...
            </div>
          ) : digest ? (
            <div className="space-y-2">
              {digest.threat_level && (
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold tracking-widest ${THREAT_COLORS[digest.threat_level] || THREAT_COLORS.MODERATE}`}>
                  <TrendingUp className="w-2.5 h-2.5" />
                  THREAT: {digest.threat_level}
                </div>
              )}
              {digest.hotspots?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {digest.hotspots.map((h) => (
                    <span key={h} className="text-[10px] text-slate-400 bg-slate-800/50 px-1.5 py-0.5 rounded border border-white/[0.06]">
                      📍 {h}
                    </span>
                  ))}
                </div>
              )}
              {digest.summary && (
                <p className="text-[11px] text-slate-300 leading-relaxed">{digest.summary}</p>
              )}
              {digest.trends && (
                <p className="text-[11px] text-slate-500 leading-relaxed italic">{digest.trends}</p>
              )}
            </div>
          ) : (
            <p className="text-[11px] text-slate-600 py-1">
              Click Generate to get an AI-powered intelligence digest.
            </p>
          )}
        </div>
      )}
    </div>
  );
}