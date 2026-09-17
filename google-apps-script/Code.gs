const FATTO_SETTINGS = Object.freeze({
  spreadsheetId: "1LiJnGvTiwXGRMrURjDsVs5GXRWC4NYQdmcEsfMU88Xs",
  sheetName: "Richieste demo",
  ownerEmail: "fattoconsulting@gmail.com",
  senderName: "FATTO!",
  privacyVersion: "12 settembre 2026",
  retentionMonths: 12,
  duplicateWindowSeconds: 300
});

const FATTO_HEADERS = Object.freeze([
  "Ricevuta il",
  "Nome",
  "Cognome",
  "Telefono",
  "Email",
  "Stato",
  "Pagina di provenienza",
  "Informativa privacy",
  "Presa visione privacy",
  "ID richiesta",
  "Conferma al cliente",
  "Notifica a FATTO!",
  "Scadenza prevista"
]);

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("FATTO!")
    .addItem("Prepara il sistema", "preparaSistema")
    .addItem("Attiva la pulizia dopo 12 mesi", "attivaPuliziaAutomatica")
    .addItem("Elimina ora le richieste scadute", "eliminaRichiesteScadute")
    .addToUi();
}

function preparaSistema() {
  const spreadsheet = getConfiguredSpreadsheet_();

  PropertiesService.getScriptProperties().setProperty("FATTO_SPREADSHEET_ID", spreadsheet.getId());
  const sheet = getOrCreateSheet_(spreadsheet);
  formatSheet_(sheet);

  showNotice_(
    "Sistema FATTO! pronto",
    "Il foglio è configurato. Ora pubblica lo script come app web seguendo la guida inclusa nel sito."
  );
}

function doGet() {
  return jsonResponse_({ ok: true, service: "FATTO! richieste demo" });
}

function doPost(event) {
  try {
    const input = readInput_(event);

    // I bot che compilano il campo invisibile ricevono una risposta neutra,
    // ma non vengono salvati e non generano email.
    if (cleanText_(input.website, 120)) return jsonResponse_({ ok: true });

    const lead = validateLead_(input);
    const spreadsheetId = PropertiesService.getScriptProperties().getProperty("FATTO_SPREADSHEET_ID");
    if (!spreadsheetId) throw new Error("Esegui prima la funzione preparaSistema dal foglio Google.");

    const duplicateKey = "lead_" + digest_(lead.email.toLowerCase());
    const cache = CacheService.getScriptCache();
    if (cache.get(duplicateKey)) return jsonResponse_({ ok: true, duplicate: true });

    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = getOrCreateSheet_(spreadsheet);
    const receivedAt = new Date();
    const expiry = new Date(receivedAt);
    expiry.setMonth(expiry.getMonth() + FATTO_SETTINGS.retentionMonths);

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    let row;
    try {
      sheet.appendRow([
        receivedAt,
        sheetSafe_(lead.firstName),
        sheetSafe_(lead.lastName),
        sheetSafe_(lead.phone),
        sheetSafe_(lead.email),
        "Nuova",
        sheetSafe_(lead.source),
        sheetSafe_(lead.privacyVersion),
        "Sì",
        sheetSafe_(lead.requestId),
        "In attesa",
        "In attesa",
        expiry
      ]);
      row = sheet.getLastRow();
    } finally {
      lock.releaseLock();
    }

    cache.put(duplicateKey, "1", FATTO_SETTINGS.duplicateWindowSeconds);
    const delivery = sendNotifications_(lead);
    sheet.getRange(row, 11, 1, 2).setValues([[
      delivery.customer,
      delivery.owner
    ]]);

    return jsonResponse_({ ok: true, requestId: lead.requestId });
  } catch (error) {
    console.error(error);
    return jsonResponse_({ ok: false, error: "La richiesta non è stata registrata." });
  }
}

function attivaPuliziaAutomatica() {
  const handler = "eliminaRichiesteScadute";
  ScriptApp.getProjectTriggers()
    .filter((trigger) => trigger.getHandlerFunction() === handler)
    .forEach((trigger) => ScriptApp.deleteTrigger(trigger));

  ScriptApp.newTrigger(handler).timeBased().everyDays(1).atHour(3).create();
  showNotice_(
    "Pulizia automatica attiva",
    "Ogni giorno saranno eliminate le richieste che hanno superato i 12 mesi, salvo che tu le abbia trasferite nella documentazione di un rapporto contrattuale."
  );
}

function eliminaRichiesteScadute() {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty("FATTO_SPREADSHEET_ID");
  if (!spreadsheetId) return;

  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(FATTO_SETTINGS.sheetName);
  if (!sheet || sheet.getLastRow() < 2) return;

  const now = new Date();
  const expiryValues = sheet.getRange(2, 13, sheet.getLastRow() - 1, 1).getValues();
  for (let index = expiryValues.length - 1; index >= 0; index -= 1) {
    const expiry = expiryValues[index][0];
    if (expiry instanceof Date && expiry <= now) sheet.deleteRow(index + 2);
  }
}

