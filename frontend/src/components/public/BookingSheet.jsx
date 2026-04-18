import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import { API, useAuth } from "@/contexts/AuthContext";
import { X, Check, Mail, Lock, User as UserIcon, CreditCard, ShieldCheck, ArrowRight } from "lucide-react";

const GIORNI_IT = ["Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato","Domenica"];

function formatSlot(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const giorno = GIORNI_IT[(d.getDay() + 6) % 7];
    const dateStr = d.toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
    const timeStr = d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
    return `${giorno} ${dateStr} · ${timeStr}`;
  } catch { return iso; }
}

// Steps: review → auth (login or register) → otp → payment → success
export default function BookingSheet({ open, onClose, terapista, slot, currentUser }) {
  const { login, refreshUser } = useAuth();
  const [step, setStep] = useState("review");
  const [mode, setMode] = useState("register"); // register | login
  const [form, setForm] = useState({ nome: "", cognome: "", email: "", password: "", otp: "", privacy: false });
  const [otpDev, setOtpDev] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setError("");
      if (currentUser && currentUser.role === "paziente") {
        setStep("payment");
      } else {
        setStep("review");
      }
    }
  }, [open, currentUser]);

  if (!open || !terapista || !slot) return null;

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.privacy) { setError("Devi accettare la Privacy Policy"); return; }
    if (form.password.length < 8) { setError("La password deve avere almeno 8 caratteri"); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/register`, {
        email: form.email, password: form.password,
        nome: form.nome, cognome: form.cognome,
        role: "paziente", consenso_privacy: true,
      });
      setOtpDev(res.data.otp_dev || "");
      setStep("otp");
    } catch (err) {
      const d = err.response?.data?.detail;
      setError(typeof d === "string" ? d : "Errore nella registrazione");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const u = await login(form.email, form.password);
      if (u.role !== "paziente") {
        setError("Solo gli utenti pazienti possono prenotare");
        return;
      }
      setStep("payment");
    } catch (err) {
      const d = err.response?.data?.detail;
      setError(typeof d === "string" ? d : "Credenziali non valide");
    } finally {
      setLoading(false);
    }
  };

  const handleOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post(`${API}/auth/verify-otp`, { email: form.email, otp_code: form.otp }, { withCredentials: true });
      await refreshUser();
      setStep("payment");
    } catch (err) {
      const d = err.response?.data?.detail;
      setError(typeof d === "string" ? d : "Codice OTP non valido");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // MOCKED PAYMENT — simulate success
      const pazienteRes = await axios.get(`${API}/pazienti/profilo/me`, { withCredentials: true });
      const paziente_id = pazienteRes.data._id;

      await axios.post(`${API}/public/prenota`, {
        terapeuta_id: terapista._id,
        paziente_id,
        data_ora: slot.data_ora,
        durata_minuti: 50,
        tipo: "online",
        note: "Pagamento mock — da sostituire con Nexi XPay",
      }, { withCredentials: true });
      setStep("success");
    } catch (err) {
      const d = err.response?.data?.detail;
      setError(typeof d === "string" ? d : "Errore nella prenotazione");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-sm flex items-stretch justify-end"
        onClick={onClose}
        data-testid="booking-sheet"
      >
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "tween", duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-xl bg-[#111111] border-l border-white/10 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-[#111111]/80 backdrop-blur-xl border-b border-white/5 px-6 lg:px-10 py-5 flex items-center justify-between">
            <div>
              <div className="text-xs tracking-[0.2em] uppercase text-[#D4A017]">Prenotazione</div>
              <div className="text-sm text-[#F4F1ED] mt-1">Dr. {terapista.nome} {terapista.cognome}</div>
            </div>
            <button onClick={onClose} data-testid="booking-close" aria-label="Chiudi" className="p-2 text-[#E6E2D8]/60 hover:text-[#F4F1ED]">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 lg:px-10 py-8">
            {/* Progress */}
            <div className="flex items-center gap-2 mb-10">
              {["review","auth","otp","payment","success"]
                .filter((s) => s !== "otp" || mode === "register")
                .map((s) => {
                  const order = ["review","auth","otp","payment","success"];
                  const cur = order.indexOf(step);
                  const idx = order.indexOf(s);
                  return (
                    <div
                      key={s}
                      className={`h-1 flex-1 rounded-full ${idx <= cur ? "bg-[#D4A017]" : "bg-white/10"}`}
                    />
                  );
                })}
            </div>

            {error && (
              <div data-testid="booking-error" className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* REVIEW */}
            {step === "review" && (
              <div data-testid="step-review">
                <h2 className="font-serif text-3xl text-[#F4F1ED] leading-tight">Riepilogo</h2>
                <div className="mt-6 p-5 bg-[#1C2A33]/40 border border-white/10 rounded-2xl space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#E6E2D8]/50">Terapeuta</span>
                    <span className="text-[#F4F1ED]">Dr. {terapista.nome} {terapista.cognome}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#E6E2D8]/50">Data &amp; Ora</span>
                    <span className="text-[#F4F1ED] text-right">{formatSlot(slot.data_ora)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#E6E2D8]/50">Durata</span>
                    <span className="text-[#F4F1ED]">50 minuti</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#E6E2D8]/50">Modalità</span>
                    <span className="text-[#F4F1ED]">Online</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-white/10">
                    <span className="text-[#E6E2D8]/50">Totale</span>
                    <span className="font-serif text-2xl text-[#D4A017]">€{terapista.prezzo_sessione || 90}</span>
                  </div>
                </div>

                <button
                  data-testid="booking-continue"
                  onClick={() => setStep("auth")}
                  className="mt-8 w-full inline-flex items-center justify-center gap-3 px-6 py-4 bg-[#D4A017] hover:bg-[#E5B942] text-[#111111] font-medium rounded-full transition-all"
                >
                  Continua <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* AUTH */}
            {step === "auth" && (
              <div data-testid="step-auth">
                <h2 className="font-serif text-3xl text-[#F4F1ED] leading-tight">
                  {mode === "register" ? "Crea il tuo account" : "Accedi"}
                </h2>
                <p className="mt-2 text-sm text-[#E6E2D8]/60">
                  {mode === "register"
                    ? "Ci servono pochi dati per completare la prenotazione."
                    : "Hai già un account?"}
                </p>

                <div className="mt-6 flex gap-2 p-1 bg-[#1C2A33]/40 border border-white/10 rounded-full w-fit">
                  <button
                    onClick={() => setMode("register")}
                    data-testid="mode-register"
                    className={`px-5 py-2 rounded-full text-sm transition-all ${mode === "register" ? "bg-[#D4A017] text-[#111111]" : "text-[#E6E2D8]/60"}`}
                  >
                    Registrati
                  </button>
                  <button
                    onClick={() => setMode("login")}
                    data-testid="mode-login"
                    className={`px-5 py-2 rounded-full text-sm transition-all ${mode === "login" ? "bg-[#D4A017] text-[#111111]" : "text-[#E6E2D8]/60"}`}
                  >
                    Accedi
                  </button>
                </div>

                <form onSubmit={mode === "register" ? handleRegister : handleLogin} className="mt-8 space-y-4">
                  {mode === "register" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs tracking-[0.15em] uppercase text-[#E6E2D8]/50 mb-2">Nome</label>
                        <input
                          data-testid="booking-nome"
                          required type="text" value={form.nome}
                          onChange={(e) => setForm({ ...form, nome: e.target.value })}
                          className="w-full px-4 py-3 bg-[#1C2A33]/30 border border-white/10 rounded-xl text-[#F4F1ED] focus:outline-none focus:border-[#D4A017]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs tracking-[0.15em] uppercase text-[#E6E2D8]/50 mb-2">Cognome</label>
                        <input
                          data-testid="booking-cognome"
                          required type="text" value={form.cognome}
                          onChange={(e) => setForm({ ...form, cognome: e.target.value })}
                          className="w-full px-4 py-3 bg-[#1C2A33]/30 border border-white/10 rounded-xl text-[#F4F1ED] focus:outline-none focus:border-[#D4A017]"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs tracking-[0.15em] uppercase text-[#E6E2D8]/50 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E6E2D8]/40" />
                      <input
                        data-testid="booking-email"
                        required type="email" value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-[#1C2A33]/30 border border-white/10 rounded-xl text-[#F4F1ED] focus:outline-none focus:border-[#D4A017]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs tracking-[0.15em] uppercase text-[#E6E2D8]/50 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E6E2D8]/40" />
                      <input
                        data-testid="booking-password"
                        required type="password" value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder={mode === "register" ? "Min. 8 caratteri" : ""}
                        className="w-full pl-10 pr-4 py-3 bg-[#1C2A33]/30 border border-white/10 rounded-xl text-[#F4F1ED] focus:outline-none focus:border-[#D4A017]"
                      />
                    </div>
                  </div>

                  {mode === "register" && (
                    <label className="flex items-start gap-3 text-sm text-[#E6E2D8]/70 cursor-pointer">
                      <input
                        data-testid="booking-privacy"
                        type="checkbox" checked={form.privacy}
                        onChange={(e) => setForm({ ...form, privacy: e.target.checked })}
                        className="mt-1 accent-[#D4A017]"
                      />
                      <span>
                        Accetto la <span className="text-[#D4A017] underline">Privacy Policy</span> e il trattamento dei dati ai sensi del GDPR.
                      </span>
                    </label>
                  )}

                  <button
                    data-testid="booking-auth-submit"
                    type="submit" disabled={loading}
                    className="w-full mt-4 inline-flex items-center justify-center gap-3 px-6 py-4 bg-[#D4A017] hover:bg-[#E5B942] disabled:opacity-40 text-[#111111] font-medium rounded-full transition-all"
                  >
                    {loading ? "Attendere..." : mode === "register" ? "Crea account e continua" : "Accedi e continua"}
                  </button>
                </form>
              </div>
            )}

            {/* OTP */}
            {step === "otp" && (
              <div data-testid="step-otp">
                <div className="w-14 h-14 rounded-full bg-[#D4A017]/10 flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6 text-[#D4A017]" />
                </div>
                <h2 className="font-serif text-3xl text-[#F4F1ED] leading-tight">Verifica l'email</h2>
                <p className="mt-3 text-sm text-[#E6E2D8]/60">
                  Abbiamo inviato un codice a 6 cifre a <strong className="text-[#F4F1ED]">{form.email}</strong>.
                </p>

                {otpDev && (
                  <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-sm" data-testid="otp-dev">
                    <strong>Dev:</strong> codice OTP {otpDev}
                  </div>
                )}

                <form onSubmit={handleOTP} className="mt-8">
                  <input
                    data-testid="booking-otp"
                    type="text" maxLength={6}
                    value={form.otp}
                    onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                    placeholder="000000"
                    className="w-full text-center text-3xl font-mono tracking-[0.5em] py-4 bg-[#1C2A33]/30 border border-white/10 rounded-xl text-[#F4F1ED] focus:outline-none focus:border-[#D4A017]"
                  />
                  <button
                    data-testid="booking-otp-submit"
                    type="submit" disabled={loading || form.otp.length !== 6}
                    className="w-full mt-6 inline-flex items-center justify-center gap-3 px-6 py-4 bg-[#D4A017] hover:bg-[#E5B942] disabled:opacity-40 text-[#111111] font-medium rounded-full"
                  >
                    {loading ? "Verifica..." : "Verifica e continua"}
                  </button>
                </form>
              </div>
            )}

            {/* PAYMENT (mocked) */}
            {step === "payment" && (
              <div data-testid="step-payment">
                <h2 className="font-serif text-3xl text-[#F4F1ED] leading-tight">Pagamento</h2>
                <p className="mt-2 text-sm text-[#E6E2D8]/60">Saldo sicuro con cifratura SSL. (Mock — integreremo Nexi XPay)</p>

                <div className="mt-6 p-5 bg-[#1C2A33]/40 border border-white/10 rounded-2xl space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#E6E2D8]/50">Seduta con</span>
                    <span className="text-[#F4F1ED]">Dr. {terapista.nome} {terapista.cognome}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#E6E2D8]/50">Quando</span>
                    <span className="text-[#F4F1ED] text-right">{formatSlot(slot.data_ora)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-white/10">
                    <span className="text-[#E6E2D8]/50">Totale da pagare</span>
                    <span className="font-serif text-2xl text-[#D4A017]">€{terapista.prezzo_sessione || 90}</span>
                  </div>
                </div>

                <form onSubmit={handlePayment} className="mt-8 space-y-4">
                  <div>
                    <label className="block text-xs tracking-[0.15em] uppercase text-[#E6E2D8]/50 mb-2">Numero carta</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E6E2D8]/40" />
                      <input
                        data-testid="mock-card-number"
                        type="text" placeholder="4242 4242 4242 4242" defaultValue="4242 4242 4242 4242"
                        className="w-full pl-10 pr-4 py-3 bg-[#1C2A33]/30 border border-white/10 rounded-xl text-[#F4F1ED]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs tracking-[0.15em] uppercase text-[#E6E2D8]/50 mb-2">Scadenza</label>
                      <input data-testid="mock-card-exp" type="text" placeholder="12/28" defaultValue="12/28" className="w-full px-4 py-3 bg-[#1C2A33]/30 border border-white/10 rounded-xl text-[#F4F1ED]" />
                    </div>
                    <div>
                      <label className="block text-xs tracking-[0.15em] uppercase text-[#E6E2D8]/50 mb-2">CVC</label>
                      <input data-testid="mock-card-cvc" type="text" placeholder="123" defaultValue="123" className="w-full px-4 py-3 bg-[#1C2A33]/30 border border-white/10 rounded-xl text-[#F4F1ED]" />
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl text-amber-300/80 text-xs">
                    <strong>Modalità demo:</strong> Nessun addebito verrà effettuato. Integrazione Nexi XPay in arrivo.
                  </div>

                  <button
                    data-testid="booking-pay-submit"
                    type="submit" disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 bg-[#D4A017] hover:bg-[#E5B942] disabled:opacity-40 text-[#111111] font-medium rounded-full"
                  >
                    {loading ? "Elaborazione..." : `Paga €${terapista.prezzo_sessione || 90}`}
                  </button>
                </form>
              </div>
            )}

            {/* SUCCESS */}
            {step === "success" && (
              <div data-testid="step-success" className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="w-20 h-20 mx-auto rounded-full bg-[#D4A017]/10 flex items-center justify-center mb-8"
                >
                  <Check className="w-10 h-10 text-[#D4A017]" strokeWidth={2.5} />
                </motion.div>
                <h2 className="font-serif text-4xl text-[#F4F1ED]">Prenotazione confermata</h2>
                <p className="mt-4 text-[#E6E2D8]/60 max-w-sm mx-auto leading-relaxed">
                  Ti abbiamo inviato un'email di conferma con tutti i dettagli. Il Dr. {terapista.cognome} ti aspetta il <strong className="text-[#F4F1ED]">{formatSlot(slot.data_ora)}</strong>.
                </p>
                <button
                  data-testid="booking-go-dashboard"
                  onClick={() => { onClose(); window.location.href = "/paziente"; }}
                  className="mt-10 inline-flex items-center gap-3 px-8 py-4 bg-[#D4A017] hover:bg-[#E5B942] text-[#111111] font-medium rounded-full"
                >
                  Vai alla mia area personale <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
