import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const SEVERITY_COLORS = {
  HIGH: "#ef4444",
  MEDIUM: "#f59e0b",
  LOW: "#10b981",
};

const EVENT_TYPE_EMOJI = {
  airstrike: "✈️",
  missile: "🚀",
  explosion: "💥",
  clash: "⚔️",
  threat: "⚠️",
  diplomatic: "🤝",
  cyberattack: "💻",
  naval: "🚢",
  other: "📍",
};

const ALERT_TYPES = ["airstrike", "missile", "explosion"];

function makeIcon(event, isSelected) {
  const color = SEVERITY_COLORS[event.severity] || "#64748b";
  const isAlert = ALERT_TYPES.includes(event.event_type);

  if (isAlert) {
    const html = `<div style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">
      <span style="font-size:18px;filter:drop-shadow(0 0 8px ${color});z-index:1;">${EVENT_TYPE_EMOJI[event.event_type] || "🚀"}</span>
      ${isSelected ? `<div style="position:absolute;inset:-4px;border-radius:50%;border:2px solid ${color};animation:radarPing 1.2s ease-out infinite;"></div>` : ""}
    </div>`;
    return L.divIcon({ html, className: "", iconSize: [32, 32], iconAnchor: [16, 16] });
  }

  const size = event.severity === "HIGH" ? 12 : event.severity === "MEDIUM" ? 9 : 7;
  const pulse = isSelected
    ? `box-shadow:0 0 0 3px ${color}55,0 0 12px ${color};`
    : `box-shadow:0 0 6px ${color}88;`;
  const html = `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};${pulse}"></div>`;
  return L.divIcon({ html, className: "", iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
}

function makeTooltipContent(event) {
  const color = SEVERITY_COLORS[event.severity] || "#64748b";
  const emoji = EVENT_TYPE_EMOJI[event.event_type] || "📍";
  const typeLabel = event.event_type ? event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1) : "Unknown";
  const summary = event.summary ? event.summary.slice(0, 100) + (event.summary.length > 100 ? "…" : "") : "";
  return `
    <div style="background:#0d1117;border:1px solid ${color}44;border-radius:8px;padding:8px 10px;min-width:180px;max-width:240px;pointer-events:none;">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;">
        <span style="font-size:13px;">${emoji}</span>
        <span style="font-size:11px;font-weight:700;color:#f1f5f9;line-height:1.3;flex:1;">${event.title}</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:${summary ? 5 : 0}px;">
        <span style="font-size:9px;font-weight:700;letter-spacing:0.08em;color:${color};background:${color}18;border:1px solid ${color}33;border-radius:3px;padding:1px 5px;text-transform:uppercase;">${event.severity}</span>
        <span style="font-size:9px;color:#475569;">${typeLabel}</span>
        ${event.is_escalation ? `<span style="font-size:9px;color:#f59e0b;font-weight:600;">⬆ Escalation</span>` : ""}
      </div>
      ${event.country ? `<div style="font-size:9px;color:#475569;margin-bottom:${summary ? 4 : 0}px;">📌 ${event.country}${event.region ? ` · ${event.region}` : ""}</div>` : ""}
      ${summary ? `<div style="font-size:10px;color:#94a3b8;line-height:1.45;border-top:1px solid rgba(255,255,255,0.05);padding-top:5px;">${summary}</div>` : ""}
      <div style="font-size:8px;color:#334155;margin-top:5px;text-align:right;">Click to view details</div>
    </div>`;
}

function CorrelationLines({ events, correlationGroups }) {
  const map = useMap();
  const linesRef = useRef([]);

  useEffect(() => {
    linesRef.current.forEach((l) => map.removeLayer(l));
    linesRef.current = [];

    if (!correlationGroups || correlationGroups.length === 0) return;

    const COLORS = ["#a78bfa", "#f59e0b", "#60a5fa", "#10b981", "#f472b6", "#fb923c"];
    const eventMap = {};
    events.forEach((e) => { if (e.latitude && e.longitude) eventMap[e.id] = e; });

    correlationGroups.forEach((group, gi) => {
      const ids = group.event_ids || [];
      const color = COLORS[gi % COLORS.length];
      for (let i = 0; i < ids.length - 1; i++) {
        const a = eventMap[ids[i]];
        const b = eventMap[ids[i + 1]];
        if (!a || !b) continue;
        const line = L.polyline([[a.latitude, a.longitude], [b.latitude, b.longitude]], {
          color,
          weight: 1.5,
          opacity: 0.45,
          dashArray: "4 6",
          interactive: false,
        });
        map.addLayer(line);
        linesRef.current.push(line);
      }
    });

    return () => {
      linesRef.current.forEach((l) => map.removeLayer(l));
      linesRef.current = [];
    };
  }, [correlationGroups, events]);

  return null;
}

function EventMarkers({ events, selectedEvent, onSelectEvent }) {
  const positioned = events.filter((e) => e.latitude && e.longitude);

  return positioned.map((event) => (
    <Marker
      key={event.id}
      position={[event.latitude, event.longitude]}
      icon={makeIcon(event, selectedEvent?.id === event.id)}
      eventHandlers={{ click: () => onSelectEvent?.(event) }}
    >
      <Tooltip
        direction="top"
        offset={[0, -8]}
        opacity={1}
        className="radar-tooltip"
      >
        <div dangerouslySetInnerHTML={{ __html: makeTooltipContent(event) }} />
      </Tooltip>
    </Marker>
  ));
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

export default function RadarMap({ events, selectedEvent, onSelectEvent, correlationGroups }) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <style>{`
        .leaflet-container { background: #050810 !important; }
        .leaflet-tile-pane { filter: brightness(0.85) saturate(0.6) contrast(1.1); }
        .leaflet-control-zoom, .leaflet-control-attribution { display: none !important; }
        .radar-tooltip { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
        .radar-tooltip::before { display: none !important; }
        .leaflet-tooltip { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
        .leaflet-tooltip-top:before { display: none !important; }
        @keyframes radarPing { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(2.5); opacity: 0; } }
        .leaflet-marker-icon { cursor: pointer !important; }
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
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
          opacity={0.8}
        />

        {selectedEvent && <FlyTo event={selectedEvent} />}
        <CorrelationLines events={events} correlationGroups={correlationGroups} />
        <EventMarkers events={events} selectedEvent={selectedEvent} onSelectEvent={onSelectEvent} />
      </MapContainer>

      {/* Corner brackets */}
      <div style={{ position:"absolute", top:10, left:10, width:20, height:20, borderTop:"2px solid rgba(220,38,38,0.5)", borderLeft:"2px solid rgba(220,38,38,0.5)", pointerEvents:"none", zIndex:500 }} />
      <div style={{ position:"absolute", top:10, right:10, width:20, height:20, borderTop:"2px solid rgba(220,38,38,0.5)", borderRight:"2px solid rgba(220,38,38,0.5)", pointerEvents:"none", zIndex:500 }} />
      <div style={{ position:"absolute", bottom:10, left:10, width:20, height:20, borderBottom:"2px solid rgba(220,38,38,0.5)", borderLeft:"2px solid rgba(220,38,38,0.5)", pointerEvents:"none", zIndex:500 }} />
      <div style={{ position:"absolute", bottom:10, right:10, width:20, height:20, borderBottom:"2px solid rgba(220,38,38,0.5)", borderRight:"2px solid rgba(220,38,38,0.5)", pointerEvents:"none", zIndex:500 }} />

      {/* Powered by AI */}
      <div style={{ position:"absolute", top:10, left:"50%", transform:"translateX(-50%)", zIndex:500, pointerEvents:"none" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)", padding:"4px 12px", borderRadius:20, border:"1px solid rgba(59,130,246,0.3)" }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"#60a5fa" }} />
          <span style={{ fontSize:10, color:"#93c5fd", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase" }}>Powered by AI</span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ position:"absolute", bottom:16, left:"50%", transform:"translateX(-50%)", zIndex:500, display:"flex", gap:8, pointerEvents:"none" }}>
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