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
import AddEventModal from "../components/radar/AddEventModal";
import { AlertStack } from "../components/radar/AlertNotificationStack";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  const addAlert = useCallback((event) => {
    const id = Date.now();
    setAlerts((prev) => [...prev.slice(-2), { id, event }]);
  }, []);

  const removeAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const loadEvents = async () => {
    const data = await base44.entities.ConflictEvent.list("-created_date", 100);
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
      } else if (event.type === "update") {
        setEvents((prev) => prev.map((e) => (e.id === event.id ? event.data : e)));
      } else if (event.type === "delete") {
        setEvents((prev) => prev.filter((e) => e.id !== event.id));
      }
    });

    return unsubscribe;
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
          <TrendAnalysisPanel events={events} />
          <NewsFeedPanel />
          <MarketTickerPanel />
          <div className="flex-1 overflow-hidden">
            <PulseFeed
              events={events}
              onSelectEvent={setSelectedEvent}
              selectedEvent={selectedEvent}
            />
          </div>
        </aside>

        {/* Main map */}
        <main className="flex-1 relative min-h-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
              <p className="text-xs text-slate-500 tracking-widest uppercase">Initializing Radar...</p>
            </div>
          ) : (
            <RadarMap
              events={events}
              selectedEvent={selectedEvent}
              onSelectEvent={setSelectedEvent}
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
    </div>
  );
}