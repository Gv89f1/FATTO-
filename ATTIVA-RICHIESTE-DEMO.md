# Attivazione richieste demo FATTO!

Questa procedura collega il questionario del sito a un foglio Google privato e invia due email per ogni richiesta:

- una conferma automatica alla persona interessata;
- una notifica a `fattoconsulting@gmail.com`.

Il foglio mostra data, nome, cognome, telefono, email, stato della richiesta, provenienza, versione dell'informativa privacy, esito delle email e data prevista di cancellazione.

## 1. Crea il foglio privato

1. Accedi a Google con `fattoconsulting@gmail.com`.
2. Apri Google Fogli e crea un foglio vuoto.
3. Chiamalo **Richieste demo FATTO!**.
4. Non condividere il foglio pubblicamente.

## 2. Inserisci l'automazione

1. Nel foglio scegli **Estensioni → Apps Script**. Se Google mostra un errore, apri direttamente `https://script.new` con lo stesso account.
2. Elimina il contenuto iniziale del file `Code.gs`.
3. Apri il file `google-apps-script/Code.gs` presente nella cartella del sito.
4. Copia tutto il contenuto e incollalo nell'editor Google.
5. Salva il progetto con il nome **FATTO richieste demo**.
6. In alto seleziona la funzione `preparaSistema`, poi premi **Esegui**. Il codice salvato è già associato al foglio FATTO! corretto e funziona anche da un progetto Apps Script aperto separatamente.
7. Google chiederà l'autorizzazione per scrivere nel foglio e inviare le due email. Concedila usando l'account FATTO!.

Se Apps Script è stato aperto dal menu del foglio, tornando al foglio comparirà il menu **FATTO!**. Se hai usato `script.new`, per attivare la cancellazione automatica seleziona nell'editor la funzione `attivaPuliziaAutomatica` e premi **Esegui** una sola volta.

## 3. Pubblica il collegamento sicuro

1. Nell'editor Apps Script scegli **Esegui il deployment → Nuovo deployment**.
2. Come tipo seleziona **App web**.
3. Inserisci la descrizione **Modulo demo FATTO!**.
4. In **Esegui come** scegli **Me**.
5. In **Chi ha accesso** scegli **Chiunque**.
6. Premi **Esegui il deployment** e copia l'indirizzo che termina con `/exec`.

Non usare l'indirizzo di prova che termina con `/dev`.

## 4. Collega il sito

1. Apri il file `form-config.js` nella cartella del sito.
2. Incolla l'indirizzo `/exec` tra le virgolette dopo `endpoint:`.
3. Salva il file.
4. Apri `gestionale.html`, invia una richiesta di prova con una tua email e controlla:
   - che la riga compaia nel foglio **Richieste demo**;
   - che arrivino la conferma al cliente e la notifica a FATTO!;
   - che le colonne **Conferma al cliente** e **Notifica a FATTO!** mostrino `Inviata`.

## 5. Pubblica l'aggiornamento

Dopo il test, carica su GitHub almeno questi file aggiornati:

- `gestionale.html`
- `script.js`
- `form-config.js`
- `style.css`
- `privacy.html`

Il file `google-apps-script/Code.gs` e questa guida servono come copia modificabile e non devono necessariamente essere pubblicati nel sito.

## Uso quotidiano

- Apri il foglio **Richieste demo FATTO!** per vedere tutte le registrazioni.
- Cambia la colonna **Stato** man mano che contatti le persone.
- Non usare i recapiti per newsletter o promozioni: il modulo autorizza soltanto la gestione della demo richiesta.
- Se in futuro vuoi inviare marketing, servirà una casella separata, facoltativa e non preselezionata, oltre a una gestione documentabile del consenso.
- L'account Gmail gratuito consente un numero limitato di destinatari al giorno. Il sistema usa due destinatari per ogni richiesta: cliente e FATTO!.
