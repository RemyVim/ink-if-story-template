// Theme management utilities (updated for settings integration)
class ThemeManager {
  constructor() {}

  setup(globalTagTheme, settingsManager = null) {
    this.settingsManager = settingsManager;

    // If we have a settings manager, let it handle theme
    if (this.settingsManager) {
      // Apply initial theme from settings
      this.settingsManager.applyTheme();
      return;
    }

    // Check whether the OS/browser is configured for dark mode
    const browserDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    const shouldUseDark =
      savedTheme === "dark" ||
      (savedTheme === null && globalTagTheme === "dark") ||
      (savedTheme === null && globalTagTheme === null && browserDark);

    if (shouldUseDark) {
      document.body.classList.add("dark");
    }
  }

  toggle() {
    // If we have a settings manager, update through it
    if (this.settingsManager) {
      const currentTheme = this.settingsManager.getSetting("theme");
      const isDark = document.body.classList.contains("dark");

      if (currentTheme === "auto") {
        // Switch to opposite of current state
        this.settingsManager.setSetting("theme", isDark ? "light" : "dark");
      } else if (currentTheme === "light") {
        this.settingsManager.setSetting("theme", "dark");
      } else {
        this.settingsManager.setSetting("theme", "light");
      }
      return;
    }

    // Fallback to original behavior
    document.body.classList.add("switched");
    document.body.classList.toggle("dark");
  }

  isAnimationEnabled() {
    if (this.settingsManager) {
      return this.settingsManager.getSetting("animations");
    }
    return window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
  }
}
