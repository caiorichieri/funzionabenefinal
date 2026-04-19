import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";

export default function LegalLayout({ title, lastUpdate, children, testId }) {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#111111] py-16 lg:py-24" data-testid={testId}>
      <article className="max-w-3xl mx-auto px-6 lg:px-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#E6E2D8]/50 hover:text-[#D4A017] mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Torna alla home
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-full bg-[#D4A017]/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-[#D4A017]" />
          </div>
          <span className="text-[#D4A017] text-xs tracking-[0.25em] uppercase">Informativa legale</span>
        </div>

        <h1 className="font-serif text-4xl lg:text-5xl text-[#F4F1ED] leading-tight">{title}</h1>
        {lastUpdate && (
          <p className="mt-3 text-xs tracking-[0.15em] uppercase text-[#E6E2D8]/40">
            Ultimo aggiornamento: {lastUpdate}
          </p>
        )}

        <div className="mt-12 prose prose-invert max-w-none text-[#E6E2D8]/75 leading-relaxed [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:text-[#F4F1ED] [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:text-[#D4A017] [&_h3]:text-xs [&_h3]:tracking-[0.15em] [&_h3]:uppercase [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-4 [&_p]:text-base [&_ul]:mb-4 [&_ul]:pl-6 [&_ul]:list-disc [&_li]:mb-2 [&_strong]:text-[#F4F1ED] [&_a]:text-[#D4A017] [&_a]:underline">
          {children}
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 text-xs text-[#E6E2D8]/40">
          <p>FunzionaBene — Clinica di Psicologia e Sessuologia · P.IVA 00000000000</p>
          <p className="mt-2">
            Per domande su questa informativa: <a href="mailto:privacy@funzionabene.it" className="text-[#D4A017] hover:text-[#E5B942]">privacy@funzionabene.it</a>
          </p>
        </div>
      </article>
    </main>
  );
}
