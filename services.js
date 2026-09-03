(() => {
  const explorer = document.querySelector(".service-explorer");
  if (!explorer) return;

  const tabs = [...explorer.querySelectorAll(".service-tab")];
  const panels = [...explorer.querySelectorAll(".service-panel")];
  let activeIndex = Math.max(0, tabs.findIndex((tab) => tab.classList.contains("active")));
  let wheelLocked = false;
  let touchStartX = 0;

  tabs.forEach((tab, index) => {
    const tabId = `service-tab-${index + 1}`;
    const panelId = `service-panel-${index + 1}`;
    tab.id = tabId;
    tab.setAttribute("aria-controls", panelId);
    panels[index].id = panelId;
    panels[index].setAttribute("aria-labelledby", tabId);
  });

  function select(index, focus = false, revealTab = true) {
    activeIndex = Math.max(0, Math.min(index, tabs.length - 1));

    tabs.forEach((tab, tabIndex) => {
      const selected = tabIndex === activeIndex;
      tab.classList.toggle("active", selected);
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });

    panels.forEach((panel, panelIndex) => {
      const selected = panelIndex === activeIndex;
      panel.hidden = !selected;
      panel.classList.toggle("active", selected);
    });

    if (focus) tabs[activeIndex].focus();
    if (revealTab && window.matchMedia("(max-width: 700px)").matches) {
      tabs[activeIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center"
      });
    }
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => select(index));
    tab.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault();
        select((activeIndex + 1) % tabs.length, true);
      }
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault();
        select((activeIndex - 1 + tabs.length) % tabs.length, true);
      }
      if (event.key === "Home") { event.preventDefault(); select(0, true); }
      if (event.key === "End") { event.preventDefault(); select(tabs.length - 1, true); }
    });
  });

  explorer.addEventListener("wheel", (event) => {
    if (Math.abs(event.deltaY) < 18) return;
    event.preventDefault();
    if (wheelLocked) return;

    const direction = event.deltaY > 0 ? 1 : -1;
    const nextIndex = activeIndex + direction;

    if (nextIndex < 0 || nextIndex >= tabs.length) {
      wheelLocked = true;
      window.dispatchEvent(new CustomEvent("fatto:navigate-page", {
        detail: { direction }
      }));
      window.setTimeout(() => { wheelLocked = false; }, 620);
      return;
    }

    wheelLocked = true;
    select(nextIndex);
    window.setTimeout(() => { wheelLocked = false; }, 620);
  }, { passive: false });

  explorer.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });

  explorer.addEventListener("touchend", (event) => {
    const distance = touchStartX - event.changedTouches[0].clientX;
    if (Math.abs(distance) < 45) return;
    const direction = distance > 0 ? 1 : -1;
    const nextIndex = activeIndex + direction;
    if (nextIndex < 0 || nextIndex >= tabs.length) {
      window.dispatchEvent(new CustomEvent("fatto:navigate-page", {
        detail: { direction }
      }));
      return;
    }
    select(nextIndex);
  }, { passive: true });

  select(activeIndex, false, false);
})();
