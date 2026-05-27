import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, ShieldCheck, Heart, Award, Lock, Sparkles, Check, X,
  Quote, AlertCircle, MessageCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { API } from "@/contexts/AuthContext";
import { AREE_INTERVENTO, AREE_CATEGORIE, TESTIMONIANZE } from "@/data/areeIntervento";
import Mascotte from "@/components/shared/Mascotte";

const HERO_BG = "/home-daily.jpg";

const STEPS = [
  { n: "01", title: "Compila il questionario", desc: "5 domande riservate, in 2 minuti. Nessun giudizio, nessun imbarazzo.", mascot: "embrulhado", anim: "float" },
  { n: "02", title: "Ricevi 3 abbinamenti", desc: "Ti presentiamo i 3 sessuologi più affini al tuo profilo e ai tuoi obiettivi.", mascot: "pensativo", anim: "breathe" },
  { n: "03", title: "Inizia il percorso", desc: "Online, nello spazio che ti fa sentire più al sicuro. Oppure immersivo, se il terapeuta lo propone.", mascot: "saltitante", anim: "wiggle" },
];

const BENEFITS = [
  {
    titolo: "Iper-specialisti",
    descrizione: "Non ci occupiamo di tutto: solo di sessuologia. Questo ci rende unici — e davvero bravi in ciò che conta per te.",
    icon: Award,
  },
  {
    titolo: "Sedute immersive",
    descrizione: "Prima piattaforma italiana a offrire sedute terapeutiche immersive per disfunzioni, fobie e blocchi. Sempre guidate dal tuo terapeuta.",
    icon: Sparkles,
    highlight: true,
  },
  {
    titolo: "Parla senza filtri",
    descrizione: "Uno spazio dove non serve fare giri di parole. Anche i temi che non racconti a nessuno, qui trovano ascolto.",
    icon: MessageCircle,
  },
  {
    titolo: "Riservatezza assoluta",
    descrizione: "Cifratura end-to-end, segreto professionale, zero dati condivisi. La tua intimità è intima davvero.",
    icon: Lock,
  },
  {
    titolo: "Specialisti verificati",
    descrizione: "Ogni professionista è iscritto all'Albo degli Psicologi italiano con polizza assicurativa attiva. Verifichiamo tutto, periodicamente.",
    icon: ShieldCheck,
  },
];

const SERVE_LIST = [
  "Ansia da prestazione e blocchi sessuali",
  "Disfunzioni erettili, eiaculazione precoce",
  "Anorgasmia, dispareunia, vaginismo",
  "Cali del desiderio, differenze nella coppia",
  "Identità di genere, orientamento, percorsi di affermazione",
  "Traumi sessuali e abusi",
  "Dipendenze sessuali e da pornografia",
  "Sessualità nelle diverse fasi di vita (gravidanza, menopausa, terza età)",
];

const NON_SERVE_LIST = [
  "Emergenze psichiatriche acute (in questo caso: 112 o TP 02.2327.2327)",
  "Prescrizione di farmaci (non siamo psichiatri)",
  "Diagnosi mediche di malattie organiche",
];

