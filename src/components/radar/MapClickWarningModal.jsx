import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, X, Loader2 } from "lucide-react";

export default function MapClickWarningModal({ latlng, onClose, onSaved }) {
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("HIGH");
  const [eventType, setEventType] = useState("other");
  const [saving, setSaving] = useState(false);

  const handlePost = async () => {
    if (!description.trim()) return;
    setSaving(true);
    try {
      const data = {
        title: description.trim(),
        summary: `Field report from coordinates (${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)})`,
        severity,
        event_type: eventType,
        latitude: latlng.lat,
        longitude: latlng.lng,
        is_escalation: severity === "HIGH",
        tags: ["field-report", "user-warning"],
      };
      await base44.entities.ConflictEvent.create(data);
      onSaved?.();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 10000,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "#0d1117", border: "1px solid rgba(239,68,68,0.35)",
        borderRadius: 12, padding: 24, width: 380, maxWidth: "90vw",
        boxShadow: "0 0 40px rgba(239,68,68,0.15)"
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AlertTriangle size={16} color="#ef4444" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", letterSpacing: "0.08em", textTransform: "uppercase" }}>Post Field Warning</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", padding: 2 }}>
            <X size={14} />
          </button>
        </div>

        {/* Coordinates badge */}
        <div style={{ fontSize: 10, color: "#64748b", background: "rgba(255,255,255,0.04)", borderRadius: 6, padding: "4px 10px", marginBottom: 14, display: "inline-block", fontFamily: "monospace" }}>
          📍 {latlng.lat.toFixed(4)}, {latlng.lng.toFixed(4)}
        </div>

        {/* Description */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>What's happening here?</label>
          <textarea
            autoFocus
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe the situation at this location..."
            rows={3}
            style={{
              width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 6, padding: "8px 10px", color: "#f1f5f9", fontSize: 12, resize: "none",
              outline: "none", fontFamily: "inherit", lineHeight: 1.5
            }}
          />
        </div>

        {/* Severity + Type row */}
        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Severity</label>
            <select
              value={severity}
              onChange={e => setSeverity(e.target.value)}
              style={{ width: "100%", background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "6px 8px", color: "#f1f5f9", fontSize: 12, cursor: "pointer" }}
            >
              <option value="HIGH">🔴 HIGH</option>
              <option value="MEDIUM">🟡 MEDIUM</option>
              <option value="LOW">🟢 LOW</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Type</label>
            <select
              value={eventType}
              onChange={e => setEventType(e.target.value)}
              style={{ width: "100%", background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "6px 8px", color: "#f1f5f9", fontSize: 12, cursor: "pointer" }}
            >
              <option value="airstrike">✈️ Airstrike</option>
              <option value="missile">🚀 Missile</option>
              <option value="explosion">💥 Explosion</option>
              <option value="clash">⚔️ Clash</option>
              <option value="threat">⚠️ Threat</option>
              <option value="cyberattack">💻 Cyberattack</option>
              <option value="naval">🚢 Naval</option>
              <option value="other">📍 Other</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{ padding: "7px 16px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#64748b", fontSize: 12, cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={handlePost}
            disabled={!description.trim() || saving}
            style={{
              padding: "7px 16px", borderRadius: 6, border: "none",
              background: description.trim() ? "#dc2626" : "#374151",
              color: description.trim() ? "#fff" : "#6b7280",
              fontSize: 12, fontWeight: 600, cursor: description.trim() ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s"
            }}
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : <AlertTriangle size={12} />}
            Post Warning
          </button>
        </div>
      </div>
    </div>
  );
}