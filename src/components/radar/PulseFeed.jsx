import { useState } from "react";
import { Search, Radio, RefreshCw } from "lucide-react";
import EventCard from "./EventCard";
import { useLang } from "../LanguageContext";

export default function PulseFeed({ events, onSelectEvent, selectedEvent, onRefresh }) {
  const { t } = useLang();
  const FILTERS = [
    { label: t.filterAll, value: "all" },
    { label: t.filterHigh, value: "HIGH" },
    { label: t.filterMed, value: "MEDIUM" },
    { label: t.filterLow, value: "LOW" },
    { label: t.filterEsc, value: "escalation" },
  ];
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const filtered = events.filter((e) => {
    const matchSearch =
      !search ||
      e.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.region?.toLowerCase().includes(search.toLowerCase()) ||
      e.country?.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      activeFilter === "all" ||
      (activeFilter === "escalation" ? e.is_escalation : e.severity === activeFilter);

    return matchSearch && matchFilter;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-white/[0.05]">
        <div className="flex items-center gap-2 mb-3">
          <Radio className="w-3.5 h-3.5 text-red-500 animate-blink" />
          <span className="text-[11px] font-bold tracking-widest text-slate-300 uppercase">{t.pulseFeed}</span>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={handleRefresh} disabled={refreshing} title="Refresh events" className="text-slate-500 hover:text-slate-300 transition-colors">
              <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin text-red-400" : ""}`} />
            </button>
            <span className="text-[10px] text-slate-600 font-mono bg-slate-800/50 px-1.5 py-0.5 rounded">
              {filtered.length}/{events.length}
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchEvents}
            className="w-full bg-slate-800/50 border border-white/[0.06] rounded text-[11px] text-slate-300 placeholder-slate-600 pl-7 pr-3 py-1.5 focus:outline-none focus:border-red-500/40 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`px-2 py-1 rounded text-[10px] font-bold tracking-widest transition-all ${
                activeFilter === f.value
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "text-slate-500 hover:text-slate-300 border border-transparent hover:border-white/10"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-600 text-xs">
            <Radio className="w-5 h-5 mb-2 opacity-30" />
            No events found
          </div>
        ) : (
          filtered.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onClick={onSelectEvent}
              isSelected={selectedEvent?.id === event.id}
            />
          ))
        )}
      </div>
    </div>
  );
}