import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Newspaper, Plus, X, Loader2, CheckCircle2, XCircle, Clock, Link, ChevronDown, ChevronUp, ShieldCheck, Settings, Smile, Radio } from "lucide-react";
import { useLang, NEWS_TRANSLATE_LANGS } from "../LanguageContext";

const STATUS_CONFIG = {
  pending:    { key: "statusChecking",   color: "#64748b", icon: Clock,         bg: "rgba(100,116,139,0.1)" },
  verified:   { key: "statusVerified",  color: "#10b981", icon: CheckCircle2,  bg: "rgba(16,185,129,0.1)"  },
  unverified: { key: "statusUnverified", color: "#f59e0b", icon: XCircle,       bg: "rgba(245,158,11,0.1)"  },
  false:      { key: "statusFalse",     color: "#ef4444", icon: XCircle,       bg: "rgba(239,68,68,0.1)"   },
};

const SENTIMENT_CONFIG = {
  very_positive: { emoji: "🟢", label: "Very Bullish", color: "#10b981" },
  positive: { emoji: "📈", label: "Bullish", color: "#34d399" },
  neutral: { emoji: "➡️", label: "Neutral", color: "#94a3b8" },
  negative: { emoji: "📉", label: "Bearish", color: "#f59e0b" },
  very_negative: { emoji: "🔴", label: "Very Bearish", color: "#ef4444" },
};

function SubmitForm({ onSubmit, onCancel, t }) {
  const [form, setForm] = useState({ headline: "", content: "", source_url: "", author_name: "", region: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.headline.trim() || !form.content.trim()) return;
    setSubmitting(true);
    await onSubmit(form);
    setSubmitting(false);
  };

  const field = (key, placeholder, multiline = false) => {
    const props = {
      placeholder,
      value: form[key],
      onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
      style: {
        width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 5, padding: "5px 8px", fontSize: 10, color: "#f1f5f9", outline: "none", resize: "none",
        fontFamily: "inherit",
      },
    };
    return multiline
      ? <textarea {...props} rows={3} />
      : <input {...props} />;
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, padding: 10, marginBottom: 8 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", marginBottom: 8, letterSpacing: "0.08em", textTransform: "uppercase" }}>{t.submitNewsReport}</div>
      <div className="space-y-2">
        {field("headline", t.headline)}
        {field("content", t.describeNews, true)}
        {field("source_url", t.sourceUrl)}
        {field("author_name", t.authorName)}
        {field("region", t.regionCountry)}
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        <button type="submit" disabled={submitting} style={{
          flex: 1, fontSize: 10, fontWeight: 600, color: "#fff",
          background: submitting ? "rgba(59,130,246,0.3)" : "rgba(59,130,246,0.7)",
          border: "1px solid rgba(59,130,246,0.4)", borderRadius: 4, padding: "5px 0", cursor: submitting ? "not-allowed" : "pointer"
        }}>
          {submitting ? t.submitting : t.submitVerify}
        </button>
        <button type="button" onClick={onCancel} style={{
          fontSize: 10, color: "#64748b", background: "transparent", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 4, padding: "5px 10px", cursor: "pointer"
        }}>{t.cancel}</button>
      </div>
    </form>
  );
}

