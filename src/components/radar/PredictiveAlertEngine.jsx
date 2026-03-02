/**
 * PredictiveAlertEngine
 * Runs in the background. Periodically analyzes current events
 * via LLM to forecast upcoming escalations, then surfaces them
 * as prediction alerts via the onPrediction callback.
 */
import { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";

// How many events to feed the LLM (most recent + high severity)
const MAX_EVENTS = 40;
// Run analysis every 8 minutes
const INTERVAL_MS = 8 * 60 * 1000;
// Don't re-surface the same prediction within 30 minutes
const DEDUP_TTL_MS = 30 * 60 * 1000;

function pickEvents(events) {
  const high = events.filter((e) => e.severity === "HIGH").slice(0, 20);
  const rest = events.filter((e) => e.severity !== "HIGH").slice(0, MAX_EVENTS - high.length);
  return [...high, ...rest];
}

export default function PredictiveAlertEngine({ events, onPrediction }) {
  const seenRef = useRef({}); // title -> timestamp

  const runAnalysis = async (evts) => {
    if (!evts || evts.length < 3) return;

    const subset = pickEvents(evts);
    const summary = subset.map((e) =>
      `[${e.severity}] ${e.event_type || "other"} – ${e.title} (${e.country || e.region || "unknown"}) | ${e.summary?.slice(0, 80) || ""}`
    ).join("\n");

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an advanced geopolitical intelligence analyst. Based on the following recent conflict events, identify 1-3 SPECIFIC, ACTIONABLE predictive alerts forecasting likely escalations or related incidents that have NOT yet occurred.

RECENT EVENTS:
${summary}

For each prediction, output a JSON object. Only generate predictions if there is real signal — do not hallucinate vague warnings.

Each prediction must have:
- title: short (under 10 words), specific prediction title
- description: 1-2 sentence explanation of why this is likely based on the patterns
- region: affected region/country
- risk_level: "CRITICAL" | "HIGH" | "MEDIUM"
- timeframe: estimated timeframe (e.g. "Next 24–48 hours", "Within 72 hours", "Coming week")
- confidence: integer 40–90 representing confidence percentage
- related_event_id: ID of the most relevant source event (from the list), or null`,
      response_json_schema: {
        type: "object",
        properties: {
          predictions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                region: { type: "string" },
                risk_level: { type: "string" },
                timeframe: { type: "string" },
                confidence: { type: "number" },
                related_event_id: { type: "string" },
              },
            },
          },
        },
      },
    });

    const now = Date.now();
    // Purge old dedup entries
    Object.keys(seenRef.current).forEach((k) => {
      if (now - seenRef.current[k] > DEDUP_TTL_MS) delete seenRef.current[k];
    });

    (result?.predictions || []).forEach((pred) => {
      if (!pred.title) return;
      const key = pred.title.toLowerCase().trim();
      if (seenRef.current[key]) return; // already shown recently

      seenRef.current[key] = now;

      // Attach the related event object if ID is provided
      const related_event = pred.related_event_id
        ? evts.find((e) => e.id === pred.related_event_id) || null
        : null;

      onPrediction?.({ ...pred, related_event });
    });
  };

  useEffect(() => {
    if (!events || events.length < 3) return;

    // Initial run after a short delay (avoid hammering on mount)
    const initial = setTimeout(() => runAnalysis(events), 5000);
    const interval = setInterval(() => runAnalysis(events), INTERVAL_MS);

    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
    // Re-run when events change significantly (length change is a good proxy)
  }, [events.length]);

  return null;
}