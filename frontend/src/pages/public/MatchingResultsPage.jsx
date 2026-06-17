import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Award, Clock, Star } from "lucide-react";

export default function MatchingResultsPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);

  useEffect(() => {
    const raw = sessionStorage.getItem("fb_match_results");
    if (!raw) {
      navigate("/questionario");
      return;
    }
    try {
      const data = JSON.parse(raw);
      setResults(data.terapisti || []);
    } catch {
      navigate("/questionario");
    }
  }, [navigate]);

  if (results.length === 0) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-transparent flex items-center justify-center">
        <div className="text-center px-6" data-testid="no-results">
          <h1 className="font-serif text-3xl text-[#0A0A0A] mb-4">Nessun abbinamento trovato</h1>
          <p className="text-[#0A0A0A]/70 mb-8">
            Prova ad ampliare i criteri del questionario.
          </p>
          <Link
            to="/questionario"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#0A0A0A] text-white font-medium rounded-full"
          >
            Riprova il questionario
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-transparent py-16 lg:py-24" data-testid="matching-results">
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[#0A0A0A] text-xs tracking-[0.25em] uppercase">Abbinamenti personalizzati</span>
          <h1 className="mt-4 font-serif text-4xl lg:text-5xl text-[#0A0A0A] leading-tight">
            Abbiamo trovato <em className="text-[#0A0A0A] not-italic">{results.length}</em> specialisti per te
          </h1>
          <p className="mt-6 text-[#0A0A0A]/70 max-w-xl mx-auto">
            In base alle tue risposte, ecco i terapeuti con la maggiore affinità al tuo profilo.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {results.map((t, i) => (
            <motion.div
              key={t._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              data-testid={`result-card-${i}`}
              className="relative p-7 brand-card flex flex-col"
            >
              {/* Compatibility badge */}
              <div className="absolute -top-3 -right-3 bg-gradient-to-br from-[#F58A1F] to-[#F5D419] hover:from-[#E07A0F] hover:to-[#E5C419] text-[#0A0A0A] font-bold rounded-2xl shadow-md hover:shadow-lg px-4 py-1.5 text-sm font-medium flex items-center gap-1.5 shadow-lg">
                <Star className="w-3.5 h-3.5 fill-current" />
                {t.compatibilita || 75}%
              </div>

              <div className="flex items-start gap-4 mb-5">
                {t.foto_url ? (
                  <img src={t.foto_url} alt={`${t.nome} ${t.cognome}`} className="w-16 h-16 rounded-2xl object-cover border border-[#0A0A0A]/15 flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0A0A0A]/20 to-[#6B8FA3]/20 border border-[#0A0A0A]/15 flex items-center justify-center flex-shrink-0">
                    <span className="font-serif text-2xl text-[#0A0A0A]">
                      {(t.nome || "?")[0]}{(t.cognome || "?")[0]}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="font-serif text-xl text-[#0A0A0A] leading-tight">
                    Dr. {t.nome} {t.cognome}
                  </h3>
                  <p className="text-xs tracking-[0.15em] uppercase text-[#6B8FA3] mt-1">
                    {t.genere === "F" ? "Psicologa" : "Psicologo"}
                  </p>
                </div>
              </div>

              {t.bio && (
                <p className="text-sm text-[#0A0A0A]/80 leading-relaxed mb-5 line-clamp-3">
                  {t.bio}
                </p>
              )}

              {Array.isArray(t.specializzazioni) && t.specializzazioni.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {t.specializzazioni.slice(0, 3).map((s) => (
                    <span key={s} className="text-xs px-3 py-1 rounded-full bg-[#6B8FA3]/10 text-[#94B2C2] border border-[#6B8FA3]/20">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs text-[#0A0A0A]/70 mb-6 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-[#6B8FA3]" />
                  {t.anni_esperienza || 0} anni
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#6B8FA3]" />
                  €{t.prezzo_sessione || 90}/sessione
                </div>
              </div>

              <Link
                to={`/terapeuti/${t._id}`}
                data-testid={`view-profile-${i}`}
                className="mt-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-br from-[#F58A1F] to-[#F5D419] hover:from-[#E07A0F] hover:to-[#E5C419] text-[#0A0A0A] font-bold rounded-2xl shadow-md hover:shadow-lg text-sm tracking-wide transition-all"
              >
                Visualizza profilo
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link to="/questionario" className="text-sm text-[#0A0A0A]/60 hover:text-[#0A0A0A] tracking-wide">
            Non ti convincono? Rifai il questionario →
          </Link>
        </div>
      </div>
    </main>
  );
}
