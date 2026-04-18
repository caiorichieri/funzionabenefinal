import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Sparkles, Calendar, Heart, ArrowRight, Award, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { API } from "@/contexts/AuthContext";

const HERO_BG = "https://images.unsplash.com/photo-1690192715829-db4e65d65dd7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwzfHxhYnN0cmFjdCUyMHdhcm0lMjBnb2xkJTIwYmx1ZSUyMHRleHR1cmV8ZW58MHx8fHwxNzc2NTEyOTEwfDA&ixlib=rb-4.1.0&q=85";

const STEPS = [
  { n: "01", title: "Compila il questionario", desc: "5 domande discrete. In 2 minuti mappiamo le tue necessità.", icon: Sparkles },
  { n: "02", title: "Ricevi 3 abbinamenti", desc: "Ti presentiamo i 3 specialisti più affini al tuo profilo.", icon: Heart },
  { n: "03", title: "Prenota la prima seduta", desc: "Scegli un orario, completa il pagamento. Online o in studio.", icon: Calendar },
];

export default function HomePage() {
  const [terapisti, setTerapisti] = useState([]);

  useEffect(() => {
    axios.get(`${API}/public/terapisti`).then(r => setTerapisti(r.data.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <main data-testid="homepage">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{ backgroundImage: `url(${HERO_BG})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#111111]/40 via-[#111111]/80 to-[#111111]" />
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#D4A017]/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#6B8FA3]/10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-20 lg:pt-32 pb-28 lg:pb-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6B8FA3]/10 border border-[#6B8FA3]/30 text-[#94B2C2] text-xs tracking-[0.2em] uppercase mb-8">
              <ShieldCheck className="w-3.5 h-3.5" />
              Discreto · Sicuro · Iscritto all'Albo
            </div>

            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.05] text-[#F4F1ED] tracking-tight">
              Trova lo <em className="text-[#D4A017] not-italic">specialista</em>
              <br />giusto per te.
            </h1>

            <p className="mt-8 text-lg lg:text-xl text-[#E6E2D8]/70 leading-relaxed max-w-2xl">
              Psicologia e sessuologia clinica. Un percorso su misura con terapeuti verificati,
              in un ambiente protetto dove puoi sentirti finalmente a tuo agio.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row gap-4">
              <Link
                to="/questionario"
                data-testid="hero-start-btn"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#D4A017] hover:bg-[#E5B942] text-[#111111] font-medium rounded-full tracking-wide transition-all"
              >
                Inizia il Questionario
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/faq"
                data-testid="hero-faq-btn"
                className="inline-flex items-center justify-center px-8 py-4 border border-[#6B8FA3]/40 text-[#E6E2D8] hover:bg-[#6B8FA3]/10 rounded-full tracking-wide transition-all"
              >
                Come funziona
              </Link>
            </div>

            <div className="mt-16 flex flex-wrap items-center gap-8 text-xs text-[#E6E2D8]/50">
              <span className="flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-[#6B8FA3]" /> SSL &amp; GDPR</span>
              <span className="flex items-center gap-2"><Award className="w-3.5 h-3.5 text-[#6B8FA3]" /> Iscritti Albo degli Psicologi</span>
              <span className="flex items-center gap-2"><Heart className="w-3.5 h-3.5 text-[#6B8FA3]" /> 98% soddisfazione pazienti</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-24 lg:py-32" data-testid="how-it-works">
        <div className="max-w-2xl mb-16">
          <span className="text-[#D4A017] text-xs tracking-[0.25em] uppercase">Come funziona</span>
          <h2 className="mt-4 font-serif text-4xl lg:text-5xl text-[#F4F1ED] leading-tight">
            Tre passi.<br />Nessuna attesa infinita.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                data-testid={`step-${s.n}`}
                className="relative p-8 lg:p-10 bg-[#1C2A33]/40 border border-white/10 rounded-3xl hover:border-[#D4A017]/40 transition-all group"
              >
                <div className="flex items-start justify-between mb-8">
                  <span className="font-serif text-5xl text-[#D4A017]/30 group-hover:text-[#D4A017]/60 transition-colors">{s.n}</span>
                  <div className="w-12 h-12 rounded-full bg-[#6B8FA3]/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#6B8FA3]" />
                  </div>
                </div>
                <h3 className="font-serif text-2xl text-[#F4F1ED] mb-3">{s.title}</h3>
                <p className="text-[#E6E2D8]/60 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* VALUES */}
      <section className="bg-[#0A0A0A] border-y border-white/5" data-testid="values-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-24 lg:py-32 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <span className="text-[#D4A017] text-xs tracking-[0.25em] uppercase">Il nostro approccio</span>
            <h2 className="mt-4 font-serif text-4xl lg:text-5xl text-[#F4F1ED] leading-tight">
              Uno spazio sicuro per ciò che fa più fatica a essere detto.
            </h2>
          </div>
          <div className="lg:col-span-7 space-y-10 lg:pl-10">
            <div className="border-l-2 border-[#D4A017]/40 pl-6">
              <h3 className="font-serif text-xl text-[#F4F1ED] mb-2">Riservatezza assoluta</h3>
              <p className="text-[#E6E2D8]/60 leading-relaxed">
                Ogni conversazione è protetta dal segreto professionale e dalla cifratura end-to-end.
                I tuoi dati non vengono mai condivisi.
              </p>
            </div>
            <div className="border-l-2 border-[#D4A017]/40 pl-6">
              <h3 className="font-serif text-xl text-[#F4F1ED] mb-2">Specialisti verificati</h3>
              <p className="text-[#E6E2D8]/60 leading-relaxed">
                Tutti i nostri terapeuti sono iscritti all'Albo degli Psicologi italiano,
                con polizza assicurativa attiva e verifica periodica.
              </p>
            </div>
            <div className="border-l-2 border-[#D4A017]/40 pl-6">
              <h3 className="font-serif text-xl text-[#F4F1ED] mb-2">Nessun giudizio</h3>
              <p className="text-[#E6E2D8]/60 leading-relaxed">
                Dalla sessuologia alla gestione dell'ansia: affrontiamo ogni tema con professionalità
                e calore umano. Nessun argomento è tabù.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* THERAPISTS PREVIEW */}
      {terapisti.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-24 lg:py-32" data-testid="therapists-preview">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <span className="text-[#D4A017] text-xs tracking-[0.25em] uppercase">I nostri specialisti</span>
              <h2 className="mt-4 font-serif text-4xl lg:text-5xl text-[#F4F1ED]">Professionisti, umani.</h2>
            </div>
            <Link to="/questionario" className="text-sm text-[#6B8FA3] hover:text-[#94B2C2] tracking-wide">
              Trova il tuo terapeuta →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {terapisti.map((t, i) => (
              <motion.div
                key={t._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                data-testid={`therapist-preview-${i}`}
                className="p-8 bg-[#1C2A33]/40 border border-white/10 rounded-3xl"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#D4A017]/20 to-[#6B8FA3]/20 border border-white/10 flex items-center justify-center mb-6">
                  <span className="font-serif text-3xl text-[#D4A017]">
                    {(t.nome || "?")[0]}{(t.cognome || "?")[0]}
                  </span>
                </div>
                <h3 className="font-serif text-2xl text-[#F4F1ED]">
                  Dr. {t.nome} {t.cognome}
                </h3>
                <p className="text-xs tracking-[0.15em] uppercase text-[#6B8FA3] mt-1">
                  {t.anni_esperienza ? `${t.anni_esperienza} anni di esperienza` : "Specialista"}
                </p>
                {Array.isArray(t.specializzazioni) && t.specializzazioni.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {t.specializzazioni.slice(0, 2).map((s) => (
                      <span key={s} className="text-xs px-3 py-1 rounded-full bg-[#D4A017]/10 text-[#D4A017] border border-[#D4A017]/20">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* CTA BAND */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-24 lg:pb-32" data-testid="cta-band">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1C2A33] via-[#1C2A33] to-[#0A0A0A] border border-white/10 p-12 lg:p-20">
          <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-[#D4A017]/10 blur-3xl" />
          <div className="relative max-w-2xl">
            <h2 className="font-serif text-4xl lg:text-5xl text-[#F4F1ED] leading-tight">
              Un primo passo.<br />Il più difficile, il più importante.
            </h2>
            <p className="mt-6 text-[#E6E2D8]/60 text-lg leading-relaxed">
              Il questionario richiede 2 minuti. Puoi interromperlo in qualsiasi momento.
              Nessuna carta di credito richiesta per iniziare.
            </p>
            <Link
              to="/questionario"
              data-testid="cta-start-btn"
              className="mt-10 inline-flex items-center gap-3 px-8 py-4 bg-[#D4A017] hover:bg-[#E5B942] text-[#111111] font-medium rounded-full tracking-wide transition-all"
            >
              Inizia ora — è gratis
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
