import { useState, useRef, useCallback } from "react";

// Point-in-polygon ray casting algorithm
function pointInPolygon(point, polygon) {
  const [px, py] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersect = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

const ZONE_COLORS = ["#a78bfa", "#60a5fa", "#34d399", "#fb923c", "#f472b6", "#fbbf24"];

export function useGeofence() {
  const [zones, setZones] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawPoints, setDrawPoints] = useState([]);
  const seenEventIds = useRef(new Set());

  const startDraw = useCallback(() => {
    setIsDrawing(true);
    setDrawPoints([]);
  }, []);

  const cancelDraw = useCallback(() => {
    setIsDrawing(false);
    setDrawPoints([]);
  }, []);

  const addDrawPoint = useCallback((latlng) => {
    setDrawPoints((prev) => [...prev, [latlng.lng, latlng.lat]]);
  }, []);

  const finishDraw = useCallback(() => {
    setDrawPoints((prev) => {
      if (prev.length < 3) return prev;
      const color = ZONE_COLORS[Math.floor(Math.random() * ZONE_COLORS.length)];
      const newZone = {
        id: Date.now(),
        name: `Zone ${Date.now().toString().slice(-4)}`,
        points: prev,
        color,
        active: true,
      };
      setZones((z) => [...z, newZone]);
      return [];
    });
    setIsDrawing(false);
  }, []);

  const deleteZone = useCallback((id) => {
    setZones((prev) => prev.filter((z) => z.id !== id));
  }, []);

  const toggleZone = useCallback((id) => {
    setZones((prev) => prev.map((z) => z.id === id ? { ...z, active: !z.active } : z));
  }, []);

  // Check if a new event falls inside any active zone
  const checkEventAgainstZones = useCallback((event) => {
    if (!event.latitude || !event.longitude) return null;
    if (seenEventIds.current.has(event.id)) return null;
    seenEventIds.current.add(event.id);

    for (const zone of zones) {
      if (!zone.active) continue;
      const inside = pointInPolygon([event.longitude, event.latitude], zone.points);
      if (inside) return { zone, event };
    }
    return null;
  }, [zones]);

  // Check all existing events against zones (when zones change)
  const checkAllEventsAgainstZone = useCallback((events, zone) => {
    const hits = [];
    for (const event of events) {
      if (!event.latitude || !event.longitude) continue;
      const inside = pointInPolygon([event.longitude, event.latitude], zone.points);
      if (inside) hits.push(event);
    }
    return hits;
  }, []);

  return {
    zones,
    isDrawing,
    drawPoints,
    startDraw,
    cancelDraw,
    addDrawPoint,
    finishDraw,
    deleteZone,
    toggleZone,
    checkEventAgainstZones,
    checkAllEventsAgainstZone,
  };
}