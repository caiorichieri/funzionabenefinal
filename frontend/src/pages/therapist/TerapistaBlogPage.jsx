import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API } from "@/contexts/AuthContext";
import { Plus, Edit2, Trash2, X, Clock, CheckCircle, XCircle } from "lucide-react";

const CATEGORIE = ["Sessuologia","Terapia di coppia","Disfunzioni sessuali","Relazioni","Salute mentale","Altro"];

const STATO_BADGE = {
  bozza:      { cls: "bg-amber-100 text-amber-700",  label: "In Revisione" },
  pubblicato: { cls: "bg-green-100 text-green-700",  label: "Pubblicato" },
  rifiutato:  { cls: "bg-red-100 text-red-700",      label: "Rifiutato" },
};

const EMPTY = { titolo: "", contenuto: "", categoria: "", tags: "" };

export default function TerapistaBlogPage() {
  const [articoli, setArticoli] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  const load = useCallback(() => {
    setLoading(true);
    axios.get(`${API}/blog`, { withCredentials: true })
      .then(r => setArticoli(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setError(""); setShowForm(true); };
  const openEdit   = (a) => {
    setEditing(a._id);
    setForm({ titolo: a.titolo, contenuto: a.contenuto, categoria: a.categoria||"", tags: (a.tags||[]).join(", ") });
    setError("");
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    const payload = { ...form, tags: form.tags ? form.tags.split(",").map(s=>s.trim()).filter(Boolean) : [] };
    try {
      if (editing) await axios.put(`${API}/blog/${editing}`, payload, { withCredentials: true });
      else         await axios.post(`${API}/blog`, payload, { withCredentials: true });
      setShowForm(false);
      setSuccess(editing ? "Articolo aggiornato!" : "Articolo inviato per approvazione!");
      setTimeout(() => setSuccess(""), 4000);
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Errore nel salvataggio");
    } finally { setSaving(false); }
  };

  const elimina = async (id) => {
    if (!window.confirm("Eliminare questo articolo?")) return;
    await axios.delete(`${API}/blog/${id}`, { withCredentials: true }); load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0A0A0A] font-[Outfit]">I miei Articoli</h1>
          <p className="text-[#0A0A0A]/65 mt-1">Scrivi contenuti per il blog di FunzionaBene</p>
        </div>
        <button data-testid="new-article-btn" onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0A0A0A] hover:bg-[#1C1C1C] text-white font-medium rounded-full transition-colors">
          <Plus className="w-4 h-4" /> Scrivi Articolo
        </button>
      </div>

      {success && (
        <div data-testid="article-success" className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {success}
        </div>
      )}

      {/* Info flow */}
      <div className="bg-[#6B8FA3]/10 border border-[#6B8FA3]/20 rounded-2xl p-4 flex items-start gap-3">
        <Clock className="w-5 h-5 text-[#6B8FA3] flex-shrink-0 mt-0.5" />
        <div className="text-sm text-[#0A0A0A]">
          Gli articoli che pubblichi vengono prima revisionati dall&apos;amministratore.
          Dopo l&apos;approvazione saranno visibili sul sito pubblico di FunzionaBene.
        </div>
      </div>

      {/* Lista articoli */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : articoli.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">✍️</div>
          <div className="text-[#0A0A0A]/55 mb-4">Non hai ancora scritto nessun articolo</div>
          <button onClick={openCreate}
            className="px-5 py-2.5 bg-[#0A0A0A] hover:bg-[#1C1C1C] text-white rounded-full font-medium">
            Scrivi il tuo primo articolo
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {articoli.map(a => {
            const badge = STATO_BADGE[a.stato] || { cls: "bg-gray-100 text-gray-600", label: a.stato };
            return (
              <div key={a._id} data-testid={`art-${a._id}`}
                className="bg-white border border-[#0A0A0A]/10 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>
                      {a.categoria && (
                        <span className="text-xs bg-white/30 text-[#0A0A0A] px-2.5 py-1 rounded-full">{a.categoria}</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-[#0A0A0A]">{a.titolo}</h3>
                    <div className="text-xs text-[#0A0A0A]/50 mt-1">
                      {new Date(a.created_at).toLocaleDateString("it-IT")}
                    </div>
                    <p className="text-sm text-[#0A0A0A]/65 mt-2 line-clamp-2">{a.contenuto}</p>

                    {a.stato === "rifiutato" && (
                      <div className="mt-2 p-2.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
                        Articolo rifiutato. Puoi modificarlo e reinviarlo per approvazione.
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {a.stato !== "pubblicato" && (
                      <button data-testid={`edit-art-${a._id}`} onClick={() => openEdit(a)}
                        className="p-2 rounded-xl hover:bg-[#0A0A0A]/5 text-[#0A0A0A]/50">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    <button data-testid={`del-art-${a._id}`} onClick={() => elimina(a._id)}
                      className="p-2 rounded-xl hover:bg-red-50 text-[#0A0A0A]/50 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-[#0A0A0A]/10">
              <h2 className="text-xl font-bold text-[#0A0A0A] font-[Outfit]">
                {editing ? "Modifica Articolo" : "Nuovo Articolo"}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-[#0A0A0A]/5">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

              <div>
                <label className="block text-sm font-medium text-[#0A0A0A] mb-1">Titolo*</label>
                <input data-testid="form-titolo" type="text" value={form.titolo} required
                  onChange={e => setForm({...form, titolo:e.target.value})}
                  placeholder="Es: Come migliorare l'intimità di coppia"
                  className="w-full px-3 py-2.5 border border-[#0A0A0A]/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#0A0A0A] mb-1">Categoria</label>
                  <select value={form.categoria} onChange={e => setForm({...form, categoria:e.target.value})}
                    className="w-full px-3 py-2.5 border border-[#0A0A0A]/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] bg-white">
                    <option value="">Seleziona</option>
                    {CATEGORIE.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0A0A0A] mb-1">Tag (separati da virgola)</label>
                  <input type="text" value={form.tags} onChange={e => setForm({...form, tags:e.target.value})}
                    placeholder="sessuologia, salute..."
                    className="w-full px-3 py-2.5 border border-[#0A0A0A]/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A]" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0A0A0A] mb-1">Contenuto*</label>
                <textarea data-testid="form-contenuto" value={form.contenuto} required
                  onChange={e => setForm({...form, contenuto:e.target.value})} rows={12}
                  placeholder="Scrivi qui il contenuto del tuo articolo..."
                  className="w-full px-3 py-2.5 border border-[#0A0A0A]/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] resize-none" />
                <div className="text-xs text-[#0A0A0A]/50 mt-1 text-right">{form.contenuto.length} caratteri</div>
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 border border-[#0A0A0A]/15 rounded-full text-[#0A0A0A] hover:bg-[#0A0A0A]/5">
                  Annulla
                </button>
                <button data-testid="save-article-btn" type="submit" disabled={saving}
                  className="px-5 py-2.5 bg-[#0A0A0A] hover:bg-[#1C1C1C] text-white rounded-full font-medium disabled:opacity-50">
                  {saving ? "Invio in corso..." : editing ? "Aggiorna" : "Invia per Approvazione"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
