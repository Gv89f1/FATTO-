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
const demoPackages = demoModal?.querySelector("[data-demo-packages]");
const checkoutView = demoModal?.querySelector("[data-checkout-view]");
const checkoutForm = demoModal?.querySelector("[data-checkout-form]");
const checkoutPlanField = demoModal?.querySelector("[data-checkout-plan-field]");
const checkoutIntervalField = demoModal?.querySelector("[data-checkout-interval-field]");
const checkoutTrialField = demoModal?.querySelector("[data-checkout-trial-field]");
const checkoutRequestId = demoModal?.querySelector("[data-checkout-request-id]");
const checkoutError = demoModal?.querySelector("[data-checkout-error]");
const checkoutConsent = checkoutForm?.elements.namedItem("terms");
const checkoutSubmit = checkoutForm?.querySelector(".demo-submit");
let demoReturnFocus = null;
let selectedCheckoutPlan = "pro";

const checkoutPlans = {
  start: {
    name: "Start",
    description: "Le funzioni essenziali per organizzare il B&B. Il pagamento avviene nella pagina sicura di Stripe e l’accesso si attiva dopo la conferma.",
    month: { price: "€19", note: "al mese", renewal: "Addebito di €19 oggi, poi rinnovo mensile. Puoi annullare il rinnovo dall’area clienti." },
    year: { price: "€190", note: "all’anno", renewal: "Addebito di €190 oggi per 12 mesi. Risparmi €38 rispetto al pagamento mensile." }
  },
  pro: {
    name: "Pro",
    description: "30 giorni gratuiti, poi scegli se continuare. Inserirai i dati di pagamento soltanto nella pagina sicura di Stripe.",
    month: { price: "€39", note: "al mese dopo 30 giorni gratis", renewal: "Oggi €0. Il primo addebito di €39 avverrà al termine dei 30 giorni, salvo annullamento precedente." },
    year: { price: "€390", note: "all’anno dopo 30 giorni gratis", renewal: "Oggi €0. Dopo 30 giorni saranno addebitati €390 per 12 mesi, salvo annullamento precedente." }
  }
};

