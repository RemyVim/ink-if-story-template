// Story state management (save/load functionality)
class StoryState {
  constructor() {
    this.saveKey = "save-state";
    this.themeKey = "theme";
  }

  save(storyStateJson) {
    try {
      window.localStorage.setItem(this.saveKey, storyStateJson);

      // Also save theme
      const isDark = document.body.classList.contains("dark");
      window.localStorage.setItem(this.themeKey, isDark ? "dark" : "");

      return true;
    } catch (e) {
      console.warn("Couldn't save state");
      return false;
    }
  }

  load() {
    try {
      const savedState = window.localStorage.getItem(this.saveKey);
      return savedState || null;
    } catch (e) {
      console.debug("Couldn't load save state");
      return null;
    }
  }

  hasSave() {
    try {
      const savedState = window.localStorage.getItem(this.saveKey);
      return !!savedState;
    } catch (e) {
      return false;
    }
  }

  loadTheme() {
    try {
      return window.localStorage.getItem(this.themeKey);
    } catch (e) {
      console.debug("Couldn't load saved theme");
      return null;
    }
  }
}
