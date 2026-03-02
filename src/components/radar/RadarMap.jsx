import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";

const SEVERITY_COLORS = {
  HIGH: "#ef4444",
  MEDIUM: "#f59e0b",
  LOW: "#10b981",
};

// Rocket/missile icon for HIGH severity events (airstrikes, missiles, explosions)
const ALERT_TYPES = ["airstrike", "missile", "explosion"];

function makeIcon(event) {
  const isAlert = ALERT_TYPES.includes(event.event_type);
  const color = SEVERITY_COLORS[event.severity] || "#64748b";

  if (isAlert) {
    // Rocket emoji marker with pulsing red ring
    const html = `
      <div style="position:relative;width:36px;height:36px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:0.25;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
        <div style="position:absolute;inset:4px;border-radius:50%;background:${color};opacity:0.4;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite 0.3s;"></div>
        <span style="font-size:20px;z-index:1;filter:drop-shadow(0 0 6px ${color});">🚀</span>
      </div>
      <style>
        @keyframes ping { 75%,100% { transform:scale(2); opacity:0; } }
      </style>
    `;
    return L.divIcon({ html, className: "", iconSize: [36, 36], iconAnchor: [18, 18] });
  }

  // Regular dot for other events
  const size = event.severity === "HIGH" ? 14 : event.severity === "MEDIUM" ? 11 : 9;
  const html = `
    <div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid ${color};box-shadow:0 0 8px ${color}77;"></div>
  `;
  return L.divIcon({ html, className: "", iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
}

function FlyTo({ event }) {
  const map = useMap();
  useEffect(() => {
    if (event?.latitude && event?.longitude) {
      map.flyTo([event.latitude, event.longitude], 6, { duration: 1.2 });
    }
  }, [event]);
  return null;
}

export default function RadarMap({ events, selectedEvent, onSelectEvent }) {
  const positioned = events.filter((e) => e.latitude && e.longitude);

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[25, 30]}
        zoom={3}
        style={{ width: "100%", height: "100%", background: "#050810" }}
        zoomControl={false}
        attributionControl={false}
        minZoom={2}
        maxZoom={14}
      >
        {/* Satellite tile layer */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
        />

        {selectedEvent && <FlyTo event={selectedEvent} />}

        {positioned.map((event) => (
          <Marker
            key={event.id}
            position={[event.latitude, event.longitude]}
            icon={makeIcon(event)}
            eventHandlers={{ click: () => onSelectEvent?.(event) }}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
              <div style={{ background: "#0f1520", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 8px", maxWidth: 200 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#f1f5f9", lineHeight: 1.3 }}>{event.title}</div>
                {event.country && (
                  <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{event.country}</div>
                )}
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>

      {/* Corner decorations */}
      <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-red-500/40 pointer-events-none z-[500]" />
      <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-red-500/40 pointer-events-none z-[500]" />
      <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-red-500/40 pointer-events-none z-[500]" />
      <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-red-500/40 pointer-events-none z-[500]" />

      {/* Powered by AI badge */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[500] pointer-events-none">
        <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur px-3 py-1 rounded-full border border-blue-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-[10px] text-blue-300 font-bold tracking-widest uppercase">Powered by AI</span>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[500] flex gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur px-2 py-1 rounded border border-white/10">
          <span className="text-sm">🚀</span>
          <span className="text-[10px] text-white/60">Missile/Airstrike</span>
        </div>
        {["HIGH", "MEDIUM", "LOW"].map((s) => {
          const count = events.filter((e) => e.severity === s).length;
          return (
            <div key={s} className="flex items-center gap-1.5 bg-black/70 backdrop-blur px-2 py-1 rounded border border-white/10">
              <span className="w-2 h-2 rounded-full" style={{ background: SEVERITY_COLORS[s] }} />
              <span className="text-[10px] font-bold text-white/70 tracking-widest">{s}</span>
              <span className="text-[10px] font-mono text-white">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}