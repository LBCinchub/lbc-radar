import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, X, Loader2, Globe } from "lucide-react";

// Basic country → approximate lat/lng lookup
const COUNTRY_COORDS = {
  "Afghanistan": [33.93, 67.71], "Albania": [41.15, 20.17], "Algeria": [28.03, 1.66],
  "Angola": [-11.20, 17.87], "Argentina": [-38.42, -63.62], "Armenia": [40.07, 45.04],
  "Australia": [-25.27, 133.78], "Austria": [47.52, 14.55], "Azerbaijan": [40.14, 47.58],
  "Bahrain": [26.0, 50.56], "Bangladesh": [23.68, 90.36], "Belarus": [53.71, 27.95],
  "Belgium": [50.50, 4.47], "Bolivia": [-16.29, -63.59], "Bosnia": [43.92, 17.68],
  "Brazil": [-14.24, -51.93], "Bulgaria": [42.73, 25.49], "Cameroon": [3.85, 11.50],
  "Canada": [56.13, -106.35], "Chad": [15.45, 18.73], "Chile": [-35.68, -71.54],
  "China": [35.86, 104.19], "Colombia": [4.57, -74.30], "Congo": [-4.04, 21.76],
  "Croatia": [45.10, 15.20], "Cuba": [21.52, -77.78], "Czech Republic": [49.82, 15.47],
  "Denmark": [56.26, 9.50], "Ecuador": [-1.83, -78.18], "Egypt": [26.82, 30.80],
  "Ethiopia": [9.15, 40.49], "Finland": [61.92, 25.75], "France": [46.23, 2.21],
  "Germany": [51.17, 10.45], "Ghana": [7.95, -1.02], "Greece": [39.07, 21.82],
  "Guatemala": [15.78, -90.23], "Hungary": [47.16, 19.50], "India": [20.59, 78.96],
  "Indonesia": [-0.79, 113.92], "Iran": [32.43, 53.69], "Iraq": [33.22, 43.68],
  "Ireland": [53.41, -8.24], "Israel": [31.05, 34.85], "Italy": [41.87, 12.57],
  "Japan": [36.20, 138.25], "Jordan": [30.59, 36.24], "Kazakhstan": [48.02, 66.92],
  "Kenya": [-0.02, 37.91], "Kuwait": [29.31, 47.48], "Lebanon": [33.85, 35.86],
  "Libya": [26.34, 17.23], "Malaysia": [4.21, 108.96], "Mali": [17.57, -3.99],
  "Mexico": [23.63, -102.55], "Morocco": [31.79, -7.09], "Mozambique": [-18.67, 35.53],
  "Myanmar": [21.92, 95.96], "Netherlands": [52.13, 5.29], "Nigeria": [9.08, 8.68],
  "North Korea": [40.34, 127.51], "Norway": [60.47, 8.47], "Oman": [21.51, 55.92],
  "Pakistan": [30.38, 69.35], "Palestine": [31.95, 35.23], "Peru": [-9.19, -75.02],
  "Philippines": [12.88, 121.77], "Poland": [51.92, 19.14], "Portugal": [39.40, -8.22],
  "Qatar": [25.35, 51.18], "Romania": [45.94, 24.97], "Russia": [61.52, 105.32],
  "Saudi Arabia": [23.89, 45.08], "Senegal": [14.50, -14.45], "Serbia": [44.02, 21.01],
  "Somalia": [5.15, 46.20], "South Africa": [-30.56, 22.94], "South Korea": [35.91, 127.77],
  "South Sudan": [6.88, 31.31], "Spain": [40.46, -3.75], "Sudan": [12.86, 30.22],
  "Sweden": [60.13, 18.64], "Switzerland": [46.82, 8.23], "Syria": [34.80, 38.99],
  "Taiwan": [23.70, 121.00], "Tanzania": [-6.37, 34.89], "Thailand": [15.87, 100.99],
  "Tunisia": [33.89, 9.54], "Turkey": [38.96, 35.24], "Turkmenistan": [38.97, 59.56],
  "UAE": [23.42, 53.85], "Uganda": [1.37, 32.29], "Ukraine": [48.38, 31.17],
  "United Kingdom": [55.38, -3.44], "USA": [37.09, -95.71], "United States": [37.09, -95.71],
  "Uzbekistan": [41.38, 64.59], "Venezuela": [6.42, -66.59], "Vietnam": [14.06, 108.28],
  "Yemen": [15.55, 48.52], "Zambia": [-13.13, 27.85], "Zimbabwe": [-19.02, 29.15],
};

