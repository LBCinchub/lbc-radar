import { useState, useEffect } from "react";
import { Shield, X } from "lucide-react";

export default function GeofenceAlertToast({ alert, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 7000);
    return () => clearTimeout(t);
  }, []);

  const severityColor = alert.event?.severity === "HIGH" ? "#ef4444" : alert.event?.severity === "MEDIUM" ? "#f59e0b" : "#10b981";

  return (
    <div
      style={{
        pointerEvents: "all",
        width: 300,
        background: "rgba(13,17,23,0.97)",
        backdropFilter: "blur(16px)",
        border: `1px solid rgba(167,139,250,0.4)`,
        borderLeft: `3px solid #a78bfa`,
        borderRadius: 10,
        padding: "10px 12px",
        transition: "all 0.3s ease",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(20px)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.6), 0 0 20px rgba(167,139,250,0.1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <Shield style={{ width: 14, height: 14, color: "#a78bfa", marginTop: 2, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#a78bfa", textTransform: "uppercase" }}>
              ⚠ Geofence Alert
            </span>
            <span style={{ fontSize: 9, fontWeight: 700, color: severityColor, background: `${severityColor}18`, border: `1px solid ${severityColor}33`, borderRadius: 3, padding: "1px 5px" }}>
              {alert.event?.severity}
            </span>
          </div>
          <p style={{ fontSize: 11, color: "#f1f5f9", fontWeight: 600, lineHeight: 1.35, margin: "0 0 4px" }}>
            {alert.event?.title}
          </p>
          <p style={{ fontSize: 10, color: "#64748b", margin: 0 }}>
            Zone: <span style={{ color: "#a78bfa" }}>{alert.zoneName}</span>
          </p>
        </div>
        <button
          onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", padding: 2, flexShrink: 0 }}
        >
          <X style={{ width: 12, height: 12 }} />
        </button>
      </div>
    </div>
  );
}