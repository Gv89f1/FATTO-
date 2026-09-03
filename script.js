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

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});
