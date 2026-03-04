import { useState } from "react";
import { X, Loader2, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLang } from "../LanguageContext";

const COUNTRIES = [
  { name: "Afghanistan", code: "af", lat: 33.93, lng: 67.71 },
  { name: "Albania", code: "al", lat: 41.15, lng: 20.17 },
  { name: "Algeria", code: "dz", lat: 28.03, lng: 1.66 },
  { name: "Angola", code: "ao", lat: -11.20, lng: 17.87 },
  { name: "Argentina", code: "ar", lat: -38.42, lng: -63.62 },
  { name: "Armenia", code: "am", lat: 40.07, lng: 45.04 },
  { name: "Australia", code: "au", lat: -25.27, lng: 133.78 },
  { name: "Austria", code: "at", lat: 47.52, lng: 14.55 },
  { name: "Azerbaijan", code: "az", lat: 40.14, lng: 47.58 },
  { name: "Bahrain", code: "bh", lat: 26.0, lng: 50.56 },
  { name: "Bangladesh", code: "bd", lat: 23.68, lng: 90.36 },
  { name: "Belarus", code: "by", lat: 53.71, lng: 27.95 },
  { name: "Belgium", code: "be", lat: 50.50, lng: 4.47 },
  { name: "Bolivia", code: "bo", lat: -16.29, lng: -63.59 },
  { name: "Bosnia", code: "ba", lat: 43.92, lng: 17.68 },
  { name: "Brazil", code: "br", lat: -14.24, lng: -51.93 },
  { name: "Bulgaria", code: "bg", lat: 42.73, lng: 25.49 },
  { name: "Burkina Faso", code: "bf", lat: 12.36, lng: -1.53 },
  { name: "Cameroon", code: "cm", lat: 3.85, lng: 11.50 },
  { name: "Canada", code: "ca", lat: 56.13, lng: -106.35 },
  { name: "Central African Republic", code: "cf", lat: 6.61, lng: 20.94 },
  { name: "Chad", code: "td", lat: 15.45, lng: 18.73 },
  { name: "Chile", code: "cl", lat: -35.68, lng: -71.54 },
  { name: "China", code: "cn", lat: 35.86, lng: 104.19 },
  { name: "Colombia", code: "co", lat: 4.57, lng: -74.30 },
  { name: "Congo (DRC)", code: "cd", lat: -4.04, lng: 21.76 },
  { name: "Croatia", code: "hr", lat: 45.10, lng: 15.20 },
  { name: "Cuba", code: "cu", lat: 21.52, lng: -77.78 },
  { name: "Czech Republic", code: "cz", lat: 49.82, lng: 15.47 },
  { name: "Denmark", code: "dk", lat: 56.26, lng: 9.50 },
  { name: "Ecuador", code: "ec", lat: -1.83, lng: -78.18 },
  { name: "Egypt", code: "eg", lat: 26.82, lng: 30.80 },
  { name: "Eritrea", code: "er", lat: 15.18, lng: 39.78 },
  { name: "Ethiopia", code: "et", lat: 9.15, lng: 40.49 },
  { name: "Finland", code: "fi", lat: 61.92, lng: 25.75 },
  { name: "France", code: "fr", lat: 46.23, lng: 2.21 },
  { name: "Gaza", code: "gz", lat: 31.35, lng: 34.31 },
  { name: "Georgia", code: "ge", lat: 42.32, lng: 43.36 },
  { name: "Germany", code: "de", lat: 51.17, lng: 10.45 },
  { name: "Ghana", code: "gh", lat: 7.95, lng: -1.02 },
  { name: "Greece", code: "gr", lat: 39.07, lng: 21.82 },
  { name: "Guatemala", code: "gt", lat: 15.78, lng: -90.23 },
  { name: "Guinea", code: "gn", lat: 11.00, lng: -10.94 },
  { name: "Haiti", code: "ht", lat: 18.97, lng: -72.29 },
  { name: "Hungary", code: "hu", lat: 47.16, lng: 19.50 },
  { name: "India", code: "in", lat: 20.59, lng: 78.96 },
  { name: "Indonesia", code: "id", lat: -0.79, lng: 113.92 },
  { name: "Iran", code: "ir", lat: 32.43, lng: 53.69 },
  { name: "Iraq", code: "iq", lat: 33.22, lng: 43.68 },
  { name: "Ireland", code: "ie", lat: 53.41, lng: -8.24 },
  { name: "Israel", code: "il", lat: 31.05, lng: 34.85 },
  { name: "Italy", code: "it", lat: 41.87, lng: 12.57 },
  { name: "Japan", code: "jp", lat: 36.20, lng: 138.25 },
  { name: "Jordan", code: "jo", lat: 30.59, lng: 36.24 },
  { name: "Kazakhstan", code: "kz", lat: 48.02, lng: 66.92 },
  { name: "Kenya", code: "ke", lat: -0.02, lng: 37.91 },
  { name: "Kuwait", code: "kw", lat: 29.31, lng: 47.48 },
  { name: "Kyrgyzstan", code: "kg", lat: 41.20, lng: 74.77 },
  { name: "Lebanon", code: "lb", lat: 33.85, lng: 35.86 },
  { name: "Libya", code: "ly", lat: 26.34, lng: 17.23 },
  { name: "Malaysia", code: "my", lat: 4.21, lng: 108.96 },
  { name: "Mali", code: "ml", lat: 17.57, lng: -3.99 },
  { name: "Mexico", code: "mx", lat: 23.63, lng: -102.55 },
  { name: "Moldova", code: "md", lat: 47.41, lng: 28.37 },
  { name: "Morocco", code: "ma", lat: 31.79, lng: -7.09 },
  { name: "Mozambique", code: "mz", lat: -18.67, lng: 35.53 },
  { name: "Myanmar", code: "mm", lat: 21.92, lng: 95.96 },
  { name: "Netherlands", code: "nl", lat: 52.13, lng: 5.29 },
  { name: "Niger", code: "ne", lat: 17.61, lng: 8.08 },
  { name: "Nigeria", code: "ng", lat: 9.08, lng: 8.68 },
  { name: "North Korea", code: "kp", lat: 40.34, lng: 127.51 },
  { name: "Norway", code: "no", lat: 60.47, lng: 8.47 },
  { name: "Oman", code: "om", lat: 21.51, lng: 55.92 },
  { name: "Pakistan", code: "pk", lat: 30.38, lng: 69.35 },
  { name: "Palestine", code: "ps", lat: 31.95, lng: 35.23 },
  { name: "Peru", code: "pe", lat: -9.19, lng: -75.02 },
  { name: "Philippines", code: "ph", lat: 12.88, lng: 121.77 },
  { name: "Poland", code: "pl", lat: 51.92, lng: 19.14 },
  { name: "Portugal", code: "pt", lat: 39.40, lng: -8.22 },
  { name: "Qatar", code: "qa", lat: 25.35, lng: 51.18 },
  { name: "Romania", code: "ro", lat: 45.94, lng: 24.97 },
  { name: "Russia", code: "ru", lat: 61.52, lng: 105.32 },
  { name: "Saudi Arabia", code: "sa", lat: 23.89, lng: 45.08 },
  { name: "Senegal", code: "sn", lat: 14.50, lng: -14.45 },
  { name: "Serbia", code: "rs", lat: 44.02, lng: 21.01 },
  { name: "Somalia", code: "so", lat: 5.15, lng: 46.20 },
  { name: "South Africa", code: "za", lat: -30.56, lng: 22.94 },
  { name: "South Korea", code: "kr", lat: 35.91, lng: 127.77 },
  { name: "South Sudan", code: "ss", lat: 6.88, lng: 31.31 },
  { name: "Spain", code: "es", lat: 40.46, lng: -3.75 },
  { name: "Sudan", code: "sd", lat: 12.86, lng: 30.22 },
  { name: "Sweden", code: "se", lat: 60.13, lng: 18.64 },
  { name: "Switzerland", code: "ch", lat: 46.82, lng: 8.23 },
  { name: "Syria", code: "sy", lat: 34.80, lng: 38.99 },
  { name: "Taiwan", code: "tw", lat: 23.70, lng: 121.00 },
  { name: "Tajikistan", code: "tj", lat: 38.86, lng: 71.28 },
  { name: "Tanzania", code: "tz", lat: -6.37, lng: 34.89 },
  { name: "Thailand", code: "th", lat: 15.87, lng: 100.99 },
  { name: "Tunisia", code: "tn", lat: 33.89, lng: 9.54 },
  { name: "Turkey", code: "tr", lat: 38.96, lng: 35.24 },
  { name: "Turkmenistan", code: "tm", lat: 38.97, lng: 59.56 },
  { name: "UAE", code: "ae", lat: 23.42, lng: 53.85 },
  { name: "Uganda", code: "ug", lat: 1.37, lng: 32.29 },
  { name: "Ukraine", code: "ua", lat: 48.38, lng: 31.17 },
  { name: "United Kingdom", code: "gb", lat: 55.38, lng: -3.44 },
  { name: "United States", code: "us", lat: 37.09, lng: -95.71 },
  { name: "Uzbekistan", code: "uz", lat: 41.38, lng: 64.59 },
  { name: "Venezuela", code: "ve", lat: 6.42, lng: -66.59 },
  { name: "Vietnam", code: "vn", lat: 14.06, lng: 108.28 },
  { name: "West Bank", code: "wb", lat: 31.95, lng: 35.30 },
  { name: "Yemen", code: "ye", lat: 15.55, lng: 48.52 },
  { name: "Zambia", code: "zm", lat: -13.13, lng: 27.85 },
  { name: "Zimbabwe", code: "zw", lat: -19.02, lng: 29.15 },
  { name: "Other", code: "", lat: 0, lng: 0 },
];

