# FATTO! — sito modificabile

Questa cartella contiene la versione completa del sito statico FATTO!

## Pagine

- `index.html`: home
- `servizi.html`: servizi dedicati ai B&B
- `metodo.html`: metodo di lavoro
- `gestionale.html`: presentazione, prezzo e accesso clienti di FATTO! Gestionale
- `privacy.html`: privacy, cookie e note legali

La prima area dei servizi, **Personalizzazione e cura del B&B**, comprende sito web, identità visiva, contenuti, presenza su Google e marketing locale.

## File grafici e funzionali

- `style.css`: colori, impaginazione, responsive e animazioni
- `script.js`: contatti WhatsApp, email e menu mobile
- `services.js`: navigazione dei pannelli Servizi e Metodo
- `page-flow.js`: puntini di navigazione e passaggio tra le tre pagine principali con la rotella del mouse su desktop; il Gestionale resta una sezione separata raggiungibile dal menu
- `logo-fatto.svg`: logo vettoriale utilizzato dal sito
- `logo-source.png`: sorgente originale del logo
- `whatsapp.svg`: icona ufficiale usata nei collegamenti WhatsApp

## Contatti configurati

- WhatsApp: `+39 392 074 2626`
- Email: `fattoconsulting@gmail.com`

## FATTO! Gestionale

- Attivazione e proposta definite dopo la demo, senza prezzo pubblico fisso
- Attivazione iniziale: assistita tramite WhatsApp
- Accesso clienti protetto: `https://gestionale.fattoconsulting.it/accesso`
- Il gestionale è una web app installabile: l’utente accede al proprio account e la installa da lì, senza un file pubblico da scaricare.
- La Versione 25 del gestionale verifica l’abbonamento sul server ed è pronta in locale; prima di rendere pubblico il nuovo collegamento va pubblicata al posto della Versione 24 attualmente online.

## Questionario demo

- Il pulsante **Richiedi una demo gratuita** apre un questionario con nome, cognome, telefono, email e presa visione della privacy.
- Il sistema predisposto salva le richieste in un foglio Google privato e invia una conferma al cliente e una notifica a FATTO!.
- L’automazione pronta da copiare si trova in `google-apps-script/Code.gs`.
- L’indirizzo dell’automazione va inserito in `form-config.js` dopo la prima configurazione.
- La procedura completa è nel file `ATTIVA-RICHIESTE-DEMO.md`.
- La checklist interna per gestire correttamente i dati è nel file `PRIVACY-OPERATIVA-RICHIESTE.md`.
- Il modulo include validazione, campo antispam invisibile, limite sugli invii ripetuti e registrazione della versione privacy.

## Dominio e pubblicazione

- Dominio acquistato: `fattoconsulting.it`
- Gestore del dominio: Aruba
- Servizio scelto: dominio con email
- Sito pubblico: `https://www.fattoconsulting.it/`
- Hosting verificato il 12 settembre 2026: GitHub Pages con HTTPS e reindirizzamento dal dominio senza `www`.
- Email attualmente usata per le richieste: `fattoconsulting@gmail.com`.

## Informazioni pubbliche

- Titolare: Giuseppe Vadalà
- Località: Reggio Calabria, Italia
- Il sito non usa cookie di profilazione, pubblicità o strumenti di analisi.
- La sola memoria di sessione è tecnica e serve a rendere ordinato il passaggio tra le pagine.
- Il sito pubblico è ospitato su GitHub Pages e non installa strumenti analytics o cookie di profilazione.

I file sono normali HTML, CSS e JavaScript e possono essere modificati con qualsiasi editor di testo.
