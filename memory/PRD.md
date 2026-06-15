# FunzionaBene.it — PRD

## Descrizione Progetto
Piattaforma integrata per clinica di sessuologia: gestionale admin + sito pubblico con prenotazione sessioni online. Mercato italiano, tutto in lingua italiana.

**Sito:** funzionabene.it  
**Focus:** Sessuologia / salute sessuale  
**Data inizio:** Aprile 2026

---

## Architettura Tecnica
- **Backend:** Python FastAPI + MongoDB (motor async)
- **Frontend:** React 19 + Tailwind CSS + shadcn/ui + Phosphor Icons
- **Auth:** JWT (httpOnly cookies) + OTP email
- **Email (placeholder):** Resend (transazionale) + Brevo (marketing)
- **Pagamenti (Fase 2):** Nexi XPay
- **Video (Fase 2):** Daily.co
- **Design (Feb 2026):** Sfondo mustarda **#E9D628** (corpo), **#D4C123** (header & footer leggermente più scuri). Cards bianche pure. Testo nero **#0A0A0A**. **Bottoni primari**: gradiente arancione→giallo (`from-[#F58A1F] to-[#F5D419]`), testo nero bold, `rounded-2xl`, soft shadow. Bottoni secondari: outline nero 1.5px. **Mascotte filled**: paleta harmonica completa — `abbraccio` arancione #F58A1F, `sereno` bianco, `embrulhado` pesca #F5C0A8, `peludo` sage verde #C8E0A8, `ovo` azzurro polvere #B8D5E0, `coppia` corallo #E89B9F, `saltitante` terracotta #D4906E, `pensativo` lavanda #C8B5E0, `curioso` azzurro cielo #8FC8D8. Tutti con contorni neri eleganti. Sidebar gestionale rimasta scura con accenti mustarda.
- **Font:** Outfit (titoli) + Figtree (body)
- **CHANGELOG Feb 2026:** Pivot estetico completo: mustarda/gradiente arancione/mascotte colorati su tutto il sito (pubblico + autenticato).

---

## Utenti (Ruoli)
| Ruolo | Accesso |
|---|---|
| **admin** | Dashboard admin completa, gestione tutto |
| **terapeuta** | Proprio profilo, pazienti assegnati, sessioni |
| **paziente** | Proprio profilo, sessioni prenotate |

---

## ✅ FASE 1 — COMPLETATA (Aprile 2026)

### Autenticazione
- [x] Login multi-ruolo (admin/terapeuta/paziente)
- [x] Registrazione con OTP email (dev mode: codice in response)
- [x] Verifica OTP con scadenza 10 minuti
- [x] JWT con refresh token (httpOnly cookies)
- [x] Seed automatico: admin + demo terapeuta + demo paziente
- [x] Logout
- [x] Protezione rotte per ruolo

### Gestione Terapisti
- [x] CRUD completo profili terapisti
- [x] Dati Albo italiano (numero, ordine, data iscrizione)
- [x] Assicurazione professionale (compagnia, polizza, scadenza)
- [x] Alert scadenza assicurazione (30/60 giorni)
- [x] Autocertificazione elettronica (firma + timestamp + IP)
- [x] Specializzazioni, lingue, bio, anni esperienza
- [x] Disponibilità settimanale (giorno + orari)
- [x] Prezzo sessione

### Gestione Pazienti
- [x] CRUD completo pazienti
- [x] Anagrafe completa (nome, CF, nascita, genere, contatti)
- [x] Validazione Codice Fiscale (algoritmo italiano backend + frontend)
- [x] Note cliniche riservate
- [x] Assegnazione terapeuta
- [x] Consenso GDPR

### Appuntamenti
- [x] CRUD appuntamenti
- [x] Stati: prenotato → confermato → completato / cancellato
- [x] Supporto online/in presenza
- [x] Vista per ruolo (admin vede tutto, terapeuta i propri, paziente i propri)

### Dashboard Admin
- [x] Stats: terapisti, pazienti, sessioni oggi/totali
- [x] Alert terapisti in attesa approvazione
- [x] Alert articoli blog in revisione
- [x] Alert terapisti senza autocertificazione
- [x] Alert scadenze assicurazione imminenti
- [x] Azioni rapide

### Dashboard Terapista
- [x] Panoramica sessioni (oggi/prossime/totali)
- [x] Checklist completamento profilo
- [x] Alert autocertificazione mancante
- [x] Lista prossime sessioni

### Dashboard Paziente
- [x] Panoramica sessioni (prenotate/completate/totali)
- [x] Gestione profilo personale
- [x] Lista prossime sessioni

