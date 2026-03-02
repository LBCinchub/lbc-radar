import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";

const SEVERITY_COLORS = {
  HIGH: "#ef4444",
  MEDIUM: "#f59e0b",
  LOW: "#10b981",
};

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
      {/* Grid overlay - below map controls */}
      <div className="absolute inset-0 radar-grid pointer-events-none z-[1]" />

      <MapContainer
        center={[25, 30]}
        zoom={3}
        style={{ width: "100%", height: "100%", background: "#050810" }}
        zoomControl={false}
        attributionControl={false}
        minZoom={2}
        maxZoom={10}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {selectedEvent && <FlyTo event={selectedEvent} />}

        {positioned.map((event) => {
          const color = SEVERITY_COLORS[event.severity] || "#64748b";
          const isSelected = selectedEvent?.id === event.id;
          return (
            <CircleMarker
              key={event.id}
              center={[event.latitude, event.longitude]}
              radius={isSelected ? 10 : event.severity === "HIGH" ? 7 : 5}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: isSelected ? 0.8 : 0.4,
                weight: isSelected ? 2 : 1,
              }}
              eventHandlers={{ click: () => onSelectEvent?.(event) }}
            >
              <Tooltip
                permanent={false}
                direction="top"
                className="radar-tooltip"
              >
                <div className="text-[11px] font-medium text-white max-w-[200px] leading-tight">
                  {event.title}
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
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

      {/* Event counter overlay */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[500] flex gap-3 pointer-events-none">
        {["HIGH", "MEDIUM", "LOW"].map((s) => {
          const count = events.filter((e) => e.severity === s).length;
          return (
            <div key={s} className="flex items-center gap-1.5 bg-black/60 backdrop-blur px-2 py-1 rounded border border-white/10">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: SEVERITY_COLORS[s] }}
              />
              <span className="text-[10px] font-bold text-white/70 tracking-widest">{s}</span>
              <span className="text-[10px] font-mono text-white">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}