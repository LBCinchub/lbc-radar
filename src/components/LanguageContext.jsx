import { createContext, useContext, useState } from "react";

export const LANGUAGES = {
  en: { label: "EN", name: "English", dir: "ltr" },
  ar: { label: "ع", name: "العربية", dir: "rtl" },
  fr: { label: "FR", name: "Français", dir: "ltr" },
  es: { label: "ES", name: "Español", dir: "ltr" },
};

export const T = {
  en: {
    appSubtitle: "Global Conflict Intelligence",
    live: "LIVE",
    activeEvents: "Active Events:",
    aiRealtime: "AI REAL-TIME",
    logEvent: "Log Event",
    initializingRadar: "Initializing Radar...",
    poweredByAI: "Powered by AI",
  },
  ar: {
    appSubtitle: "استخبارات النزاعات العالمية",
    live: "مباشر",
    activeEvents: "الأحداث النشطة:",
    aiRealtime: "ذكاء اصطناعي فوري",
    logEvent: "تسجيل حدث",
    initializingRadar: "جارٍ تهيئة الرادار...",
    poweredByAI: "مدعوم بالذكاء الاصطناعي",
  },
  fr: {
    appSubtitle: "Renseignement sur les conflits mondiaux",
    live: "EN DIRECT",
    activeEvents: "Événements actifs :",
    aiRealtime: "IA EN TEMPS RÉEL",
    logEvent: "Enregistrer",
    initializingRadar: "Initialisation du radar...",
    poweredByAI: "Propulsé par l'IA",
  },
  es: {
    appSubtitle: "Inteligencia de conflictos globales",
    live: "EN VIVO",
    activeEvents: "Eventos activos:",
    aiRealtime: "IA EN TIEMPO REAL",
    logEvent: "Registrar",
    initializingRadar: "Iniciando radar...",
    poweredByAI: "Impulsado por IA",
  },
};

const LanguageContext = createContext({ lang: "en", setLang: () => {}, t: T.en });

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(
    () => localStorage.getItem("lbc_lang") || "en"
  );

  const handleSetLang = (l) => {
    setLang(l);
    localStorage.setItem("lbc_lang", l);
    document.documentElement.dir = LANGUAGES[l]?.dir || "ltr";
  };

  // Apply dir on mount
  if (typeof document !== "undefined") {
    document.documentElement.dir = LANGUAGES[lang]?.dir || "ltr";
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t: T[lang] || T.en }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}