function readInput_(event) {
  if (!event) return {};
  if (event.parameter && Object.keys(event.parameter).length) return event.parameter;
  try {
    return JSON.parse(event.postData && event.postData.contents ? event.postData.contents : "{}");
  } catch (error) {
    return {};
  }
}

function validateLead_(input) {
  const firstName = cleanText_(input.firstName, 60);
  const lastName = cleanText_(input.lastName, 60);
  const phone = cleanText_(input.phone, 30);
  const email = cleanText_(input.email, 160).toLowerCase();
  const source = cleanText_(input.source, 300);
  const requestId = cleanText_(input.requestId, 80);
  const privacyVersion = cleanText_(input.privacyVersion, 60);
  const elapsedMs = Number(input.elapsedMs);
  const privacyAccepted = String(input.privacyAccepted).toLowerCase() === "true";

  if (firstName.length < 2 || lastName.length < 2) throw new Error("Nome o cognome non valido.");
  if (!/^[0-9+().\s-]{7,30}$/.test(phone)) throw new Error("Numero di telefono non valido.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Indirizzo email non valido.");
  if (!privacyAccepted || privacyVersion !== FATTO_SETTINGS.privacyVersion) throw new Error("Presa visione privacy mancante.");
  if (!/^[a-zA-Z0-9-]{10,80}$/.test(requestId)) throw new Error("Identificativo richiesta non valido.");
  if (!Number.isFinite(elapsedMs) || elapsedMs < 2000) throw new Error("Invio troppo rapido.");

  return { firstName, lastName, phone, email, source, requestId, privacyVersion };
}

function sendNotifications_(lead) {
  if (MailApp.getRemainingDailyQuota() < 2) {
    return { customer: "Quota email esaurita", owner: "Quota email esaurita" };
  }

  let customer = "Inviata";
  let owner = "Inviata";

  try {
    MailApp.sendEmail({
      to: lead.email,
      subject: "Abbiamo ricevuto la tua richiesta — FATTO!",
      name: FATTO_SETTINGS.senderName,
      replyTo: FATTO_SETTINGS.ownerEmail,
      body: customerText_(lead),
      htmlBody: customerHtml_(lead)
    });
  } catch (error) {
    customer = "Errore: " + cleanText_(error.message, 120);
  }

  try {
    MailApp.sendEmail({
      to: FATTO_SETTINGS.ownerEmail,
      subject: "Nuova richiesta demo — " + lead.firstName + " " + lead.lastName,
      name: FATTO_SETTINGS.senderName,
      replyTo: lead.email,
      body: ownerText_(lead),
      htmlBody: ownerHtml_(lead)
    });
  } catch (error) {
    owner = "Errore: " + cleanText_(error.message, 120);
  }

  return { customer, owner };
}

function customerText_(lead) {
  return [
    "Ciao " + lead.firstName + ",",
    "",
    "abbiamo ricevuto la tua richiesta di una demo gratuita di FATTO! Gestionale.",
    "Ti ricontatteremo presto per mostrarti il gestionale e capire le esigenze del tuo B&B.",
    "",
    "Recapiti indicati:",
    "Telefono: " + lead.phone,
    "Email: " + lead.email,
    "",
    "Se non hai effettuato tu questa richiesta, rispondi a questa email e la elimineremo.",
    "",
    "FATTO!",
    "Reggio Calabria",
    FATTO_SETTINGS.ownerEmail
  ].join("\n");
}

function customerHtml_(lead) {
  return emailShell_(
    "Richiesta ricevuta",
    "Ciao " + escapeHtml_(lead.firstName) + ",",
    "Abbiamo ricevuto la tua richiesta di una demo gratuita di <strong>FATTO! Gestionale</strong>. Ti ricontatteremo presto per mostrarti il gestionale e capire le esigenze del tuo B&amp;B.",
    "<strong>Telefono:</strong> " + escapeHtml_(lead.phone) + "<br><strong>Email:</strong> " + escapeHtml_(lead.email),
    "Se non hai effettuato tu questa richiesta, rispondi a questa email e la elimineremo."
  );
}

function ownerText_(lead) {
  return [
    "Nuova richiesta demo FATTO!",
    "",
    "Nome: " + lead.firstName + " " + lead.lastName,
    "Telefono: " + lead.phone,
    "Email: " + lead.email,
    "Pagina: " + lead.source,
    "Informativa: " + lead.privacyVersion,
    "ID richiesta: " + lead.requestId,
    "",
    "La richiesta è stata salvata nel foglio Google Richieste demo."
  ].join("\n");
}

