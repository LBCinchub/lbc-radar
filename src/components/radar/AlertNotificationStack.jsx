import { useState, useCallback } from "react";
import CriticalAlertToast from "./CriticalAlertToast";

export default function AlertNotificationStack({ onLocateEvent }) {
  const [alerts, setAlerts] = useState([]);

  const addAlert = useCallback((event) => {
    const id = Date.now();
    setAlerts((prev) => [...prev.slice(-2), { id, event }]); // max 3 at once
  }, []);

  const removeAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return { alerts, addAlert, removeAlert };
}

export function AlertStack({ alerts, onRemove, onLocate }) {
  return (
    <div style={{
      position: "fixed",
      top: 70,
      right: 16,
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      gap: 8,
      pointerEvents: "none",
    }}>
      {alerts.map(({ id, event }) => (
        <CriticalAlertToast
          key={id}
          event={event}
          onClose={() => onRemove(id)}
          onLocate={onLocate}
        />
      ))}
    </div>
  );
}