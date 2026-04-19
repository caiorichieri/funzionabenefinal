import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, User } from "lucide-react";

function formatDate(d) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("it-IT", { year: "numeric", month: "long", day: "numeric" });
  } catch { return ""; }
}

export default function BlogPublicPage() {
  const [articoli, setArticoli] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/public/blog`)
      .then(r => setArticoli(r.data))
      .catch(() => setArticoli([]))
      .finally(() => setLoading(false));
  }, []);

  const [hero, ...rest] = articoli;

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#111111] py-16 lg:py-24" data-testid="blog-page">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="mb-16 max-w-2xl">
          <span className="text-[#D4A017] text-xs tracking-[0.25em] uppercase">Rivista</span>
          <h1 className="mt-4 font-serif text-5xl lg:text-6xl text-[#F4F1ED] leading-tight">
            Pensieri e ricerche<br />dai nostri specialisti.
          </h1>
          <p className="mt-6 text-[#E6E2D8]/60 text-lg">
            Articoli scritti dai nostri specialisti per aiutarti a comprendere meglio te stesso.
          </p>
        </div>

        {loading && (
          <div className="text-center py-20 text-[#E6E2D8]/40">Caricamento...</div>
        )}

        {!loading && articoli.length === 0 && (
          <div className="py-20 text-center border border-dashed border-white/10 rounded-3xl" data-testid="blog-empty">
            <p className="text-[#E6E2D8]/50">Nessun articolo pubblicato al momento. Torna presto.</p>
          </div>
        )}

        {hero && (
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            data-testid="blog-hero"
            className="mb-16 p-10 lg:p-16 bg-gradient-to-br from-[#1C2A33] via-[#1C2A33]/80 to-[#111111] border border-white/10 rounded-3xl relative overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-[#D4A017]/5 blur-3xl" />
            <div className="relative max-w-3xl">
              {hero.categoria && (
                <span className="text-xs tracking-[0.25em] uppercase text-[#D4A017]">{hero.categoria}</span>
              )}
              <h2 className="mt-4 font-serif text-4xl lg:text-5xl text-[#F4F1ED] leading-tight">
                {hero.titolo}
              </h2>
              <p className="mt-6 text-[#E6E2D8]/70 text-lg leading-relaxed line-clamp-3">
                {(hero.contenuto || "").slice(0, 240)}...
              </p>
              <div className="mt-8 flex items-center gap-6 text-xs text-[#E6E2D8]/50">
                <span className="flex items-center gap-2"><User className="w-3.5 h-3.5" />{hero.autore_nome}</span>
                <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" />{formatDate(hero.created_at)}</span>
              </div>
              <Link
                to={`/blog/${hero._id}`}
                data-testid="blog-hero-link"
                className="mt-10 inline-flex items-center gap-3 px-6 py-3 bg-[#D4A017] hover:bg-[#E5B942] text-[#111111] rounded-full text-sm font-medium tracking-wide transition-all"
              >
                Leggi l'articolo <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.article>
        )}

        {rest.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((a, i) => (
              <motion.article
                key={a._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                data-testid={`blog-card-${i}`}
                className="p-8 bg-[#1C2A33]/40 border border-white/10 rounded-3xl hover:border-[#D4A017]/40 transition-all flex flex-col"
              >
                {a.categoria && (
                  <span className="text-xs tracking-[0.25em] uppercase text-[#6B8FA3] mb-3">{a.categoria}</span>
                )}
                <h3 className="font-serif text-2xl text-[#F4F1ED] leading-tight mb-4">
                  {a.titolo}
                </h3>
                <p className="text-sm text-[#E6E2D8]/60 line-clamp-3 mb-6 flex-1">
                  {(a.contenuto || "").slice(0, 160)}...
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-xs text-[#E6E2D8]/40">{formatDate(a.created_at)}</span>
                  <Link
                    to={`/blog/${a._id}`}
                    data-testid={`blog-card-link-${i}`}
                    className="text-xs tracking-[0.15em] uppercase text-[#D4A017] hover:text-[#E5B942]"
                  >
                    Leggi →
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
