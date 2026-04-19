import { useEffect, useState } from "react";
import axios from "axios";
import { API } from "@/contexts/AuthContext";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FALLBACK_FAQ = [
  {
    domanda: "Come funziona l'abbinamento con il terapeuta?",
    risposta: "Compilando un breve questionario di 5 domande, il nostro algoritmo confronta le tue esigenze (area di interesse, disponibilità, preferenze) con il profilo dei nostri specialisti e ti propone i 3 professionisti più affini.",
  },
  {
    domanda: "Le sedute sono online o in presenza?",
    risposta: "La maggior parte delle sedute avviene online tramite videochiamata sicura (Daily.co), ma alcuni terapeuti offrono anche sedute in studio. Potrai scegliere in fase di prenotazione.",
  },
  {
    domanda: "Quanto costa una seduta?",
    risposta: "Le tariffe variano dai 49€ ai 90€ per seduta da 50 minuti, a seconda dello specialista. Il prezzo è sempre indicato chiaramente sul profilo del terapeuta prima di confermare la prenotazione.",
  },
  {
    domanda: "I miei dati sono protetti?",
    risposta: "Assolutamente sì. Tutti i dati sono cifrati e conservati in conformità al GDPR. Le conversazioni con il tuo terapeuta sono coperte dal segreto professionale.",
  },
  {
    domanda: "Posso cambiare terapeuta se non mi trovo bene?",
    risposta: "Certo. Senza alcuna domanda. Puoi sempre rifare il questionario e richiedere un nuovo abbinamento.",
  },
  {
    domanda: "I terapeuti sono davvero qualificati?",
    risposta: "Tutti i nostri specialisti sono psicologi iscritti all'Albo italiano con polizza assicurativa professionale attiva. Verifichiamo periodicamente le loro credenziali.",
  },
  {
    domanda: "Posso annullare una seduta?",
    risposta: "Sì, puoi annullare o riprogrammare fino a 24 ore prima della seduta senza alcun costo.",
  },
];

export default function FAQPage() {
  const [faqs, setFaqs] = useState([]);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    axios.get(`${API}/public/faq`).then(r => {
      setFaqs(r.data.length > 0 ? r.data : FALLBACK_FAQ);
    }).catch(() => setFaqs(FALLBACK_FAQ));
  }, []);

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#111111] py-16 lg:py-24" data-testid="faq-page">
      <div className="max-w-3xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-16">
          <span className="text-[#D4A017] text-xs tracking-[0.25em] uppercase">Domande frequenti</span>
          <h1 className="mt-4 font-serif text-5xl lg:text-6xl text-[#F4F1ED] leading-tight">
            Cosa c'è da sapere.
          </h1>
          <p className="mt-6 text-[#E6E2D8]/60">
            Risposte chiare alle domande più comuni. Se non trovi quella che cerchi, scrivici.
          </p>
        </div>

        <div className="divide-y divide-white/10 border-t border-b border-white/10">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} data-testid={`faq-item-${i}`}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full py-6 flex items-start justify-between gap-6 text-left group"
                >
                  <span className="font-serif text-xl text-[#F4F1ED] group-hover:text-[#D4A017] transition-colors">
                    {f.domanda}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#6B8FA3] flex-shrink-0 mt-1 transition-transform ${isOpen ? "rotate-180 text-[#D4A017]" : ""}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 text-[#E6E2D8]/70 leading-relaxed">{f.risposta}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
