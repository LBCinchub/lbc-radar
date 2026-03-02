import { useState } from "react";
import { Shield, Plus, Trash2, Eye, EyeOff, Pencil } from "lucide-react";
import { useLang } from "../LanguageContext";

export default function GeofenceManager({ zones, onAdd, onDelete, onToggle, isDrawing, onStartDraw, onCancelDraw }) {
  const { t } = useLang();
  const [expanded, setExpanded] = useState(true);

  return (
    <div
      style={{
        position: "absolute",
        top: 90,
        right: 16,
        zIndex: 1000,
        minWidth: 200,
        background: "rgba(13,17,23,0.92)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "#94a3b8",
        }}
      >
        <Shield style={{ width: 14, height: 14, color: "#a78bfa" }} />
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#cbd5e1" }}>
          {t.geofences || "Geofences"}
        </span>
        {zones.length > 0 && (
          <span style={{
            marginLeft: "auto",
            fontSize: 10,
            background: "rgba(167,139,250,0.15)",
            color: "#a78bfa",
            border: "1px solid rgba(167,139,250,0.3)",
            borderRadius: 4,
            padding: "1px 6px",
            fontWeight: 700,
          }}>
            {zones.length}
          </span>
        )}
      </button>

      {expanded && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "8px" }}>
          {/* Draw button */}
          {isDrawing ? (
            <div style={{ marginBottom: 8 }}>
              <div style={{
                fontSize: 10,
                color: "#fbbf24",
                background: "rgba(251,191,36,0.1)",
                border: "1px solid rgba(251,191,36,0.3)",
                borderRadius: 6,
                padding: "6px 10px",
                marginBottom: 6,
                lineHeight: 1.4,
              }}>
                ✏️ {t.drawingZone || "Click on map to add points. Double-click to finish."}
              </div>
              <button
                onClick={onCancelDraw}
                style={{
                  width: "100%",
                  padding: "5px 10px",
                  borderRadius: 6,
                  border: "1px solid rgba(239,68,68,0.4)",
                  background: "rgba(239,68,68,0.1)",
                  color: "#f87171",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {t.cancel || "Cancel"}
              </button>
            </div>
          ) : (
            <button
              onClick={onStartDraw}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid rgba(167,139,250,0.4)",
                background: "rgba(167,139,250,0.1)",
                color: "#c4b5fd",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                marginBottom: zones.length > 0 ? 8 : 0,
              }}
            >
              <Plus style={{ width: 12, height: 12 }} />
              {t.drawZone || "Draw Zone"}
            </button>
          )}

          {/* Zone list */}
          {zones.map((zone) => (
            <div
              key={zone.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 6px",
                borderRadius: 6,
                marginBottom: 4,
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${zone.color}22`,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: zone.color, flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: "#cbd5e1", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {zone.name}
              </span>
              <button onClick={() => onToggle(zone.id)} style={{ background: "none", border: "none", cursor: "pointer", color: zone.active ? "#a78bfa" : "#475569", padding: 2 }}>
                {zone.active ? <Eye style={{ width: 11, height: 11 }} /> : <EyeOff style={{ width: 11, height: 11 }} />}
              </button>
              <button onClick={() => onDelete(zone.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 2 }}>
                <Trash2 style={{ width: 11, height: 11 }} />
              </button>
            </div>
          ))}

          {zones.length === 0 && !isDrawing && (
            <p style={{ fontSize: 10, color: "#475569", textAlign: "center", marginTop: 4 }}>
              {t.noZonesYet || "No zones defined yet"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}