import { Link } from "react-router-dom";
import Mascotte from "@/components/shared/Mascotte";

export default function NotFoundPage() {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#E9D628] flex items-center justify-center px-6 py-20" data-testid="404-page">
      <div className="text-center max-w-lg">
        <Mascotte name="curioso" theme="light" size={180} animation="wiggle" />
        <div className="mt-8 text-xs tracking-[0.25em] uppercase text-[#0A0A0A]">Errore 404</div>
        <h1 className="mt-4 font-serif text-4xl lg:text-5xl text-[#0A0A0A] leading-tight">
          Questa pagina si è nascosta.
        </h1>
        <p className="mt-6 text-[#0A0A0A]/65 leading-relaxed">
          Forse l'URL non esiste più, o forse stiamo ancora costruendo questa parte del sito. In ogni caso, possiamo aiutarti a tornare sulla strada giusta.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            data-testid="404-home-btn"
            className="px-6 py-3 bg-gradient-to-r from-[#F58A1F] to-[#F5D419] hover:from-[#E07A0F] hover:to-[#E5C419] text-[#0A0A0A] font-bold rounded-2xl shadow-md hover:shadow-lg text-sm font-medium tracking-wide transition-all"
          >
            Torna alla home
          </Link>
          <Link
            to="/questionario"
            data-testid="404-questionario-btn"
            className="px-6 py-3 text-[#0A0A0A]/75 hover:text-[#0A0A0A] text-sm tracking-wide"
          >
            Inizia il questionario →
          </Link>
        </div>
      </div>
    </main>
  );
}
