import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, Heart, ShieldCheck, Award, Users, Target } from "lucide-react";
import Mascotte from "@/components/shared/Mascotte";

const VALUES = [
  {
    icon: Target,
    titolo: "Iper-specializzazione",
    desc: "Non ci occupiamo di tutto. Ci occupiamo <strong>solo</strong> di sessuologia. Questo ci permette di selezionare solo professionisti con formazione specifica e di offrire percorsi che funzionano davvero.",
  },
  {
    icon: Sparkles,
    titolo: "Innovazione clinica",
    desc: "Siamo la prima piattaforma italiana a integrare <strong>sedute immersive</strong> nei percorsi di sessuologia. Non per moda tecnologica, ma perché la ricerca lo dimostra: funziona.",
  },
  {
    icon: Heart,
    titolo: "Calore umano",
    desc: "Dietro ogni specialista c'è una persona che ha scelto questa professione per aiutare. Niente burocrazia, niente tono asettico: solo ascolto autentico.",
  },
  {
    icon: ShieldCheck,
    titolo: "Riservatezza assoluta",
    desc: "I tuoi dati sono cifrati end-to-end, custoditi su server europei. Le sedute sono coperte dal segreto professionale. La tua intimità è intima davvero.",
  },
  {
    icon: Award,
    titolo: "Qualità certificata",
    desc: "Ogni terapeuta è iscritto all'Albo degli Psicologi con polizza assicurativa attiva. Verifichiamo periodicamente ogni documento, senza eccezioni.",
  },
  {
    icon: Users,
    titolo: "Inclusione reale",
    desc: "Nessun tema è tabù. Single, coppie, persone LGBTQIA+, età mature, identità non binarie. Qui la sessualità di ognuno trova uno spazio legittimo.",
  },
];

const STATS = [
  { n: "100%", desc: "Specialisti in sessuologia" },
  { n: "10+", desc: "Terapeuti selezionati con cura" },
  { n: "50 min", desc: "Durata di ogni seduta" },
  { n: "1ª", desc: "Piattaforma italiana con sedute immersive" },
];

