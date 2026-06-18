import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API } from "@/contexts/AuthContext";
import { Plus, CheckCircle, XCircle, Trash2, Eye, Clock, X, Edit2 } from "lucide-react";

const CATEGORIE = ["Sessuologia","Terapia di coppia","Disfunzioni sessuali","Relazioni","Salute mentale","Altro"];

const STATO_BADGE = {
  bozza:      "bg-amber-100 text-amber-700",
  pubblicato: "bg-green-100 text-green-700",
  rifiutato:  "bg-red-100 text-red-700",
};

const STATO_LABEL = {
  bozza:      "In Revisione",
  pubblicato: "Pubblicato",
  rifiutato:  "Rifiutato",
};

function getSaveButtonLabel(saving, editing, publishLabel = "Pubblica") {
  if (saving) return "Salvataggio...";
  if (editing) return "Aggiorna";
  return publishLabel;
}

const EMPTY = { titolo: "", contenuto: "", categoria: "", tags: "" };

export default function AdminBlogPage() {
  const [articoli, setArticoli] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filtro, setFiltro]     = useState("tutti");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [preview, setPreview]   = useState(null);
  const [error, setError]       = useState("");

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
      setShowForm(false); load();
    } catch (err) {
      setError(err.response?.data?.detail || "Errore nel salvataggio");
    } finally { setSaving(false); }
  };

  const approva  = async (id) => { await axios.patch(`${API}/blog/${id}/approva`, {}, { withCredentials: true }); load(); };
  const rifiuta  = async (id) => { await axios.patch(`${API}/blog/${id}/rifiuta`, {}, { withCredentials: true }); load(); };
  const elimina  = async (id) => {
    if (!window.confirm("Eliminare questo articolo?")) return;
    await axios.delete(`${API}/blog/${id}`, { withCredentials: true }); load();
  };

  const filtered = filtro === "tutti" ? articoli : articoli.filter(a => a.stato === filtro);
  const contatori = {
    tutti: articoli.length,
    bozza: articoli.filter(a => a.stato === "bozza").length,
    pubblicato: articoli.filter(a => a.stato === "pubblicato").length,
    rifiutato: articoli.filter(a => a.stato === "rifiutato").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0A0A0A] font-[Outfit]">Blog</h1>
          <p className="text-[#0A0A0A]/65 mt-1">Gestisci e approva gli articoli dei terapisti</p>
        </div>
        <button data-testid="new-article-btn" onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0A0A0A] hover:bg-[#1C1C1C] text-white font-medium rounded-full transition-colors">
          <Plus className="w-4 h-4" /> Nuovo Articolo
        </button>
      </div>

      {/* Filtri */}
      <div className="flex gap-2 flex-wrap">
        {[
          { k: "tutti",      label: "Tutti" },
          { k: "bozza",      label: "In Revisione" },
          { k: "pubblicato", label: "Pubblicati" },
          { k: "rifiutato",  label: "Rifiutati" },
        ].map(f => (
          <button key={f.k} data-testid={`filtro-${f.k}`} onClick={() => setFiltro(f.k)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2
              ${filtro === f.k ? "bg-[#0A0A0A] text-white" : "bg-white border border-[rgba(28,28,28,0.12)] text-[#0A0A0A]/75 hover:border-[#0A0A0A]"}`}>
            {f.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${filtro === f.k ? "bg-white/20" : "bg-[rgba(28,28,28,0.08)]"}`}>
              {contatori[f.k]}
            </span>
          </button>
        ))}
      </div>

      {/* Alert revisione */}
      {contatori.bozza > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <span className="text-amber-800 text-sm font-medium">
            {contatori.bozza} {contatori.bozza === 1 ? "articolo in attesa" : "articoli in attesa"} di approvazione
          </span>
        </div>
      )}

      {/* Lista articoli */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[#0A0A0A]/50">
          <div className="text-4xl mb-3">📝</div>
          <div>Nessun articolo trovato</div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => (
            <div key={a._id} data-testid={`articolo-${a._id}`}
              className="bg-white border border-[#0A0A0A]/10 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATO_BADGE[a.stato] || "bg-gray-100 text-gray-600"}`}>
                      {STATO_LABEL[a.stato] || a.stato}
                    </span>
                    {a.categoria && (
                      <span className="text-xs bg-[#6B8FA3]/10 text-[#6B8FA3] px-2.5 py-1 rounded-full">{a.categoria}</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-[#0A0A0A] text-lg leading-snug">{a.titolo}</h3>
                  <div className="text-sm text-[#0A0A0A]/55 mt-1 flex items-center gap-3">
                    <span>di <strong>{a.autore_nome}</strong></span>
                    <span>·</span>
                    <span>{new Date(a.created_at).toLocaleDateString("it-IT")}</span>
                  </div>
                  <p className="text-sm text-[#0A0A0A]/65 mt-2 line-clamp-2">{a.contenuto}</p>
                  {(a.tags||[]).length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {a.tags.map(t => (
                        <span key={t} className="text-xs bg-[rgba(28,28,28,0.06)] text-[#0A0A0A]/65 px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Azioni */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button data-testid={`preview-${a._id}`} onClick={() => setPreview(a)}
                    className="p-2 rounded-xl hover:bg-[#0A0A0A]/5 text-[#0A0A0A]/50" title="Anteprima">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button data-testid={`edit-art-${a._id}`} onClick={() => openEdit(a)}
                    className="p-2 rounded-xl hover:bg-[#0A0A0A]/5 text-[#0A0A0A]/50" title="Modifica">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {a.stato === "bozza" && (
                    <>
                      <button data-testid={`approva-${a._id}`} onClick={() => approva(a._id)}
                        className="p-2 rounded-xl hover:bg-green-50 text-green-600" title="Approva e Pubblica">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button data-testid={`rifiuta-${a._id}`} onClick={() => rifiuta(a._id)}
                        className="p-2 rounded-xl hover:bg-red-50 text-red-500" title="Rifiuta">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button data-testid={`elimina-${a._id}`} onClick={() => elimina(a._id)}
                    className="p-2 rounded-xl hover:bg-red-50 text-[#0A0A0A]/50 hover:text-red-600" title="Elimina">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crea/Modifica */}
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
                  placeholder="Titolo dell'articolo"
                  className="w-full px-3 py-2.5 border border-[#0A0A0A]/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#0A0A0A] mb-1">Categoria</label>
                  <select value={form.categoria} onChange={e => setForm({...form, categoria:e.target.value})}
                    className="w-full px-3 py-2.5 border border-[#0A0A0A]/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] bg-white">
                    <option value="">Seleziona categoria</option>
                    {CATEGORIE.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0A0A0A] mb-1">Tag (virgola)</label>
                  <input type="text" value={form.tags} onChange={e => setForm({...form, tags:e.target.value})}
                    placeholder="sessuologia, coppia, ..."
                    className="w-full px-3 py-2.5 border border-[#0A0A0A]/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0A0A0A] mb-1">Contenuto*</label>
                <textarea data-testid="form-contenuto" value={form.contenuto} required
                  onChange={e => setForm({...form, contenuto:e.target.value})} rows={10}
                  placeholder="Scrivi il contenuto dell'articolo..."
                  className="w-full px-3 py-2.5 border border-[#0A0A0A]/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] resize-none" />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 border border-[#0A0A0A]/15 rounded-full text-[#0A0A0A] hover:bg-[#0A0A0A]/5">
                  Annulla
                </button>
                <button data-testid="save-article-btn" type="submit" disabled={saving}
                  className="px-5 py-2.5 bg-[#0A0A0A] hover:bg-[#1C1C1C] text-white rounded-full font-medium disabled:opacity-50">
                  {getSaveButtonLabel(saving, editing, "Pubblica")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Anteprima */}
      {preview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-[#0A0A0A]/10">
              <div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATO_BADGE[preview.stato]}`}>
                  {preview.stato}
                </span>
              </div>
              <button onClick={() => setPreview(null)} className="p-2 rounded-xl hover:bg-[#0A0A0A]/5">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-[#0A0A0A] font-[Outfit] mb-2">{preview.titolo}</h2>
              <div className="text-sm text-[#0A0A0A]/55 mb-4">
                di <strong>{preview.autore_nome}</strong> · {new Date(preview.created_at).toLocaleDateString("it-IT")}
              </div>
              <div className="prose text-[#0A0A0A] text-sm leading-relaxed whitespace-pre-wrap">{preview.contenuto}</div>
            </div>
            {preview.stato === "bozza" && (
              <div className="flex justify-end gap-3 p-6 border-t border-[#0A0A0A]/10">
                <button onClick={() => { rifiuta(preview._id); setPreview(null); }}
                  className="px-5 py-2.5 border border-red-200 text-red-600 rounded-full hover:bg-red-50 flex items-center gap-2">
                  <XCircle className="w-4 h-4" /> Rifiuta
                </button>
                <button onClick={() => { approva(preview._id); setPreview(null); }}
                  className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Approva e Pubblica
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
