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
- **Design:** Oro #D4A017 + Blu acciaio #6B8FA3, sfondo crema #FDFBF7 (dashboard), scuro #0A0A0A (hero sito)
- **Font:** Outfit (titoli) + Figtree (body)

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
