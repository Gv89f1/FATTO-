const redesignHeader = document.querySelector("[data-header]");
const dropdownToggle = document.querySelector("[data-dropdown-toggle]");
const dropdown = document.querySelector("[data-dropdown]");

function setDropdown(open) {
  if (!dropdownToggle || !dropdown) return;
  dropdownToggle.setAttribute("aria-expanded", String(open));
  dropdown.classList.toggle("open", open);
}

dropdownToggle?.addEventListener("click", (event) => {
  event.stopPropagation();
  setDropdown(dropdownToggle.getAttribute("aria-expanded") !== "true");
});

dropdown?.addEventListener("click", () => setDropdown(false));

document.addEventListener("click", (event) => {
  if (!event.target.closest(".rd-nav-group")) setDropdown(false);
});

window.addEventListener("scroll", () => {
  redesignHeader?.classList.toggle("scrolled", window.scrollY > 24);
}, { passive: true });

document.querySelectorAll("[data-mobile-close]").forEach((button) => {
  button.addEventListener("click", () => {
    const toggle = document.querySelector("[data-menu-toggle]");
    const menu = document.querySelector("[data-mobile-menu]");
    toggle?.setAttribute("aria-expanded", "false");
    toggle?.setAttribute("aria-label", "Apri il menu");
    menu?.setAttribute("aria-hidden", "true");
    menu?.classList.remove("open");
    document.body.classList.remove("menu-open");
  });
});

document.querySelectorAll("[data-faq-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest("article");
    const open = !item?.classList.contains("open");

    document.querySelectorAll(".rd-faq-list article").forEach((article) => {
      article.classList.remove("open");
      const articleButton = article.querySelector("[data-faq-toggle]");
      articleButton?.setAttribute("aria-expanded", "false");
      const icon = articleButton?.querySelector("i");
      if (icon) icon.textContent = "+";
    });

    if (open && item) {
      item.classList.add("open");
      button.setAttribute("aria-expanded", "true");
      const icon = button.querySelector("i");
      if (icon) icon.textContent = "−";
    }
  });
});

const featureTabs = [...document.querySelectorAll("[data-feature-tab]")];
const featurePanels = [...document.querySelectorAll("[data-feature-panel]")];

function setFeaturePanel(key, focusTab = false) {
  const selectedTab = featureTabs.find((tab) => tab.dataset.featureTab === key);
  if (!selectedTab) return;

  featureTabs.forEach((tab) => {
    const selected = tab === selectedTab;
    tab.classList.toggle("active", selected);
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });

  featurePanels.forEach((panel) => {
    const selected = panel.dataset.featurePanel === key;
    panel.classList.toggle("active", selected);
    panel.hidden = !selected;
  });

  if (focusTab) selectedTab.focus();
}

featureTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => setFeaturePanel(tab.dataset.featureTab));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = index;
    if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = featureTabs.length - 1;
    else if (["ArrowRight", "ArrowDown"].includes(event.key)) nextIndex = (index + 1) % featureTabs.length;
    else nextIndex = (index - 1 + featureTabs.length) % featureTabs.length;
    setFeaturePanel(featureTabs[nextIndex].dataset.featureTab, true);
  });
});

if (featureTabs.length) setFeaturePanel(featureTabs.find((tab) => tab.classList.contains("active"))?.dataset.featureTab || featureTabs[0].dataset.featureTab);

document.querySelectorAll("[data-feature-link]").forEach((link) => {
  link.addEventListener("click", (event) => {
    const key = link.dataset.featureLink;
    if (!key) return;
    event.preventDefault();
    setFeaturePanel(key);
    setDropdown(false);
    document.querySelector("#funzioni-complete")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const revealTargets = document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("revealed");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -45px" });

  revealTargets.forEach((target, index) => {
    target.style.transitionDelay = `${Math.min(index % 3, 2) * 70}ms`;
    revealObserver.observe(target);
  });
} else {
  revealTargets.forEach((target) => target.classList.add("revealed"));
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setDropdown(false);
});