function createCheckoutRequestId() {
  return globalThis.crypto?.randomUUID?.() || `fatto-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function syncCheckoutConsent() {
  if (!(checkoutConsent instanceof HTMLInputElement) || !checkoutSubmit) return;
  checkoutSubmit.disabled = !checkoutConsent.checked;
  checkoutSubmit.removeAttribute("data-loading");
}

function resetDemoForm() {
  checkoutForm?.reset();
  syncCheckoutConsent();
  if (checkoutError) checkoutError.hidden = true;
  if (demoPackages) demoPackages.hidden = false;
  if (checkoutView) checkoutView.hidden = true;
  demoDialog?.setAttribute("aria-labelledby", "demo-packages-title");
  demoDialog?.setAttribute("aria-describedby", "demo-packages-description");
}

function updateCheckout(interval = "month") {
  const plan = checkoutPlans[selectedCheckoutPlan] || checkoutPlans.pro;
  const billing = plan[interval] || plan.month;
  if (checkoutIntervalField) checkoutIntervalField.value = interval;
  demoModal?.querySelectorAll("[data-billing-interval]").forEach((button) => button.classList.toggle("active", button.dataset.billingInterval === interval));
  const name = demoModal?.querySelector("[data-checkout-plan-name]");
  const summaryName = demoModal?.querySelector("[data-checkout-summary-name]");
  const description = demoModal?.querySelector("[data-checkout-description]");
  const price = demoModal?.querySelector("[data-checkout-price]");
  const priceNote = demoModal?.querySelector("[data-checkout-price-note]");
  const renewal = demoModal?.querySelector("[data-checkout-renewal]");
  const submitLabel = checkoutForm?.querySelector(".demo-submit span");
  if (name) name.textContent = plan.name;
  if (summaryName) summaryName.textContent = plan.name;
  if (description) description.textContent = plan.description;
  if (price) price.textContent = billing.price;
  if (priceNote) priceNote.textContent = billing.note;
  if (renewal) renewal.textContent = billing.renewal;
  if (submitLabel) submitLabel.textContent = selectedCheckoutPlan === "pro" ? "Inizia 30 giorni gratuiti" : "Continua al pagamento sicuro";
}

function showCheckout(plan = "pro") {
  selectedCheckoutPlan = checkoutPlans[plan] ? plan : "pro";
  if (checkoutPlanField) checkoutPlanField.value = selectedCheckoutPlan;
  if (checkoutTrialField) checkoutTrialField.value = selectedCheckoutPlan === "pro" ? "30" : "0";
  if (checkoutRequestId) checkoutRequestId.value = createCheckoutRequestId();
  if (demoPackages) demoPackages.hidden = true;
  if (checkoutView) checkoutView.hidden = false;
  if (checkoutError) checkoutError.hidden = true;
  checkoutForm?.reset();
  if (checkoutPlanField) checkoutPlanField.value = selectedCheckoutPlan;
  if (checkoutTrialField) checkoutTrialField.value = selectedCheckoutPlan === "pro" ? "30" : "0";
  if (checkoutRequestId) checkoutRequestId.value = createCheckoutRequestId();
  updateCheckout("month");
  syncCheckoutConsent();
  demoDialog?.setAttribute("aria-labelledby", "checkout-title");
  demoDialog?.setAttribute("aria-describedby", "checkout-description");
  window.setTimeout(() => demoModal?.querySelector("[data-billing-interval]")?.focus(), 60);
}

function setDemo(open, trigger = null) {
  if (!demoModal) return;

  if (open) {
    setMenu(false);
    resetDemoForm();
    demoReturnFocus = trigger || document.activeElement;
    demoModal.classList.add("open");
    demoModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("demo-open");
    window.setTimeout(() => demoModal.querySelector("[data-checkout-plan]")?.focus(), 80);
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

demoModal?.querySelectorAll("[data-checkout-plan]").forEach((button) => {
  button.addEventListener("click", () => showCheckout(button.dataset.checkoutPlan));
});

demoModal?.querySelectorAll("[data-billing-interval]").forEach((button) => {
  button.addEventListener("click", () => updateCheckout(button.dataset.billingInterval));
});

demoModal?.querySelector("[data-demo-plans-back]")?.addEventListener("click", () => {
  resetDemoForm();
  demoModal.querySelector("[data-checkout-plan]")?.focus();
});

demoModal?.querySelectorAll("[data-demo-close]").forEach((button) => {
  button.addEventListener("click", () => setDemo(false));
});

checkoutForm?.addEventListener("submit", (event) => {
  if (!(checkoutConsent instanceof HTMLInputElement) || !checkoutConsent.checked) {
    event.preventDefault();
    if (checkoutError) checkoutError.hidden = false;
    checkoutConsent?.focus?.();
    return;
  }
  if (checkoutError) checkoutError.hidden = true;
  const label = checkoutSubmit?.querySelector("span");
  if (checkoutSubmit) {
    checkoutSubmit.dataset.loading = "true";
    checkoutSubmit.disabled = true;
  }
  if (label) label.textContent = "Apertura checkout…";
});

checkoutConsent?.addEventListener("change", () => {
  syncCheckoutConsent();
  if (checkoutError) checkoutError.hidden = true;
});

if (new URLSearchParams(window.location.search).get("pagamento") === "annullato") {
  setDemo(true);
  showCheckout("pro");
  if (checkoutError) {
    checkoutError.textContent = "Pagamento annullato: non è stato effettuato alcun addebito. Puoi riprendere quando vuoi.";
    checkoutError.hidden = false;
  }
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (demoModal?.classList.contains("open")) setDemo(false);
    else setMenu(false);
  }

  if (event.key === "Tab" && demoModal?.classList.contains("open") && demoDialog) {
    const focusable = [...demoDialog.querySelectorAll("button:not([hidden]):not(:disabled), input:not([hidden]):not(:disabled), a[href]")]
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

const activationCheckout = document.querySelector("[data-activation-checkout]");
const activationIntervalField = activationCheckout?.querySelector("[data-activation-interval-field]");
const activationRequestId = activationCheckout?.querySelector("[data-activation-request-id]");
const activationRenewal = activationCheckout?.querySelector("[data-activation-renewal]");
const activationSubmitLabel = activationCheckout?.querySelector("[data-activation-submit-label]");
const activationConsent = activationCheckout?.elements.namedItem("terms");
const activationSubmit = activationCheckout?.querySelector(".rd-payment-submit");

function syncActivationConsent() {
  if (!(activationConsent instanceof HTMLInputElement) || !activationSubmit) return;
  activationSubmit.disabled = !activationConsent.checked;
  activationSubmit.removeAttribute("data-loading");
}

function updateActivationCheckout(interval = "month") {
  if (activationIntervalField) activationIntervalField.value = interval;
  activationCheckout?.querySelectorAll("[data-activation-interval]").forEach((button) => button.classList.toggle("active", button.dataset.activationInterval === interval));
  if (activationRenewal) activationRenewal.textContent = interval === "year"
    ? "€390 per 12 mesi. Risparmi €78 rispetto al pagamento mensile."
    : "€39 al mese. Il rinnovo può essere annullato dall’area clienti.";
  if (activationSubmitLabel) activationSubmitLabel.textContent = interval === "year"
    ? "Continua al pagamento · €390/anno"
    : "Continua al pagamento · €39/mese";
}

activationCheckout?.querySelectorAll("[data-activation-interval]").forEach((button) => {
  button.addEventListener("click", () => updateActivationCheckout(button.dataset.activationInterval));
});

activationCheckout?.addEventListener("submit", (event) => {
  if (!(activationConsent instanceof HTMLInputElement) || !activationConsent.checked) {
    event.preventDefault();
    activationConsent?.focus?.();
    return;
  }
  if (activationRequestId) activationRequestId.value = createCheckoutRequestId();
  if (activationSubmit) {
    activationSubmit.dataset.loading = "true";
    activationSubmit.disabled = true;
  }
  if (activationSubmitLabel) activationSubmitLabel.textContent = "Apertura checkout…";
});

activationConsent?.addEventListener("change", syncActivationConsent);
syncActivationConsent();
if (activationRequestId) activationRequestId.value = createCheckoutRequestId();
