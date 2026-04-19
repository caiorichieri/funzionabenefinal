import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { API } from "@/contexts/AuthContext";
import { Send, MessageCircle, ArrowLeft } from "lucide-react";

/**
 * ChatPanel — private 1:1 chat between paziente and terapista.
 * Usable for both roles (paziente sees therapist list, therapist sees patient list).
 * Props: role ('paziente' | 'terapeuta'), currentUserId.
 */
export default function ChatPanel({ role }) {
  const [conversazioni, setConversazioni] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messaggi, setMessaggi] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  const loadConversazioni = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/conversazioni`, { withCredentials: true });
      setConversazioni(res.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadConversazioni(); }, [loadConversazioni]);

  const loadMessaggi = useCallback(async (convId) => {
    if (!convId) return;
    try {
      const res = await axios.get(`${API}/messaggi/${convId}`, { withCredentials: true });
      setMessaggi(res.data || []);
      // Mark as read by reloading list
      loadConversazioni();
    } catch (err) {
      console.warn("[ChatPanel] loadMessaggi failed:", err);
    }
  }, [loadConversazioni]);

  useEffect(() => {
    if (!activeConv) return;
    loadMessaggi(activeConv.conversazione_id);
    // Poll every 5s while chat open
    pollRef.current = setInterval(() => loadMessaggi(activeConv.conversazione_id), 5000);
    return () => pollRef.current && clearInterval(pollRef.current);
  }, [activeConv, loadMessaggi]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messaggi]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeConv) return;
    setSending(true);
    try {
      const destinatario_id = role === "paziente" ? activeConv.terapeuta_id : activeConv.paziente_id;
      await axios.post(`${API}/messaggi`, { destinatario_id, testo: input.trim() }, { withCredentials: true });
      setInput("");
      await loadMessaggi(activeConv.conversazione_id);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-[rgba(28,28,28,0.5)] text-sm" data-testid="chat-loading">
        Caricamento messaggi...
      </div>
    );
  }

  if (conversazioni.length === 0) {
    return (
      <div className="p-12 text-center" data-testid="chat-empty">
        <MessageCircle className="w-10 h-10 text-[#6B8FA3] mx-auto mb-4 opacity-50" />
        <h3 className="font-serif text-xl text-[#1C1C1C] mb-2">Nessuna conversazione</h3>
        <p className="text-sm text-[rgba(28,28,28,0.5)] max-w-sm mx-auto">
          {role === "paziente"
            ? "Le conversazioni con il tuo terapeuta saranno disponibili dopo la prima prenotazione confermata."
            : "Le conversazioni con i tuoi pazienti appariranno qui dopo la prima seduta."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-[280px_1fr] h-[540px] border border-[rgba(28,28,28,0.08)] rounded-2xl overflow-hidden bg-white" data-testid="chat-panel">
      {/* Conversations list */}
      <div className={`border-r border-[rgba(28,28,28,0.08)] bg-[#FAF8F3]/60 overflow-y-auto ${activeConv ? "hidden md:block" : ""}`}>
        <div className="px-4 py-3 border-b border-[rgba(28,28,28,0.08)] text-xs tracking-[0.2em] uppercase text-[rgba(28,28,28,0.5)]">
          Conversazioni
        </div>
        {conversazioni.map((c) => {
          const nome = role === "paziente" ? `Dr. ${c.terapeuta_nome}` : c.paziente_nome;
          const isActive = activeConv?.conversazione_id === c.conversazione_id;
          return (
            <button
              key={c.conversazione_id}
              data-testid={`conv-${c.conversazione_id}`}
              onClick={() => setActiveConv(c)}
              className={`w-full text-left px-4 py-3 border-b border-[rgba(28,28,28,0.05)] hover:bg-[#D4A017]/5 transition-colors ${isActive ? "bg-[#D4A017]/10 border-l-2 border-l-[#D4A017]" : ""}`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-medium text-[#1C1C1C] text-sm truncate">{nome}</span>
                {c.non_letti > 0 && (
                  <span className="bg-[#D4A017] text-white text-[10px] font-bold min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center">{c.non_letti}</span>
                )}
              </div>
              <div className="text-xs text-[rgba(28,28,28,0.5)] truncate">
                {c.ultimo_messaggio || "Nessun messaggio"}
              </div>
            </button>
          );
        })}
      </div>

      {/* Messages */}
      <div className={`flex flex-col ${!activeConv ? "hidden md:flex" : "flex"}`}>
        {!activeConv ? (
          <div className="flex-1 flex items-center justify-center text-sm text-[rgba(28,28,28,0.4)]">
            Seleziona una conversazione
          </div>
        ) : (
          <>
            <div className="px-5 py-3 border-b border-[rgba(28,28,28,0.08)] flex items-center gap-3">
              <button
                className="md:hidden p-1 text-[rgba(28,28,28,0.5)] hover:text-[#1C1C1C]"
                onClick={() => setActiveConv(null)}
                data-testid="chat-back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="w-9 h-9 rounded-full bg-[#6B8FA3]/10 flex items-center justify-center">
                <span className="text-xs font-medium text-[#6B8FA3]">
                  {(role === "paziente" ? activeConv.terapeuta_nome : activeConv.paziente_nome || "?")[0]}
                </span>
              </div>
              <div>
                <div className="text-sm font-medium text-[#1C1C1C]">
                  {role === "paziente" ? `Dr. ${activeConv.terapeuta_nome}` : activeConv.paziente_nome}
                </div>
                <div className="text-xs text-[rgba(28,28,28,0.4)]">Conversazione privata</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-[#FAF8F3]/30">
              {messaggi.length === 0 ? (
                <div className="text-center text-xs text-[rgba(28,28,28,0.4)] py-8">
                  Nessun messaggio. Inizia la conversazione.
                </div>
              ) : (
                messaggi.map((m, i) => {
                  const isMe = m.mittente_ruolo === role;
                  return (
                    <div key={m._id || i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? "bg-[#D4A017] text-white rounded-br-sm"
                          : "bg-white border border-[rgba(28,28,28,0.08)] text-[#1C1C1C] rounded-bl-sm"
                      }`}>
                        {m.testo}
                        <div className={`text-[10px] mt-1 ${isMe ? "text-white/70" : "text-[rgba(28,28,28,0.4)]"}`}>
                          {new Date(m.created_at).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={sendMessage} className="p-3 border-t border-[rgba(28,28,28,0.08)] bg-white flex gap-2">
              <input
                data-testid="chat-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Scrivi un messaggio..."
                className="flex-1 px-4 py-2.5 bg-[#FAF8F3] border border-[rgba(28,28,28,0.08)] rounded-full text-sm text-[#1C1C1C] focus:outline-none focus:border-[#D4A017]"
              />
              <button
                data-testid="chat-send"
                type="submit" disabled={sending || !input.trim()}
                className="px-4 py-2.5 bg-[#D4A017] hover:bg-[#B38612] disabled:opacity-40 text-white rounded-full flex items-center gap-2 text-sm font-medium"
              >
                <Send className="w-4 h-4" /> Invia
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
