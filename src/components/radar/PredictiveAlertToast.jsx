import { useEffect, useState } from "react";
import { BrainCircuit, X, MapPin, TrendingUp, Clock } from "lucide-react";

const RISK_COLORS = {
  CRITICAL: { border: "rgba(239,68,68,0.6)", bg: "rgba(239,68,68,0.12)", text: "#ef4444", glow: "rgba(239,68,68,0.2)" },
  HIGH:     { border: "rgba(245,158,11,0.6)", bg: "rgba(245,158,11,0.12)", text: "#f59e0b", glow: "rgba(245,158,11,0.2)" },
  MEDIUM:   { border: "rgba(167,139,250,0.6)", bg: "rgba(167,139,250,0.12)", text: "#a78bfa", glow: "rgba(167,139,250,0.2)" },
};

export default function PredictiveAlertToast({ prediction, onClose, onLocate }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    const dismiss = setTimeout(() => handleClose(), 18000);
    return () => { clearTimeout(t); clearTimeout(dismiss); };
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const c = RISK_COLORS[prediction.risk_level] || RISK_COLORS.MEDIUM;

  return (
    <div
      style={{
        transition: "all 0.3s ease",
        transform: visible ? "translateX(0)" : "translateX(110%)",
        opacity: visible ? 1 : 0,
        background: "#0a0f1a",
        border: `1px solid ${c.border}`,
        borderRadius: 8,
        padding: 12,
        width: 300,
        boxShadow: `0 0 30px ${c.glow}, 0 8px 32px rgba(0,0,0,0.6)`,
        pointerEvents: "auto",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 6, background: c.bg, border: `1px solid ${c.border}`, flexShrink: 0 }}>
          <BrainCircuit style={{ width: 14, height: 14, color: c.text }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", color: c.text, textTransform: "uppercase" }}>
            🔮 AI Prediction · {prediction.risk_level}
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#f1f5f9", lineHeight: 1.3, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {prediction.title}
          </div>
        </div>
        <button onClick={handleClose} style={{ color: "#475569", background: "none", border: "none", cursor: "pointer", padding: 2, flexShrink: 0 }}>
          <X style={{ width: 12, height: 12 }} />
        </button>
      </div>

      {/* Region */}
      {prediction.region && (
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
          <MapPin style={{ width: 10, height: 10, color: "#64748b" }} />
          <span style={{ fontSize: 10, color: "#64748b" }}>{prediction.region}</span>
        </div>
      )}

      {/* Description */}
      <p style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1.5, margin: "0 0 8px 0" }}>
        {prediction.description.length > 150 ? prediction.description.slice(0, 150) + "…" : prediction.description}
      </p>

      {/* Timeframe + confidence */}
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        {prediction.timeframe && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.04)", borderRadius: 4, padding: "3px 7px" }}>
            <Clock style={{ width: 9, height: 9, color: "#475569" }} />
            <span style={{ fontSize: 9, color: "#64748b" }}>{prediction.timeframe}</span>
          </div>
        )}
        {prediction.confidence && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.04)", borderRadius: 4, padding: "3px 7px" }}>
            <TrendingUp style={{ width: 9, height: 9, color: c.text }} />
            <span style={{ fontSize: 9, color: c.text, fontWeight: 700 }}>{prediction.confidence}% confidence</span>
          </div>
        )}
      </div>

      {/* Locate action */}
      {prediction.related_event && (
        <button
          onClick={() => { onLocate?.(prediction.related_event); handleClose(); }}
          style={{ width: "100%", fontSize: 10, fontWeight: 600, color: c.text, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 4, padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
        >
          <MapPin style={{ width: 10, height: 10 }} />
          View Related Event
        </button>
      )}
    </div>
  );
}