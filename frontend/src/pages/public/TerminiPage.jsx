import LegalLayout from "@/components/public/LegalLayout";

export default function TerminiPage() {
  return (
    <LegalLayout title="Termini e Condizioni" lastUpdate="19 aprile 2026" testId="termini-page">
      <p>
        I presenti Termini regolano l&apos;utilizzo dei servizi offerti da <strong>FunzionaBene.it</strong> — piattaforma
        di psicologia e sessuologia clinica online. Effettuando una prenotazione accetti integralmente queste condizioni.
      </p>

      <h2>1. Oggetto del servizio</h2>
      <p>
        FunzionaBene mette a disposizione dell&apos;utente (paziente) una piattaforma per prenotare sessioni individuali o di coppia
        con psicologi iscritti all&apos;Albo italiano e con polizza assicurativa professionale attiva. Le sessioni si svolgono online
        tramite videochiamata sicura (Daily.co) oppure, dove indicato dal terapeuta, in studio.
      </p>

      <h2>2. Accesso e registrazione</h2>
      <ul>
        <li>Il servizio è riservato a maggiorenni (18+).</li>
        <li>Per prenotare è necessario registrarsi fornendo dati veritieri e completi, verificati via OTP email.</li>
        <li>L&apos;utente è responsabile della riservatezza delle proprie credenziali di accesso.</li>
        <li>È vietato cedere il proprio account a terzi.</li>
      </ul>

      <h2>2.bis Dati fiscali obbligatori</h2>
      <p>
        Prima di confermare il pagamento è necessario fornire: Codice Fiscale, dati di residenza e luogo di nascita.
        Questi dati sono indispensabili per l&apos;emissione della fattura sanitaria, detraibile fiscalmente in Italia (art. 15 TUIR).
      </p>

      <h2>3. Prenotazione e disdetta</h2>
      <ul>
        <li>La prenotazione è confermata al momento del pagamento.</li>
        <li>Puoi <strong>annullare o riprogrammare gratuitamente fino a 24 ore prima</strong> dell&apos;orario della sessione.</li>
        <li>Per disdette entro 24 ore la sessione è considerata effettuata e non è rimborsabile.</li>
        <li>In caso di impedimento del terapeuta la sessione sarà riprogrammata o rimborsata integralmente.</li>
      </ul>

      <h2>4. Tariffe e pagamento</h2>
      <ul>
        <li>Le tariffe (da €49 a €90 per sessione da 50 minuti) sono indicate sul profilo di ciascun terapeuta.</li>
        <li>Il pagamento avviene online tramite <strong>Nexi XPay</strong> con cifratura SSL.</li>
        <li>FunzionaBene non conserva i dati della carta di pagamento.</li>
        <li>Le fatture sanitarie sono emesse e inviate via email entro 7 giorni dalla sessione.</li>
      </ul>

      <h2>5. Svolgimento della sessione</h2>
      <ul>
        <li>Il link per accedere alla stanza video è disponibile nella tua area personale 15 minuti prima.</li>
        <li>La sessione dura 50 minuti. Eventuali ritardi del paziente non prolungano l&apos;orario.</li>
        <li>È vietata la registrazione audio/video della sessione senza consenso esplicito del terapeuta.</li>
        <li>Il terapeuta è tenuto al <strong>segreto professionale</strong> (art. 11 Codice Deontologico Psicologi).</li>
      </ul>

      <h2>6. Diritto di recesso</h2>
      <p>
        Ai sensi dell&apos;art. 59 lett. a) del Codice del Consumo, il diritto di recesso è escluso per servizi con data determinata
        una volta iniziata l&apos;erogazione. Per sessioni non ancora erogate vale la policy di disdetta (punto 3).
      </p>

      <h2>7. Limitazione di responsabilità</h2>
      <p>
        FunzionaBene è un intermediario tecnologico. La responsabilità clinica della sessione è del terapeuta assegnato.
        <strong> In caso di emergenza psichiatrica o ideazione suicidaria contatta immediatamente il 112 o il Telefono Amico (02 2327 2327).</strong>
      </p>

      <h2>8. Proprietà intellettuale</h2>
      <p>
        Tutti i contenuti del sito (testi, logo, immagini, articoli del blog) sono di proprietà di FunzionaBene
        o dei rispettivi autori, protetti da diritto d&apos;autore.
      </p>

      <h2>9. Legge applicabile e foro competente</h2>
      <p>
        I presenti Termini sono regolati dalla legge italiana. Per qualsiasi controversia è competente il Foro del consumatore.
        Prima di agire in giudizio le parti si impegnano a tentare una mediazione ai sensi del D.Lgs. 28/2010.
      </p>

      <h2>10. Modifiche</h2>
      <p>
        FunzionaBene si riserva il diritto di modificare i presenti Termini. Gli utenti registrati riceveranno una notifica
        via email almeno 15 giorni prima dell&apos;entrata in vigore di modifiche sostanziali.
      </p>
    </LegalLayout>
  );
}
