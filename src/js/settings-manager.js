import { TagRegistry, TAGS } from "./tag-registry.js";
import { errorManager, ERROR_SOURCES } from "./error-manager.js";

const log = errorManager.forSource(ERROR_SOURCES.SETTINGS_MANAGER);

class SettingsManager {
  constructor() {
    this.settings = this.getDefaults();

    // Wired by main.js after construction
    this.storyManager = null;
    this.keyboardShortcuts = null;
    this.settingsModal = null;

    this.toneIndicatorsAvailable = false;
    this.authorToneIndicators = true;
    this.toneIndicatorsTrailing = false;

    // TODO: Move toneMap to tagRegistry where it makes more sense
    this.toneMap = {}; // Will be populated from global tags
    this.authorChoiceNumbering = "auto";

    this.init();
  }

  init() {
    this.loadSettings();
    this.setupThemeDetection();
    this.applySettings();
  }

  showSettings() {
    this.settingsModal?.show?.();
  }

  getDefaults() {
    return {
      theme: "auto",
      textSize: "medium",
      lineHeight: "normal",
      fontFamily: "serif",
      audioEnabled: true,
      autoSave: true,
      animations: true,
      toneIndicators: this.authorToneIndicators || false,
      choiceNumbering: this.authorChoiceNumbering || "auto",
      keyboardShortcuts: true,
    };
  }

