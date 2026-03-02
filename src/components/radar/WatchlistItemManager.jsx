import { useState } from "react";
import { X, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";

const AVAILABLE_ASSETS = [
  { symbol: "AAPL", label: "Apple", type: "stock" },
  { symbol: "MSFT", label: "Microsoft", type: "stock" },
  { symbol: "NVDA", label: "NVIDIA", type: "stock" },
  { symbol: "TSLA", label: "Tesla", type: "stock" },
  { symbol: "AMZN", label: "Amazon", type: "stock" },
  { symbol: "XAU", label: "Gold", type: "commodity" },
  { symbol: "XAG", label: "Silver", type: "commodity" },
  { symbol: "OIL", label: "Oil (WTI)", type: "commodity" },
  { symbol: "BTC", label: "Bitcoin", type: "crypto" },
  { symbol: "ETH", label: "Ethereum", type: "crypto" },
  { symbol: "XRP", label: "Ripple", type: "crypto" },
];

export default function WatchlistItemManager({ watchlistId, items, onItemsChange }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState("");
  const [loading, setLoading] = useState(false);

  if (!watchlistId) {
    return <div className="p-3 text-[10px] text-slate-500">Select a watchlist to add items</div>;
  }

  const usedSymbols = items.map(i => i.symbol);
  const availableAssets = AVAILABLE_ASSETS.filter(a => !usedSymbols.includes(a.symbol));

  const addItem = async () => {
    if (!selectedAsset) return;

    const asset = AVAILABLE_ASSETS.find(a => a.symbol === selectedAsset);
    setLoading(true);

    try {
      const created = await base44.entities.WatchlistItem.create({
        watchlist_id: watchlistId,
        symbol: asset.symbol,
        label: asset.label,
        type: asset.type,
      });
      onItemsChange([...items, created]);
      setSelectedAsset("");
      setShowAddForm(false);
    } catch (error) {
      console.error("Failed to add item:", error);
    }
    setLoading(false);
  };

  const removeItem = async (itemId) => {
    try {
      await base44.entities.WatchlistItem.delete(itemId);
      onItemsChange(items.filter(i => i.id !== itemId));
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  return (
    <div className="space-y-2">
      {items.length === 0 && !showAddForm && (
        <div className="text-[10px] text-slate-500 p-2">No assets in this watchlist</div>
      )}

      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between p-2 bg-white/[0.03] border border-white/[0.08] rounded"
        >
          <div>
            <div className="text-[10px] font-semibold text-slate-300">{item.symbol}</div>
            <div className="text-[9px] text-slate-500">{item.label}</div>
          </div>
          <button
            onClick={() => removeItem(item.id)}
            className="text-slate-500 hover:text-red-400 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}

      {showAddForm ? (
        <div className="space-y-1.5">
          <select
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            className="w-full px-2 py-1.5 text-[10px] bg-white/[0.05] border border-white/[0.1] rounded text-white focus:outline-none focus:border-red-500/50"
          >
            <option value="">Select an asset...</option>
            {availableAssets.map((asset) => (
              <option key={asset.symbol} value={asset.symbol}>
                {asset.symbol} - {asset.label} ({asset.type})
              </option>
            ))}
          </select>
          <div className="flex gap-1">
            <button
              onClick={addItem}
              disabled={!selectedAsset || loading}
              className="flex-1 px-2 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded text-[10px] text-red-400 font-semibold transition-all disabled:opacity-50"
            >
              Add
            </button>
            <button
              onClick={() => { setShowAddForm(false); setSelectedAsset(""); }}
              className="flex-1 px-2 py-1.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] rounded text-[10px] text-slate-400 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 border border-dashed border-white/[0.1] rounded text-[10px] text-slate-400 hover:text-slate-300 hover:border-white/[0.2] transition-all"
        >
          <Plus className="w-3 h-3" />
          Add Asset
        </button>
      )}
    </div>
  );
}