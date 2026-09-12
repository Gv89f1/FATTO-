const CONFIG = {
  whatsapp: "393920742626",
  email: "fattoconsulting@gmail.com"
};

document.querySelectorAll("[data-whatsapp]").forEach((link) => {
  const message = link.dataset.message || "Salve, vorrei richiedere una consulenza gratuita sui servizi FATTO! per il mio B&B.";
  link.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(message)}`;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
});

document.querySelectorAll("[data-email]").forEach((link) => {
  link.href = `mailto:${CONFIG.email}`;
  link.textContent = CONFIG.email;
});

const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");

function setMenu(open) {
  if (!menuToggle || !mobileMenu) return;
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Chiudi il menu" : "Apri il menu");
  mobileMenu.setAttribute("aria-hidden", String(!open));
  mobileMenu.classList.toggle("open", open);
  document.body.classList.toggle("menu-open", open);
}

menuToggle?.addEventListener("click", () => {
  setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
});

mobileMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

const demoModal = document.querySelector("[data-demo-modal]");
const demoDialog = demoModal?.querySelector(".demo-dialog");
const demoForm = demoModal?.querySelector("[data-demo-form]");
const demoSuccess = demoModal?.querySelector("[data-demo-success]");
const demoError = demoModal?.querySelector("[data-demo-error]");
const demoFormNote = demoModal?.querySelector("[data-demo-form-note]");
const demoSuccessName = demoModal?.querySelector("[data-demo-success-name]");
const demoSuccessEmail = demoModal?.querySelector("[data-demo-success-email]");
const demoEndpoint = String(window.FATTO_LEAD_CONFIG?.endpoint || "").trim();
const demoEndpointReady = /^https:\/\/script\.google\.com\/macros\/s\/[a-zA-Z0-9_-]+\/exec$/.test(demoEndpoint);
let demoReturnFocus = null;
let demoOpenedAt = 0;

if (demoFormNote && !demoEndpointReady) {
  demoFormNote.innerHTML = "<b>Collegamento da completare:</b> il questionario è pronto, ma va ancora inserito l’indirizzo dell’automazione Google.";
}

function resetDemoForm() {
  demoForm?.reset();
  demoForm?.querySelectorAll("[aria-invalid]").forEach((field) => field.removeAttribute("aria-invalid"));
  if (demoError) demoError.hidden = true;
  if (demoSuccess) demoSuccess.hidden = true;
  if (demoForm) demoForm.hidden = false;
}

function setDemo(open, trigger = null) {
  if (!demoModal) return;

  if (open) {
    setMenu(false);
    if (demoSuccess && !demoSuccess.hidden) resetDemoForm();
    demoOpenedAt = Date.now();
    demoReturnFocus = trigger || document.activeElement;
    demoModal.classList.add("open");
    demoModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("demo-open");
    window.setTimeout(() => demoForm?.querySelector("input")?.focus(), 80);
    return;
  }

  demoModal.classList.remove("open");
  demoModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("demo-open");
  demoReturnFocus?.focus?.();
}

document.querySelectorAll("[data-demo-open]").forEach((button) => {
  button.addEventListener("click", () => setDemo(true, button));
});

demoModal?.querySelectorAll("[data-demo-close]").forEach((button) => {
  button.addEventListener("click", () => setDemo(false));
});

demoForm?.querySelectorAll("input[required]").forEach((input) => {
  input.addEventListener("input", () => {
    input.setCustomValidity("");
    input.removeAttribute("aria-invalid");
  });
  input.addEventListener("change", () => {
    input.setCustomValidity("");
    input.removeAttribute("aria-invalid");
  });
});

demoForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const phoneField = demoForm.elements.namedItem("phone");
  if (phoneField instanceof HTMLInputElement && !/^[0-9+().\s-]{7,30}$/.test(phoneField.value.trim())) {
    phoneField.setCustomValidity("Inserisci un numero di telefono valido.");
  }
  const requiredFields = [...demoForm.querySelectorAll("input[required]")];
  const invalidFields = requiredFields.filter((field) => !field.validity.valid);

  requiredFields.forEach((field) => {
    if (field.validity.valid) field.removeAttribute("aria-invalid");
    else field.setAttribute("aria-invalid", "true");
  });

  if (invalidFields.length) {
    if (demoError) {
      demoError.textContent = "Controlla i campi evidenziati prima di continuare.";
      demoError.hidden = false;
    }
    invalidFields[0].focus();
    return;
  }

  if (!demoEndpointReady) {
    if (demoError) {
      demoError.textContent = "Il collegamento delle richieste non è ancora attivo. Puoi contattarci tramite WhatsApp.";
      demoError.hidden = false;
    }
    return;
  }

  if (demoError) demoError.hidden = true;
  const submitButton = demoForm.querySelector(".demo-submit");
  const submitLabel = submitButton?.querySelector("span");
  const originalLabel = submitLabel?.textContent || "Invia la richiesta";
  const formData = new FormData(demoForm);
  const firstName = String(formData.get("firstName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const requestId = globalThis.crypto?.randomUUID?.() || `fatto-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const payload = new URLSearchParams({
    firstName,
    lastName: String(formData.get("lastName") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    email,
    website: String(formData.get("website") || ""),
    privacyAccepted: String(formData.get("privacy") === "on"),
    privacyVersion: "12 settembre 2026",
    elapsedMs: String(Math.max(Date.now() - (demoOpenedAt || Date.now()), 0)),
    requestId,
    source: `${window.location.origin}${window.location.pathname}`
  });

  if (submitButton) submitButton.disabled = true;
  if (submitLabel) submitLabel.textContent = "Invio in corso…";

  try {
    await fetch(demoEndpoint, {
      method: "POST",
      mode: "no-cors",
      body: payload,
      referrerPolicy: "strict-origin-when-cross-origin"
    });

    demoForm.hidden = true;
    if (demoSuccessName) demoSuccessName.textContent = `${firstName}!`;
    if (demoSuccessEmail) demoSuccessEmail.textContent = email;
    if (demoSuccess) {
      demoSuccess.hidden = false;
      demoSuccess.querySelector("button")?.focus();
    }
  } catch (error) {
    if (demoError) {
      demoError.textContent = "Non siamo riusciti a inviare la richiesta. Riprova oppure contattaci tramite WhatsApp.";
      demoError.hidden = false;
    }
  } finally {
    if (submitButton) submitButton.disabled = false;
    if (submitLabel) submitLabel.textContent = originalLabel;
  }
});

demoModal?.querySelector("[data-demo-reset]")?.addEventListener("click", () => {
  resetDemoForm();
  demoOpenedAt = Date.now();
  demoForm?.querySelector("input")?.focus();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (demoModal?.classList.contains("open")) setDemo(false);
    else setMenu(false);
  }

  if (event.key === "Tab" && demoModal?.classList.contains("open") && demoDialog) {
    const focusable = [...demoDialog.querySelectorAll("button:not([hidden]), input:not([hidden]), a[href]")]
      .filter((element) => !element.closest("[hidden]") && !element.disabled);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});
