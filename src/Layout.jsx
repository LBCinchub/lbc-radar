import { LanguageProvider } from "./components/LanguageContext";

export default function Layout({ children }) {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-[#080b12]">
        {children}
      </div>
    </LanguageProvider>
  );
}