import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, Settings, X } from "lucide-react";
import {
  hasGivenConsent, acceptAll, acceptEssentialOnly, setCookiePreferences, getCookiePreferences,
} from "@/utils/cookieConsent";

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [prefs, setPrefs] = useState({ essential: true, analytics: false, marketing: false });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasGivenConsent()) {
        setVisible(true);
      }
    }, 500);
    const onChange = () => {
      setVisible(!hasGivenConsent());
      const p = getCookiePreferences();
      if (p) setPrefs(p);
    };
    window.addEventListener("fb-cookie-consent-changed", onChange);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("fb-cookie-consent-changed", onChange);
    };
  }, []);

  const handleAcceptAll = () => { acceptAll(); setVisible(false); };
  const handleEssentialOnly = () => { acceptEssentialOnly(); setVisible(false); };
  const handleSaveCustom = () => { setCookiePreferences(prefs); setVisible(false); };

  const Toggle = ({ name, label, desc, disabled }) => (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-white/5 last:border-0">
      <div className="flex-1">
        <div className="text-[#F4F1ED] text-sm font-medium mb-0.5">{label}</div>
        <div className="text-xs text-[#E6E2D8]/55 leading-relaxed">{desc}</div>
      </div>
      <label className="relative inline-block w-10 h-5 flex-shrink-0 mt-1 cursor-pointer">
        <input
          type="checkbox" disabled={disabled}
          data-testid={`banner-cookie-${name}`}
          checked={prefs[name]}
          onChange={(e) => setPrefs({ ...prefs, [name]: e.target.checked })}
          className="sr-only peer"
        />
        <span className={`block w-10 h-5 rounded-full transition-colors ${prefs[name] ? "bg-[#D4A017]" : "bg-white/15"} ${disabled ? "opacity-60" : ""}`}></span>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${prefs[name] ? "translate-x-5" : ""}`}></span>
      </label>
    </div>
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-40 p-4 sm:p-6"
          data-testid="cookie-banner"
        >
          <div className="max-w-5xl mx-auto bg-[#111111]/98 backdrop-blur-xl border border-[#D4A017]/20 rounded-3xl shadow-2xl shadow-black/50 p-6 lg:p-8">
            {!customize ? (
              <div className="grid lg:grid-cols-[auto_1fr_auto] gap-6 items-center">
                <div className="w-12 h-12 rounded-full bg-[#D4A017]/10 flex items-center justify-center flex-shrink-0">
                  <Cookie className="w-6 h-6 text-[#D4A017]" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-[#F4F1ED] mb-1">La tua privacy conta.</h3>
                  <p className="text-sm text-[#E6E2D8]/60 leading-relaxed">
                    Usiamo cookie essenziali per il funzionamento del sito. Con il tuo consenso, anche cookie di analisi.
                    Per saperne di più consulta la <Link to="/cookie" className="text-[#D4A017] hover:text-[#E5B942] underline">Cookie Policy</Link>.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 lg:flex-col xl:flex-row">
                  <button
                    data-testid="banner-customize-btn"
                    onClick={() => setCustomize(true)}
                    className="flex items-center justify-center gap-2 px-5 py-3 text-sm text-[#E6E2D8]/80 hover:text-[#F4F1ED] border border-white/10 hover:bg-white/5 rounded-full tracking-wide transition-all"
                  >
                    <Settings className="w-3.5 h-3.5" /> Personalizza
                  </button>
                  <button
                    data-testid="banner-essential-btn"
                    onClick={handleEssentialOnly}
                    className="px-5 py-3 text-sm text-[#E6E2D8] border border-white/15 hover:bg-white/5 rounded-full tracking-wide transition-all"
                  >
                    Solo essenziali
                  </button>
                  <button
                    data-testid="banner-accept-all-btn"
                    onClick={handleAcceptAll}
                    className="px-5 py-3 text-sm bg-[#D4A017] hover:bg-[#E5B942] text-[#111111] font-medium rounded-full tracking-wide transition-all"
                  >
                    Accetta tutti
                  </button>
                </div>
              </div>
            ) : (
              <div data-testid="banner-customize-panel">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="font-serif text-xl text-[#F4F1ED] mb-1">Le tue preferenze</h3>
                    <p className="text-xs text-[#E6E2D8]/50">Attiva solo quello che preferisci — potrai modificare in qualsiasi momento.</p>
                  </div>
                  <button onClick={() => setCustomize(false)} className="p-1 text-[#E6E2D8]/50 hover:text-[#F4F1ED]">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-[#0A0A0A]/50 border border-white/5 rounded-2xl px-5">
                  <Toggle name="essential" label="Cookie essenziali" desc="Login, sessione, preferenze. Sempre attivi." disabled={true} />
                  <Toggle name="analytics" label="Cookie di analisi" desc="Statistiche di utilizzo anonime e aggregate." />
                  <Toggle name="marketing" label="Cookie di marketing" desc="Pubblicità personalizzata (attualmente non utilizzati)." />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-5 justify-end">
                  <button
                    data-testid="banner-save-custom-btn"
                    onClick={handleSaveCustom}
                    className="px-6 py-3 bg-[#D4A017] hover:bg-[#E5B942] text-[#111111] text-sm font-medium rounded-full tracking-wide"
                  >
                    Salva preferenze
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
