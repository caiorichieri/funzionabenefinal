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

## 🔄 FASE 2 — IN PIANIFICAZIONE

### Integrazione Nexi XPay
- [ ] Checkout sessioni online
- [ ] Gestione rimborsi
- [ ] Storico pagamenti

### Integrazione Daily.co
- [ ] Generazione link videochiamate
- [ ] Log sessioni (prova avvenimento)
- [ ] Tracking durata

### Email Automatiche (Resend)
- [ ] Conferma prenotazione
- [ ] Reminder 1 giorno prima (con link video)
- [ ] Reminder 1 ora prima
- [ ] Sistema recupero pazienti (Brevo)

---

## 🌐 FASE 3 — SITO PUBBLICO

### Homepage & Contenuti
- [ ] Hero section (dark, premium)
- [ ] Presentazione specialisti
- [ ] Sezione problematiche trattate
- [ ] FAQ section
- [ ] Blog pubblico (articoli approvati)

### Questionario di Matching
- [ ] Form multi-step (età, genere, problematiche, orari, preferenza M/F)
- [ ] Algoritmo matching → 3 terapisti suggeriti
- [ ] Prenotazione sessione da risultato

### Area Privata Post-Acquisto
- [ ] Messaggistica terapeuta ↔ paziente
- [ ] Non visibile nel sito pubblico

---

## Credenziali Test
Vedi: /app/memory/test_credentials.md

## Note GDPR
- Dati sanitari = categoria speciale (art. 9 GDPR)
- Consenso esplicito al momento della registrazione
- Diritto all'oblio implementabile
- Server idealmente in Europa (Hetzner/DigitalOcean Frankfurt)