export default function HomePage() {
  const [terapisti, setTerapisti] = useState([]);

  useEffect(() => {
    axios.get(`${API}/public/terapisti`).then(r => setTerapisti(r.data.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <main data-testid="homepage" className="relative bg-[#111111] overflow-hidden">
      {/* ────────── UNIFIED ATMOSPHERIC BACKDROP — covers entire homepage ────────── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Base warm-home image, very low opacity for whole-page texture */}
        <div
          className="absolute inset-0 opacity-[0.08] bg-fixed"
          style={{ backgroundImage: `url(${HERO_BG})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
        {/* Soft amber bloom top-left */}
        <div className="absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full bg-[#D4A017]/10 blur-3xl" />
        {/* Steel-blue bloom bottom-right */}
        <div className="absolute -bottom-32 -right-32 w-[800px] h-[800px] rounded-full bg-[#6B8FA3]/8 blur-3xl" />
        {/* Mid amber bloom */}
        <div className="absolute top-[40%] left-[35%] w-[500px] h-[500px] rounded-full bg-[#D4A017]/5 blur-3xl" />
      </div>

      {/* ────────── HERO ────────── */}
      <section className="relative">
        {/* Hero-only stronger image */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-30"
            style={{ backgroundImage: `url(${HERO_BG})`, backgroundSize: "cover", backgroundPosition: "center" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/30 via-[#111111]/70 to-[#111111]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-20 lg:pt-32 pb-28 lg:pb-40">
          {/* Hero mascots — floating decoratively on the side */}
          <div className="hidden lg:block absolute right-10 top-32 opacity-90 pointer-events-none">
            <Mascotte name="abbraccio" theme="dark" size={180} animation="breathe" />
          </div>
          <div className="hidden xl:block absolute right-56 top-72 opacity-70 pointer-events-none">
            <Mascotte name="saltitante" theme="dark" size={110} animation="float" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-4xl relative z-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4A017]/10 border border-[#D4A017]/30 text-[#D4A017] text-xs tracking-[0.2em] uppercase mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              Sessuologia online · Riservata · Senza giudizio
            </div>

            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.05] text-[#F4F1ED] tracking-tight">
              Parla di tutto.
              <br /><em className="text-[#D4A017] not-italic">Anche di quello.</em>
            </h1>

            <p className="mt-8 text-lg lg:text-xl text-[#E6E2D8]/75 leading-relaxed max-w-2xl">
              Sessuologia online con specialisti dedicati. Percorsi tradizionali, guidati dal tuo terapeuta,
              nel <strong className="text-[#F4F1ED]">tuo spazio sicuro</strong>. Sempre.
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
                to="/sedute-immersive"
                data-testid="hero-immersive-btn"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-[#6B8FA3]/40 text-[#E6E2D8] hover:bg-[#6B8FA3]/10 rounded-full tracking-wide transition-all"
              >
                <Sparkles className="w-4 h-4 text-[#D4A017]" /> Scopri le sedute immersive
              </Link>
            </div>

            <div className="mt-16 flex flex-wrap items-center gap-x-10 gap-y-6 text-xs text-[#E6E2D8]/60">
              <span className="flex items-center gap-3">
                <Mascotte name="abbraccio" theme="blue" size={36} animation="breathe" />
                Riservato e cifrato
              </span>
              <span className="flex items-center gap-3">
                <Mascotte name="pensativo" theme="blue" size={36} animation="float" />
                Specialisti iscritti all'Albo
              </span>
              <span className="flex items-center gap-3">
                <Mascotte name="peludo" theme="blue" size={36} animation="wiggle" />
                100% sessuologia
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ────────── HOW IT WORKS ────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-24 lg:py-32" data-testid="how-it-works">
        <div className="max-w-2xl mb-16">
          <span className="text-[#D4A017] text-xs tracking-[0.25em] uppercase">Come funziona</span>
          <h2 className="mt-4 font-serif text-4xl lg:text-5xl text-[#F4F1ED] leading-tight">
            Tre passi.<br />Nessuna attesa infinita.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((s, i) => {
            return (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                data-testid={`step-${s.n}`}
                className="relative p-8 lg:p-10 bg-[#1C2A33]/40 border border-white/10 rounded-3xl hover:border-[#D4A017]/40 transition-all group overflow-hidden"
              >
                {/* Glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#D4A017]/0 to-[#D4A017]/0 group-hover:from-[#D4A017]/5 group-hover:to-transparent transition-all duration-700 pointer-events-none" />
                <div className="relative flex items-start justify-between mb-6">
                  <span className="font-serif text-5xl text-[#D4A017]/30 group-hover:text-[#D4A017]/70 transition-colors">{s.n}</span>
                  <Mascotte name={s.mascot} theme="gold" size={70} animation={s.anim} />
                </div>
                <h3 className="font-serif text-2xl text-[#F4F1ED] mb-3 relative">{s.title}</h3>
                <p className="text-[#E6E2D8]/60 text-sm leading-relaxed relative">{s.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ────────── SEDUTE IMMERSIVE (DIFFERENZIATORE) ────────── */}
      <section className="relative" data-testid="immersive-section">
        {/* Subtle darker overlay for emphasis */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1C2A33]/40 via-transparent to-[#0A0A0A]/30 pointer-events-none" />
        <div className="absolute -top-20 -right-40 w-[500px] h-[500px] rounded-full bg-[#D4A017]/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-24 lg:py-36 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4A017]/10 border border-[#D4A017]/30 text-[#D4A017] text-xs tracking-[0.2em] uppercase mb-8">
              <Sparkles className="w-3.5 h-3.5" /> Il nostro differenziale
            </div>
            <h2 className="font-serif text-4xl lg:text-6xl text-[#F4F1ED] leading-[1.05]">
              Sedute immersive.<br /><em className="text-[#D4A017] not-italic">La terapia, reimmaginata.</em>
            </h2>
            <p className="mt-8 text-lg text-[#E6E2D8]/75 leading-relaxed max-w-2xl">
              La prima piattaforma italiana a integrare <strong className="text-[#F4F1ED]">ambienti immersivi terapeutici</strong>
              nei percorsi di sessuologia. Il tuo terapeuta può guidarti attraverso esperienze di esposizione
              graduale, desensibilizzazione e consapevolezza corporea, <strong className="text-[#F4F1ED]">sempre nello
              spazio sicuro della tua casa</strong>.
            </p>

            <div className="mt-10 grid sm:grid-cols-3 gap-6">
              <div>
                <div className="font-serif text-4xl lg:text-5xl text-[#D4A017]">−35%</div>
                <div className="text-xs tracking-[0.15em] uppercase text-[#E6E2D8]/50 mt-2">
                  tempo di trattamento medio per fobie e disfunzioni ansiose<sup>*</sup>
                </div>
              </div>
              <div>
                <div className="font-serif text-4xl lg:text-5xl text-[#D4A017]">72%</div>
                <div className="text-xs tracking-[0.15em] uppercase text-[#E6E2D8]/50 mt-2">
                  dei pazienti riporta maggiore comfort rispetto all'esposizione tradizionale<sup>*</sup>
                </div>
              </div>
              <div>
                <div className="font-serif text-4xl lg:text-5xl text-[#D4A017]">0€</div>
                <div className="text-xs tracking-[0.15em] uppercase text-[#E6E2D8]/50 mt-2">
                  costo extra: le sedute immersive sono incluse nel percorso
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/sedute-immersive"
                data-testid="immersive-deep-link"
                className="inline-flex items-center gap-3 px-7 py-3.5 bg-[#D4A017] hover:bg-[#E5B942] text-[#111111] font-medium rounded-full text-sm tracking-wide transition-all"
              >
                Scopri come funziona <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/questionario"
                className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/15 text-[#E6E2D8] hover:bg-white/5 rounded-full text-sm tracking-wide transition-all"
              >
                Inizia un percorso
              </Link>
            </div>

            <p className="mt-6 text-xs text-[#E6E2D8]/35 leading-relaxed">
              <sup>*</sup> Riva G. et al. (2016) — <em>Transforming experience: the potential of augmented and virtual reality for enhancing personal and clinical change</em>, Frontiers in Psychology.
              Freeman D. et al. (2017), Diemer J. et al. (2015).
            </p>
          </div>

          {/* Right side: VR mascot centerpiece — replaces the photo */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="relative flex items-center justify-center w-full"
              data-testid="immersive-vr-stage"
            >
              {/* Soft gold halo behind the mascot */}
              <div className="absolute w-[420px] h-[420px] rounded-full bg-[#D4A017]/15 blur-3xl" />
              <div className="absolute w-[260px] h-[260px] rounded-full bg-[#D4A017]/20 blur-2xl" />
              <Mascotte name="vr" theme="gold" size={360} animation="breathe" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ────────── AREE DI INTERVENTO ────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-24 lg:py-32" data-testid="aree-intervento">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div className="max-w-2xl">
            <span className="text-[#D4A017] text-xs tracking-[0.25em] uppercase">Aree di intervento</span>
            <h2 className="mt-4 font-serif text-4xl lg:text-5xl text-[#F4F1ED] leading-tight">
              Temi che qui<br />si possono dire.
            </h2>
            <p className="mt-6 text-[#E6E2D8]/60 text-lg">
              Nessun argomento è fuori posto. Qualunque sia la tua storia, c'è uno specialista preparato ad ascoltarla.
            </p>
          </div>
          <Link to="/aree-intervento" className="text-sm text-[#6B8FA3] hover:text-[#94B2C2] tracking-wide">
            Vedi tutte le aree →
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AREE_INTERVENTO.slice(0, 12).map((a, i) => {
            const cat = AREE_CATEGORIE[a.categoria] || {};
            return (
              <motion.div
                key={a.slug}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (i % 6) * 0.05 }}
                data-testid={`area-${a.slug}`}
                className="group p-6 bg-[#1C2A33]/30 border border-white/10 hover:border-[#D4A017]/40 rounded-2xl transition-all cursor-default"
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className="text-[10px] tracking-[0.2em] uppercase px-2 py-0.5 rounded-full border"
                    style={{ color: cat.color, borderColor: `${cat.color}40`, background: `${cat.color}10` }}
                  >
                    {cat.label}
                  </span>
                </div>
                <h3 className="font-serif text-xl text-[#F4F1ED] leading-tight mb-2 group-hover:text-[#D4A017] transition-colors">{a.titolo}</h3>
                <p className="text-xs text-[#E6E2D8]/55 leading-relaxed line-clamp-3">{a.descrizione}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/aree-intervento"
            className="inline-flex items-center gap-2 px-6 py-3 border border-white/15 text-[#E6E2D8] hover:bg-white/5 rounded-full text-sm tracking-wide transition-all"
          >
            Esplora tutte le {AREE_INTERVENTO.length} aree <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* ────────── PERCHÉ FUNZIONABENE ────────── */}
      <section className="relative" data-testid="perche-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-24 lg:py-32">
          <div className="max-w-2xl mb-16">
            <span className="text-[#D4A017] text-xs tracking-[0.25em] uppercase">Perché FunzionaBene</span>
            <h2 className="mt-4 font-serif text-4xl lg:text-5xl text-[#F4F1ED] leading-tight">
              Non per tutti.<br />Per chi vuole davvero uno specialista.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={b.titolo}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  data-testid={`benefit-${i}`}
                  className={`p-7 rounded-3xl border transition-all ${
                    b.highlight
                      ? "bg-gradient-to-br from-[#D4A017]/15 via-[#1C2A33]/40 to-transparent border-[#D4A017]/40"
                      : "bg-[#1C2A33]/30 border-white/10 hover:border-[#6B8FA3]/40"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${b.highlight ? "bg-[#D4A017]/20" : "bg-[#6B8FA3]/10"}`}>
                    <Icon className={`w-5 h-5 ${b.highlight ? "text-[#D4A017]" : "text-[#6B8FA3]"}`} />
                  </div>
                  <h3 className="font-serif text-2xl text-[#F4F1ED] mb-3 leading-tight">{b.titolo}</h3>
                  <p className="text-sm text-[#E6E2D8]/60 leading-relaxed">{b.descrizione}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ────────── TESTIMONIANZE ────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-24 lg:py-32" data-testid="testimonianze-section">
        <div className="mb-16 max-w-2xl">
          <span className="text-[#D4A017] text-xs tracking-[0.25em] uppercase">Storie dei nostri pazienti</span>
          <h2 className="mt-4 font-serif text-4xl lg:text-5xl text-[#F4F1ED] leading-tight">
            Qualcuno l'ha già fatto<br />prima di te.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIANZE.map((t, i) => (
            <motion.blockquote
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.1 }}
              data-testid={`testimonial-${i}`}
              className="p-7 bg-[#1C2A33]/30 border border-white/10 rounded-2xl flex flex-col"
            >
              <Quote className="w-6 h-6 text-[#D4A017]/60 mb-4" />
              <p className="text-[#E6E2D8]/85 leading-relaxed font-serif text-lg flex-1">
                "{t.testo}"
              </p>
              <div className="mt-6 pt-5 border-t border-white/10">
                <div className="text-sm text-[#F4F1ED]">{t.nome}</div>
                <div className="text-xs tracking-[0.15em] uppercase text-[#6B8FA3] mt-1">{t.area}</div>
                <div className="text-xs text-[#E6E2D8]/40 mt-1">{t.durata}</div>
              </div>
            </motion.blockquote>
          ))}
        </div>

        <p className="mt-12 text-xs text-[#E6E2D8]/35 text-center max-w-2xl mx-auto leading-relaxed">
          Testimonianze rappresentative. Nomi, età e dettagli sono stati modificati per tutelare la riservatezza dei pazienti, come previsto dal codice deontologico degli psicologi e dal GDPR.
        </p>
      </section>

      {/* ────────── A COSA SERVE / NON SERVE ────────── */}
      <section className="relative" data-testid="serve-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-24 lg:py-32 grid lg:grid-cols-2 gap-10">
          <div className="p-10 bg-[#1C2A33]/40 border border-[#D4A017]/20 rounded-3xl">
            <div className="inline-flex items-center gap-2 text-[#D4A017] text-xs tracking-[0.2em] uppercase mb-5">
              <Check className="w-4 h-4" /> Ecco per cosa siamo qui
            </div>
            <h3 className="font-serif text-3xl text-[#F4F1ED] mb-8">A cosa serve FunzionaBene</h3>
            <ul className="space-y-4">
              {SERVE_LIST.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-[#E6E2D8]/80 text-sm leading-relaxed">
                  <Check className="w-4 h-4 text-[#D4A017] flex-shrink-0 mt-0.5" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-10 bg-[#1C2A33]/20 border border-white/10 rounded-3xl">
            <div className="inline-flex items-center gap-2 text-[#E6E2D8]/60 text-xs tracking-[0.2em] uppercase mb-5">
              <AlertCircle className="w-4 h-4" /> Onestà prima di tutto
            </div>
            <h3 className="font-serif text-3xl text-[#F4F1ED] mb-8">A cosa non serve</h3>
            <ul className="space-y-4">
              {NON_SERVE_LIST.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-[#E6E2D8]/70 text-sm leading-relaxed">
                  <X className="w-4 h-4 text-[#C77474] flex-shrink-0 mt-0.5" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 pt-6 border-t border-white/10">
              <Link to="/emergenze" className="text-sm text-[#D4A017] hover:text-[#E5B942] inline-flex items-center gap-2">
                Se stai vivendo un'emergenza → consulta i numeri di aiuto
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── THERAPISTS PREVIEW ────────── */}
      {terapisti.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-24 lg:py-32" data-testid="therapists-preview">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <span className="text-[#D4A017] text-xs tracking-[0.25em] uppercase">I nostri specialisti</span>
              <h2 className="mt-4 font-serif text-4xl lg:text-5xl text-[#F4F1ED]">Professionisti, umani.</h2>
            </div>
            <Link to="/questionario" className="text-sm text-[#6B8FA3] hover:text-[#94B2C2] tracking-wide">
              Trova il tuo sessuologo →
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
                {t.foto_url ? (
                  <img src={t.foto_url} alt={`${t.nome} ${t.cognome}`} className="w-20 h-20 rounded-full object-cover border border-white/10 mb-6" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#D4A017]/20 to-[#6B8FA3]/20 border border-white/10 flex items-center justify-center mb-6">
                    <span className="font-serif text-3xl text-[#D4A017]">
                      {(t.nome || "?")[0]}{(t.cognome || "?")[0]}
                    </span>
                  </div>
                )}
                <h3 className="font-serif text-2xl text-[#F4F1ED]">Dr. {t.nome} {t.cognome}</h3>
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

      {/* ────────── CTA BAND ────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-24 lg:pb-32" data-testid="cta-band">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1C2A33] via-[#1C2A33] to-[#0A0A0A] border border-white/10 p-12 lg:p-20">
          <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-[#D4A017]/10 blur-3xl" />
          <div className="hidden md:block absolute right-12 bottom-12 lg:right-20 lg:bottom-20 opacity-80">
            <Mascotte name="abbraccio" theme="dark" size={160} animation="breathe" />
          </div>
          <div className="relative max-w-2xl">
            <h2 className="font-serif text-4xl lg:text-5xl text-[#F4F1ED] leading-tight">
              Un primo passo.<br />Il più difficile, il più importante.
            </h2>
            <p className="mt-6 text-[#E6E2D8]/60 text-lg leading-relaxed">
              Il questionario richiede 2 minuti. Puoi interromperlo in qualsiasi momento. Nessuna carta richiesta per iniziare.
            </p>
            <Link
              to="/questionario"
              data-testid="cta-start-btn"
              className="mt-10 inline-flex items-center gap-3 px-8 py-4 bg-[#D4A017] hover:bg-[#E5B942] text-[#111111] font-medium rounded-full tracking-wide transition-all"
            >
              Inizia ora <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
