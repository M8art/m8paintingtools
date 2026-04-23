const gameCards = document.querySelectorAll("[data-game-card]");
const colorSwatches = [
  "linear-gradient(135deg, #85735f, #9d836c)",
  "linear-gradient(135deg, #6a7b7f, #95a8a7)",
  "linear-gradient(135deg, #a3634a, #cc8a60)",
  "linear-gradient(135deg, #5e625f, #8b8f87)"
];

gameCards.forEach((card) => {
  const toggleButton = card.querySelector("[data-toggle-card]");
  const panel = card.querySelector("[data-prototype-panel][hidden]");
  const feedback = card.querySelector("[data-feedback]");
  const actionButton = card.querySelector("[data-prototype-action]");

  if (toggleButton && panel) {
    toggleButton.addEventListener("click", () => {
      const willOpen = panel.hasAttribute("hidden");

      gameCards.forEach((otherCard) => {
        const otherPanel = otherCard.querySelector("[data-prototype-panel][hidden], [data-prototype-panel]:not(.value-card-note)");
        const otherToggle = otherCard.querySelector("[data-toggle-card]");
        if (!otherPanel || !otherToggle || otherCard === card) {
          return;
        }

        otherPanel.setAttribute("hidden", "");
        otherCard.classList.remove("is-open");
        otherToggle.textContent = "Open Game";
        otherToggle.setAttribute("aria-expanded", "false");
      });

      if (willOpen) {
        panel.removeAttribute("hidden");
        card.classList.add("is-open");
        toggleButton.textContent = "Close Game";
        toggleButton.setAttribute("aria-expanded", "true");
      } else {
        panel.setAttribute("hidden", "");
        card.classList.remove("is-open");
        toggleButton.textContent = "Open Game";
        toggleButton.setAttribute("aria-expanded", "false");
      }
    });
  }

  actionButton?.addEventListener("click", () => {
    const action = actionButton.dataset.prototypeAction;

    if (action === "focal") {
      const focalHalo = card.querySelector("[data-focal-halo]");
      const focalCrosshair = card.querySelector("[data-focal-crosshair]");
      if (focalHalo && focalCrosshair) {
        const left = 24 + Math.round(Math.random() * 52);
        const top = 24 + Math.round(Math.random() * 50);
        focalHalo.style.left = `${left}%`;
        focalHalo.style.top = `${top}%`;
        focalCrosshair.style.left = `${left}%`;
        focalCrosshair.style.top = `${top}%`;
      }
      if (feedback) {
        feedback.textContent = "Prototype focus marker reset for another instinct check.";
      }
    }

    if (action === "color") {
      const swatch = card.querySelector("[data-color-swatch]");
      const preview = card.querySelector("[data-color-swatch-preview]");
      const nextColor = colorSwatches[Math.floor(Math.random() * colorSwatches.length)];
      if (swatch) {
        swatch.style.background = nextColor;
      }
      if (preview) {
        preview.style.background = nextColor;
      }
      if (feedback) {
        feedback.textContent = "Prototype target color changed for a new pigment guess.";
      }
    }
  });
});

document.querySelector("[data-focal-stage]")?.addEventListener("click", (event) => {
  const stage = event.currentTarget;
  const halo = stage.querySelector("[data-focal-halo]");
  const crosshair = stage.querySelector("[data-focal-crosshair]");
  const rect = stage.getBoundingClientRect();
  const left = ((event.clientX - rect.left) / rect.width) * 100;
  const top = ((event.clientY - rect.top) / rect.height) * 100;

  if (halo && crosshair) {
    halo.style.left = `${left}%`;
    halo.style.top = `${top}%`;
    crosshair.style.left = `${left}%`;
    crosshair.style.top = `${top}%`;
  }

  const feedback = stage.closest("[data-game-card]")?.querySelector("[data-feedback]");
  if (feedback) {
    feedback.textContent = "Prototype click captured. Future versions can compare this instinct with the M8 focal read.";
  }
});

document.querySelectorAll("[data-pigment-name]").forEach((chip) => {
  chip.addEventListener("click", () => {
    const feedback = chip.closest("[data-game-card]")?.querySelector("[data-feedback]");
    if (feedback) {
      feedback.textContent = `${chip.dataset.pigmentName} pigment chip selected in the prototype shell.`;
    }
  });
});