### Blog
- [x] API completa (CRUD + approva/rifiuta)
- [x] UI Admin: lista articoli, filtri (Tutti/In Revisione/Pubblicati/Rifiutati), approva, rifiuta, anteprima, elimina, crea articolo
- [x] UI Terapista: scrivere articoli, invio per approvazione, stato bozza/pubblicato/rifiutato
- [x] Banner informativo flusso approvazione

### Sistema Slot Disponibilità
- [x] API slot: `GET /api/terapisti/{id}/slots?settimane=N`
- [x] Generazione slot da disponibilità settimanale (50 min cadauno)
- [x] Controllo conflitti con appuntamenti esistenti
- [x] Formato date in italiano (es. "Lunedì 21/04/2026 09:00")
- [x] Pronto per il sito pubblico (Fase 3)

---

## ✅ FASE 2 — SITO PUBBLICO COMPLETATA (Febbraio 2026)

### Layout pubblico (PublicLayout)
- [x] Header sticky con navigation (Home / Questionario / Blog / FAQ) + CTA gold
- [x] Mobile menu responsive
- [x] Footer con sezioni legali (Privacy, Cookie, GDPR)
- [x] Tema dark/warm premium (Gold #D4A017 + Steel Blue #6B8FA3)
- [x] Tipografia Cormorant Garamond (serif) + Outfit (sans)

### Homepage (/)
- [x] Hero con background texture + CTA "Inizia il Questionario"
- [x] Trust signals (SSL/GDPR, Albo, 98% soddisfazione)
- [x] Sezione "Come funziona" (3 step)
- [x] Sezione Valori (Riservatezza, Specialisti verificati, Nessun giudizio)
- [x] Therapists preview grid (caricato da /api/public/terapisti)
- [x] CTA band finale

### Questionario (/questionario)
- [x] 5 step (età, genere, problemi multi, orari multi, preferenza terapeuta)
- [x] Progress bar animata, auto-advance per single-select
- [x] Animazioni framer-motion tra step
- [x] POST /api/public/matching con scoring → salva in sessionStorage

### Risultati Matching (/risultati)
- [x] Top 3 terapeuti con badge compatibilità %
- [x] Card premium con foto placeholder, specializzazioni, tariffa, link al profilo

### Profilo pubblico terapeuta (/terapeuti/:id)
- [x] Layout 2 colonne: sidebar (Albo, esperienza, lingue, prezzo) + bio/formazione
- [x] Calendario slot 14 giorni (da /api/terapisti/{id}/slots, Italian days)
- [x] Click slot → apre BookingSheet

### BookingSheet (flusso prenotazione)
- [x] Step 1 Review (riepilogo slot + prezzo)
- [x] Step 2 Auth tabs (Registrati / Accedi)
- [x] Step 3 OTP verification (con otp_dev mostrato in modalità dev)
- [x] Step 4 Pagamento MOCKATO (UI carta di credito)
- [x] Step 5 Success + redirect area paziente
- [x] Skip auth steps se utente già loggato come paziente

### Blog pubblico (/blog + /blog/:id)
- [x] Layout editoriale (hero article + grid)
- [x] Post singolo con reading column, autore, CTA questionario

### FAQ (/faq)
- [x] Accordion animato
- [x] 7 FAQ di fallback se DB vuoto
- [x] Integrazione con /api/public/faq

### Backend public endpoints (no auth)
- [x] GET /api/public/terapisti (solo autocertificati)
- [x] GET /api/public/terapisti/{id}
- [x] POST /api/public/matching (scoring: genere×30 + specializzazioni×20 + disponibilità×10-15 → normalizzato a 70-99%)
- [x] GET /api/public/blog (solo pubblicati)
- [x] GET /api/public/faq
- [x] POST /api/public/prenota (richiede auth paziente)
- [x] GET /api/terapisti/{id}/slots (public, con Italian day names)

**Test status:** 15/15 backend tests passed, 100% frontend flows validated (iteration_3.json)

---

## 🔄 FASE 3 — INTEGRAZIONI REALI (NEXT)

### Fase 2 — Sito Pubblico Premium ✅ COMPLETATA (19/04/2026)

**Homepage redesign completa:**
- [x] Hero: "Parla di tutto. Anche di quello." con badge "Prima clinica italiana di sessuologia immersiva"
- [x] Sezione Sedute immersive (mai uso delle sigle VR/AR — sempre "immersiva")
- [x] Aree di intervento: 12 cards in homepage + pagina dedicata con 20 temi in 9 categorie
- [x] Perché FunzionaBene: 5 cards differenzianti (Iper-specialisti, Sedute immersive, Parla senza filtri, Riservatezza, Verificati)
- [x] Testimonianze: 6 anonimizzate con disclaimer GDPR
- [x] A cosa serve / Non serve (stile Serenis, onestà radicale)
- [x] CTA band finale

**Nuove pagine:**
- [x] `/sedute-immersive` — landing dedicata con stats, step-by-step, use cases, FAQ e riferimenti scientifici (Riva, Freeman, Diemer, Wiederhold, Optale)
- [x] `/aree-intervento` — tutte le 20 aree organizzate in 9 categorie colorate
- [x] `/emergenze` — 8 numeri d'emergenza con warning (112, TP, 1522, Gay Help Line, Samaritans 800.861.061, 114, 1500, 800.915.150)
- [x] `/chi-siamo` — storia, missione, valori, team philosophy, "perché solo sessuologia"

**Terapisti arricchiti:**
- [x] 4 terapisti demo aggiuntivi con diversità reale:
  - Alessandro Conti (M, 55y, 28 anni esperienza, ansia prestazione/disfunzione erettile, €79)
  - Giulia Marchetti (F, 38y, 9 anni, anorgasmia/vaginismo/mindfulness, €65)
  - Marco Fontana (M, 32y, 5 anni, LGBTQIA+/identità/poliamore, €55)
  - Chiara Esposito (F, 45y, 18 anni, traumi/EMDR/menopausa, €85)
- [x] Foto profissionali generate via OpenAI gpt-image-1 (Emergent LLM key)
- [x] Endpoint `/api/media/therapists/{filename}` per servire immagini
- [x] Foto integrate in: HomePage preview, MatchingResultsPage card, TerapistaPublicPage hero

**Navigation aggiornata:**
- Home · Immersive · Aree · **Chi siamo** · Blog · FAQ
- Footer con "Numeri d'emergenza" in rosso allerta
- [x] **Cabeçalho aggiornato**: rimosso subtitle "clinica psicologica", font del logo aumentato (text-3xl sm:text-4xl)
- [x] **FAQ prezzi corretti**: da 70-120€ a **49-90€** per seduta
- [x] **Pagine legali** complete in italiano conforme GDPR:
  - `/privacy` — Privacy Policy (trattamento dati sanitari, categoria speciale art.9, diritti art.15-22)
  - `/cookie` — Cookie Policy con toggle interattivi per salvare preferenze
  - `/termini` — Termini e Condizioni (con policy disdette 24h, diritto recesso, responsabilità)
- [x] **Cookie Consent Banner** GDPR-compliant:
  - Appare alla prima visita (localStorage `fb_cookie_consent`)
  - 3 opzioni: "Personalizza" (toggle granulari) / "Solo essenziali" / "Accetta tutti"
  - Solo cookie essenziali funzionano di default finché l'utente non acconsente
  - Utility `cookieConsent.js` per leggere/scrivere preferenze
- [x] Footer aggiornato con link alle 3 pagine legali

### Miglioramenti UX/Funzionali ✅ COMPLETATI (19/04/2026)
- [x] **Logo personalizzata** (cuore gold+steel blue su nero) sostituisce il placeholder in tutto il sito
- [x] **Codice Fiscale auto-calcolato** via backend `/api/utils/compute-cf` (python-codicefiscale)
  - Supporta sia nati in Italia (comune) sia all'estero (paese ISO)
  - Campo UI con indicatore "Calcolato automaticamente" (Sparkles icon)
  - User può editare manualmente se il calcolo non è corretto
- [x] **Chat privata paziente↔terapista** completa con `ChatPanel.jsx`
  - Lista conversazioni a sinistra, messaggi a destra
  - Polling 5s per nuovi messaggi
  - Badge "non letti" per conversazioni con messaggi nuovi
  - Disponibile nel PazienteDashboard e TerapistaDashboard
  - Attiva automaticamente dopo prima prenotazione (stato="confermato")
- [x] **Email automatici post-booking**
  - Email conferma prenotazione (paziente + terapista) — template premium dark+gold
  - Reminder 1 giorno prima (APScheduler)
  - Reminder 1 ora prima (APScheduler)
  - Template Italiano con data formattata ("Lunedì 20 aprile 2026 · 09:00")
- [x] Stato appuntamento cambiato da `prenotato` → `confermato` on booking (attiva subito la chat)

### Dati Fiscali Paziente ✅ COMPLETATA (19/04/2026)
- [x] Dataset italiano hardcoded (110 province + ~175 paesi esteri ISO)
- [x] Form "Completa i tuoi dati" con: anagrafe, luogo nascita (Italia/estero toggle), CF (validazione checksum backend), telefono, indirizzo residenza (via/città/CAP/provincia)
- [x] Step "dati-fiscali" nel BookingSheet **PRIMA** del pagamento
- [x] Backend computa automaticamente flag `dati_fiscali_completi` su update
- [x] Skip dello step se paziente già ha tutti i dati
- [x] Step success senza pulsante dashboard (solo "Chiudi")

### Integrazione Daily.co ✅ COMPLETATA (19/04/2026)
- [x] `daily_service.py` backend (create room + meeting token + presenze)
- [x] Auto-creazione stanza privata al momento della prenotazione
- [x] Endpoint `/api/appuntamenti/{id}/video-token` (token con nbf/exp scoped)
- [x] Endpoint `/api/appuntamenti/{id}/presenze` (logs Daily per prova presenza)
- [x] Frontend `VideoCallPage` fullscreen con iframe Daily (tema premium dark+gold)
- [x] Pulsante "Entra" in PazienteDashboard + TerapistaDashboard (visibile 15 min prima → 15 min dopo)
- [x] Ownership: terapista = is_owner=true (può gestire partecipanti), paziente = guest

### Integrazione Nexi XPay
- [ ] Checkout sessioni online
- [ ] Gestione rimborsi
- [ ] Storico pagamenti

### Integrazione Skebby SMS OTP + Document Upload ✅ COMPLETATA (19/04/2026)
- [x] `sms_service.py` con Skebby REST API (login session + token alphanumeric sender)
- [x] POST `/api/sms/send-otp` (stored in `db.sms_otp`, fallback `otp_dev` se Skebby fallisce)
- [x] POST `/api/sms/verify-otp` → setta `telefono`, `telefono_verificato`, `telefono_verificato_at` sull'utente
- [x] **Paziente flow**: SMS OTP step aggiunto nel BookingSheet tra "payment" e "success", con checkbox privacy art. 9 GDPR
- [x] `/api/public/prenota` richiede `telefono_verificato_at` entro 60 min
- [x] **Terapeuta flow**: `OnboardingSection.jsx` con 3 step (upload CV/Assicurazione/Laurea → SMS OTP → autocertificazione DPR 445/2000)
- [x] POST `/api/terapisti/me/documenti/{tipo}` multipart, tipi: cv/assicurazione/laurea, max 10MB, estensioni PDF/PNG/JPG
- [x] POST `/api/terapisti/me/autocertificazione-dpr445` richiede tutti docs + telefono verificato
- [x] **Admin vetting**: GET `/api/admin/terapisti/{id}/documenti` + `/download`, PATCH `/verifica` toggla `documenti_verificati`
- [x] Filtro public (`/public/terapisti`, matching) ora usa `documenti_verificati=true` come gate di visibilità pubblica
- [x] Admin TerapistiPage: badge Pubblico/Non pubblico, toggle verifica, pannello documenti espandibile con download
- [x] **Testing iteration_5.json: 23/23 backend + 9/9 frontend PASS**
- [ ] **NOTA**: Skebby credenziali attuali restituiscono 404 — utente deve verificare API credentials in dashboard Skebby (potrebbero differire dalle credenziali di login web)

### Integrazione Daily.co ✅ COMPLETATA
- [x] Generazione link videochiamate
- [x] Log sessioni (prova avvenimento)
- [x] Tracking durata

### Email Automatiche (Resend)
- [ ] OTP email reali
- [ ] Conferma prenotazione
- [ ] Reminder 1 giorno prima (con link video)
- [ ] Reminder 1 ora prima
- [ ] Sistema recupero pazienti (Brevo)

### Chat privata paziente ↔ terapeuta
- [x] API /api/conversazioni + /api/messaggi già presenti
- [ ] UI chat nelle dashboard (paziente + terapeuta)
- [ ] Real-time (WebSocket o polling)

---

## 🔧 REFACTORING BACKLOG
- [ ] Split server.py (1043 linee) in router modulari: auth.py, public.py, terapisti.py, pazienti.py, appuntamenti.py, blog.py, faq.py, messaggi.py
- [ ] Aggiungere endpoint dedicato GET /api/public/blog/{id} (attualmente BlogPostPage filtra client-side)
- [ ] Test files pytest in /app/backend/tests

---

## Credenziali Test
Vedi: /app/memory/test_credentials.md

## Note GDPR
- Dati sanitari = categoria speciale (art. 9 GDPR)
- Consenso esplicito al momento della registrazione
- Diritto all'oblio implementabile
- Server idealmente in Europa (Hetzner/DigitalOcean Frankfurt)
