# FATTO! — sito modificabile

Questa cartella contiene la versione completa del sito statico FATTO!

## Pagine

- `index.html`: home
- `servizi.html`: servizi dedicati ai B&B
- `metodo.html`: metodo di lavoro
- `gestionale.html`: presentazione, prezzo e accesso clienti di FATTO! Gestionale
- `privacy.html`: privacy, cookie e note legali
- `condizioni.html`: condizioni di prova, rinnovo e abbonamento

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

- Piano Start: €19/mese o €190/anno
- Piano Pro: €39/mese o €390/anno, con 30 giorni gratuiti per i nuovi clienti
- Piano Su misura: preventivo dedicato a partire da €99/mese
- Checkout protetto ospitato da Stripe; il sito non raccoglie dati carta
- Licenza automatica soltanto dopo la conferma verificata del checkout
- Accesso clienti protetto: `https://gestionale.fattoconsulting.it/accesso`
- Il gestionale è una web app installabile: l’utente accede al proprio account e la installa da lì, senza un file pubblico da scaricare.
- La Versione 29 del gestionale verifica l’abbonamento sul server ed è pubblicata in modo indipendente su Cloudflare Pages. Il sottodominio `gestionale.fattoconsulting.it` punta direttamente a questa versione ed è totalmente indipendente.

## Pagamenti

- I pulsanti Start e Pro inviano al checkout sicuro del sottodominio gestionale.
- Il piano Pro richiede il metodo di pagamento ma addebita soltanto dopo i 30 giorni gratuiti, salvo annullamento.
- Rinnovi, pagamenti non riusciti e disdette aggiornano lo stato della licenza tramite webhook Stripe firmato.
- Checkout, quattro Price ID, webhook e portale clienti sono verificati in modalità test. Il passaggio agli addebiti reali resta separato e richiede l’attivazione live di Stripe e la configurazione fiscale completa.

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
