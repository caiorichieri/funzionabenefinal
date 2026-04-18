import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API } from "@/contexts/AuthContext";
import { Plus, Search, Edit2, Trash2, X } from "lucide-react";

const GENERI = ["M", "F", "Non binario", "Preferisco non specificare"];
const EMPTY = {
  nome: "", cognome: "", data_nascita: "", genere: "", codice_fiscale: "",
  telefono: "", indirizzo: "", citta: "", cap: "", note_cliniche: "", terapeuta_assegnato: ""
};

export default function PazientiPage() {
  const [pazienti, setPazienti] = useState([]);
  const [terapisti, setTerapisti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      axios.get(`${API}/pazienti`, { withCredentials: true }),
      axios.get(`${API}/terapisti`, { withCredentials: true })
    ]).then(([p, t]) => {
      setPazienti(p.data);
      setTerapisti(t.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setError(""); setShowForm(true); };
  const openEdit = (p) => {
    setEditing(p._id);
    setForm({
      nome: p.nome||"", cognome: p.cognome||"", data_nascita: p.data_nascita||"",
      genere: p.genere||"", codice_fiscale: p.codice_fiscale||"",
      telefono: p.telefono||"", indirizzo: p.indirizzo||"",
      citta: p.citta||"", cap: p.cap||"", note_cliniche: p.note_cliniche||"",
      terapeuta_assegnato: p.terapeuta_assegnato||""
    });
    setError(""); setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      if (editing) await axios.put(`${API}/pazienti/${editing}`, form, { withCredentials: true });
      else await axios.post(`${API}/pazienti`, form, { withCredentials: true });
      setShowForm(false); load();
    } catch (err) {
      setError(err.response?.data?.detail || "Errore nel salvataggio");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Eliminare questo paziente?")) return;
    await axios.delete(`${API}/pazienti/${id}`, { withCredentials: true });
    load();
  };

  const filtered = pazienti.filter(p =>
    `${p.nome} ${p.cognome} ${p.codice_fiscale||""}`.toLowerCase().includes(search.toLowerCase())
  );

  const getTerapistaNome = (id) => {
    const t = terapisti.find(t => t._id === id);
    return t ? `${t.nome} ${t.cognome}` : "—";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1C1C1C] font-[Outfit]">Pazienti</h1>
          <p className="text-[rgba(28,28,28,0.6)] mt-1">{pazienti.length} pazienti registrati</p>
        </div>
        <button data-testid="add-paziente-btn" onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#6B8FA3] hover:bg-[#567587] text-white font-medium rounded-full transition-colors">
          <Plus className="w-4 h-4" /> Aggiungi Paziente
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgba(28,28,28,0.4)]" />
        <input data-testid="pazienti-search" type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cerca per nome o codice fiscale..."
          className="w-full pl-10 pr-4 py-3 border border-[rgba(28,28,28,0.15)] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#6B8FA3]" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-[#6B8FA3] border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-white border border-[rgba(28,28,28,0.08)] rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(28,28,28,0.06)] bg-[#FDFBF7]">
                {["Paziente","Codice Fiscale","Contatto","Terapeuta","Azioni"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[rgba(28,28,28,0.5)] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-[rgba(28,28,28,0.5)]">Nessun paziente trovato</td></tr>
              ) : filtered.map(p => (
                <tr key={p._id} data-testid={`paziente-row-${p._id}`}
                  className="border-b border-[rgba(28,28,28,0.04)] last:border-0 hover:bg-[rgba(28,28,28,0.02)]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#6B8FA3]/10 flex items-center justify-center text-[#6B8FA3] font-semibold text-sm">
                        {p.nome?.[0]}{p.cognome?.[0]}
                      </div>
                      <div>
                        <div className="font-medium text-[#1C1C1C]">{p.nome} {p.cognome}</div>
                        {p.data_nascita && <div className="text-xs text-[rgba(28,28,28,0.5)]">{new Date(p.data_nascita).toLocaleDateString("it-IT")}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm font-mono text-[rgba(28,28,28,0.7)]">{p.codice_fiscale || "—"}</td>
                  <td className="px-5 py-4 text-sm text-[rgba(28,28,28,0.7)]">{p.telefono || "—"}</td>
                  <td className="px-5 py-4 text-sm text-[rgba(28,28,28,0.7)]">{getTerapistaNome(p.terapeuta_assegnato)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button data-testid={`edit-paziente-${p._id}`} onClick={() => openEdit(p)}
                        className="p-2 rounded-lg hover:bg-[rgba(28,28,28,0.05)] text-[rgba(28,28,28,0.5)]">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button data-testid={`delete-paziente-${p._id}`} onClick={() => handleDelete(p._id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-[rgba(28,28,28,0.5)] hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-[rgba(28,28,28,0.08)]">
              <h2 className="text-xl font-bold text-[#1C1C1C] font-[Outfit]">{editing ? "Modifica Paziente" : "Nuovo Paziente"}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-[rgba(28,28,28,0.05)]"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

              <div className="grid grid-cols-2 gap-4">
                {[["nome","Nome*"],["cognome","Cognome*"]].map(([k,l]) => (
                  <div key={k}>
                    <label className="block text-sm font-medium text-[#1C1C1C] mb-1">{l}</label>
                    <input data-testid={`paziente-${k}`} type="text" value={form[k]} required
                      onChange={e => setForm({...form,[k]:e.target.value})}
                      className="w-full px-3 py-2.5 border border-[rgba(28,28,28,0.15)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6B8FA3]" />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-1">Data di Nascita</label>
                  <input type="date" value={form.data_nascita} onChange={e => setForm({...form, data_nascita:e.target.value})}
                    className="w-full px-3 py-2.5 border border-[rgba(28,28,28,0.15)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6B8FA3]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-1">Genere</label>
                  <select value={form.genere} onChange={e => setForm({...form, genere:e.target.value})}
                    className="w-full px-3 py-2.5 border border-[rgba(28,28,28,0.15)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6B8FA3] bg-white">
                    <option value="">Seleziona</option>
                    {GENERI.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1C1C1C] mb-1">Codice Fiscale</label>
                <input data-testid="paziente-cf" type="text" value={form.codice_fiscale}
                  onChange={e => setForm({...form, codice_fiscale:e.target.value.toUpperCase()})}
                  maxLength={16} placeholder="RSSMRA90E15H501Z"
                  className="w-full px-3 py-2.5 border border-[rgba(28,28,28,0.15)] rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#6B8FA3]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-1">Telefono</label>
                  <input type="tel" value={form.telefono} onChange={e => setForm({...form, telefono:e.target.value})}
                    className="w-full px-3 py-2.5 border border-[rgba(28,28,28,0.15)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6B8FA3]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-1">Città</label>
                  <input type="text" value={form.citta} onChange={e => setForm({...form, citta:e.target.value})}
                    className="w-full px-3 py-2.5 border border-[rgba(28,28,28,0.15)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6B8FA3]" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1C1C1C] mb-1">Terapeuta Assegnato</label>
                <select value={form.terapeuta_assegnato} onChange={e => setForm({...form, terapeuta_assegnato:e.target.value})}
                  className="w-full px-3 py-2.5 border border-[rgba(28,28,28,0.15)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6B8FA3] bg-white">
                  <option value="">Nessuno</option>
                  {terapisti.map(t => <option key={t._id} value={t._id}>{t.nome} {t.cognome}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1C1C1C] mb-1">Note Cliniche</label>
                <textarea value={form.note_cliniche} onChange={e => setForm({...form, note_cliniche:e.target.value})} rows={3}
                  placeholder="Note riservate al personale medico..."
                  className="w-full px-3 py-2.5 border border-[rgba(28,28,28,0.15)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6B8FA3] resize-none" />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 border border-[rgba(28,28,28,0.15)] rounded-full text-[#1C1C1C] hover:bg-[rgba(28,28,28,0.05)]">
                  Annulla
                </button>
                <button data-testid="save-paziente-btn" type="submit" disabled={saving}
                  className="px-5 py-2.5 bg-[#6B8FA3] hover:bg-[#567587] text-white rounded-full font-medium disabled:opacity-50">
                  {saving ? "Salvataggio..." : editing ? "Aggiorna" : "Crea Paziente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
