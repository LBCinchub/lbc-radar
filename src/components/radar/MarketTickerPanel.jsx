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

  return (
    <div className="border-b border-white/[0.05]">
      <div
        className="flex items-center gap-2 p-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-[11px] font-bold tracking-widest text-slate-300 uppercase">News Market</span>
        {isLiveMode && (
          <span style={{ fontSize: 7, background: "rgba(16,185,129,0.2)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 2, padding: "1px 4px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            ● LIVE
          </span>
        )}
        {lastUpdated && (
          <span style={{ fontSize: 8, color: "#334155", marginLeft: isLiveMode ? 0 : 2 }}>
            {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          {expanded && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setIsLiveMode((v) => !v); }}
                style={{ 
                  fontSize: 9, 
                  color: isLiveMode ? "#10b981" : "#64748b", 
                  background: "none", 
                  border: "none", 
                  cursor: "pointer",
                  fontWeight: isLiveMode ? 700 : 400
                }}
              >
                {isLiveMode ? "◉ Live" : "○ Manual"}
              </button>
              {!isLiveMode && (
                <button
                  onClick={(e) => { e.stopPropagation(); fetchPrices(); }}
                  style={{ fontSize: 9, color: "#10b981", background: "none", border: "none", cursor: "pointer" }}
                >
                  ↻ Refresh
                </button>
              )}
            </>
          )}
          {expanded ? <ChevronUp className="w-3 h-3 text-slate-500" /> : <ChevronDown className="w-3 h-3 text-slate-500" />}
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3">
          {Object.keys(prices).length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 0", fontSize: 10, color: "#475569" }}>
              <div style={{ width: 10, height: 10, border: "1.5px solid #10b981", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              Fetching real-time market data...
            </div>
          ) : (
            <>
              <div style={{ fontSize: 8, fontWeight: 700, color: "#334155", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Stocks</div>
              {stocks.map((s) => <PriceRow key={s.symbol} item={s} />)}
              <div style={{ fontSize: 8, fontWeight: 700, color: "#334155", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 8, marginBottom: 4 }}>Commodities</div>
              {commodities.map((s) => <PriceRow key={s.symbol} item={s} />)}
              <div style={{ fontSize: 8, fontWeight: 700, color: "#334155", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 8, marginBottom: 4 }}>Cryptocurrencies</div>
              {cryptos.map((s) => <PriceRow key={s.symbol} item={s} />)}
              {lastUpdated && (
                <p style={{ fontSize: 8, color: "#1e293b", marginTop: 6, textAlign: "right" }}>
                  {isLiveMode ? "Finnhub + CoinGecko · auto-refresh 30s" : "Real-time data · Finnhub & CoinGecko"}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}