export default function AddEventModal({ onClose, onSave }) {
  const { t } = useLang();
  const [form, setForm] = useState({
    title: "",
    summary: "",
    severity: "MEDIUM",
    event_type: "other",
    country: "",
    country_code: "",
    affected_countries: [],
    region: "",
    impact_level: "military",
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
      prompt: `You are a conflict intelligence analyst. Given this event title, generate structured intelligence data:\n\nTitle: "${form.title}"\n\nProvide a detailed summary, suggest severity (HIGH/MEDIUM/LOW), confidence level (0-100), impact level (economic/military/political/humanitarian/environmental/infrastructure), affected countries, and relevant tags.`,
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          severity: { type: "string" },
          confidence: { type: "number" },
          impact_level: { type: "string" },
          affected_countries: { type: "array", items: { type: "string" } },
          tags: { type: "array", items: { type: "string" } },
          ai_analysis: { type: "string" },
          is_escalation: { type: "boolean" },
        },
      },
    });
    if (result.summary) set("summary", result.summary);
    if (result.severity) set("severity", result.severity);
    if (result.confidence) set("confidence", result.confidence);
    if (result.impact_level) set("impact_level", result.impact_level);
    if (result.affected_countries) set("affected_countries", result.affected_countries);
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg panel-glass rounded-xl border border-white/[0.08] border-glow-red overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/[0.05]">
          <h2 className="text-sm font-bold text-white tracking-wider uppercase">{t.logNewEvent}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          {/* Title + AI */}
          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 block">{t.eventTitle}</label>
            <div className="flex gap-2">
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder={t.describeIncident}
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
               <label className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 block">{t.severity}</label>
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
               <label className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 block">{t.eventType}</label>
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
               <label className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 block">{t.country}</label>
               <select
                 value={form.country}
                 onChange={(e) => handleCountryChange(e.target.value)}
                 className="w-full bg-slate-800/50 border border-white/[0.07] rounded text-xs text-slate-200 px-3 py-2 focus:outline-none"
               >
                 <option value="">{t.selectCountry}</option>
                 {COUNTRIES.map((c) => <option key={c.code} value={c.name}>{c.name}</option>)}
               </select>
             </div>
             <div>
               <label className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 block">{t.confidencePct}</label>
               <input
                 type="number"
                 min="0" max="100"
                 value={form.confidence}
                 onChange={(e) => set("confidence", Number(e.target.value))}
                 className="w-full bg-slate-800/50 border border-white/[0.07] rounded text-xs text-slate-200 px-3 py-2 focus:outline-none"
               />
             </div>
             <div>
               <label className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 block">Impact Level</label>
               <select
                 value={form.impact_level}
                 onChange={(e) => set("impact_level", e.target.value)}
                 className="w-full bg-slate-800/50 border border-white/[0.07] rounded text-xs text-slate-200 px-3 py-2 focus:outline-none"
               >
                 <option value="military">Military</option>
                 <option value="economic">Economic</option>
                 <option value="political">Political</option>
                 <option value="humanitarian">Humanitarian</option>
                 <option value="environmental">Environmental</option>
                 <option value="infrastructure">Infrastructure</option>
               </select>
             </div>
           </div>

          <div>
             <label className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 block">{t.regionLocation}</label>
             <input
               value={form.region}
               onChange={(e) => set("region", e.target.value)}
               placeholder={t.regionPlaceholder}
               className="w-full bg-slate-800/50 border border-white/[0.07] rounded text-xs text-slate-200 px-3 py-2 focus:outline-none"
             />
           </div>

           <div>
             <label className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 block">Affected Countries</label>
             <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
               {COUNTRIES.filter(c => c.name !== "Other").map((country) => (
                 <label key={country.code} className="flex items-center gap-2 cursor-pointer text-xs">
                   <input
                     type="checkbox"
                     checked={form.affected_countries.includes(country.name)}
                     onChange={(e) => {
                       if (e.target.checked) {
                         set("affected_countries", [...form.affected_countries, country.name]);
                       } else {
                         set("affected_countries", form.affected_countries.filter(c => c !== country.name));
                       }
                     }}
                     className="w-3 h-3 accent-red-500"
                   />
                   <span className="text-slate-300">{country.name}</span>
                 </label>
               ))}
             </div>
           </div>

          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 block">{t.summaryLabel}</label>
            <textarea
              value={form.summary}
              onChange={(e) => set("summary", e.target.value)}
              rows={3}
              placeholder={t.summaryPlaceholder}
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
            <span className="text-[11px] text-slate-400">{t.markEscalation}</span>
          </label>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-white/[0.05]">
          <button onClick={onClose} className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors">{t.cancel}</button>
          <button
            onClick={handleSave}
            disabled={!form.title || saving}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded transition-all disabled:opacity-40 flex items-center gap-1.5"
          >
            {saving && <Loader2 className="w-3 h-3 animate-spin" />}
            {t.logEventBtn}
          </button>
        </div>
      </div>
    </div>
  );
}