import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { API } from "@/contexts/AuthContext";
import { ArrowLeft, Calendar, User } from "lucide-react";

function formatDate(d) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("it-IT", { year: "numeric", month: "long", day: "numeric" });
  } catch { return ""; }
}

// Content is authored by the admin / seeded from our own HTML source, so inner HTML is safe.
// Only <p>, <strong>, <em> tags are expected.
function hasHtmlMarkup(s) {
  return /<(p|em|strong|br)[\s>/]/i.test(s || "");
}

export default function BlogPostPage() {
  const { id } = useParams();
  const [articolo, setArticolo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/public/blog`).then(r => {
      const found = (r.data || []).find(a => a._id === id);
      setArticolo(found || null);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <main className="min-h-[calc(100vh-80px)] bg-[#111111] flex items-center justify-center text-[#E6E2D8]/40">Caricamento...</main>;
  }

  if (!articolo) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-[#111111] flex items-center justify-center px-6" data-testid="blog-not-found">
        <div className="text-center">
          <h1 className="font-serif text-3xl text-[#F4F1ED] mb-4">Articolo non trovato</h1>
          <Link to="/blog" className="text-[#D4A017] hover:text-[#E5B942]">← Torna al blog</Link>
        </div>
      </main>
    );
  }

  const contenuto = articolo.contenuto || "";
  const isHtml = hasHtmlMarkup(contenuto);

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#111111] py-16 lg:py-24" data-testid="blog-post">
      <article className="max-w-3xl mx-auto px-6 lg:px-10">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-[#E6E2D8]/50 hover:text-[#D4A017] mb-10">
          <ArrowLeft className="w-4 h-4" /> Torna al blog
        </Link>

        {articolo.categoria && (
          <span className="text-xs tracking-[0.25em] uppercase text-[#D4A017]">{articolo.categoria}</span>
        )}
        <h1 className="mt-4 font-serif text-4xl lg:text-5xl text-[#F4F1ED] leading-tight">
          {articolo.titolo}
        </h1>

        <div className="mt-8 pb-8 border-b border-white/10 flex flex-wrap gap-6 text-sm text-[#E6E2D8]/50">
          <span className="flex items-center gap-2"><User className="w-4 h-4" />{articolo.autore_nome}</span>
          <span className="flex items-center gap-2"><Calendar className="w-4 h-4" />{formatDate(articolo.created_at)}</span>
        </div>

        {articolo.immagine_url && (
          <div className="mt-10 rounded-3xl overflow-hidden border border-white/5">
            <img
              src={articolo.immagine_url}
              alt=""
              loading="eager"
              className="w-full h-auto max-h-[520px] object-cover"
              data-testid="blog-post-image"
            />
          </div>
        )}

        {isHtml ? (
          <div
            className="blog-prose mt-10"
            dangerouslySetInnerHTML={{ __html: contenuto }}
          />
        ) : (
          <div className="mt-10">
            {contenuto.split("\n").filter(Boolean).map((p, i) => (
              <p key={i} className="text-lg text-[#E6E2D8]/80 leading-loose mb-6 font-serif">
                {p}
              </p>
            ))}
          </div>
        )}

        <div className="mt-16 p-8 bg-[#1C2A33]/40 border border-white/10 rounded-3xl text-center">
          <h3 className="font-serif text-2xl text-[#F4F1ED] mb-3">Hai bisogno di parlarne?</h3>
          <p className="text-[#E6E2D8]/60 mb-6">Prova il nostro questionario e trova lo specialista giusto per te.</p>
          <Link
            to="/questionario"
            data-testid="blog-post-cta"
            className="inline-flex items-center gap-3 px-6 py-3 bg-[#D4A017] hover:bg-[#E5B942] text-[#111111] rounded-full text-sm font-medium tracking-wide"
          >
            Inizia il questionario
          </Link>
        </div>
      </article>
    </main>
  );
}
