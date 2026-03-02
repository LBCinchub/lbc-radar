import { useState, useEffect } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Edit2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function WatchlistManager({ onSelectWatchlist, selectedWatchlistId }) {
  const [watchlists, setWatchlists] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWatchlists();
  }, []);

  const fetchWatchlists = async () => {
    try {
      const user = await base44.auth.me();
      const data = await base44.entities.Watchlist.list();
      setWatchlists(data);
      
      // Auto-select first or default watchlist
      if (data.length > 0 && !selectedWatchlistId) {
        const defaultOrFirst = data.find(w => w.is_default) || data[0];
        onSelectWatchlist(defaultOrFirst.id);
      }
    } catch (error) {
      console.error("Failed to fetch watchlists:", error);
    }
  };

  const createWatchlist = async () => {
    if (!newName.trim()) return;
    
    setLoading(true);
    try {
      const created = await base44.entities.Watchlist.create({
        name: newName,
        is_default: watchlists.length === 0
      });
      setWatchlists([...watchlists, created]);
      onSelectWatchlist(created.id);
      setNewName("");
      setShowNewForm(false);
    } catch (error) {
      console.error("Failed to create watchlist:", error);
    }
    setLoading(false);
  };

  const deleteWatchlist = async (id) => {
    try {
      await base44.entities.Watchlist.delete(id);
      const updated = watchlists.filter(w => w.id !== id);
      setWatchlists(updated);
      if (selectedWatchlistId === id && updated.length > 0) {
        onSelectWatchlist(updated[0].id);
      }
    } catch (error) {
      console.error("Failed to delete watchlist:", error);
    }
  };

  return (
    <div className="border-b border-white/[0.05]">
      <div
        className="flex items-center gap-2 p-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-[11px] font-bold tracking-widest text-slate-300 uppercase">My Watchlists</span>
        {expanded ? <ChevronUp className="w-3 h-3 text-slate-500 ml-auto" /> : <ChevronDown className="w-3 h-3 text-slate-500 ml-auto" />}
      </div>

      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          {watchlists.map((wl) => (
            <div
              key={wl.id}
              onClick={() => onSelectWatchlist(wl.id)}
              className={`flex items-center justify-between p-2 rounded border transition-all cursor-pointer ${
                selectedWatchlistId === wl.id
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : "border-white/[0.08] text-slate-400 hover:border-white/[0.15] hover:bg-white/[0.03]"
              }`}
            >
              <span className="text-[10px] font-semibold truncate">{wl.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); deleteWatchlist(wl.id); }}
                className="text-slate-500 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}

          {showNewForm ? (
            <div className="flex gap-1">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && createWatchlist()}
                placeholder="Watchlist name"
                className="flex-1 px-2 py-1.5 text-[10px] bg-white/[0.05] border border-white/[0.1] rounded text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50"
                autoFocus
              />
              <button
                onClick={createWatchlist}
                disabled={loading}
                className="px-2 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded text-[10px] text-red-400 font-semibold transition-all disabled:opacity-50"
              >
                Add
              </button>
              <button
                onClick={() => { setShowNewForm(false); setNewName(""); }}
                className="px-2 py-1.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] rounded text-[10px] text-slate-400 transition-all"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewForm(true)}
              className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 border border-dashed border-white/[0.1] rounded text-[10px] text-slate-400 hover:text-slate-300 hover:border-white/[0.2] transition-all"
            >
              <Plus className="w-3 h-3" />
              New Watchlist
            </button>
          )}
        </div>
      )}
    </div>
  );
}