  setupThemeDetection() {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", () => {
      if (this.settings.theme === "auto") {
        this.applyTheme();
      }
    });
  }

  getSetting(key) {
    return this.settings[key];
  }

  setSetting(key, value) {
    if (key in this.settings) {
      this.settings[key] = value;
      this.storeSettings();
      this.applySettings();
    }
  }

  resetToDefaults() {
    this.settings = this.getDefaults();
    this.applySettings();
  }

  toggleTheme() {
    const currentIsDark = document.body?.classList.contains("dark");

    if (this.settings.theme === "auto") {
      // If auto, switch to opposite of current state
      this.settings.theme = currentIsDark ? "light" : "dark";
    } else if (this.settings.theme === "light") {
      this.settings.theme = "dark";
    } else {
      this.settings.theme = "light";
    }

    this.storeSettings();
    this.applyTheme();
  }

  loadSettings() {
    try {
      const parsed = this.getStoredSettings();
      if (parsed) {
        this.settings = { ...this.settings, ...parsed };
      }
    } catch (error) {
      log.warning("Failed to load settings", error);
    }
  }

  storeSettings() {
    try {
      localStorage.setItem(
        "ink-template-settings",
        JSON.stringify(this.settings),
      );
    } catch (error) {
      log.error("Failed to store settings", error);
    }
  }

  getStoredSettings() {
    try {
      const stored = localStorage.getItem("ink-template-settings");
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      return null;
    }
  }

  applySettings() {
    this.applyTheme();
    this.applyFontFamily();
    this.applyTextSize();
    this.applyLineHeight();
    this.applyAnimations();
    this.applyChoiceNumbering();
    this.applyKeyboardShortcuts();
  }

  applyIndividualSetting(setting) {
    switch (setting) {
      case "theme":
        this.applyTheme();
        break;
      case "fontFamily":
        this.applyFontFamily();
        break;
      case "textSize":
        this.applyTextSize();
        break;
      case "lineHeight":
        this.applyLineHeight();
        break;
      case "toneIndicators":
        this.refreshChoices();
        break;
      case "choiceNumbering":
        this.applyChoiceNumbering();
        break;
      case "keyboardShortcuts":
        this.applyKeyboardShortcuts();
        break;
    }
  }

  applyTheme() {
    const body = document.body;
    const html = document.documentElement;
    if (!body) return;

    body.classList.remove("dark");
    html.classList.remove("dark");

    if (this.settings.theme === "dark") {
      body.classList.add("dark");
      html.classList.add("dark");
    } else if (this.settings.theme === "auto") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      if (prefersDark) {
        body.classList.add("dark");
        html.classList.add("dark");
      }
    }

    body.classList.add("switched");
  }

  applyFontFamily() {
    const root = document.documentElement;
    if (!root) return;

    const fonts = {
      serif: "var(--font-serif)",
      sans: "var(--font-sans)",
      dyslexic: "var(--font-dyslexic)",
    };

    root.style.setProperty(
      "--font-main",
      fonts[this.settings.fontFamily] || fonts.serif,
    );
  }

  applyTextSize() {
    const root = document.documentElement;
    if (!root) return;

    const sizes = {
      small: "11pt",
      medium: "13pt",
      large: "15pt",
      xl: "17pt",
    };

    root.style.setProperty(
      "--text-size-base",
      sizes[this.settings.textSize] || sizes.medium,
    );
  }

  applyLineHeight() {
    const root = document.documentElement;
    if (!root) return;

    const heights = {
      tight: "1.4em",
      normal: "1.7em",
      loose: "2.0em",
    };

    const height = heights[this.settings.lineHeight] || heights.normal;
    root.style.setProperty("--line-height-text", height);
    root.style.setProperty("--line-height-choice", height);
  }

  applyAnimations() {
    const root = document.documentElement;
    if (!root) return;

    if (!this.settings.animations) {
      root.style.setProperty("--transition-fast", "0s");
      root.style.setProperty("--transition-medium", "0s");
      root.style.setProperty("--transition-slow", "0s");
      root.style.setProperty("--transition-very-slow", "0s");
    } else {
      root.style.setProperty("--transition-fast", "0.1s");
      root.style.setProperty("--transition-medium", "0.2s");
      root.style.setProperty("--transition-slow", "0.6s");
      root.style.setProperty("--transition-very-slow", "1s");
    }
  }

  applyChoiceNumbering() {
    document.body?.classList.remove(
      "choice-numbers-on",
      "choice-numbers-off",
      "choice-numbers-auto",
    );
    document.body?.classList.add(
      `choice-numbers-${this.settings.choiceNumbering || "auto"}`,
    );
  }

  applyKeyboardShortcuts() {
    if (this.settings.keyboardShortcuts) {
      this.keyboardShortcuts?.enable?.();
    } else {
      this.keyboardShortcuts?.disable?.();
    }

    this.settingsModal?.updateKeyboardHelpButtonVisibility?.();
  }

  /**
   * Process global tags from the story for initial author setup
   * @param {Array} globalTags - Array of global tags from the story
   */
  processGlobalTags(globalTags) {
    if (!Array.isArray(globalTags)) return;

    if (!TAGS || !TagRegistry.getTagDef) return;

    for (const tag of globalTags) {
      if (typeof tag !== "string") continue;

      const { tagDef, tagValue, invalid } = TagRegistry.parseTag(tag);
      if (invalid) continue;

      switch (tagDef) {
        case TAGS.THEME:
          const storedSettings = this.getStoredSettings();
          if (!storedSettings?.theme) {
            this.settings.theme = tagValue === "dark" ? "dark" : "light";
          }
          break;

        case TAGS.TITLE:
          const titleElements = document.querySelectorAll(".title");
          titleElements.forEach((el) => (el.textContent = tagValue));
          break;

        case TAGS.AUTHOR:
          const bylineElement = document.querySelector(".byline");
          if (bylineElement) {
            bylineElement.textContent = `by ${tagValue}`;
          }
          break;

        case TAGS.CHOICE_NUMBERS: {
          const numMode = tagValue.toLowerCase();
          if (numMode === "off") {
            this.authorChoiceNumbering = "off";
          } else if (numMode === "on") {
            this.authorChoiceNumbering = "on";
          } else {
            this.authorChoiceNumbering = "auto"; // = keyboard only (default)
          }

          const storedSettings = this.getStoredSettings();
          if (!storedSettings?.choiceNumbering) {
            this.settings.choiceNumbering = this.authorChoiceNumbering;
          }

          this.applyChoiceNumbering();
          break;
        }

        case TAGS.TONE_INDICATORS:
          const toneMode = tagValue.toLowerCase();
          this.toneIndicatorsAvailable = true;
          this.authorToneIndicators = toneMode !== "off" || false;
          this.settings.toneIndicators = toneMode !== "off";
          break;

        case TAGS.TONE_TRAILING:
          this.toneIndicatorsTrailing = true;
          break;

        case TAGS.TONE: // TONE: label icon
          const spaceIndex = tagValue.indexOf(" ");
          if (spaceIndex !== -1) {
            const label = tagValue
              .substring(0, spaceIndex)
              .trim()
              .toLowerCase();
            const icon = tagValue.substring(spaceIndex + 1).trim();
            this.toneMap[label] = icon;
          }
          break;
      }
    }
  }

  /**
   * Handle changes to the audio setting
   * @param {boolean} wasEnabled - Previous audio enabled state
   * @param {boolean} isEnabled - New audio enabled state
   */
  handleAudioSettingChange(wasEnabled, isEnabled) {
    try {
      const tagProcessor = this.storyManager?.contentProcessor?.tagProcessor;
      if (!tagProcessor) {
        return;
      }

      if (wasEnabled && !isEnabled) {
        tagProcessor.stopAllAudio();
      } else if (!wasEnabled && isEnabled) {
        tagProcessor.resumeAudioLoop();
      }
    } catch (error) {
      log.warning("Failed to handle audio setting change", error);
    }
  }

  refreshChoices() {
    if (
      this.storyManager?.display?.domHelpers &&
      this.storyManager?.story?.currentChoices?.length > 0
    ) {
      // Re-render existing choices
      this.storyManager.display.domHelpers.removeAll(".choice");
      this.storyManager.createChoices();
    }
  }

  isAnimationEnabled() {
    return this.settings.animations;
  }

  /**
   * Get tone indicators for a set of choice tags
   * @param {Array} tags - Choice tags
   * @returns {Array} Array of icon strings (max 3)
   */
  getToneIndicators(tags) {
    if (!this.toneIndicatorsAvailable || !this.settings.toneIndicators) {
      return [];
    }

    const indicators = [];
    for (const tag of tags) {
      if (typeof tag !== "string") continue;
      const normalizedTag = tag.trim().toLowerCase();
      if (this.toneMap[normalizedTag]) {
        indicators.push({
          label: normalizedTag,
          icon: this.toneMap[normalizedTag],
        });
      }
    }
    return indicators;
  }

  isReady() {
    return !!document.documentElement;
  }

  getStats() {
    return {
      currentTheme: this.settings.theme,
      settingsCount: Object.keys(this.settings).length,
    };
  }
}

export { SettingsManager };
