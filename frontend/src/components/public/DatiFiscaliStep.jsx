import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API } from "@/contexts/AuthContext";
import { PROVINCE_IT, PAESI_ESTERI } from "@/data/italianData";
import { FileCheck, ArrowRight, Sparkles } from "lucide-react";

const GENERI = ["M", "F", "Altro", "Preferisco non specificare"];

function cfValido(cf) {
  if (!cf) return false;
  const c = cf.toUpperCase().trim();
  return /^[A-Z0-9]{16}$/.test(c);
}

function capValido(cap) {
  return /^\d{5}$/.test((cap || "").trim());
}

export default function DatiFiscaliStep({ onComplete, existingData = {} }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(() => {
    const base = {
      nome: "", cognome: "", data_nascita: "", genere: "",
      codice_fiscale: "", telefono: "",
      nato_all_estero: false,
      luogo_nascita_provincia: "", luogo_nascita_comune: "",
      paese_nascita: "",
      indirizzo: "", citta: "", cap: "", provincia_residenza: "",
    };
    const clean = Object.fromEntries(
      Object.entries(existingData || {}).filter(([, v]) => v !== null && v !== undefined)
    );
    return { ...base, ...clean };
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Auto-compute CF (debounced) when anagrafic fields change
  const cfTimerRef = useRef(null);
  const [cfAutoComputed, setCfAutoComputed] = useState(false);
  useEffect(() => {
    if (cfTimerRef.current) clearTimeout(cfTimerRef.current);
    cfTimerRef.current = setTimeout(async () => {
      const needed = form.nome && form.cognome && form.data_nascita && form.genere;
      const place = form.nato_all_estero ? form.paese_nascita : form.luogo_nascita_comune;
      if (!needed || !place) return;
      if (!["M", "F"].includes(form.genere)) return;
      try {
        const res = await axios.post(`${API}/utils/compute-cf`, {
          nome: form.nome,
          cognome: form.cognome,
          genere: form.genere,
          data_nascita: form.data_nascita,
          nato_all_estero: !!form.nato_all_estero,
          luogo_nascita_comune: form.luogo_nascita_comune,
          paese_nascita: form.paese_nascita,
        }, { withCredentials: true });
        if (res.data && res.data.cf) {
          setForm((f) => ({ ...f, codice_fiscale: res.data.cf }));
          setCfAutoComputed(true);
        }
      } catch { /* ignore */ }
    }, 500);
    return () => cfTimerRef.current && clearTimeout(cfTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.nome, form.cognome, form.data_nascita, form.genere, form.nato_all_estero, form.paese_nascita, form.luogo_nascita_comune]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    const requiredBase = ["nome", "cognome", "data_nascita", "genere", "codice_fiscale", "telefono",
                          "indirizzo", "citta", "cap", "provincia_residenza"];
    for (const f of requiredBase) {
      if (!form[f] || !String(form[f]).trim()) {
        setError("Compila tutti i campi obbligatori");
        return;
      }
    }
    if (form.nato_all_estero) {
      if (!form.paese_nascita) { setError("Seleziona il paese di nascita"); return; }
    } else {
      if (!form.luogo_nascita_provincia || !form.luogo_nascita_comune) {
        setError("Seleziona provincia e comune di nascita");
        return;
      }
    }
    if (!cfValido(form.codice_fiscale)) {
      setError("Codice Fiscale non valido (16 caratteri alfanumerici)");
      return;
    }
    if (!capValido(form.cap)) {
      setError("CAP non valido (5 cifre)");
      return;
    }

    setLoading(true);
    try {
      const payload = { ...form, codice_fiscale: form.codice_fiscale.toUpperCase().trim() };
      // If estero, clear provincia/comune nascita to avoid stale data
      if (form.nato_all_estero) {
        payload.luogo_nascita_provincia = "";
        payload.luogo_nascita_comune = "";
      } else {
        payload.paese_nascita = "";
      }
      const res = await axios.put(`${API}/pazienti/profilo/me`, payload, { withCredentials: true });
      onComplete(res.data);
    } catch (err) {
      const d = err.response?.data?.detail;
      setError(typeof d === "string" ? d : "Errore nel salvataggio dei dati");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-3 bg-white border border-[#0A0A0A]/15 rounded-xl text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] text-sm";
  const labelCls = "block text-xs tracking-[0.15em] uppercase text-[#0A0A0A]/60 mb-2";

  return (
    <div data-testid="step-dati-fiscali">
      <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center mb-5">
        <FileCheck className="w-5 h-5 text-[#0A0A0A]" />
      </div>
      <h2 className="font-serif text-3xl text-[#0A0A0A] leading-tight">Completa i tuoi dati</h2>
      <p className="mt-2 text-sm text-[#0A0A0A]/70">
        Dati necessari per la fatturazione e il rispetto delle normative italiane.
      </p>

      {error && (
        <div data-testid="dati-fiscali-error" className="mt-5 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-5">
        <div>
          <div className="text-xs tracking-[0.2em] uppercase text-[#0A0A0A] mb-3">Dati anagrafici</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Nome *</label>
              <input data-testid="df-nome" required className={inputCls} value={form.nome} onChange={(e) => set("nome", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Cognome *</label>
              <input data-testid="df-cognome" required className={inputCls} value={form.cognome} onChange={(e) => set("cognome", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Data di nascita *</label>
              <input data-testid="df-data-nascita" type="date" required className={inputCls} value={form.data_nascita} onChange={(e) => set("data_nascita", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Genere *</label>
              <select data-testid="df-genere" required className={inputCls} value={form.genere} onChange={(e) => set("genere", e.target.value)}>
                <option value="">Seleziona</option>
                {GENERI.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs tracking-[0.2em] uppercase text-[#0A0A0A] mb-3">Luogo di nascita</div>

          <label className="flex items-center gap-3 mb-4 text-sm text-[#0A0A0A]/85 cursor-pointer">
            <input
              data-testid="df-estero-checkbox"
              type="checkbox"
              checked={form.nato_all_estero}
              onChange={(e) => set("nato_all_estero", e.target.checked)}
              className="accent-[#0A0A0A] w-4 h-4"
            />
            <span>Sono nato/a all'estero</span>
          </label>

          {form.nato_all_estero ? (
            <div>
              <label className={labelCls}>Paese di nascita *</label>
              <select data-testid="df-paese" required className={inputCls} value={form.paese_nascita} onChange={(e) => set("paese_nascita", e.target.value)}>
                <option value="">Seleziona un paese</option>
                {PAESI_ESTERI.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Provincia *</label>
                <select data-testid="df-prov-nascita" required className={inputCls} value={form.luogo_nascita_provincia} onChange={(e) => set("luogo_nascita_provincia", e.target.value)}>
                  <option value="">Seleziona</option>
                  {PROVINCE_IT.map((p) => <option key={p.sigla} value={p.sigla}>{p.nome} ({p.sigla})</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Comune *</label>
                <input data-testid="df-comune-nascita" required className={inputCls} value={form.luogo_nascita_comune} onChange={(e) => set("luogo_nascita_comune", e.target.value)} placeholder="es. Milano" />
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={labelCls + " mb-0"}>Codice Fiscale *</label>
            {cfAutoComputed && (
              <span className="flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase text-[#0A0A0A]">
                <Sparkles className="w-3 h-3" /> Calcolato automaticamente
              </span>
            )}
          </div>
          <input
            data-testid="df-cf"
            required maxLength={16}
            className={`${inputCls} font-mono tracking-wider uppercase`}
            value={form.codice_fiscale}
            onChange={(e) => { set("codice_fiscale", e.target.value.toUpperCase()); setCfAutoComputed(false); }}
            placeholder="RSSMRA90E15H501Z"
          />
          <p className="mt-2 text-xs text-[#0A0A0A]/40">
            Compila nome, cognome, data di nascita, genere e luogo di nascita — calcoleremo il tuo CF automaticamente.
          </p>
        </div>

        <div>
          <label className={labelCls}>Telefono *</label>
          <input data-testid="df-telefono" required type="tel" className={inputCls} value={form.telefono} onChange={(e) => set("telefono", e.target.value)} placeholder="+39 333 1234567" />
        </div>

        <div>
          <div className="text-xs tracking-[0.2em] uppercase text-[#0A0A0A] mb-3">Indirizzo di residenza</div>
          <div className="space-y-3">
            <div>
              <label className={labelCls}>Indirizzo *</label>
              <input data-testid="df-indirizzo" required className={inputCls} value={form.indirizzo} onChange={(e) => set("indirizzo", e.target.value)} placeholder="Via Roma 12" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className={labelCls}>Città *</label>
                <input data-testid="df-citta" required className={inputCls} value={form.citta} onChange={(e) => set("citta", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>CAP *</label>
                <input data-testid="df-cap" required maxLength={5} className={inputCls} value={form.cap} onChange={(e) => set("cap", e.target.value.replace(/\D/g, ""))} placeholder="00100" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Provincia *</label>
              <select data-testid="df-prov-res" required className={inputCls} value={form.provincia_residenza} onChange={(e) => set("provincia_residenza", e.target.value)}>
                <option value="">Seleziona</option>
                {PROVINCE_IT.map((p) => <option key={p.sigla} value={p.sigla}>{p.nome} ({p.sigla})</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="pt-3 text-xs text-[#0A0A0A]/40 leading-relaxed">
          I tuoi dati saranno trattati ai sensi del GDPR (Reg. UE 2016/679) e utilizzati esclusivamente
          per la fatturazione e la gestione della seduta.
        </div>

        <button
          data-testid="df-submit"
          type="submit" disabled={loading}
          className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 bg-[#0A0A0A] hover:bg-[#1C1C1C] disabled:opacity-40 text-white font-medium rounded-md transition-all"
        >
          {loading ? "Salvataggio..." : "Continua al pagamento"}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}
