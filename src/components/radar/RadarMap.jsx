import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";

const SEVERITY_COLORS = {
  HIGH: "#ef4444",
  MEDIUM: "#f59e0b",
  LOW: "#10b981",
};

const ALERT_TYPES = ["airstrike", "missile", "explosion"];

function makeIcon(event, isSelected) {
  const color = SEVERITY_COLORS[event.severity] || "#64748b";
  const isAlert = ALERT_TYPES.includes(event.event_type);

  if (isAlert) {
    const html = `<div style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">
      <span style="font-size:18px;filter:drop-shadow(0 0 8px ${color});z-index:1;">🚀</span>
      ${isSelected ? `<div style="position:absolute;inset:-4px;border-radius:50%;border:2px solid ${color};animation:radarPing 1.2s ease-out infinite;"></div>` : ""}
    </div>`;
    return L.divIcon({ html, className: "", iconSize: [32, 32], iconAnchor: [16, 16] });
  }

  const size = event.severity === "HIGH" ? 12 : event.severity === "MEDIUM" ? 9 : 7;
  const ring = isSelected ? `box-shadow:0 0 0 3px ${color}55,0 0 12px ${color};` : `box-shadow:0 0 6px ${color}88;`;
  const html = `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};${ring}"></div>`;
  return L.divIcon({ html, className: "", iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
}

function FlyTo({ event }) {
  const map = useMap();
  useEffect(() => {
    if (event?.latitude && event?.longitude) {
      map.flyTo([event.latitude, event.longitude], 6, { duration: 1.2 });
    }
  }, [event?.id]);
  return null;
}

export default function RadarMap({ events, selectedEvent, onSelectEvent }) {
  const positioned = events.filter((e) => e.latitude && e.longitude);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <style>{`
        .leaflet-container { background: #050810 !important; }
        .leaflet-tile-pane { filter: brightness(0.85) saturate(0.6) contrast(1.1); }
        .leaflet-control-zoom, .leaflet-control-attribution { display: none !important; }
        .leaflet-tooltip { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
        .leaflet-tooltip-top:before { display: none !important; }
        @keyframes radarPing { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(2.5); opacity: 0; } }
      `}</style>

      <MapContainer
        center={[20, 15]}
        zoom={2}
        style={{ width: "100%", height: "100%", background: "#050810" }}
        zoomControl={false}
        attributionControl={false}
        minZoom={2}
        maxZoom={12}
      >
        {/* Base dark map with clear country borders */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />
        {/* Country borders + labels layer on top */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
          opacity={0.8}
        />

        {selectedEvent && <FlyTo event={selectedEvent} />}

        {positioned.map((event) => (
          <Marker
            key={event.id}
            position={[event.latitude, event.longitude]}
            icon={makeIcon(event, selectedEvent?.id === event.id)}
            eventHandlers={{ click: () => onSelectEvent?.(event) }}
          >
            <Tooltip direction="top" offset={[0, -6]} opacity={1}>
              <div style={{
                background: "#0f1520",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 6,
                padding: "5px 9px",
                maxWidth: 200,
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#f1f5f9", lineHeight: 1.4 }}>{event.title}</div>
                {event.country && <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{event.country}</div>}
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>

      {/* Corner brackets */}
      <div style={{ position:"absolute", top:10, left:10, width:20, height:20, borderTop:"2px solid rgba(220,38,38,0.5)", borderLeft:"2px solid rgba(220,38,38,0.5)", pointerEvents:"none", zIndex:500 }} />
      <div style={{ position:"absolute", top:10, right:10, width:20, height:20, borderTop:"2px solid rgba(220,38,38,0.5)", borderRight:"2px solid rgba(220,38,38,0.5)", pointerEvents:"none", zIndex:500 }} />
      <div style={{ position:"absolute", bottom:10, left:10, width:20, height:20, borderBottom:"2px solid rgba(220,38,38,0.5)", borderLeft:"2px solid rgba(220,38,38,0.5)", pointerEvents:"none", zIndex:500 }} />
      <div style={{ position:"absolute", bottom:10, right:10, width:20, height:20, borderBottom:"2px solid rgba(220,38,38,0.5)", borderRight:"2px solid rgba(220,38,38,0.5)", pointerEvents:"none", zIndex:500 }} />

      {/* Powered by AI */}
      <div style={{ position:"absolute", top:10, left:"50%", transform:"translateX(-50%)", zIndex:500, pointerEvents:"none" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)", padding:"4px 12px", borderRadius:20, border:"1px solid rgba(59,130,246,0.3)" }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"#60a5fa", animation:"pulse 2s infinite" }} />
          <span style={{ fontSize:10, color:"#93c5fd", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase" }}>Powered by AI</span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ position:"absolute", bottom:16, left:"50%", transform:"translateX(-50%)", zIndex:500, display:"flex", gap:8, pointerEvents:"none" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(0,0,0,0.7)", padding:"4px 10px", borderRadius:6, border:"1px solid rgba(255,255,255,0.08)" }}>
          <span style={{ fontSize:12 }}>🚀</span>
          <span style={{ fontSize:10, color:"rgba(255,255,255,0.5)" }}>Missile/Strike</span>
        </div>
        {["HIGH","MEDIUM","LOW"].map((s) => (
          <div key={s} style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(0,0,0,0.7)", padding:"4px 10px", borderRadius:6, border:"1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ width:8, height:8, borderRadius:"50%", background: SEVERITY_COLORS[s] }} />
            <span style={{ fontSize:10, color:"rgba(255,255,255,0.6)", fontWeight:700, letterSpacing:"0.1em" }}>{s}</span>
            <span style={{ fontSize:10, color:"#fff", fontFamily:"monospace" }}>{events.filter(e => e.severity === s).length}</span>
          </div>
        ))}
      </div>
    </div>
  );
}