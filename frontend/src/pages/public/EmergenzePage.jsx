import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, Phone, Heart, Shield, ExternalLink, ArrowLeft } from "lucide-react";
import Mascotte from "@/components/shared/Mascotte";

const NUMBERS = [
  {
    n: "112",
    label: "Emergenza generale",
    desc: "Il numero unico europeo per ogni emergenza grave. Chiamalo in caso di pericolo per la vita, propria o altrui.",
    tel: "tel:112",
    urgent: true,
  },
  {
    n: "02.2327.2327",
    label: "Telefono Amico",
    desc: "Linea di ascolto nazionale. Attivo 10–24 tutti i giorni. Gratuito, anonimo, riservato.",
    tel: "tel:0223272327",
    urgent: true,
  },
  {
    n: "1522",
    label: "Anti-violenza e stalking",
    desc: "Numero gratuito, attivo 24/7, multilingua. Per donne vittime di violenza di genere e stalking.",
    tel: "tel:1522",
    urgent: true,
  },
  {
    n: "800.860.022",
    label: "Antiviolenza LGBTQIA+ (Gay Help Line)",
    desc: "Ascolto, supporto psicologico e legale per persone LGBTQIA+ vittime di discriminazione o violenza.",
    tel: "tel:800860022",
  },
  {
    n: "800.861.061",
    label: "SOS Prevenzione Suicidi (Samaritans Onlus)",
    desc: "Ascolto empatico, non giudicante, per chi attraversa una crisi emotiva profonda. Attivo 13–22 ogni giorno.",
    tel: "tel:800861061",
    urgent: true,
  },
  {
    n: "800.915.150",
    label: "Numero Verde Droga",
    desc: "Informazione, ascolto e orientamento per dipendenze da sostanze. Gratuito, anonimo, 24/7.",
    tel: "tel:800915150",
  },
  {
    n: "114",
    label: "Emergenza infanzia",
    desc: "Per segnalare situazioni di abuso, violenza o pericolo che coinvolgono minori. Attivo 24/7, gratuito.",
    tel: "tel:114",
    urgent: true,
  },
  {
    n: "1500",
    label: "Pubblica Utilità Ministero Salute",
    desc: "Informazioni su salute mentale, prevenzione, servizi pubblici. Attivo in orario d'ufficio.",
    tel: "tel:1500",
  },
];

export default function EmergenzePage() {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#111111] relative overflow-hidden" data-testid="emergenze-page">
      <div className="absolute inset-x-0 top-0 h-[500px] pointer-events-none">
        <img
          src="/home-cozy-reading.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          data-testid="emergenze-hero-bg"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#111111]/80 to-[#111111]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#E6E2D8]/50 hover:text-[#D4A017] mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Torna alla home
        </Link>

        {/* Warning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 p-6 lg:p-8 bg-gradient-to-br from-[#C77474]/20 via-[#C77474]/10 to-transparent border-2 border-[#C77474]/40 rounded-3xl flex items-start gap-5"
        >
          <AlertTriangle className="w-8 h-8 text-[#C77474] flex-shrink-0 mt-1" />
          <div>
            <h2 className="font-serif text-2xl text-[#F4F1ED] mb-2">Se sei in pericolo, chiama subito il 112.</h2>
            <p className="text-[#E6E2D8]/75 text-sm leading-relaxed">
              FunzionaBene <strong>non è un servizio d'emergenza</strong>. Se tu o qualcuno che conosci state vivendo una crisi acuta,
              pensieri di autolesionismo o suicidio, contatta immediatamente uno dei numeri qui sotto.
            </p>
          </div>
        </motion.div>

        <div className="mb-12 relative">
          <div className="hidden md:block absolute right-0 -top-4 opacity-90">
            <Mascotte name="abbraccio" theme="gold" size={130} animation="breathe" />
          </div>
          <span className="text-[#D4A017] text-xs tracking-[0.25em] uppercase">Numeri utili</span>
          <h1 className="mt-4 font-serif text-4xl lg:text-5xl text-[#F4F1ED] leading-tight max-w-2xl">Non sei solo. Non sei sola.</h1>
          <p className="mt-4 text-[#E6E2D8]/60 text-lg leading-relaxed max-w-2xl">
            Qui trovi numeri di ascolto, emergenza e supporto. Tutti gratuiti, molti attivi 24 ore su 24.
          </p>
        </div>

        <div className="space-y-4" data-testid="numbers-list">
          {NUMBERS.map((num, i) => (
            <motion.a
              key={num.n}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              href={num.tel}
              data-testid={`emergency-${num.n}`}
              className={`block p-6 rounded-2xl border transition-all ${
                num.urgent
                  ? "bg-[#C77474]/10 border-[#C77474]/30 hover:border-[#C77474]/60"
                  : "bg-[#1C2A33]/30 border-white/10 hover:border-[#D4A017]/40"
              }`}
            >
              <div className="flex items-start gap-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${num.urgent ? "bg-[#C77474]/20" : "bg-[#D4A017]/10"}`}>
                  <Phone className={`w-5 h-5 ${num.urgent ? "text-[#C77474]" : "text-[#D4A017]"}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-3 flex-wrap mb-1">
                    <span className={`font-mono text-2xl font-medium ${num.urgent ? "text-[#C77474]" : "text-[#D4A017]"}`}>{num.n}</span>
                    <span className="text-[#F4F1ED]">{num.label}</span>
                  </div>
                  <p className="text-sm text-[#E6E2D8]/60 leading-relaxed">{num.desc}</p>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        <div className="mt-16 p-8 bg-[#1C2A33]/30 border border-white/10 rounded-3xl">
          <div className="flex items-start gap-4 mb-5">
            <Shield className="w-6 h-6 text-[#6B8FA3] flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-serif text-2xl text-[#F4F1ED] mb-2">Se sei un professionista</h3>
              <p className="text-[#E6E2D8]/65 leading-relaxed text-sm">
                Se lavori in ambito sanitario, sociale o educativo e stai gestendo una situazione di emergenza, oltre al 112 puoi contattare
                il tuo DSM di riferimento o lo SPDC (Servizio Psichiatrico di Diagnosi e Cura) dell'ospedale più vicino.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Heart className="w-6 h-6 text-[#D4A017] flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-serif text-2xl text-[#F4F1ED] mb-2">Risorse internazionali</h3>
              <p className="text-[#E6E2D8]/65 leading-relaxed text-sm mb-3">
                Se ti trovi fuori dall'Italia:
              </p>
              <ul className="space-y-2 text-sm text-[#E6E2D8]/55">
                <li>• <a href="https://findahelpline.com/" target="_blank" rel="noreferrer" className="text-[#D4A017] hover:text-[#E5B942] inline-flex items-center gap-1">Find a Helpline (globale) <ExternalLink className="w-3 h-3" /></a></li>
                <li>• <a href="https://www.iasp.info/resources/Crisis_Centres/" target="_blank" rel="noreferrer" className="text-[#D4A017] hover:text-[#E5B942] inline-flex items-center gap-1">IASP Crisis Centres <ExternalLink className="w-3 h-3" /></a></li>
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-10 text-xs text-[#E6E2D8]/35 text-center leading-relaxed">
          Informazioni verificate alla data di ultimo aggiornamento. Consulta sempre il sito ufficiale dei servizi di riferimento.
        </p>
      </div>
    </main>
  );
}
