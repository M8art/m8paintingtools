(() => {
  const THEME_KEY = "m8MobileLandingTheme";

  function applyStoredTheme() {
    try {
      document.documentElement.classList.toggle(
        "mobile-light-mode",
        window.localStorage.getItem(THEME_KEY) === "light"
      );
    } catch (error) {
      document.documentElement.classList.remove("mobile-light-mode");
    }
  }

  applyStoredTheme();
  window.addEventListener("storage", (event) => {
    if (event.key === THEME_KEY) {
      applyStoredTheme();
    }
  });
})();
