import { useEffect, useState } from "react";
import { ShieldAlert, X, Mail, MapPin, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function CriticalAlertToast({ event, onClose, onLocate }) {
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const t = setTimeout(() => setVisible(true), 50);
    // Auto-dismiss after 12 seconds
    const dismiss = setTimeout(() => handleClose(), 12000);
    return () => { clearTimeout(t); clearTimeout(dismiss); };
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleLocate = () => {
    onLocate?.(event);
    handleClose();
  };

  const handleEmailAlert = async () => {
    setSendingEmail(true);
    const user = await base44.auth.me();
    if (user?.email) {
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `🚨 CRITICAL ALERT: ${event.title}`,
        body: `
LBC RADAR — Critical Conflict Event Detected

Title: ${event.title}
Severity: ${event.severity}
Type: ${event.event_type || "Unknown"}
Location: ${event.country || event.region || "Unknown"}

Summary:
${event.summary || "No summary available."}

${event.ai_analysis ? `AI Analysis:\n${event.ai_analysis}` : ""}

—
LBC RADAR | Global Conflict Intelligence
        `.trim(),
      });
      setEmailSent(true);
    }
    setSendingEmail(false);
  };

  return (
    <div
      style={{
        transition: "all 0.3s ease",
        transform: visible ? "translateX(0)" : "translateX(110%)",
        opacity: visible ? 1 : 0,
      }}
      className="flex flex-col gap-2 bg-[#0f1520] border border-red-500/50 rounded-lg p-3 shadow-2xl w-[300px] pointer-events-auto"
      style={{
        transition: "all 0.3s ease",
        transform: visible ? "translateX(0)" : "translateX(110%)",
        opacity: visible ? 1 : 0,
        background: "#0f1520",
        border: "1px solid rgba(239,68,68,0.5)",
        borderRadius: 8,
        padding: 12,
        width: 300,
        boxShadow: "0 0 30px rgba(239,68,68,0.15), 0 8px 32px rgba(0,0,0,0.6)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 6, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", flexShrink: 0 }}>
          <ShieldAlert style={{ width: 14, height: 14, color: "#ef4444" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", color: "#ef4444", textTransform: "uppercase" }}>⚡ Critical Alert</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#f1f5f9", lineHeight: 1.3, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.title}</div>
        </div>
        <button onClick={handleClose} style={{ color: "#475569", background: "none", border: "none", cursor: "pointer", padding: 2, flexShrink: 0 }}>
          <X style={{ width: 12, height: 12 }} />
        </button>
      </div>

      {/* Location */}
      {(event.country || event.region) && (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <MapPin style={{ width: 10, height: 10, color: "#64748b" }} />
          <span style={{ fontSize: 10, color: "#64748b" }}>{event.country || event.region}</span>
        </div>
      )}

      {/* Summary */}
      {event.summary && (
        <p style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1.5, margin: 0 }}>
          {event.summary.length > 120 ? event.summary.slice(0, 120) + "…" : event.summary}
        </p>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
        <button
          onClick={handleLocate}
          style={{ flex: 1, fontSize: 10, fontWeight: 600, color: "#ef4444", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 4, padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
        >
          <MapPin style={{ width: 10, height: 10 }} />
          View on Map
        </button>
        <button
          onClick={handleEmailAlert}
          disabled={sendingEmail || emailSent}
          style={{ flex: 1, fontSize: 10, fontWeight: 600, color: emailSent ? "#10b981" : "#60a5fa", background: emailSent ? "rgba(16,185,129,0.1)" : "rgba(59,130,246,0.1)", border: `1px solid ${emailSent ? "rgba(16,185,129,0.3)" : "rgba(59,130,246,0.3)"}`, borderRadius: 4, padding: "4px 8px", cursor: sendingEmail || emailSent ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
        >
          {sendingEmail ? <Loader2 style={{ width: 10, height: 10, animation: "spin 1s linear infinite" }} /> : <Mail style={{ width: 10, height: 10 }} />}
          {emailSent ? "Sent!" : "Email Alert"}
        </button>
      </div>
    </div>
  );
}