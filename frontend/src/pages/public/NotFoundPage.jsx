import { Link } from "react-router-dom";
import Mascotte from "@/components/shared/Mascotte";

export default function NotFoundPage() {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#E5D9C5] flex items-center justify-center px-6 py-20" data-testid="404-page">
      <div className="text-center max-w-lg">
        <Mascotte name="curioso" theme="gold" size={180} animation="wiggle" />
        <div className="mt-8 text-xs tracking-[0.25em] uppercase text-[#D4A017]">Errore 404</div>
        <h1 className="mt-4 font-serif text-4xl lg:text-5xl text-[#1C1C1C] leading-tight">
          Questa pagina si è nascosta.
        </h1>
        <p className="mt-6 text-[rgba(28,28,28,0.6)] leading-relaxed">
          Forse l'URL non esiste più, o forse stiamo ancora costruendo questa parte del sito. In ogni caso, possiamo aiutarti a tornare sulla strada giusta.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            data-testid="404-home-btn"
            className="px-6 py-3 bg-[#D4A017] hover:bg-[#E5B942] text-[#111111] rounded-full text-sm font-medium tracking-wide transition-all"
          >
            Torna alla home
          </Link>
          <Link
            to="/questionario"
            data-testid="404-questionario-btn"
            className="px-6 py-3 text-[rgba(28,28,28,0.7)] hover:text-[#D4A017] text-sm tracking-wide"
          >
            Inizia il questionario →
          </Link>
        </div>
      </div>
    </main>
  );
}
