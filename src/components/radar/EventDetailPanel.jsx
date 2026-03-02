import { X, MapPin, Clock, Shield, Zap, Brain } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import SeverityBadge from "./SeverityBadge";
import { useLang } from "../LanguageContext";

const EVENT_TYPE_LABELS = {
  airstrike: "Airstrike",
  missile: "Missile Attack",
  explosion: "Explosion",
  clash: "Armed Clash",
  threat: "Threat",
  diplomatic: "Diplomatic",
  cyberattack: "Cyberattack",
  naval: "Naval Incident",
  other: "Incident",
};

export default function EventDetailPanel({ event, onClose }) {
  if (!event) return null;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-[#0f1520]/95 backdrop-blur p-3 border-b border-white/[0.05] z-10">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <SeverityBadge severity={event.severity} />
            {event.event_type && (
              <span className="text-[10px] text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded border border-white/[0.06] uppercase tracking-wider">
                {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
              </span>
            )}
            {event.is_escalation && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold">
                <Zap className="w-2.5 h-2.5" /> ESCALATION
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-200 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-3 space-y-4">
        {/* Title */}
        <h2 className="text-sm font-semibold text-white leading-snug">{event.title}</h2>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-2">
          {(event.region || event.country) && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <MapPin className="w-3 h-3 text-slate-600" />
              <span>{event.region || event.country}</span>
              {event.country_code && (
                <img
                  src={`https://flagcdn.com/w20/${event.country_code.toLowerCase()}.png`}
                  alt=""
                  className="w-3.5 h-2.5 object-cover rounded-[1px]"
                />
              )}
            </div>
          )}
          {event.created_date && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Clock className="w-3 h-3 text-slate-600" />
              {formatDistanceToNow(new Date(event.created_date), { addSuffix: true })}
            </div>
          )}
          {event.confidence && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Shield className="w-3 h-3 text-slate-600" />
              {event.confidence}% confidence
            </div>
          )}
        </div>

        {/* Summary */}
        {event.summary && (
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1.5">Summary</p>
            <p className="text-xs text-slate-300 leading-relaxed">{event.summary}</p>
          </div>
        )}

        {/* AI Analysis */}
        {event.ai_analysis && (
          <div className="rounded-lg bg-blue-900/10 border border-blue-500/20 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Brain className="w-3 h-3 text-blue-400" />
              <span className="text-[10px] text-blue-400 font-bold tracking-widest uppercase">AI Analysis</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{event.ai_analysis}</p>
          </div>
        )}

        {/* Tags */}
        {event.tags?.length > 0 && (
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1.5">Tags</p>
            <div className="flex flex-wrap gap-1">
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 rounded bg-slate-800/60 border border-white/[0.06] text-[10px] text-slate-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}