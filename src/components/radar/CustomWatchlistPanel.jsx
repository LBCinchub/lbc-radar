import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import WatchlistManager from "./WatchlistManager";
import WatchlistItemManager from "./WatchlistItemManager";

export default function CustomWatchlistPanel() {
  const [expanded, setExpanded] = useState(false);
  const [selectedWatchlistId, setSelectedWatchlistId] = useState(null);
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (selectedWatchlistId) {
      fetchWatchlistItems();
    }
  }, [selectedWatchlistId]);

  const fetchWatchlistItems = async () => {
    try {
      const items = await base44.entities.WatchlistItem.filter({ watchlist_id: selectedWatchlistId });
      setWatchlistItems(items);
      if (items.length > 0) {
        fetchPrices(items);
      }
    } catch (error) {
      console.error("Failed to fetch watchlist items:", error);
    }
  };

  const fetchPrices = async (items) => {
    setLoading(true);
    try {
      const symbols = items.map(i => i.symbol);
      const response = await base44.functions.invoke('getMarketPrices', { symbols });

      const map = {};
      (response.data.prices || []).forEach((p) => { map[p.symbol] = p; });
      setPrices(map);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch prices:', error);
    }
    setLoading(false);
  };

  const PriceRow = ({ item }) => {
    const data = prices[item.symbol];
    const up = data?.change_pct >= 0;
    
    return (
      <div className="flex items-center justify-between p-2 border-b border-white/[0.05]">
        <div>
          <div className="text-[10px] font-semibold text-slate-300">{item.symbol}</div>
          <div className="text-[9px] text-slate-500">{item.label}</div>
        </div>
        {data ? (
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-semibold text-white font-mono">
              ${data.price?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div className="flex items-center gap-1" style={{ color: up ? "#10b981" : "#ef4444" }}>
              {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span className="text-[9px] font-semibold">{up ? "+" : ""}{parseFloat(data.change_pct).toFixed(2)}%</span>
            </div>
          </div>
        ) : (
          <span className="text-[9px] text-slate-500">{loading ? "—" : "N/A"}</span>
        )}
      </div>
    );
  };

  return (
    <div className="border-b border-white/[0.05]">
      <div
        className="flex items-center gap-2 p-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-[11px] font-bold tracking-widest text-slate-300 uppercase">Custom Watchlist</span>
        {expanded ? <ChevronUp className="w-3 h-3 text-slate-500 ml-auto" /> : <ChevronDown className="w-3 h-3 text-slate-500 ml-auto" />}
      </div>

      {expanded && (
        <div className="px-3 pb-3 space-y-4">
          <WatchlistManager onSelectWatchlist={setSelectedWatchlistId} selectedWatchlistId={selectedWatchlistId} />

          {selectedWatchlistId && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Assets</span>
                <button
                  onClick={() => fetchPrices(watchlistItems)}
                  disabled={loading}
                  className="text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <WatchlistItemManager
                watchlistId={selectedWatchlistId}
                items={watchlistItems}
                onItemsChange={setWatchlistItems}
              />

              {watchlistItems.length > 0 && (
                <div className="border border-white/[0.08] rounded divide-y divide-white/[0.05]">
                  {watchlistItems.map((item) => (
                    <PriceRow key={item.id} item={item} />
                  ))}
                </div>
              )}

              {lastUpdated && (
                <p className="text-[8px] text-slate-600 text-right">
                  Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}