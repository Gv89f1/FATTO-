(() => {
  const pages = [
    { file: "index.html", label: "Home" },
    { file: "servizi.html", label: "Servizi" },
    { file: "metodo.html", label: "Metodo" }
  ];

  const currentPage = location.pathname.split("/").pop() || "index.html";
  const currentIndex = Math.max(0, pages.findIndex((page) => page.file === currentPage));
  const navigationLockKey = "fatto-page-navigation-lock";
  const navigationLockDuration = 1100;
  const lastNavigation = Number(sessionStorage.getItem(navigationLockKey)) || 0;
  const remainingLock = navigationLockDuration - (Date.now() - lastNavigation);
  let navigationLocked = remainingLock > 0;

  if (navigationLocked) {
    window.setTimeout(() => { navigationLocked = false; }, remainingLock);
  }

  const pageDots = document.createElement("nav");
  pageDots.className = "page-dots";
  pageDots.setAttribute("aria-label", "Navigazione tra le pagine");
  pageDots.innerHTML = `
    <div class="page-dots-links">
      ${pages.map((page, index) => `
        <a href="${page.file}"${index === currentIndex ? ' class="active" aria-current="page"' : ""} aria-label="Vai a ${page.label}">
          <span class="page-dot-label">${page.label}</span>
          <span class="page-dot" aria-hidden="true"></span>
        </a>
      `).join("")}
    </div>
    <small><b>${String(currentIndex + 1).padStart(2, "0")}</b> / ${String(pages.length).padStart(2, "0")}</small>
  `;
  document.body.append(pageDots);

  function goTo(index) {
    if (navigationLocked || index < 0 || index >= pages.length || index === currentIndex) return;
    navigationLocked = true;
    sessionStorage.setItem(navigationLockKey, String(Date.now()));
    location.assign(pages[index].file);
  }

  pageDots.querySelectorAll("a").forEach((link, index) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      goTo(index);
    });
  });

  function move(direction) {
    goTo(currentIndex + direction);
  }

  window.addEventListener("fatto:navigate-page", (event) => {
    move(Number(event.detail?.direction) || 0);
  });

  document.addEventListener("wheel", (event) => {
    if (window.matchMedia("(max-width: 960px)").matches) return;
    if (event.target.closest?.(".service-explorer")) return;
    if (Math.abs(event.deltaY) < 55 || navigationLocked) return;
    move(event.deltaY > 0 ? 1 : -1);
  }, { passive: true });

  document.addEventListener("keydown", (event) => {
    if (event.target.matches("input, textarea, select, [contenteditable='true']")) return;
    if (event.key === "PageDown") move(1);
    if (event.key === "PageUp") move(-1);
  });
})();
