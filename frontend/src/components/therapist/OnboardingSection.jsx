import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { API } from "@/contexts/AuthContext";
import { ShieldCheck, Upload, FileCheck2, Smartphone, Check, AlertCircle } from "lucide-react";

const DOC_TYPES = [
  { key: "cv", label: "Curriculum Vitae", hint: "CV aggiornato (PDF/JPG/PNG — max 10MB)" },
  { key: "assicurazione", label: "Assicurazione Professionale", hint: "Polizza RC o dichiarazione della compagnia" },
  { key: "laurea", label: "Laurea / Abilitazione", hint: "Diploma di laurea o certificato di abilitazione" },
];

export default function OnboardingSection({ profilo, currentUser, onRefresh }) {
  const [docs, setDocs] = useState({});
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [uploading, setUploading] = useState({});
  const [error, setError] = useState("");
  const fileRefs = useRef({});

  // SMS OTP
  const [smsPhone, setSmsPhone] = useState(currentUser?.telefono || "");
  const [smsOtp, setSmsOtp] = useState("");
  const [smsOtpDev, setSmsOtpDev] = useState("");
  const [smsSending, setSmsSending] = useState(false);
  const [smsStep, setSmsStep] = useState("phone"); // phone | code | done
  const phoneVerified = Boolean(currentUser?.telefono_verificato);

  // DPR 445
  const [dprChecked, setDprChecked] = useState(false);
  const [dprSigning, setDprSigning] = useState(false);

  const fetchDocs = useCallback(async () => {
    setLoadingDocs(true);
    try {
      const r = await axios.get(`${API}/terapisti/me/documenti`, { withCredentials: true });
      setDocs(r.data?.documenti || {});
    } catch (e) {
      /* noop */
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);
  useEffect(() => {
    setSmsPhone(currentUser?.telefono || "");
    if (currentUser?.telefono_verificato) setSmsStep("done");
  }, [currentUser?.telefono, currentUser?.telefono_verificato]);

  const handleUpload = async (tipo, file) => {
    if (!file) return;
    setError("");
    setUploading((u) => ({ ...u, [tipo]: true }));
    try {
      const fd = new FormData();
      fd.append("file", file);
      await axios.post(`${API}/terapisti/me/documenti/${tipo}`, fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchDocs();
    } catch (err) {
      const d = err.response?.data?.detail;
      setError(typeof d === "string" ? d : "Errore caricamento documento");
    } finally {
      setUploading((u) => ({ ...u, [tipo]: false }));
    }
  };

  const handleSmsSend = async () => {
    setError("");
    if (!smsPhone || smsPhone.length < 8) { setError("Numero non valido"); return; }
    setSmsSending(true);
    try {
      const r = await axios.post(`${API}/sms/send-otp`, { phone: smsPhone, context: "verifica-terapeuta" }, { withCredentials: true });
      setSmsOtpDev(r.data?.otp_dev || "");
      setSmsStep("code");
    } catch (err) {
      const d = err.response?.data?.detail;
      setError(typeof d === "string" ? d : "Errore invio SMS");
    } finally {
      setSmsSending(false);
    }
  };

  const handleSmsVerify = async () => {
    setError("");
    setSmsSending(true);
    try {
      await axios.post(`${API}/sms/verify-otp`, { phone: smsPhone, otp_code: smsOtp }, { withCredentials: true });
      setSmsStep("done");
      onRefresh && onRefresh();
    } catch (err) {
      const d = err.response?.data?.detail;
      setError(typeof d === "string" ? d : "Codice SMS non valido");
    } finally {
      setSmsSending(false);
    }
  };

  const allDocsUploaded = DOC_TYPES.every((d) => docs[d.key]);
  const canSignDpr = allDocsUploaded && phoneVerified && dprChecked && !profilo?.autocertificazione_dpr445;

  const handleSignDpr = async () => {
    setError("");
    setDprSigning(true);
    try {
      await axios.post(`${API}/terapisti/me/autocertificazione-dpr445`, {}, { withCredentials: true });
      onRefresh && onRefresh();
    } catch (err) {
      const d = err.response?.data?.detail;
      setError(typeof d === "string" ? d : "Errore firma autocertificazione");
    } finally {
      setDprSigning(false);
    }
  };

  const alreadySigned = Boolean(profilo?.autocertificazione_dpr445 || profilo?.autocertificazione_firmata);

  return (
    <div className="space-y-5" data-testid="therapist-onboarding">
      <div className="rounded-2xl border border-[rgba(28,28,28,0.08)] bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <ShieldCheck className={`w-7 h-7 flex-shrink-0 mt-0.5 ${alreadySigned ? "text-green-600" : "text-[#D4A017]"}`} />
          <div className="flex-1">
            <h3 className="font-semibold text-[#1C1C1C] font-[Outfit] text-lg">
              {alreadySigned ? "Profilo verificato" : "Verifica profilo professionista"}
            </h3>
            <p className="text-sm text-[rgba(28,28,28,0.6)] mt-1">
              {alreadySigned
                ? "Hai completato tutti i passi richiesti. In attesa di verifica documenti da parte dell'amministratore per diventare pubblicamente visibile."
                : "Per essere visibile ai pazienti, carica i documenti, verifica il numero e firma l'autocertificazione (DPR 445/2000)."}
            </p>
            {profilo?.documenti_verificati && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-medium">
                <Check className="w-3.5 h-3.5" /> Documenti verificati dall'amministratore · Profilo pubblico attivo
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div data-testid="onboarding-error" className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> <span>{error}</span>
        </div>
      )}

      {/* Step 1: Documenti */}
      <div className="rounded-2xl border border-[rgba(28,28,28,0.08)] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${allDocsUploaded ? "bg-green-100 text-green-700" : "bg-[#D4A017]/10 text-[#D4A017]"}`}>
            {allDocsUploaded ? <Check className="w-4 h-4" /> : "1"}
          </div>
          <h3 className="font-semibold text-[#1C1C1C] font-[Outfit]">Carica i tuoi documenti</h3>
        </div>

        {loadingDocs ? (
          <div className="text-sm text-[rgba(28,28,28,0.5)]">Caricamento...</div>
        ) : (
          <div className="space-y-3">
            {DOC_TYPES.map((d) => {
              const meta = docs[d.key];
              const isUp = uploading[d.key];
              return (
                <div key={d.key} className="flex items-center gap-3 p-3 rounded-xl border border-[rgba(28,28,28,0.08)] bg-[#FDFBF7]">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm font-medium text-[#1C1C1C]">
                      {meta ? <FileCheck2 className="w-4 h-4 text-green-600" /> : <Upload className="w-4 h-4 text-[rgba(28,28,28,0.4)]" />}
                      {d.label}
                    </div>
                    <div className="text-xs text-[rgba(28,28,28,0.55)] mt-0.5 truncate">
                      {meta ? `${meta.filename} · ${(meta.size/1024).toFixed(1)} KB` : d.hint}
                    </div>
                  </div>
                  <input
                    ref={(el) => { fileRefs.current[d.key] = el; }}
                    type="file" accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    data-testid={`doc-file-${d.key}`}
                    onChange={(e) => handleUpload(d.key, e.target.files?.[0])}
                  />
                  <button
                    type="button" disabled={isUp}
                    data-testid={`doc-upload-${d.key}`}
                    onClick={() => fileRefs.current[d.key]?.click()}
                    className="px-3 py-1.5 text-xs font-medium rounded-full border border-[#D4A017] text-[#D4A017] hover:bg-[#D4A017] hover:text-white transition-colors disabled:opacity-50"
                  >
                    {isUp ? "Carico..." : meta ? "Sostituisci" : "Carica"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Step 2: SMS OTP */}
      <div className="rounded-2xl border border-[rgba(28,28,28,0.08)] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${phoneVerified ? "bg-green-100 text-green-700" : "bg-[#D4A017]/10 text-[#D4A017]"}`}>
            {phoneVerified ? <Check className="w-4 h-4" /> : "2"}
          </div>
          <h3 className="font-semibold text-[#1C1C1C] font-[Outfit]">Verifica il tuo numero di telefono</h3>
        </div>

        {phoneVerified ? (
          <div className="text-sm text-[rgba(28,28,28,0.7)] flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-green-600" />
            Numero verificato: <strong className="text-[#1C1C1C]">{currentUser?.telefono || smsPhone}</strong>
          </div>
        ) : smsStep === "phone" ? (
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              data-testid="onb-sms-phone"
              type="tel" value={smsPhone}
              onChange={(e) => setSmsPhone(e.target.value)}
              placeholder="+39 351 1234567"
              className="flex-1 px-3 py-2.5 border border-[rgba(28,28,28,0.15)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
            />
            <button
              data-testid="onb-sms-send"
              type="button" disabled={smsSending}
              onClick={handleSmsSend}
              className="px-5 py-2.5 text-sm font-medium rounded-full bg-[#D4A017] hover:bg-[#B38612] text-white transition-colors disabled:opacity-50"
            >
              {smsSending ? "Invio..." : "Invia codice SMS"}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-[rgba(28,28,28,0.7)]">
              Codice inviato a <strong className="text-[#1C1C1C]">{smsPhone}</strong>.
              {smsOtpDev && (
                <span className="block mt-1 text-amber-700 text-xs bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 inline-block">
                  Dev fallback: <code className="font-mono">{smsOtpDev}</code>
                </span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                data-testid="onb-sms-code"
                inputMode="numeric" maxLength={6} value={smsOtp}
                onChange={(e) => setSmsOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="flex-1 px-3 py-2.5 border border-[rgba(28,28,28,0.15)] rounded-xl text-sm text-center tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
              />
              <button
                data-testid="onb-sms-verify"
                type="button" disabled={smsSending}
                onClick={handleSmsVerify}
                className="px-5 py-2.5 text-sm font-medium rounded-full bg-[#D4A017] hover:bg-[#B38612] text-white transition-colors disabled:opacity-50"
              >
                {smsSending ? "Verifica..." : "Verifica"}
              </button>
              <button
                type="button"
                onClick={() => { setSmsStep("phone"); setSmsOtp(""); }}
                className="px-3 py-2.5 text-xs text-[rgba(28,28,28,0.5)] hover:text-[#D4A017]"
              >
                Cambia numero
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Step 3: Autocertificazione DPR 445/2000 */}
      <div className="rounded-2xl border border-[rgba(28,28,28,0.08)] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${alreadySigned ? "bg-green-100 text-green-700" : "bg-[#D4A017]/10 text-[#D4A017]"}`}>
            {alreadySigned ? <Check className="w-4 h-4" /> : "3"}
          </div>
          <h3 className="font-semibold text-[#1C1C1C] font-[Outfit]">Autocertificazione (DPR 445/2000)</h3>
        </div>

        {alreadySigned ? (
          <div className="text-sm text-[rgba(28,28,28,0.7)]">
            Hai firmato l'autocertificazione il{" "}
            <strong className="text-[#1C1C1C]">
              {profilo?.autocertificazione_data ? new Date(profilo.autocertificazione_data).toLocaleDateString("it-IT") : "—"}
            </strong>.
          </div>
        ) : (
          <>
            <label className="flex items-start gap-3 text-sm text-[rgba(28,28,28,0.75)] leading-relaxed cursor-pointer">
              <input
                data-testid="dpr445-checkbox"
                type="checkbox" checked={dprChecked}
                onChange={(e) => setDprChecked(e.target.checked)}
                disabled={!allDocsUploaded || !phoneVerified}
                className="mt-0.5 accent-[#D4A017]"
              />
              <span>
                Il sottoscritto, consapevole delle sanzioni penali previste dall'<strong>art. 76 del DPR 28 dicembre 2000, n. 445</strong>,
                per le ipotesi di falsità in atti e dichiarazioni mendaci, dichiara sotto la propria responsabilità che
                i dati e i documenti caricati (CV, assicurazione professionale, laurea/abilitazione) sono <strong>veritieri, completi e corrispondenti al vero</strong>.
                Autorizzo FunzionaBene alla verifica dei dati ai sensi della normativa vigente.
              </span>
            </label>

            {(!allDocsUploaded || !phoneVerified) && (
              <div className="mt-3 text-xs text-[rgba(28,28,28,0.5)]">
                {!allDocsUploaded && <div>• Prima carica tutti i documenti richiesti</div>}
                {!phoneVerified && <div>• Prima verifica il tuo numero di telefono via SMS</div>}
              </div>
            )}

            <button
              data-testid="dpr445-sign"
              type="button" disabled={!canSignDpr || dprSigning}
              onClick={handleSignDpr}
              className="mt-4 px-5 py-2.5 text-sm font-medium rounded-full bg-[#D4A017] hover:bg-[#B38612] text-white transition-colors disabled:opacity-50"
            >
              {dprSigning ? "Firma in corso..." : "Firma autocertificazione"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
