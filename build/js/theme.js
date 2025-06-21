// Theme management utilities
class ThemeManager {
  constructor() {
    this.storyState = new StoryState();
  }

  setup(globalTagTheme) {
    const savedTheme = this.storyState.loadTheme();

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
    document.body.classList.add("switched");
    document.body.classList.toggle("dark");
  }

  isAnimationEnabled() {
    return window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
  }
}
