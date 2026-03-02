import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp, BarChart2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const SYMBOLS = [
  { symbol: "AAPL",  label: "Apple",     type: "stock" },
  { symbol: "MSFT",  label: "Microsoft", type: "stock" },
  { symbol: "NVDA",  label: "NVIDIA",    type: "stock" },
  { symbol: "TSLA",  label: "Tesla",     type: "stock" },
  { symbol: "AMZN",  label: "Amazon",    type: "stock" },
  { symbol: "XAU",   label: "Gold",      type: "commodity" },
  { symbol: "XAG",   label: "Silver",    type: "commodity" },
  { symbol: "OIL",   label: "Oil (WTI)", type: "commodity" },
];

export default function MarketTickerPanel() {
  const [expanded, setExpanded] = useState(false);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchPrices = async () => {
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a financial data provider. Return the latest approximate market prices for these assets as of today (${new Date().toISOString().slice(0,10)}). Use your best knowledge of recent market data.\n\nAssets: Apple (AAPL), Microsoft (MSFT), NVIDIA (NVDA), Tesla (TSLA), Amazon (AMZN), Gold per troy oz (XAU), Silver per troy oz (XAG), WTI Crude Oil per barrel (OIL).\n\nFor each, provide price in USD and an estimated 1-day percent change.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          prices: {
            type: "array",
            items: {
              type: "object",
              properties: {
                symbol: { type: "string" },
                price: { type: "number" },
                change_pct: { type: "number" },
              },
            },
          },
        },
      },
    });

    const map = {};
    (result.prices || []).forEach((p) => { map[p.symbol] = p; });
    setPrices(map);
    setLastUpdated(new Date());
    setLoading(false);
  };

  useEffect(() => {
    if (expanded && Object.keys(prices).length === 0) fetchPrices();
  }, [expanded]);

  const stocks = SYMBOLS.filter((s) => s.type === "stock");
  const commodities = SYMBOLS.filter((s) => s.type === "commodity");

  const PriceRow = ({ item }) => {
    const data = prices[item.symbol];
    const up = data?.change_pct >= 0;
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
        <div>
          <span style={{ fontSize: 10, fontWeight: 600, color: "#cbd5e1" }}>{item.symbol}</span>
          <span style={{ fontSize: 9, color: "#475569", marginLeft: 5 }}>{item.label}</span>
        </div>
        {data ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#f1f5f9", fontFamily: "monospace" }}>
              ${data.price?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 2, color: up ? "#10b981" : "#ef4444" }}>
              {up ? <TrendingUp style={{ width: 9, height: 9 }} /> : <TrendingDown style={{ width: 9, height: 9 }} />}
              <span style={{ fontSize: 9, fontWeight: 600 }}>{up ? "+" : ""}{data.change_pct?.toFixed(2)}%</span>
            </div>
          </div>
        ) : (
          <span style={{ fontSize: 9, color: "#334155" }}>{loading ? "—" : "N/A"}</span>
        )}
      </div>
    );
  };

  return (
    <div className="border-b border-white/[0.05]">
      <div
        className="flex items-center gap-2 p-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-[11px] font-bold tracking-widest text-slate-300 uppercase">Markets</span>
        {lastUpdated && (
          <span style={{ fontSize: 8, color: "#334155", marginLeft: 2 }}>
            {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          {expanded && (
            <button
              onClick={(e) => { e.stopPropagation(); fetchPrices(); }}
              style={{ fontSize: 9, color: "#10b981", background: "none", border: "none", cursor: "pointer" }}
            >
              ↻ Refresh
            </button>
          )}
          {expanded ? <ChevronUp className="w-3 h-3 text-slate-500" /> : <ChevronDown className="w-3 h-3 text-slate-500" />}
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3">
          {loading && Object.keys(prices).length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 0", fontSize: 10, color: "#475569" }}>
              <div style={{ width: 10, height: 10, border: "1.5px solid #10b981", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              Fetching live market data...
            </div>
          ) : (
            <>
              <div style={{ fontSize: 8, fontWeight: 700, color: "#334155", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Stocks</div>
              {stocks.map((s) => <PriceRow key={s.symbol} item={s} />)}
              <div style={{ fontSize: 8, fontWeight: 700, color: "#334155", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 8, marginBottom: 4 }}>Commodities</div>
              {commodities.map((s) => <PriceRow key={s.symbol} item={s} />)}
              {lastUpdated && (
                <p style={{ fontSize: 8, color: "#1e293b", marginTop: 6, textAlign: "right" }}>
                  AI-sourced · approx. values
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}