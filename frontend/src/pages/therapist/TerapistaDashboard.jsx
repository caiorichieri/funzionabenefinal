import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, Clock, Users, ShieldCheck, Video, FileText } from "lucide-react";

export default function TerapistaDashboard() {
  const { user } = useAuth();
  const [profilo, setProfilo] = useState(null);
  const [appuntamenti, setAppuntamenti] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/terapisti/profilo/me`, { withCredentials: true }).catch(() => null),
      axios.get(`${API}/appuntamenti`, { withCredentials: true }).catch(() => ({ data: [] }))
    ]).then(([p, a]) => {
      if (p) setProfilo(p.data);
      setAppuntamenti(a.data);
    }).finally(() => setLoading(false));
  }, []);

  const oggi = appuntamenti.filter(a => {
    const d = new Date(a.data_ora);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });
  const prossime = appuntamenti.filter(a => new Date(a.data_ora) > new Date()).slice(0, 5);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#D4A017] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1C1C1C] font-[Outfit]">
          Benvenuta, {user?.nome}!
        </h1>
        <p className="text-[rgba(28,28,28,0.6)] mt-1">Ecco il riepilogo della tua attività</p>
      </div>

      {/* Autocertificazione alert */}
      {profilo && !profilo.autocertificazione_firmata && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
          <ShieldCheck className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-amber-800">Autocertificazione non firmata</div>
            <div className="text-sm text-amber-600 mt-1">
              Completa il tuo profilo e firma l'autocertificazione per essere visibile ai pazienti.
            </div>
            <a href="/terapeuta/profilo"
              className="mt-2 inline-block text-sm font-medium text-amber-700 hover:text-amber-800">
              Vai al profilo →
            </a>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[rgba(28,28,28,0.08)] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-[#D4A017]" />
            <span className="text-sm text-[rgba(28,28,28,0.5)]">Sessioni oggi</span>
          </div>
          <div className="text-3xl font-bold text-[#1C1C1C] font-[Outfit]">{oggi.length}</div>
        </div>
        <div className="bg-white border border-[rgba(28,28,28,0.08)] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-[#6B8FA3]" />
            <span className="text-sm text-[rgba(28,28,28,0.5)]">Prossime sessioni</span>
          </div>
          <div className="text-3xl font-bold text-[#1C1C1C] font-[Outfit]">{prossime.length}</div>
        </div>
        <div className="bg-white border border-[rgba(28,28,28,0.08)] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-green-600" />
            <span className="text-sm text-[rgba(28,28,28,0.5)]">Totale sessioni</span>
          </div>
          <div className="text-3xl font-bold text-[#1C1C1C] font-[Outfit]">{appuntamenti.length}</div>
        </div>
      </div>

      {/* Profile completion */}
      {profilo && (
        <div className="bg-white border border-[rgba(28,28,28,0.08)] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#1C1C1C] font-[Outfit]">Completamento Profilo</h3>
            <a href="/terapeuta/profilo" className="text-sm text-[#D4A017] hover:text-[#B38612]">Modifica</a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Biografia", done: !!profilo.bio },
              { label: "Albo Iscrizione", done: !!profilo.albo_numero },
              { label: "Assicurazione", done: !!profilo.assicurazione_numero_polizza },
              { label: "Autocertificazione", done: profilo.autocertificazione_firmata },
              { label: "Disponibilità", done: (profilo.disponibilita || []).length > 0 },
              { label: "Specializzazioni", done: (profilo.specializzazioni || []).length > 0 },
              { label: "Prezzo Sessione", done: !!profilo.prezzo_sessione },
              { label: "Foto Profilo", done: false }
            ].map(item => (
              <div key={item.label} className={`flex items-center gap-2 p-3 rounded-xl text-sm
                ${item.done ? "bg-green-50 text-green-700" : "bg-[rgba(28,28,28,0.04)] text-[rgba(28,28,28,0.5)]"}`}>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.done ? "bg-green-500" : "bg-[rgba(28,28,28,0.2)]"}`} />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prossime sessioni */}
      {prossime.length > 0 && (
        <div className="bg-white border border-[rgba(28,28,28,0.08)] rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-[#1C1C1C] font-[Outfit] mb-4">Prossime Sessioni</h3>
          <div className="space-y-3">
            {prossime.map(a => (
              <div key={a._id} className="flex items-center justify-between py-3 border-b border-[rgba(28,28,28,0.06)] last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#6B8FA3]/10 flex items-center justify-center">
                    <Video className="w-4 h-4 text-[#6B8FA3]" />
                  </div>
                  <div>
                    <div className="font-medium text-[#1C1C1C] text-sm">{a.paziente_nome || "Paziente"}</div>
                    <div className="text-xs text-[rgba(28,28,28,0.5)]">
                      {new Date(a.data_ora).toLocaleString("it-IT")} · {a.durata_minuti} min
                    </div>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  a.stato === "confermato" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                }`}>{a.stato}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
