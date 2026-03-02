import { formatDistanceToNow } from "date-fns";
import SeverityBadge from "./SeverityBadge";
import { MapPin, Zap } from "lucide-react";

const EVENT_TYPE_ICONS = {
  airstrike: "✈",
  missile: "🚀",
  explosion: "💥",
  clash: "⚔",
  threat: "⚠",
  diplomatic: "🤝",
  cyberattack: "💻",
  naval: "⚓",
  other: "📡",
};

export default function EventCard({ event, onClick, isSelected }) {
  const timeAgo = event.created_date
    ? formatDistanceToNow(new Date(event.created_date), { addSuffix: false })
    : "just now";

  return (
    <div
      onClick={() => onClick?.(event)}
      className={`group cursor-pointer p-3 border-b border-white/[0.04] hover:bg-white/[0.03] transition-all duration-200 animate-fade-in-up ${
        isSelected ? "bg-red-900/10 border-l-2 border-l-red-500" : "border-l-2 border-l-transparent"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm">{EVENT_TYPE_ICONS[event.event_type] || "📡"}</span>
          <SeverityBadge severity={event.severity} small />
          {event.is_escalation && (
            <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-bold tracking-widest">
              <Zap className="w-2 h-2" /> ESC
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-500 shrink-0 font-mono">{timeAgo}</span>
      </div>

      <p className="text-xs font-medium text-slate-200 leading-snug mb-1 line-clamp-2">
        {event.title}
      </p>

      {event.summary && (
        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
          {event.summary}
        </p>
      )}

      <div className="flex items-center gap-1 mt-1.5">
        {event.country_code && (
          <img
            src={`https://flagcdn.com/w20/${event.country_code.toLowerCase()}.png`}
            alt={event.country}
            className="w-3.5 h-2.5 object-cover rounded-[1px] opacity-80"
          />
        )}
        {event.region && (
          <span className="flex items-center gap-0.5 text-[10px] text-slate-500">
            <MapPin className="w-2.5 h-2.5" />
            {event.region}
          </span>
        )}
        {event.confidence && (
          <span className="ml-auto text-[10px] text-slate-600 font-mono">
            {event.confidence}% conf.
          </span>
        )}
      </div>
    </div>
  );
}