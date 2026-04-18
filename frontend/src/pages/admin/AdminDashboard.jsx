import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API } from "@/contexts/AuthContext";
import { Users, UserCheck, Calendar, AlertTriangle, FileText, ShieldX } from "lucide-react";

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-white border border-[rgba(28,28,28,0.08)] rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[rgba(28,28,28,0.5)] text-sm font-medium">{label}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-3xl font-bold text-[#1C1C1C] font-[Outfit]">{value ?? "—"}</div>
      {sub && <div className="text-xs text-[rgba(28,28,28,0.5)] mt-1">{sub}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(() => {
    axios.get(`${API}/dashboard/stats`, { withCredentials: true })
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#D4A017] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1C1C1C] font-[Outfit]">Panoramica</h1>
        <p className="text-[rgba(28,28,28,0.6)] mt-1">Gestionale FunzionaBene — Riepilogo attività</p>
      </div>

      {/* Stats grid */}
      <div data-testid="stats-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={UserCheck} label="Terapisti Attivi" value={stats?.terapisti}
          color="bg-[#D4A017]/10 text-[#D4A017]" sub="Professionisti iscritti" />
        <StatCard icon={Users} label="Pazienti" value={stats?.pazienti}
          color="bg-[#6B8FA3]/10 text-[#6B8FA3]" sub="Pazienti registrati" />
        <StatCard icon={Calendar} label="Sessioni Oggi" value={stats?.appuntamenti_oggi}
          color="bg-green-100 text-green-600" sub={`${stats?.appuntamenti_totali} totali`} />
        <StatCard icon={AlertTriangle} label="In Attesa" value={stats?.terapisti_pendenti}
          color="bg-orange-100 text-orange-600" sub="Terapisti da approvare" />
      </div>

      {/* Alert cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats?.articoli_in_revisione > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
            <FileText className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-amber-800">{stats.articoli_in_revisione} articoli in attesa di approvazione</div>
              <div className="text-sm text-amber-600 mt-1">Accedi alla sezione Blog per revisioinarli</div>
            </div>
          </div>
        )}
        {stats?.terapisti_senza_autocertificazione > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4">
            <ShieldX className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-red-800">{stats.terapisti_senza_autocertificazione} terapisti senza autocertificazione</div>
              <div className="text-sm text-red-600 mt-1">Richiedi la firma dell'autocertificazione</div>
            </div>
          </div>
        )}
      </div>

      {/* Insurance expiry alerts */}
      {stats?.scadenze_assicurazione?.length > 0 && (
        <div className="bg-white border border-[rgba(28,28,28,0.08)] rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-[#1C1C1C] font-[Outfit] mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Scadenze Assicurazione in Arrivo
          </h3>
          <div className="space-y-3">
            {stats.scadenze_assicurazione.map((s) => (
              <div key={`${s.terapeuta}-${s.scadenza}`} className="flex items-center justify-between py-2 border-b border-[rgba(28,28,28,0.06)] last:border-0">
                <div>
                  <div className="font-medium text-[#1C1C1C] text-sm">{s.terapeuta}</div>
                  <div className="text-xs text-[rgba(28,28,28,0.5)]">Scade: {new Date(s.scadenza).toLocaleDateString("it-IT")}</div>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  s.giorni_rimanenti < 0 ? "bg-red-100 text-red-700" :
                  s.giorni_rimanenti < 30 ? "bg-red-100 text-red-700" :
                  "bg-orange-100 text-orange-700"
                }`}>
                  {s.giorni_rimanenti < 0 ? "SCADUTA" : `${s.giorni_rimanenti} giorni`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="bg-white border border-[rgba(28,28,28,0.08)] rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-[#1C1C1C] font-[Outfit] mb-4">Azioni Rapide</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Aggiungi Terapista", href: "/admin/terapisti", color: "bg-[#D4A017]/10 text-[#D4A017]" },
            { label: "Aggiungi Paziente", href: "/admin/pazienti", color: "bg-[#6B8FA3]/10 text-[#6B8FA3]" },
            { label: "Nuovo Appuntamento", href: "/admin/appuntamenti", color: "bg-green-100 text-green-700" },
            { label: "Rivedi Blog", href: "/admin/blog", color: "bg-purple-100 text-purple-700" },
          ].map(action => (
            <a key={action.label} href={action.href}
              className={`${action.color} rounded-xl p-4 text-sm font-medium text-center hover:opacity-80 transition-opacity cursor-pointer`}>
              {action.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
