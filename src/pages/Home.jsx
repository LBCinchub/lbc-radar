import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import TopBar from "../components/radar/TopBar";
import PulseFeed from "../components/radar/PulseFeed";
import RadarMap from "../components/radar/RadarMap";
import EventDetailPanel from "../components/radar/EventDetailPanel";
import SmartDigestPanel from "../components/radar/SmartDigestPanel";
import TrendAnalysisPanel from "../components/radar/TrendAnalysisPanel";
import NewsFeedPanel from "../components/radar/NewsFeedPanel";
import MarketTickerPanel from "../components/radar/MarketTickerPanel";
import CorrelationPanel from "../components/radar/CorrelationPanel";
import AddEventModal from "../components/radar/AddEventModal";
import { AlertStack } from "../components/radar/AlertNotificationStack";
import PredictiveAlertEngine from "../components/radar/PredictiveAlertEngine";
import PredictiveAlertToast from "../components/radar/PredictiveAlertToast";
import GeofenceManager from "../components/radar/GeofenceManager";
import GeofenceAlertToast from "../components/radar/GeofenceAlertToast";
import { useGeofence } from "../components/radar/useGeofence";
import { useLang } from "../components/LanguageContext";

export default function Home() {
  const { t } = useLang();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [correlationGroups, setCorrelationGroups] = useState([]);
  const [geofenceAlerts, setGeofenceAlerts] = useState([]);
  const {
    zones, isDrawing, drawPoints,
    startDraw, cancelDraw, addDrawPoint, finishDraw,
    deleteZone, toggleZone, checkEventAgainstZones,
  } = useGeofence();

  const addPrediction = useCallback((pred) => {
    const id = Date.now() + Math.random();
    setPredictions((prev) => [...prev.slice(-2), { id, pred }]);
  }, []);

  const removePrediction = useCallback((id) => {
    setPredictions((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addAlert = useCallback((event) => {
    const id = Date.now();
    setAlerts((prev) => [...prev.slice(-2), { id, event }]);
  }, []);

  const removeAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const loadEvents = async () => {
    const data = await base44.entities.ConflictEvent.list("-created_date", 500);
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => {
    loadEvents();

    // Auto-refresh events every 2 minutes
    const interval = setInterval(() => loadEvents(), 2 * 60 * 1000);

    // Subscribe to real-time updates
    const unsubscribe = base44.entities.ConflictEvent.subscribe((event) => {
      if (event.type === "create") {
        setEvents((prev) => [event.data, ...prev]);
        // Trigger critical alert for HIGH severity new events
        if (event.data?.severity === "HIGH") {
          addAlert(event.data);
        }
        // Check geofence zones
        const geoHit = checkEventAgainstZones(event.data);
        if (geoHit) {
          const id = Date.now() + Math.random();
          setGeofenceAlerts((prev) => [...prev.slice(-3), { id, event: geoHit.event, zoneName: geoHit.zone.name }]);
        }
      } else if (event.type === "update") {
        setEvents((prev) => prev.map((e) => (e.id === event.id ? event.data : e)));
      } else if (event.type === "delete") {
        setEvents((prev) => prev.filter((e) => e.id !== event.id));
      }
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  const handleSaveEvent = async (formData) => {
    await base44.entities.ConflictEvent.create(formData);
  };

  return (
    <div className="flex flex-col h-screen bg-[#080b12] overflow-hidden">
      <TopBar eventCount={events.length} onAddEvent={() => setShowAddModal(true)} />

      <div className="flex flex-1 min-h-0">
        {/* Left panel - Feed */}
        <aside className="w-[300px] shrink-0 panel-glass border-r border-white/[0.05] flex flex-col overflow-hidden hidden md:flex">
          <SmartDigestPanel events={events} />
          <CorrelationPanel
            events={events}
            onSelectEventById={(id) => {
              const ev = events.find((e) => e.id === id);
              if (ev) setSelectedEvent(ev);
            }}
            onGroupsChange={setCorrelationGroups}
          />
          <TrendAnalysisPanel events={events} />
          <NewsFeedPanel />
          <MarketTickerPanel />
          <div className="flex-1 overflow-hidden">
            <PulseFeed
              events={events}
              onSelectEvent={setSelectedEvent}
              selectedEvent={selectedEvent}
              onRefresh={loadEvents}
            />
          </div>
        </aside>

        {/* Main map */}
        <main className="flex-1 relative min-h-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
              <p className="text-xs text-slate-500 tracking-widest uppercase">{t.initializingRadar}</p>
            </div>
          ) : (
            <RadarMap
              events={events}
              selectedEvent={selectedEvent}
              onSelectEvent={setSelectedEvent}
              correlationGroups={correlationGroups}
            />
          )}
        </main>

        {/* Right panel - Event detail */}
        <aside
          className={`shrink-0 panel-glass border-l border-white/[0.05] transition-all duration-300 overflow-hidden ${
            selectedEvent ? "w-[280px]" : "w-0"
          }`}
        >
          {selectedEvent && (
            <EventDetailPanel
              event={selectedEvent}
              onClose={() => setSelectedEvent(null)}
            />
          )}
        </aside>
      </div>

      {/* Mobile feed (bottom sheet on mobile) */}
      <div className="md:hidden border-t border-white/[0.05] h-64 overflow-hidden">
        <PulseFeed
          events={events}
          onSelectEvent={setSelectedEvent}
          selectedEvent={selectedEvent}
        />
      </div>

      {showAddModal && (
        <AddEventModal
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveEvent}
        />
      )}

      {/* Critical alert notifications */}
      <AlertStack
        alerts={alerts}
        onRemove={removeAlert}
        onLocate={(event) => setSelectedEvent(event)}
      />

      {/* Predictive alert toasts */}
      <div style={{ position: "fixed", top: 70, left: 16, zIndex: 9998, display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none" }}>
        {predictions.map(({ id, pred }) => (
          <PredictiveAlertToast
            key={id}
            prediction={pred}
            onClose={() => removePrediction(id)}
            onLocate={(event) => setSelectedEvent(event)}
          />
        ))}
      </div>

      {/* Prediction engine (invisible) */}
      <PredictiveAlertEngine events={events} onPrediction={addPrediction} />
    </div>
  );
}