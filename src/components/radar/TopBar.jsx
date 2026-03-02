import { useState, useEffect } from "react";
import { Radio, Plus, Clock } from "lucide-react";

export default function TopBar({ eventCount, onAddEvent }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n) => String(n).padStart(2, "0");
  const timeStr = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())} UTC`;

  return (
    <header className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05] bg-[#0a0e18]/90 backdrop-blur z-30 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <div className="w-7 h-7 rounded bg-red-600/20 border border-red-500/40 flex items-center justify-center">
            <Radio className="w-3.5 h-3.5 text-red-400" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-blink" />
        </div>
        <div>
          <div className="text-sm font-black tracking-widest text-white text-glow-red">LBC RADAR</div>
          <div className="text-[9px] text-slate-500 tracking-widest uppercase">Global Conflict Intelligence</div>
        </div>
      </div>

      {/* Center status */}
      <div className="hidden md:flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-blink" />
          <span className="text-[10px] text-red-400 font-bold tracking-widest">LIVE</span>
        </div>
        <div className="text-[10px] text-slate-500 font-mono">{timeStr}</div>
        <div className="flex items-center gap-1.5 bg-slate-800/50 px-2 py-1 rounded border border-white/[0.06]">
          <span className="text-[10px] text-slate-400">Active Events:</span>
          <span className="text-[10px] font-bold text-white font-mono">{eventCount}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onAddEvent}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded text-[11px] text-red-400 font-bold tracking-wider transition-all hover:border-red-500/50"
        >
          <Plus className="w-3 h-3" />
          Log Event
        </button>
      </div>
    </header>
  );
}