function ownerHtml_(lead) {
  return emailShell_(
    "Nuova richiesta demo",
    escapeHtml_(lead.firstName + " " + lead.lastName),
    "Ha chiesto di vedere <strong>FATTO! Gestionale</strong> in azione.",
    "<strong>Telefono:</strong> " + escapeHtml_(lead.phone) + "<br><strong>Email:</strong> " + escapeHtml_(lead.email) + "<br><strong>Pagina:</strong> " + escapeHtml_(lead.source) + "<br><strong>ID:</strong> " + escapeHtml_(lead.requestId),
    "La richiesta è già disponibile nel foglio Google, con stato “Nuova”."
  );
}

function emailShell_(eyebrow, title, copy, details, footnote) {
  return '<div style="margin:0;padding:30px;background:#f3f8fb;font-family:Arial,sans-serif;color:#082a44">' +
    '<div style="max-width:600px;margin:auto;padding:32px;background:#fff;border:1px solid #dce9ef;border-radius:18px">' +
    '<div style="font-size:13px;font-weight:800;letter-spacing:.12em;color:#0879bd">FATTO!</div>' +
    '<p style="margin:28px 0 8px;font-size:11px;font-weight:700;letter-spacing:.12em;color:#6b8594">' + escapeHtml_(eyebrow.toUpperCase()) + '</p>' +
    '<h1 style="margin:0 0 18px;font-size:30px;line-height:1.1">' + title + '</h1>' +
    '<p style="font-size:16px;line-height:1.65;color:#496675">' + copy + '</p>' +
    '<div style="margin:24px 0;padding:18px;background:#f3f8fb;border-radius:12px;font-size:14px;line-height:1.8">' + details + '</div>' +
    '<p style="font-size:12px;line-height:1.6;color:#7a909c">' + footnote + '</p>' +
    '<p style="margin:26px 0 0;font-size:13px;font-weight:700">FATTO! · Reggio Calabria<br><a style="color:#0879bd" href="mailto:' + FATTO_SETTINGS.ownerEmail + '">' + FATTO_SETTINGS.ownerEmail + '</a></p>' +
    '</div></div>';
}

function getOrCreateSheet_(spreadsheet) {
  let sheet = spreadsheet.getSheetByName(FATTO_SETTINGS.sheetName);
  if (!sheet) {
    const sheets = spreadsheet.getSheets();
    const blankFirstSheet = sheets.length === 1 && sheets[0].getLastRow() === 0;
    sheet = blankFirstSheet ? sheets[0].setName(FATTO_SETTINGS.sheetName) : spreadsheet.insertSheet(FATTO_SETTINGS.sheetName);
  }
  if (sheet.getLastRow() === 0) sheet.appendRow(FATTO_HEADERS);
  return sheet;
}

function getConfiguredSpreadsheet_() {
  if (FATTO_SETTINGS.spreadsheetId) return SpreadsheetApp.openById(FATTO_SETTINGS.spreadsheetId);
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (activeSpreadsheet) return activeSpreadsheet;
  throw new Error("Indica lo spreadsheetId del foglio Google nelle impostazioni iniziali.");
}

function showNotice_(title, message) {
  try {
    SpreadsheetApp.getUi().alert(title, message, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (error) {
    console.log(title + ": " + message);
  }
}

function formatSheet_(sheet) {
  const header = sheet.getRange(1, 1, 1, FATTO_HEADERS.length);
  header.setValues([FATTO_HEADERS]);
  header.setBackground("#082a44").setFontColor("#ffffff").setFontWeight("bold");
  sheet.setFrozenRows(1);
  sheet.getRange("A:A").setNumberFormat("dd/mm/yyyy hh:mm");
  sheet.getRange("M:M").setNumberFormat("dd/mm/yyyy");
  sheet.setColumnWidth(1, 145);
  sheet.setColumnWidth(2, 120);
  sheet.setColumnWidth(3, 140);
  sheet.setColumnWidth(4, 145);
  sheet.setColumnWidth(5, 220);
  sheet.setColumnWidth(6, 125);
  sheet.setColumnWidth(7, 250);
  sheet.setColumnWidth(8, 150);
  sheet.setColumnWidth(9, 145);
  sheet.setColumnWidth(10, 230);
  sheet.setColumnWidth(11, 155);
  sheet.setColumnWidth(12, 155);
  sheet.setColumnWidth(13, 135);

  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Nuova", "Da contattare", "Contattato", "Demo fissata", "Cliente", "Non interessato"], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, 6, Math.max(sheet.getMaxRows() - 1, 1), 1).setDataValidation(statusRule);
}

function digest_(value) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value)
    .map((byte) => (byte + 256).toString(16).slice(-2))
    .join("")
    .slice(0, 32);
}

function cleanText_(value, maxLength) {
  return String(value == null ? "" : value).replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function sheetSafe_(value) {
  const text = String(value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function escapeHtml_(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
