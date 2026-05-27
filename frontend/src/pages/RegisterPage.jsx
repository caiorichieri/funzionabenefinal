import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API } from "@/contexts/AuthContext";
import { Eye, EyeOff, User, Mail, Lock, UserCheck } from "lucide-react";
import Mascotte from "@/components/shared/Mascotte";

const ROLES = [
  { id: "paziente", label: "Sono un Paziente", desc: "Cerco supporto psicologico/sessuologico" },
  { id: "terapeuta", label: "Sono un Terapeuta", desc: "Voglio offrire i miei servizi professionali" }
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [form, setForm] = useState({ nome: "", cognome: "", email: "", password: "", conferma_password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRoleSelect = (r) => { setRole(r); setStep(2); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.conferma_password) { setError("Le password non coincidono"); return; }
    if (form.password.length < 8) { setError("La password deve avere almeno 8 caratteri"); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/register`, {
        email: form.email, password: form.password,
        nome: form.nome, cognome: form.cognome,
        role, consenso_privacy: true
      });
      navigate("/verifica-otp", { state: { email: form.email, otp_dev: res.data.otp_dev } });
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Errore durante la registrazione");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Mascotte name="saltitante" theme="gold" size={90} animation="wiggle" />
          </div>
          <h1 className="text-3xl font-bold text-[#1C1C1C] font-[Outfit]">Crea il tuo account</h1>
          <p className="text-[rgba(28,28,28,0.6)] mt-2">Il primo passo è già qui.</p>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-center text-[#1C1C1C] font-medium mb-6">Chi sei?</p>
            {ROLES.map(r => (
              <button
                key={r.id}
                data-testid={`role-${r.id}`}
                onClick={() => handleRoleSelect(r.id)}
                className="w-full p-5 border-2 border-[rgba(28,28,28,0.1)] rounded-2xl text-left hover:border-[#D4A017] hover:bg-[#D4A017]/5 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#D4A017]/10 group-hover:bg-[#D4A017]/20 flex items-center justify-center">
                    {r.id === "paziente" ? <User className="w-5 h-5 text-[#D4A017]" /> : <UserCheck className="w-5 h-5 text-[#D4A017]" />}
                  </div>
                  <div>
                    <div className="font-semibold text-[#1C1C1C] font-[Outfit]">{r.label}</div>
                    <div className="text-sm text-[rgba(28,28,28,0.6)]">{r.desc}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <>
            <div className="mb-4">
              <button onClick={() => setStep(1)} className="text-sm text-[rgba(28,28,28,0.6)] hover:text-[#D4A017] flex items-center gap-1">
                ← Cambia ruolo
              </button>
              <div className="mt-2 inline-flex items-center gap-2 bg-[#D4A017]/10 text-[#D4A017] text-sm px-3 py-1 rounded-full">
                {role === "paziente" ? <User className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                {role === "paziente" ? "Paziente" : "Terapeuta"}
              </div>
            </div>

            {error && (
              <div data-testid="register-error" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-1">Nome</label>
                  <input
                    data-testid="register-nome"
                    type="text" value={form.nome}
                    onChange={e => setForm({ ...form, nome: e.target.value })}
                    required placeholder="Mario"
                    className="w-full px-3 py-3 border border-[rgba(28,28,28,0.15)] rounded-xl bg-white text-[#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-1">Cognome</label>
                  <input
                    data-testid="register-cognome"
                    type="text" value={form.cognome}
                    onChange={e => setForm({ ...form, cognome: e.target.value })}
                    required placeholder="Rossi"
                    className="w-full px-3 py-3 border border-[rgba(28,28,28,0.15)] rounded-xl bg-white text-[#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1C1C1C] mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(28,28,28,0.4)] w-5 h-5" />
                  <input
                    data-testid="register-email"
                    type="email" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required placeholder="mario.rossi@email.it"
                    className="w-full pl-10 pr-4 py-3 border border-[rgba(28,28,28,0.15)] rounded-xl bg-white text-[#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1C1C1C] mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(28,28,28,0.4)] w-5 h-5" />
                  <input
                    data-testid="register-password"
                    type={showPass ? "text" : "password"} value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required placeholder="Minimo 8 caratteri"
                    className="w-full pl-10 pr-12 py-3 border border-[rgba(28,28,28,0.15)] rounded-xl bg-white text-[#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(28,28,28,0.4)]">
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1C1C1C] mb-1">Conferma Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(28,28,28,0.4)] w-5 h-5" />
                  <input
                    data-testid="register-conferma-password"
                    type={showPass ? "text" : "password"} value={form.conferma_password}
                    onChange={e => setForm({ ...form, conferma_password: e.target.value })}
                    required placeholder="Ripeti la password"
                    className="w-full pl-10 pr-4 py-3 border border-[rgba(28,28,28,0.15)] rounded-xl bg-white text-[#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2">
                <input type="checkbox" required id="privacy" className="mt-1 accent-[#D4A017]" />
                <label htmlFor="privacy" className="text-sm text-[rgba(28,28,28,0.7)]">
                  Accetto la{" "}
                  <span className="text-[#D4A017] cursor-pointer">Privacy Policy</span>{" "}
                  e il trattamento dei dati personali ai sensi del GDPR
                </label>
              </div>

              <button
                data-testid="register-submit"
                type="submit" disabled={loading}
                className="w-full py-3 bg-[#D4A017] hover:bg-[#B38612] text-white font-semibold rounded-full transition-colors disabled:opacity-50 font-[Outfit]"
              >
                {loading ? "Registrazione in corso..." : "Crea Account"}
              </button>
            </form>
          </>
        )}

        <p className="mt-6 text-center text-sm text-[rgba(28,28,28,0.6)]">
          Hai già un account?{" "}
          <Link data-testid="login-link" to="/login" className="text-[#D4A017] font-medium hover:text-[#B38612]">
            Accedi
          </Link>
        </p>
      </div>
    </div>
  );
}
