import { useState } from "react";
import { X, Loader2, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLang } from "../LanguageContext";

const COUNTRIES = [
  { name: "Lebanon", code: "lb", lat: 33.8547, lng: 35.8623 },
  { name: "Israel", code: "il", lat: 31.0461, lng: 34.8516 },
  { name: "Iran", code: "ir", lat: 32.4279, lng: 53.688 },
  { name: "Ukraine", code: "ua", lat: 48.3794, lng: 31.1656 },
  { name: "Russia", code: "ru", lat: 61.524, lng: 105.3188 },
  { name: "Syria", code: "sy", lat: 34.802, lng: 38.9968 },
  { name: "Iraq", code: "iq", lat: 33.2232, lng: 43.6793 },
  { name: "Yemen", code: "ye", lat: 15.5527, lng: 48.5164 },
  { name: "Sudan", code: "sd", lat: 12.8628, lng: 30.2176 },
  { name: "Myanmar", code: "mm", lat: 21.9162, lng: 95.956 },
  { name: "Palestine", code: "ps", lat: 31.9522, lng: 35.2332 },
  { name: "Pakistan", code: "pk", lat: 30.3753, lng: 69.3451 },
  { name: "Other", code: "", lat: 0, lng: 0 },
];

export default function AddEventModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    title: "",
    summary: "",
    severity: "MEDIUM",
    event_type: "other",
    country: "",
    country_code: "",
    region: "",
    confidence: 75,
    is_escalation: false,
    latitude: null,
    longitude: null,
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCountryChange = (name) => {
    const c = COUNTRIES.find((c) => c.name === name);
    if (c) {
      set("country", c.name);
      set("country_code", c.code);
      if (c.lat) { set("latitude", c.lat); set("longitude", c.lng); }
    }
  };

  const aiEnrich = async () => {
    if (!form.title) return;
    setAiLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a conflict intelligence analyst. Given this event title, generate structured intelligence data:\n\nTitle: "${form.title}"\n\nProvide a detailed summary, suggest severity (HIGH/MEDIUM/LOW), confidence level (0-100), and relevant tags.`,
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          severity: { type: "string" },
          confidence: { type: "number" },
          tags: { type: "array", items: { type: "string" } },
          ai_analysis: { type: "string" },
          is_escalation: { type: "boolean" },
        },
      },
    });
    if (result.summary) set("summary", result.summary);
    if (result.severity) set("severity", result.severity);
    if (result.confidence) set("confidence", result.confidence);
    if (result.tags) set("tags", result.tags);
    if (result.ai_analysis) set("ai_analysis", result.ai_analysis);
    if (result.is_escalation !== undefined) set("is_escalation", result.is_escalation);
    setAiLoading(false);
  };

  const handleSave = async () => {
    if (!form.title) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg panel-glass rounded-xl border border-white/[0.08] border-glow-red overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/[0.05]">
          <h2 className="text-sm font-bold text-white tracking-wider uppercase">Log New Event</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          {/* Title + AI */}
          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 block">Event Title *</label>
            <div className="flex gap-2">
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Describe the incident..."
                className="flex-1 bg-slate-800/50 border border-white/[0.07] rounded text-xs text-slate-200 px-3 py-2 focus:outline-none focus:border-red-500/40 placeholder-slate-600"
              />
              <button
                onClick={aiEnrich}
                disabled={!form.title || aiLoading}
                className="px-3 py-2 bg-blue-600/20 border border-blue-500/30 rounded text-[10px] text-blue-400 hover:bg-blue-600/30 transition-all flex items-center gap-1 disabled:opacity-40"
              >
                {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                AI
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 block">Severity</label>
              <select
                value={form.severity}
                onChange={(e) => set("severity", e.target.value)}
                className="w-full bg-slate-800/50 border border-white/[0.07] rounded text-xs text-slate-200 px-3 py-2 focus:outline-none"
              >
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 block">Event Type</label>
              <select
                value={form.event_type}
                onChange={(e) => set("event_type", e.target.value)}
                className="w-full bg-slate-800/50 border border-white/[0.07] rounded text-xs text-slate-200 px-3 py-2 focus:outline-none"
              >
                {["airstrike","missile","explosion","clash","threat","diplomatic","cyberattack","naval","other"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 block">Country</label>
              <select
                value={form.country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full bg-slate-800/50 border border-white/[0.07] rounded text-xs text-slate-200 px-3 py-2 focus:outline-none"
              >
                <option value="">Select...</option>
                {COUNTRIES.map((c) => <option key={c.code} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 block">Confidence %</label>
              <input
                type="number"
                min="0" max="100"
                value={form.confidence}
                onChange={(e) => set("confidence", Number(e.target.value))}
                className="w-full bg-slate-800/50 border border-white/[0.07] rounded text-xs text-slate-200 px-3 py-2 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 block">Region / Location</label>
            <input
              value={form.region}
              onChange={(e) => set("region", e.target.value)}
              placeholder="e.g. Southern Beirut, Northern Gaza"
              className="w-full bg-slate-800/50 border border-white/[0.07] rounded text-xs text-slate-200 px-3 py-2 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 block">Summary</label>
            <textarea
              value={form.summary}
              onChange={(e) => set("summary", e.target.value)}
              rows={3}
              placeholder="Brief description of the event..."
              className="w-full bg-slate-800/50 border border-white/[0.07] rounded text-xs text-slate-200 px-3 py-2 focus:outline-none resize-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_escalation}
              onChange={(e) => set("is_escalation", e.target.checked)}
              className="w-3 h-3 accent-red-500"
            />
            <span className="text-[11px] text-slate-400">Mark as Escalation</span>
          </label>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-white/[0.05]">
          <button onClick={onClose} className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors">Cancel</button>
          <button
            onClick={handleSave}
            disabled={!form.title || saving}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded transition-all disabled:opacity-40 flex items-center gap-1.5"
          >
            {saving && <Loader2 className="w-3 h-3 animate-spin" />}
            Log Event
          </button>
        </div>
      </div>
    </div>
  );
}