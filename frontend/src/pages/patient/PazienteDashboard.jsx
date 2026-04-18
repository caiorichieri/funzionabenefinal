import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API, useAuth } from "@/contexts/AuthContext";
import { Calendar, Clock, Video, User, Save, CheckCircle } from "lucide-react";

export default function PazienteDashboard() {
  const { user } = useAuth();
  const [profilo, setProfilo] = useState(null);
  const [appuntamenti, setAppuntamenti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editProfile, setEditProfile] = useState(false);
  const [form, setForm] = useState({
    nome:"", cognome:"", data_nascita:"", genere:"",
    codice_fiscale:"", telefono:"", citta:"", cap:""
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [cfError, setCfError] = useState("");

  const fetchData = useCallback(() => {
    Promise.all([
      axios.get(`${API}/pazienti/profilo/me`, { withCredentials: true }).catch(() => null),
      axios.get(`${API}/appuntamenti`, { withCredentials: true }).catch(() => ({ data: [] }))
    ]).then(([p, a]) => {
      if (p) {
        setProfilo(p.data);
        setForm({
          nome: p.data.nome||"", cognome: p.data.cognome||"",
          data_nascita: p.data.data_nascita||"", genere: p.data.genere||"",
          codice_fiscale: p.data.codice_fiscale||"", telefono: p.data.telefono||"",
          citta: p.data.citta||"", cap: p.data.cap||""
        });
      }
      setAppuntamenti(a.data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const validateCF = (cf) => {
    cf = cf.toUpperCase().trim();
    if (cf.length !== 16) return false;
    const allowed = /^[A-Z0-9]{16}$/;
    return allowed.test(cf);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setCfError("");
    if (form.codice_fiscale && !validateCF(form.codice_fiscale)) {
      setCfError("Codice fiscale non valido (deve essere 16 caratteri alfanumerici)");
      return;
    }
    setSaving(true);
    try {
      const res = await axios.put(`${API}/pazienti/profilo/me`, form, { withCredentials: true });
      setProfilo(res.data); setSaved(true); setEditProfile(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setCfError(err.response?.data?.detail || "Errore nel salvataggio");
    } finally { setSaving(false); }
  };

  const prossime = appuntamenti.filter(a => new Date(a.data_ora) > new Date());
  const passate = appuntamenti.filter(a => new Date(a.data_ora) <= new Date());

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-[#D4A017] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1C1C1C] font-[Outfit]">Benvenuto, {user?.nome}!</h1>
        <p className="text-[rgba(28,28,28,0.6)] mt-1">Gestisci il tuo profilo e le tue sessioni</p>
      </div>

      {saved && <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Profilo aggiornato!</div>}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[rgba(28,28,28,0.08)] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-[rgba(28,28,28,0.5)] text-sm"><Calendar className="w-4 h-4" /> Sessioni Prenotate</div>
          <div className="text-3xl font-bold text-[#1C1C1C] font-[Outfit]">{prossime.length}</div>
        </div>
        <div className="bg-white border border-[rgba(28,28,28,0.08)] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-[rgba(28,28,28,0.5)] text-sm"><Clock className="w-4 h-4" /> Sessioni Completate</div>
          <div className="text-3xl font-bold text-[#1C1C1C] font-[Outfit]">{passate.filter(a=>a.stato==="completato").length}</div>
        </div>
        <div className="bg-white border border-[rgba(28,28,28,0.08)] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-[rgba(28,28,28,0.5)] text-sm"><User className="w-4 h-4" /> Totale Sessioni</div>
          <div className="text-3xl font-bold text-[#1C1C1C] font-[Outfit]">{appuntamenti.length}</div>
        </div>
      </div>

      {/* Profile */}
      <div className="bg-white border border-[rgba(28,28,28,0.08)] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#1C1C1C] font-[Outfit]">Il mio Profilo</h3>
          <button data-testid="edit-profile-btn" onClick={() => setEditProfile(!editProfile)}
            className="text-sm text-[#D4A017] hover:text-[#B38612]">
            {editProfile ? "Annulla" : "Modifica"}
          </button>
        </div>

        {!editProfile ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {[
              ["Nome", `${profilo?.nome||""} ${profilo?.cognome||""}`],
              ["Data di Nascita", profilo?.data_nascita ? new Date(profilo.data_nascita).toLocaleDateString("it-IT") : "—"],
              ["Genere", profilo?.genere || "—"],
              ["Codice Fiscale", profilo?.codice_fiscale || "—"],
              ["Telefono", profilo?.telefono || "—"],
              ["Città", profilo?.citta || "—"]
            ].map(([l, v]) => (
              <div key={l}>
                <div className="text-[rgba(28,28,28,0.5)] text-xs mb-0.5">{l}</div>
                <div className="text-[#1C1C1C] font-medium">{v}</div>
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            {cfError && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{cfError}</div>}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1C1C1C] mb-1">Nome</label>
                <input type="text" value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})}
                  className="w-full px-3 py-2.5 border border-[rgba(28,28,28,0.15)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1C1C] mb-1">Cognome</label>
                <input type="text" value={form.cognome} onChange={e=>setForm({...form,cognome:e.target.value})}
                  className="w-full px-3 py-2.5 border border-[rgba(28,28,28,0.15)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1C1C] mb-1">Data di Nascita</label>
                <input type="date" value={form.data_nascita} onChange={e=>setForm({...form,data_nascita:e.target.value})}
                  className="w-full px-3 py-2.5 border border-[rgba(28,28,28,0.15)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1C1C] mb-1">Genere</label>
                <select value={form.genere} onChange={e=>setForm({...form,genere:e.target.value})}
                  className="w-full px-3 py-2.5 border border-[rgba(28,28,28,0.15)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017] bg-white">
                  <option value="">Seleziona</option>
                  {["M","F","Non binario","Preferisco non specificare"].map(g=><option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1C1C1C] mb-1">Codice Fiscale</label>
              <input data-testid="paziente-cf-input" type="text" value={form.codice_fiscale}
                onChange={e=>setForm({...form,codice_fiscale:e.target.value.toUpperCase()})} maxLength={16}
                placeholder="RSSMRA90E15H501Z"
                className="w-full px-3 py-2.5 border border-[rgba(28,28,28,0.15)] rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#D4A017]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1C1C1C] mb-1">Telefono</label>
                <input type="tel" value={form.telefono} onChange={e=>setForm({...form,telefono:e.target.value})}
                  className="w-full px-3 py-2.5 border border-[rgba(28,28,28,0.15)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1C1C] mb-1">Città</label>
                <input type="text" value={form.citta} onChange={e=>setForm({...form,citta:e.target.value})}
                  className="w-full px-3 py-2.5 border border-[rgba(28,28,28,0.15)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]" />
              </div>
            </div>
            <button data-testid="save-paziente-profile-btn" type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#D4A017] hover:bg-[#B38612] text-white rounded-full font-medium transition-colors disabled:opacity-50">
              <Save className="w-4 h-4" />
              {saving ? "Salvataggio..." : "Salva Modifiche"}
            </button>
          </form>
        )}
      </div>

      {/* Prossime sessioni */}
      {prossime.length > 0 && (
        <div className="bg-white border border-[rgba(28,28,28,0.08)] rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-[#1C1C1C] font-[Outfit] mb-4">Prossime Sessioni</h3>
          <div className="space-y-3">
            {prossime.map(a => (
              <div key={a._id} className="flex items-center justify-between py-3 border-b border-[rgba(28,28,28,0.06)] last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D4A017]/10 flex items-center justify-center">
                    <Video className="w-4 h-4 text-[#D4A017]" />
                  </div>
                  <div>
                    <div className="font-medium text-[#1C1C1C] text-sm">{a.terapeuta_nome || "Terapeuta"}</div>
                    <div className="text-xs text-[rgba(28,28,28,0.5)]">{new Date(a.data_ora).toLocaleString("it-IT")} · {a.durata_minuti} min</div>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">{a.stato}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