function NewsCard({ post, t, selectedLangs = ["en", "ar"], highlightAssets = [] }) {
  const [expanded, setExpanded] = useState(false);
  const [displayLang, setDisplayLang] = useState(selectedLangs[0] || "en");
  const cfg = STATUS_CONFIG[post.verification_status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  const sentimentCfg = SENTIMENT_CONFIG[post.sentiment] || SENTIMENT_CONFIG.neutral;

  const getTranslation = (field, lang) => {
    if (lang === "original") return post[field];
    return post[`${field}_${lang}`] || post[field];
  };

  const displayHeadline = getTranslation("headline", displayLang);
  const displayContent = getTranslation("content", displayLang);
  const availableLangs = selectedLangs.filter(lang => {
    return lang === "original" || post[`headline_${lang}`];
  });

  const hasHighlightedAssets = post.mentioned_assets?.some(a => highlightAssets.includes(a.symbol));
  const isBreaking = post.tags?.includes('BREAKING');

  return (
    <div style={{
      background: isBreaking ? "rgba(239,68,68,0.06)" : hasHighlightedAssets ? "rgba(59,130,246,0.05)" : "rgba(255,255,255,0.02)",
      border: `1px solid ${isBreaking ? "rgba(239,68,68,0.35)" : hasHighlightedAssets ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.06)"}`,
      borderRadius: 6, padding: "8px 10px", marginBottom: 6,
      boxShadow: isBreaking ? "0 0 12px rgba(239,68,68,0.12)" : "none"
    }}>
      {/* BREAKING NEWS banner */}
      {isBreaking && (
        <div style={{
          display: "flex", alignItems: "center", gap: 6, marginBottom: 6,
          background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)",
          borderRadius: 4, padding: "3px 8px"
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", flexShrink: 0, animation: "pulse-red 1.2s infinite" }} />
          <span style={{ fontSize: 9, fontWeight: 900, color: "#ef4444", letterSpacing: "0.18em", textTransform: "uppercase" }}>Breaking News</span>
          <span style={{ fontSize: 8, color: "#f87171", opacity: 0.7, marginLeft: "auto" }}>NewsData.io</span>
        </div>
      )}
      {/* Status & Sentiment badges */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 5 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 3, background: cfg.bg, border: `1px solid ${cfg.color}33`, borderRadius: 4, padding: "2px 6px" }}>
          <Icon style={{ width: 9, height: 9, color: cfg.color }} />
          <span style={{ fontSize: 8, fontWeight: 700, color: cfg.color, letterSpacing: "0.08em", textTransform: "uppercase" }}>{t[cfg.key]}</span>

          {post.verification_confidence != null && post.verification_status !== "pending" && (
            <span style={{ fontSize: 8, color: cfg.color, opacity: 0.7 }}>{Math.round(post.verification_confidence * 100)}%</span>
          )}
        </div>

        {post.sentiment && (
          <div style={{ display: "flex", alignItems: "center", gap: 3, background: "rgba(255,255,255,0.02)", border: `1px solid ${sentimentCfg.color}33`, borderRadius: 4, padding: "2px 6px" }}>
            <span style={{ fontSize: 10 }}>{sentimentCfg.emoji}</span>
            <span style={{ fontSize: 8, fontWeight: 700, color: sentimentCfg.color, letterSpacing: "0.08em", textTransform: "uppercase" }}>{sentimentCfg.label}</span>
            {post.sentiment_confidence && (
              <span style={{ fontSize: 8, color: sentimentCfg.color, opacity: 0.7 }}>{Math.round(post.sentiment_confidence * 100)}%</span>
            )}
          </div>
        )}

        {post.region && <span style={{ fontSize: 8, color: "#475569", marginLeft: "auto" }}>📍 {post.region}</span>}
      </div>

      {/* Translation language selector */}
      {availableLangs.length > 1 && (
        <div style={{ marginBottom: 4, display: "flex", gap: 2, flexWrap: "wrap" }}>
          {availableLangs.map((lang) => {
            const label = lang === "original" ? "Original" : NEWS_TRANSLATE_LANGS[lang]?.label || lang;
            return (
              <button
                key={lang}
                onClick={() => setDisplayLang(lang)}
                style={{
                  fontSize: 8,
                  fontWeight: displayLang === lang ? 700 : 400,
                  color: displayLang === lang ? "#3b82f6" : "#64748b",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: displayLang === lang ? "underline" : "none"
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Headline */}
      <div style={{ fontSize: 11, fontWeight: isBreaking ? 800 : 600, color: isBreaking ? "#fca5a5" : "#e2e8f0", lineHeight: 1.4, marginBottom: 4 }}>{displayHeadline}</div>

      {/* Content preview */}
      <p style={{ fontSize: 10, color: "#64748b", lineHeight: 1.5, marginBottom: 4 }}>
        {expanded ? displayContent : displayContent?.slice(0, 100) + (displayContent?.length > 100 ? "…" : "")}
      </p>

      {/* AI verification summary */}
      {post.verification_summary && post.verification_status !== "pending" && (
        <div style={{ background: "rgba(255,255,255,0.02)", borderLeft: `2px solid ${cfg.color}55`, padding: "4px 8px", marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 2 }}>
            <ShieldCheck style={{ width: 8, height: 8, color: cfg.color }} />
            <span style={{ fontSize: 8, fontWeight: 700, color: cfg.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>{t.aiFact}</span>
          </div>
          <p style={{ fontSize: 9, color: "#94a3b8", lineHeight: 1.4 }}>{post.verification_summary}</p>
        </div>
      )}

      {/* Executive summary */}
      {post.executive_summary && (
        <div style={{ background: "rgba(100,116,139,0.1)", borderLeft: `2px solid #94a3b855`, padding: "6px 8px", marginBottom: 4 }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Executive Summary</div>
          <p style={{ fontSize: 9, color: "#cbd5e1", lineHeight: 1.5, marginBottom: post.key_impacts?.length > 0 ? 3 : 0 }}>{post.executive_summary}</p>
          {post.key_impacts && post.key_impacts.length > 0 && (
            <div style={{ fontSize: 8, color: "#94a3b8" }}>
              {post.key_impacts.map((impact, idx) => (
                <div key={idx} style={{ marginTop: 2, paddingLeft: 8, borderLeft: "1px solid #475569" }}>→ {impact}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mentioned assets */}
      {post.mentioned_assets && post.mentioned_assets.length > 0 && (
        <div style={{ background: "rgba(255,255,255,0.02)", borderLeft: `2px solid #3b82f655`, padding: "4px 8px", marginBottom: 4 }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Assets Mentioned</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {post.mentioned_assets.map((asset, idx) => (
              <span key={idx} style={{ fontSize: 8, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 3, padding: "2px 6px", color: "#3b82f6" }}>
                {asset.symbol} ({asset.type})
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
        {post.content?.length > 100 && (
          <button onClick={() => setExpanded((v) => !v)} style={{ fontSize: 9, color: "#3b82f6", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            {expanded ? t.showLess : t.readMore}
          </button>
        )}
        {post.source_url && (
          <a href={post.source_url} target="_blank" rel="noreferrer" style={{ fontSize: 9, color: "#475569", display: "flex", alignItems: "center", gap: 2, marginLeft: "auto" }}>
            <Link style={{ width: 8, height: 8 }} /> {t.source}
          </a>
        )}
        <span style={{ fontSize: 8, color: "#334155", marginLeft: post.source_url ? 0 : "auto" }}>
          {post.author_name || t.anonymous} · {post.created_date ? new Date(post.created_date).toLocaleDateString() : ""}
        </span>
      </div>
    </div>
  );
}

function playRadarPing() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.4);
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  } catch (_) {}
}

function NewsToast({ post, onDismiss }) {
  const isBreaking = post.tags?.includes('BREAKING');
  useEffect(() => {
    const timer = setTimeout(onDismiss, 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      width: 300, background: isBreaking ? "rgba(30,8,8,0.97)" : "rgba(10,15,26,0.97)",
      border: `1px solid ${isBreaking ? "rgba(239,68,68,0.6)" : "rgba(59,130,246,0.4)"}`,
      borderRadius: 8, padding: "10px 12px",
      boxShadow: isBreaking ? "0 0 24px rgba(239,68,68,0.3)" : "0 0 24px rgba(59,130,246,0.2)",
      animation: "fadeInUp 0.3s ease-out forwards",
      backdropFilter: "blur(12px)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <Radio style={{ width: 10, height: 10, color: isBreaking ? "#ef4444" : "#3b82f6" }} />
        <span style={{ fontSize: 8, fontWeight: 900, color: isBreaking ? "#ef4444" : "#3b82f6", letterSpacing: "0.18em", textTransform: "uppercase" }}>
          {isBreaking ? "⚡ Breaking News" : "📡 New Report"}
        </span>
        <span style={{ fontSize: 7, color: "#475569", marginLeft: "auto" }}>{post.author_name}</span>
        <button onClick={onDismiss} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 12, lineHeight: 1, padding: 0 }}>×</button>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: isBreaking ? "#fca5a5" : "#e2e8f0", lineHeight: 1.4, marginBottom: 4 }}>
        {post.headline?.slice(0, 100)}{post.headline?.length > 100 ? "…" : ""}
      </div>
      {post.region && <div style={{ fontSize: 8, color: "#475569" }}>📍 {post.region}</div>}
    </div>
  );
}

export default function NewsFeedPanel() {
  const [posts, setPosts] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastPost, setToastPost] = useState(null);
  const [showLangSettings, setShowLangSettings] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLangs, setSelectedLangs] = useState(() => 
    JSON.parse(localStorage.getItem("news_translate_langs")) || ["en", "ar"]
  );
  const [sortBy, setSortBy] = useState("date"); // date, relevance, source
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [assetFilter, setAssetFilter] = useState([]);
  const [watchlists, setWatchlists] = useState([]);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [suggestedAssets, setSuggestedAssets] = useState([
    { symbol: "AAPL", type: "stock" },
    { symbol: "MSFT", type: "stock" },
    { symbol: "NVDA", type: "stock" },
    { symbol: "BTC", type: "crypto" },
    { symbol: "ETH", type: "crypto" },
    { symbol: "XAU", type: "commodity" },
    { symbol: "OIL", type: "commodity" },
  ]);
  const { t } = useLang();

  const loadPosts = async () => {
    const data = await base44.entities.NewsPost.list("-created_date", 50);
    setPosts(data);
  };

  const loadWatchlists = async () => {
    const data = await base44.entities.Watchlist.list();
    setWatchlists(data);
  };

  useEffect(() => {
    if (!expanded) return;
    setLoading(true);
    Promise.all([loadPosts(), loadWatchlists()]).finally(() => setLoading(false));

    // Auto-refresh based on live mode
    const refreshInterval = isLiveMode ? 30 * 1000 : 10 * 60 * 1000;
    const interval = setInterval(() => loadPosts(), refreshInterval);

    const unsub = base44.entities.NewsPost.subscribe((ev) => {
      if (ev.type === "create") {
        setPosts((p) => [ev.data, ...p]);
        playRadarPing();
      }
      else if (ev.type === "update") setPosts((p) => p.map((x) => x.id === ev.id ? ev.data : x));
      else if (ev.type === "delete") setPosts((p) => p.filter((x) => x.id !== ev.id));
    });

    return () => {
      clearInterval(interval);
      unsub();
    };
  }, [expanded, isLiveMode]);

  const handleSubmit = async (form) => {
    // Create post with pending status
    const post = await base44.entities.NewsPost.create({
      ...form,
      verification_status: "pending",
    });

    setShowForm(false);

    // AI fact-check
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an AI fact-checker for a conflict intelligence platform. A user submitted this news report:\n\nHeadline: ${form.headline}\nContent: ${form.content}\nSource URL: ${form.source_url || "none provided"}\n\nUsing your knowledge and reasoning, assess whether this news report is likely accurate, misleading, or false. Consider:\n- Is the event plausible given world context?\n- Are there obvious factual errors or implausible claims?\n- Does the content match the headline?\n\nProvide a factual verdict and brief explanation.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          status: { type: "string", description: "One of: verified, unverified, false" },
          confidence: { type: "number", description: "0.0 to 1.0 confidence score" },
          summary: { type: "string", description: "2-3 sentence explanation of the verdict" },
        },
      },
    });

    const status = ["verified", "unverified", "false"].includes(result.status) ? result.status : "unverified";

    await base44.entities.NewsPost.update(post.id, {
      verification_status: status,
      verification_confidence: result.confidence ?? null,
      verification_summary: result.summary ?? null,
    });
  };

  const pendingCount = posts.filter((p) => p.verification_status === "pending").length;

  const handleLangToggle = (lang) => {
    const updated = selectedLangs.includes(lang)
      ? selectedLangs.filter(l => l !== lang)
      : [...selectedLangs, lang];
    setSelectedLangs(updated);
    localStorage.setItem("news_translate_langs", JSON.stringify(updated));
  };

  const allFilterAssets = [...suggestedAssets];
  watchlists.forEach(wl => {
    if (wl.watchlist_items) {
      wl.watchlist_items.forEach(item => {
        if (!allFilterAssets.find(a => a.symbol === item.symbol)) {
          allFilterAssets.push({ symbol: item.symbol, type: item.type });
        }
      });
    }
  });

  let filteredPosts = posts.filter(p => {
    if (sentimentFilter !== "all" && p.sentiment !== sentimentFilter) return false;
    if (assetFilter.length > 0 && !p.mentioned_assets?.some(a => assetFilter.includes(a.symbol))) return false;
    return true;
  });

  // Sort posts
  if (sortBy === "date") {
    filteredPosts.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  } else if (sortBy === "relevance") {
    filteredPosts.sort((a, b) => {
      const aMatches = assetFilter.length === 0 ? 0 : (a.mentioned_assets?.filter(x => assetFilter.includes(x.symbol)).length || 0);
      const bMatches = assetFilter.length === 0 ? 0 : (b.mentioned_assets?.filter(x => assetFilter.includes(x.symbol)).length || 0);
      return bMatches - aMatches || new Date(b.created_date) - new Date(a.created_date);
    });
  } else if (sortBy === "source") {
    filteredPosts.sort((a, b) => (a.author_name || "").localeCompare(b.author_name || ""));
  }

  return (
    <div className="border-b border-white/[0.05]">
      <div
        className="flex items-center gap-2 p-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <Newspaper className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-[11px] font-bold tracking-widest text-slate-300 uppercase">{t.newsFeed}</span>
        {isLiveMode && (
          <span style={{ fontSize: 7, background: "rgba(59,130,246,0.2)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 2, padding: "1px 4px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            ● LIVE
          </span>
        )}
        {pendingCount > 0 && (
          <span style={{ fontSize: 8, background: "rgba(245,158,11,0.2)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 3, padding: "1px 5px", fontWeight: 700 }}>
            {pendingCount} {t.checking}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          {expanded && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setIsLiveMode((v) => !v); }}
                style={{ 
                  fontSize: 9, 
                  color: isLiveMode ? "#3b82f6" : "#64748b", 
                  background: "none", 
                  border: "none", 
                  cursor: "pointer",
                  fontWeight: isLiveMode ? 700 : 400
                }}
              >
                {isLiveMode ? "◉ Live" : "○ Manual"}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowFilters((v) => !v); }}
                className="text-[10px] text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
                title="Filters"
              >
                <Smile className="w-2.5 h-2.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowLangSettings((v) => !v); }}
                className="text-[10px] text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
                title="Translation settings"
              >
                <Settings className="w-2.5 h-2.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowForm((v) => !v); }}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-2.5 h-2.5" />
                {t.submit}
              </button>
            </>
          )}
          {expanded ? <ChevronUp className="w-3 h-3 text-slate-500" /> : <ChevronDown className="w-3 h-3 text-slate-500" />}
        </div>
      </div>

      {expanded && showFilters && (
        <div style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: 10 }}>
          <div style={{ fontSize: 9, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8" }}>Sentiment Filter</div>
          <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
            {["all", "very_positive", "positive", "neutral", "negative", "very_negative"].map(s => (
              <button
                key={s}
                onClick={() => setSentimentFilter(s)}
                style={{
                  fontSize: 8,
                  padding: "4px 8px",
                  borderRadius: 3,
                  border: sentimentFilter === s ? "1px solid #3b82f6" : "1px solid rgba(255,255,255,0.1)",
                  background: sentimentFilter === s ? "rgba(59,130,246,0.1)" : "transparent",
                  color: sentimentFilter === s ? "#3b82f6" : "#64748b",
                  cursor: "pointer",
                  fontWeight: sentimentFilter === s ? 700 : 400
                }}
              >
                {s === "all" ? "All" : SENTIMENT_CONFIG[s]?.label || s}
              </button>
            ))}
          </div>

          <div style={{ fontSize: 9, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8" }}>Sort By</div>
          <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
            {["date", "relevance", "source"].map(s => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                style={{
                  fontSize: 8,
                  padding: "4px 8px",
                  borderRadius: 3,
                  border: sortBy === s ? "1px solid #3b82f6" : "1px solid rgba(255,255,255,0.1)",
                  background: sortBy === s ? "rgba(59,130,246,0.1)" : "transparent",
                  color: sortBy === s ? "#3b82f6" : "#64748b",
                  cursor: "pointer",
                  fontWeight: sortBy === s ? 700 : 400
                }}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <div style={{ fontSize: 9, fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8" }}>Filter by Assets</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 4, maxHeight: 120, overflowY: "auto" }}>
            {allFilterAssets.map((asset) => (
              <label key={asset.symbol} style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 8 }}>
                <input
                  type="checkbox"
                  checked={assetFilter.includes(asset.symbol)}
                  onChange={() => {
                    setAssetFilter(assetFilter.includes(asset.symbol)
                      ? assetFilter.filter(s => s !== asset.symbol)
                      : [...assetFilter, asset.symbol]
                    );
                  }}
                  style={{ width: 10, height: 10, cursor: "pointer" }}
                />
                <span style={{ color: assetFilter.includes(asset.symbol) ? "#3b82f6" : "#64748b" }}>
                  {asset.symbol} <span style={{ fontSize: 7, color: "#475569" }}>({asset.type})</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {expanded && showLangSettings && (
        <div style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: 10, fontSize: 10, color: "#94a3b8" }}>
          <div style={{ fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>{t.newsTranslateLang}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
            {Object.entries(NEWS_TRANSLATE_LANGS).map(([code, info]) => (
              <label key={code} style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", padding: "4px 6px", borderRadius: 3, background: selectedLangs.includes(code) ? "rgba(59,130,246,0.1)" : "transparent", border: `1px solid ${selectedLangs.includes(code) ? "rgba(59,130,246,0.3)" : "transparent"}`, transition: "all 0.2s" }}>
                <input
                  type="checkbox"
                  checked={selectedLangs.includes(code)}
                  onChange={() => handleLangToggle(code)}
                  style={{ width: 12, height: 12, cursor: "pointer" }}
                />
                <span style={{ color: selectedLangs.includes(code) ? "#3b82f6" : "#64748b" }}>
                  <strong>{info.label}</strong> {info.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {expanded && !showLangSettings && !showFilters && (
        <div className="px-3 pb-3">
          {showForm && <SubmitForm onSubmit={handleSubmit} onCancel={() => setShowForm(false)} t={t} />}

          {loading ? (
            <div className="flex items-center gap-2 py-3">
              <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
              <span style={{ fontSize: 10, color: "#475569" }}>{t.loadingNews}</span>
            </div>
          ) : filteredPosts.length === 0 ? (
            <p style={{ fontSize: 10, color: "#334155", paddingTop: 4 }}>{assetFilter.length > 0 || sentimentFilter !== "all" ? "No news matching filters" : t.noNewsYet}</p>
          ) : (
            <div style={{ maxHeight: 340, overflowY: "auto" }}>
              {filteredPosts.map((p) => <NewsCard key={p.id} post={p} t={t} selectedLangs={selectedLangs} highlightAssets={assetFilter} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}