export default function ChiSiamoPage() {
  return (
    <main className="min-h-[calc(100vh-80px)] relative bg-[#FBF8F2] overflow-hidden" data-testid="chisiamo-page">
      {/* Continuous atmospheric backdrop */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-[0.10] bg-fixed"
          style={{ backgroundImage: "url(/home-cozy-reading.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full bg-[#D4A017]/8 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[800px] h-[800px] rounded-full bg-[#6B8FA3]/6 blur-3xl" />
      </div>

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/home-cozy-reading.jpg"
            alt=""
            aria-hidden="true"
            loading="eager"
            className="absolute inset-0 w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(28,28,28,0.04)] via-[rgba(251,248,242,0.4)] to-[#FBF8F2]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 lg:px-10 py-20 lg:py-32">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-[rgba(28,28,28,0.5)] hover:text-[#D4A017] mb-10 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Torna alla home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            {/* Peeking mascot on the right side */}
            <div className="hidden md:block absolute right-0 top-0 -mr-6 -mt-4 opacity-90">
              <Mascotte name="coppia" theme="gold" size={180} animation="breathe" />
            </div>
            <span className="text-[#D4A017] text-xs tracking-[0.25em] uppercase">Chi siamo</span>
            <h1 className="mt-4 font-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.05] text-[#1C1C1C] tracking-tight max-w-3xl">
              Una piattaforma curata,<br /><em className="text-[#D4A017] not-italic">non un marketplace.</em>
            </h1>
            <p className="mt-8 text-lg lg:text-xl text-[rgba(28,28,28,0.7)] leading-relaxed max-w-3xl">
              FunzionaBene nasce nel 2026 da un'idea semplice: portare la sessuologia italiana al livello
              che merita. Con professionisti scelti uno a uno, tecnologia al servizio della cura e un linguaggio
              che non ha paura di chiamare le cose con il loro nome.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-5xl mx-auto px-6 lg:px-10 py-20 lg:py-28" data-testid="mission-section">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <span className="text-[#D4A017] text-xs tracking-[0.25em] uppercase">La nostra missione</span>
            <h2 className="mt-4 font-serif text-4xl lg:text-5xl text-[#1C1C1C] leading-tight">
              Rendere normale parlare di ciò che finora è stato silenzioso.
            </h2>
          </div>
          <div className="lg:col-span-7 space-y-6 text-[rgba(28,28,28,0.7)] leading-relaxed text-lg">
            <p>
              La sessualità è ancora, nel 2026, uno dei temi più <strong className="text-[#1C1C1C]">non detti</strong> della
              salute mentale italiana. Si parla di ansia. Si parla di depressione. Ma quando si tratta di disfunzioni sessuali,
              di blocchi emotivi legati all'intimità, di differenze di desiderio in coppia — spesso il silenzio vince.
            </p>
            <p>
              FunzionaBene esiste per rompere quel silenzio. In modo <strong className="text-[#1C1C1C]">professionale,
              discreto e umano</strong>. Non siamo un'app di auto-aiuto. Non siamo un marketplace dove un algoritmo
              ti accoppia al primo disponibile. Siamo una piattaforma curata dove ogni professionista è scelto personalmente,
              ogni percorso è costruito su misura, e la tua esperienza conta quanto la tua diagnosi.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative py-16" data-testid="stats-section">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 grid md:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="font-serif text-5xl lg:text-6xl text-[#D4A017]">{s.n}</div>
              <div className="mt-3 text-xs tracking-[0.2em] uppercase text-[rgba(28,28,28,0.5)]">{s.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-20 lg:py-28" data-testid="values-section">
        <div className="max-w-2xl mb-14">
          <span className="text-[#D4A017] text-xs tracking-[0.25em] uppercase">I nostri valori</span>
          <h2 className="mt-4 font-serif text-4xl lg:text-5xl text-[#1C1C1C] leading-tight">
            Sei principi che non sono negoziabili.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {VALUES.map((v, i) => {
            const Icon = v.icon;
            return (
              <motion.div
                key={v.titolo}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                data-testid={`value-${i}`}
                className="p-7 bg-white/30 border border-[rgba(28,28,28,0.08)] rounded-3xl"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#D4A017]/10 flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-[#D4A017]" />
                </div>
                <h3 className="font-serif text-xl text-[#1C1C1C] mb-3 leading-tight">{v.titolo}</h3>
                <p className="text-sm text-[rgba(28,28,28,0.6)] leading-relaxed" dangerouslySetInnerHTML={{ __html: v.desc }} />
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Team philosophy */}
      <section className="relative" data-testid="team-section">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 py-20 lg:py-28">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <span className="text-[#D4A017] text-xs tracking-[0.25em] uppercase">Il team</span>
              <h2 className="mt-4 font-serif text-4xl lg:text-5xl text-[#1C1C1C] leading-tight">
                Pochi, scelti con cura.
              </h2>
            </div>
            <div className="lg:col-span-7 space-y-6 text-[rgba(28,28,28,0.7)] leading-relaxed">
              <p>
                Non abbiamo 3000 terapeuti. Ne abbiamo una decina, e tutti li conosciamo personalmente.
                Ognuno è stato selezionato per competenza clinica, empatia e specializzazione concreta in sessuologia —
                non solo un corso fatto una volta, ma anni di pratica specifica.
              </p>
              <p>
                Verifichiamo <strong className="text-[#1C1C1C]">ogni trimestre</strong> l'iscrizione all'Albo, la validità
                della polizza assicurativa professionale e la partecipazione a percorsi di supervisione continua.
                Se qualcosa scade, sospendiamo immediatamente il terapeuta dalla piattaforma.
              </p>
              <Link to="/questionario" className="inline-flex items-center gap-2 text-[#D4A017] hover:text-[#E5B942] text-sm tracking-wide mt-4">
                Conosci i nostri specialisti <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why sexology only */}
      <section className="max-w-4xl mx-auto px-6 lg:px-10 py-20 lg:py-28" data-testid="why-section">
        <span className="text-[#D4A017] text-xs tracking-[0.25em] uppercase">Perché solo sessuologia</span>
        <h2 className="mt-4 font-serif text-4xl lg:text-5xl text-[#1C1C1C] leading-tight mb-10">
          Uno può fare tutto.<br />Oppure fare una cosa sola, benissimo.
        </h2>
        <div className="space-y-6 text-[rgba(28,28,28,0.7)] leading-relaxed text-lg">
          <p>
            Altre piattaforme offrono psicologia generica, coaching, nutrizione, psichiatria. Va bene,
            è un modello di business legittimo. Ma per temi delicati come la sessualità, noi crediamo
            che serva <strong className="text-[#1C1C1C]">chi ha fatto di questa materia la sua vita professionale</strong>.
          </p>
          <p>
            Un terapeuta che tratta ansia-depressione-coppia-sessualità-lutto tutto insieme difficilmente
            può essere altrettanto preparato su ogni tema. Un terapeuta che da 15 anni si occupa quasi
            esclusivamente di disfunzioni erettili — quello fa la differenza.
          </p>
          <p className="text-[#D4A017] font-serif text-2xl italic">
            "La specializzazione non è limitazione. È rispetto per chi ci sceglie."
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 lg:px-10 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#D4A017]/10 via-[#1C2A33]/60 to-[#FBF8F2] border border-[#D4A017]/30 p-10 lg:p-16 text-center">
          <h2 className="font-serif text-4xl lg:text-5xl text-[#1C1C1C] leading-tight max-w-2xl mx-auto">
            Ora che ci conosci, parliamo di te.
          </h2>
          <p className="mt-5 text-[rgba(28,28,28,0.6)] max-w-xl mx-auto">
            Il questionario in 2 minuti individua le aree più rilevanti per te e ti propone i 3 specialisti più affini.
          </p>
          <Link
            to="/questionario"
            data-testid="chi-siamo-cta"
            className="mt-10 inline-flex items-center gap-3 px-8 py-4 bg-[#D4A017] hover:bg-[#E5B942] text-[#111111] font-medium rounded-full tracking-wide transition-all"
          >
            Inizia il Questionario <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
