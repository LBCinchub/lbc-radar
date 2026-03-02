import { useState, useEffect, useRef } from "react";
import { Radio, Plus, Zap, Globe } from "lucide-react";
import { useLang, LANGUAGES } from "../LanguageContext";

export default function TopBar({ eventCount, onAddEvent }) {
  const [time, setTime] = useState(new Date());
  const [showLangMenu, setShowLangMenu] = useState(false);
  const langRef = useRef(null);
  const { lang, setLang, t } = useLang();

  useEffect(() => {
    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setShowLangMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pad = (n) => String(n).padStart(2, "0");
  const timeStr = `${pad(time.getUTCHours())}:${pad(time.getUTCMinutes())}:${pad(time.getUTCSeconds())} UTC`;

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
          <div className="text-[9px] text-slate-500 tracking-widest uppercase">{t.appSubtitle}</div>
        </div>
      </div>

      {/* Center status */}
      <div className="hidden md:flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-blink" />
          <span className="text-[10px] text-red-400 font-bold tracking-widest">{t.live}</span>
        </div>
        <div className="text-[10px] text-slate-500 font-mono">{timeStr}</div>
        <div className="flex items-center gap-1.5 bg-slate-800/50 px-2 py-1 rounded border border-white/[0.06]">
          <span className="text-[10px] text-slate-400">{t.activeEvents}</span>
          <span className="text-[10px] font-bold text-white font-mono">{eventCount}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/25">
          <Zap className="w-2.5 h-2.5 text-blue-400" />
          <span className="text-[10px] text-blue-400 font-bold tracking-widest">{t.aiRealtime}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Language Switcher */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setShowLangMenu((v) => !v)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/50 hover:bg-slate-700/60 border border-white/[0.07] rounded text-[11px] text-slate-400 font-bold tracking-wider transition-all"
          >
            <Globe className="w-3 h-3" />
            {LANGUAGES[lang]?.label}
          </button>
          {showLangMenu && (
            <div className="fixed right-4 bg-[#0d1117] border border-white/[0.08] rounded-lg shadow-2xl overflow-hidden z-[9999] min-w-[150px]" style={{ top: 52 }}>
              {Object.entries(LANGUAGES).map(([code, info]) => (
                <button
                  key={code}
                  onClick={() => { setLang(code); setShowLangMenu(false); }}
                  className={`w-full text-left px-3 py-2 text-[11px] flex items-center gap-2 transition-colors ${
                    lang === code
                      ? "bg-red-500/10 text-red-400 font-bold"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <span className="font-bold w-5">{info.label}</span>
                  <span>{info.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onAddEvent}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded text-[11px] text-red-400 font-bold tracking-wider transition-all hover:border-red-500/50"
        >
          <Plus className="w-3 h-3" />
          {t.logEvent}
        </button>
      </div>
    </header>
  );
}