function findCountryCoords(name) {
  const lower = name.toLowerCase().trim();
  const entry = Object.entries(COUNTRY_COORDS).find(
    ([country]) => country.toLowerCase() === lower || country.toLowerCase().includes(lower) || lower.includes(country.toLowerCase())
  );
  return entry ? entry[1] : null;
}

export default function MapClickWarningModal({ latlng, onClose, onSaved }) {
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("HIGH");
  const [eventType, setEventType] = useState("other");
  const [country, setCountry] = useState("");
  const [saving, setSaving] = useState(false);
  const [coordsOverride, setCoordsOverride] = useState(null);
  const [coordsError, setCoordsError] = useState("");

  // Determine final coordinates
  const finalCoords = coordsOverride || (latlng ? { lat: latlng.lat, lng: latlng.lng } : null);

  const handleCountryChange = (val) => {
    setCountry(val);
    setCoordsError("");
    if (!val.trim()) {
      setCoordsOverride(null);
      return;
    }
    const found = findCountryCoords(val);
    if (found) {
      setCoordsOverride({ lat: found[0], lng: found[1] });
      setCoordsError("");
    } else {
      setCoordsOverride(null);
      setCoordsError("Country not recognized — using map coordinates if available.");
    }
  };

  const handlePost = async () => {
    if (!description.trim() || !finalCoords) return;
    setSaving(true);
    try {
      await base44.entities.ConflictEvent.create({
        title: description.trim(),
        summary: country
          ? `Field report from ${country} (${finalCoords.lat.toFixed(4)}, ${finalCoords.lng.toFixed(4)})`
          : `Field report from coordinates (${finalCoords.lat.toFixed(4)}, ${finalCoords.lng.toFixed(4)})`,
        severity,
        event_type: eventType,
        country: country || undefined,
        latitude: finalCoords.lat,
        longitude: finalCoords.lng,
        is_escalation: severity === "HIGH",
        tags: ["field-report", "user-warning"],
      });
      onSaved?.();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const canSubmit = description.trim() && finalCoords;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 10000,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "#0d1117", border: "1px solid rgba(239,68,68,0.35)",
        borderRadius: 12, padding: 24, width: 400, maxWidth: "90vw",
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

        {/* Coordinates display */}
        {finalCoords && (
          <div style={{ fontSize: 10, color: "#64748b", background: "rgba(255,255,255,0.04)", borderRadius: 6, padding: "4px 10px", marginBottom: 14, display: "inline-block", fontFamily: "monospace" }}>
            📍 {finalCoords.lat.toFixed(4)}, {finalCoords.lng.toFixed(4)}
          </div>
        )}

        {/* Country input */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
            <Globe size={10} style={{ display: "inline", marginRight: 4 }} />
            Country
          </label>
          <input
            value={country}
            onChange={e => handleCountryChange(e.target.value)}
            placeholder="e.g. Syria, Ukraine, Gaza..."
            style={{
              width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 6, padding: "7px 10px", color: "#f1f5f9", fontSize: 12,
              outline: "none", fontFamily: "inherit"
            }}
          />
          {coordsError && <div style={{ fontSize: 9, color: "#f59e0b", marginTop: 3 }}>{coordsError}</div>}
          {country && coordsOverride && <div style={{ fontSize: 9, color: "#10b981", marginTop: 3 }}>✓ Coordinates resolved</div>}
        </div>

        {/* Description */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>What's happening?</label>
          <textarea
            autoFocus
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe the situation..."
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
            disabled={!canSubmit || saving}
            style={{
              padding: "7px 16px", borderRadius: 6, border: "none",
              background: canSubmit ? "#dc2626" : "#374151",
              color: canSubmit ? "#fff" : "#6b7280",
              fontSize: 12, fontWeight: 600, cursor: canSubmit ? "pointer" : "not-allowed",
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