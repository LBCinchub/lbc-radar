import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, BarChart2, TrendingUp, TrendingDown } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function MarketTickerPanel() {
  const [expanded, setExpanded] = useState(false);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchMarketNews = async () => {
    setLoading(true);
    try {
      const posts = await base44.entities.NewsPost.list('-created_date', 10);
      const marketNews = posts.filter(post => 
        post.mentioned_assets?.length > 0 || 
        post.headline?.toLowerCase().includes('market') ||
        post.headline?.toLowerCase().includes('stock') ||
        post.headline?.toLowerCase().includes('crypto') ||
        post.headline?.toLowerCase().includes('commodity')
      );
      setNews(marketNews.slice(0, 6));
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch market news:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (expanded) fetchMarketNews();
  }, [expanded]);

  const sentimentColor = (sentiment) => {
    const colors = {
      very_positive: "#10b981",
      positive: "#34d399",
      neutral: "#64748b",
      negative: "#f97316",
      very_negative: "#ef4444"
    };
    return colors[sentiment] || "#64748b";
  };

  const NewsItem = ({ item }) => (
    <div style={{
      padding: "8px 4px",
      borderBottom: "1px solid rgba(255,255,255,0.03)",
      fontSize: 9
    }}>
      <div style={{ display: "flex", alignItems: "start", gap: 6, marginBottom: 3 }}>
        <div style={{ color: sentimentColor(item.sentiment), fontWeight: 700 }}>
          {item.sentiment === "very_positive" || item.sentiment === "positive" ? "▲" : item.sentiment === "very_negative" || item.sentiment === "negative" ? "▼" : "●"}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ color: "#f1f5f9", fontWeight: 600, margin: 0, marginBottom: 2, lineHeight: 1.3 }}>
            {item.headline?.substring(0, 60)}...
          </p>
          {item.executive_summary && (
            <p style={{ color: "#94a3b8", fontSize: 8, margin: 0, lineHeight: 1.2 }}>
              {item.executive_summary.substring(0, 80)}...
            </p>
          )}
          {item.mentioned_assets?.length > 0 && (
            <div style={{ marginTop: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
              {item.mentioned_assets.slice(0, 3).map((asset, i) => (
                <span key={i} style={{ fontSize: 7, background: "rgba(59,130,246,0.2)", color: "#60a5fa", padding: "1px 3px", borderRadius: 2 }}>
                  {asset.symbol}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="border-b border-white/[0.05]">
      <div
        className="flex items-center gap-2 p-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-[11px] font-bold tracking-widest text-slate-300 uppercase">News Market</span>
        <span style={{ fontSize: 7, background: "rgba(59,130,246,0.2)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 2, padding: "1px 4px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          ● AI POWERED
        </span>
        {lastUpdated && (
          <span style={{ fontSize: 8, color: "#334155", marginLeft: 2 }}>
            {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
        <div className="ml-auto">
          {expanded ? <ChevronUp className="w-3 h-3 text-slate-500" /> : <ChevronDown className="w-3 h-3 text-slate-500" />}
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3">
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 0", fontSize: 10, color: "#475569" }}>
              <div style={{ width: 10, height: 10, border: "1.5px solid #60a5fa", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              Loading market news...
            </div>
          ) : news.length === 0 ? (
            <p style={{ fontSize: 9, color: "#475569", padding: "6px 0" }}>No market news available</p>
          ) : (
            <>
              {news.map((item, i) => (
                <NewsItem key={i} item={item} />
              ))}
              <p style={{ fontSize: 8, color: "#1e293b", marginTop: 4, textAlign: "right" }}>
                AI-analyzed market news · Powered by multiple sources
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}