// settings.js
class SettingsManager {
  constructor() {
    this.settings = {
      theme: "auto", // 'light', 'dark', 'auto'
      textSize: "medium", // 'small', 'medium', 'large', 'xl'
      lineHeight: "normal", // 'tight', 'normal', 'loose'
      fontFamily: "serif", // 'serif', 'sans', 'dyslexic'
      audioEnabled: true,
      autoSave: true,
      animations: true,
      choiceNumbering: "auto",
    };

    this.init();
  }

  init() {
    this.loadSettings();
    this.createSettingsModal();
    this.setupEventListeners();
    this.setupThemeDetection();
    this.applySettings();
  }

  createSettingsModal() {
    this.modal = new BaseModal({
      title: "Settings",
      className: "settings-modal",
      maxWidth: "500px",
      onShow: () => this.populateSettings(),
    });
  }

  /**
   * Setup automatic theme detection for 'auto' mode
   */
  setupThemeDetection() {
    // Listen for system theme changes when in auto mode
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", () => {
      if (this.settings.theme === "auto") {
        this.applyTheme();
      }
    });
  }

  /**
   * Process global tags from the story for initial theme setup
   * @param {Array} globalTags - Array of global tags from the story
   */
  processGlobalTags(globalTags) {
    if (!Array.isArray(globalTags)) return;

    for (const tag of globalTags) {
      if (typeof tag !== "string") continue;

      const colonIndex = tag.indexOf(":");
      if (colonIndex === -1) continue;

      const property = tag.substring(0, colonIndex).trim().toLowerCase();
      const value = tag.substring(colonIndex + 1).trim();

      switch (property) {
        case "theme":
          // Only apply global theme if user hasn't set a preference
          const storedSettings = this.getStoredSettings();
          if (!storedSettings?.theme) {
            this.settings.theme = value === "dark" ? "dark" : "light";
          }
          break;

        case "title":
          const titleElements = document.querySelectorAll(".title");
          titleElements.forEach((el) => (el.textContent = value));
          break;

        case "author":
          const bylineElement = document.querySelector(".byline");
          if (bylineElement) {
            bylineElement.textContent = `by ${value}`;
          }
          break;

        case "choice_numbers":
          // 'on' = always show, 'off' = never show, 'auto' = keyboard only (default)
          const mode = value.toLowerCase();
          if (mode === "off") {
            this.settings.choiceNumbering = "off";
          } else if (mode === "on") {
            this.settings.choiceNumbering = "on";
          } else {
            this.settings.choiceNumbering = "auto";
          }
          document.body?.classList.remove(
            "choice-numbers-on",
            "choice-numbers-off",
            "choice-numbers-auto",
          );
          document.body?.classList.add(
            `choice-numbers-${this.settings.choiceNumbering}`,
          );
          break;
      }
    }
  }

  applyTheme() {
    const body = document.body;
    if (!body) return;

    // Remove existing theme classes
    body.classList.remove("dark");

    if (this.settings.theme === "dark") {
      body.classList.add("dark");
    } else if (this.settings.theme === "auto") {
      // Use system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      if (prefersDark) {
        body.classList.add("dark");
      }
    }

    // Add transition class for smooth theme switching
    body.classList.add("switched");
  }

  /**
   * Toggle theme between light and dark (for potential theme toggle button)
   */
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

  /**
   * Check if animations are enabled (used by other parts of the app)
   */
  isAnimationEnabled() {
    return this.settings.animations;
  }

  /**
   * Get stored settings from localStorage
   */
  getStoredSettings() {
    try {
      const stored = localStorage.getItem("ink-template-settings");
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      return null;
    }
  }

  getSettingsHTML() {
    return `
      <div class="settings-section">
        <h3>Appearance</h3>
        
        <div class="setting-item">
          <label class="setting-label">Theme</label>
          <select name="theme" class="setting-select">
            <option value="auto">Auto (System)</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div class="setting-item">
          <label class="setting-label">Font Family</label>
          <select name="fontFamily" class="setting-select">
            <option value="serif">Merriweather (Serif)</option>
            <option value="sans">Inter (Sans-serif)</option>
            <option value="dyslexic">OpenDyslexic (Accessibility)</option>
          </select>
        </div>

        <div class="setting-item">
          <label class="setting-label">Text Size</label>
          <select name="textSize" class="setting-select">
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="xl">Extra Large</option>
          </select>
        </div>

        <div class="setting-item">
          <label class="setting-label">Line Height</label>
          <select name="lineHeight" class="setting-select">
            <option value="tight">Tight (1.4)</option>
            <option value="normal">Normal (1.7)</option>
            <option value="loose">Loose (2.0)</option>
          </select>
        </div>
      </div>

      <div class="settings-section">
        <h3>Experience</h3>
        
        <div class="setting-item">
          <label class="setting-checkbox-label">
            <input type="checkbox" name="audioEnabled" class="setting-checkbox">
            <span>Enable Audio</span>
          </label>
        </div>

        <div class="setting-item">
          <label class="setting-checkbox-label">
            <input type="checkbox" name="autoSave" class="setting-checkbox">
            <span>Auto Save Progress</span>
          </label>
        </div>

        <div class="setting-item">
          <label class="setting-checkbox-label">
            <input type="checkbox" name="animations" class="setting-checkbox">
            <span>Enable Animations</span>
          </label>
        </div>
      </div>
${
  window.keyboardHelpModal?.isAvailable()
    ? `
  <div class="settings-section">
    <h3>Help</h3>
    <button type="button" class="keyboard-help-btn">Keyboard Shortcuts</button>
  </div>
`
    : ""
}
    `;
  }

  setupEventListeners() {
    // Settings button in nav
    const settingsBtn = document.getElementById("settings-btn");
    if (settingsBtn) {
      settingsBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.showSettings();
      });
    }
  }

  showSettings() {
    if (!this.modal?.isReady()) {
      window.errorManager.error(
        "Cannot show settings - modal not available",
        null,
        "settings",
      );
      return;
    }

    this.modal.show((modal) => {
      // Set content
      modal.setContent(this.getSettingsHTML());

      // Set footer with buttons
      const footer = modal.getFooter();
      if (footer) {
        footer.innerHTML = "";

        const resetBtn = modal.createButton("Reset to Defaults", {
          variant: "secondary",
          onClick: () => this.resetSettings(),
        });

        const saveBtn = modal.createButton("Save Settings", {
          variant: "primary",
          onClick: () => this.saveSettings(),
        });

        footer.style.display = "flex";
        footer.style.justifyContent = "space-between";
        footer.appendChild(resetBtn);
        footer.appendChild(saveBtn);
      }

      // Setup real-time preview
      this.setupRealtimePreview();

      // Keyboard help button
      const helpBtn =
        this.modal.modalElement.querySelector(".keyboard-help-btn");
      if (helpBtn) {
        helpBtn.addEventListener("click", () => {
          this.hideSettings();
          window.keyboardHelpModal?.show?.();
        });
      }
    });
  }

  hideSettings() {
    this.modal?.hide();
  }

  setupRealtimePreview() {
    if (!this.modal?.modalElement) return;

    const elements = {
      theme: this.modal.modalElement.querySelector('select[name="theme"]'),
      fontFamily: this.modal.modalElement.querySelector(
        'select[name="fontFamily"]',
      ),
      textSize: this.modal.modalElement.querySelector(
        'select[name="textSize"]',
      ),
      lineHeight: this.modal.modalElement.querySelector(
        'select[name="lineHeight"]',
      ),
    };

    Object.entries(elements).forEach(([setting, element]) => {
      if (element) {
        element.addEventListener("change", () => {
          this.settings[setting] = element.value;
          this.applyIndividualSetting(setting);
        });
      }
    });
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
    }
  }

  populateSettings() {
    if (!this.modal?.modalElement) return;

    // Set form values from current settings
    const elements = [
      { name: "theme", value: this.settings.theme },
      { name: "fontFamily", value: this.settings.fontFamily },
      { name: "textSize", value: this.settings.textSize },
      { name: "lineHeight", value: this.settings.lineHeight },
      { name: "audioEnabled", checked: this.settings.audioEnabled },
      { name: "autoSave", checked: this.settings.autoSave },
      { name: "animations", checked: this.settings.animations },
    ];

    elements.forEach(({ name, value, checked }) => {
      const element = this.modal.modalElement.querySelector(`[name="${name}"]`);
      if (element) {
        if (typeof checked !== "undefined") {
          element.checked = checked;
        } else {
          element.value = value;
        }
      }
    });
  }

  saveSettings() {
    if (!this.modal?.modalElement) return;

    // Get values from form
    const getValue = (name, isCheckbox = false) => {
      const element = this.modal.modalElement.querySelector(`[name="${name}"]`);
      return element ? (isCheckbox ? element.checked : element.value) : null;
    };

    // Store previous audio setting to detect changes
    const prevAudioEnabled = this.settings.audioEnabled;

    this.settings.theme = getValue("theme") || this.settings.theme;
    this.settings.fontFamily =
      getValue("fontFamily") || this.settings.fontFamily;
    this.settings.textSize = getValue("textSize") || this.settings.textSize;
    this.settings.lineHeight =
      getValue("lineHeight") || this.settings.lineHeight;
    this.settings.audioEnabled =
      getValue("audioEnabled", true) ?? this.settings.audioEnabled;
    this.settings.autoSave =
      getValue("autoSave", true) ?? this.settings.autoSave;
    this.settings.animations =
      getValue("animations", true) ?? this.settings.animations;

    // Handle audio setting changes
    this.handleAudioSettingChange(prevAudioEnabled, this.settings.audioEnabled);

    this.storeSettings();
    this.applySettings();
    this.hideSettings();

    this.modal.showNotification("Settings saved successfully!");
  }

  /**
   * Handle changes to the audio setting
   * @param {boolean} wasEnabled - Previous audio enabled state
   * @param {boolean} isEnabled - New audio enabled state
   */
  handleAudioSettingChange(wasEnabled, isEnabled) {
    try {
      // Get the tag processor from story manager
      const tagProcessor = window.storyManager?.contentProcessor?.tagProcessor;

      if (!tagProcessor) {
        return; // No tag processor available
      }

      if (wasEnabled && !isEnabled) {
        // Audio was disabled - stop all audio immediately
        tagProcessor.stopAllAudio();
      } else if (!wasEnabled && isEnabled) {
        // Audio was enabled - resume audioloop if there was one
        tagProcessor.resumeAudioLoop();
      }
    } catch (error) {
      window.errorManager.warning(
        "Failed to handle audio setting change",
        error,
        "settings",
      );
    }
  }

  /**
   * Setup real-time preview with audio handling
   */
  setupRealtimePreview() {
    if (!this.modal?.modalElement) return;

    const elements = {
      theme: this.modal.modalElement.querySelector('select[name="theme"]'),
      fontFamily: this.modal.modalElement.querySelector(
        'select[name="fontFamily"]',
      ),
      textSize: this.modal.modalElement.querySelector(
        'select[name="textSize"]',
      ),
      lineHeight: this.modal.modalElement.querySelector(
        'select[name="lineHeight"]',
      ),
      audioEnabled: this.modal.modalElement.querySelector(
        'input[name="audioEnabled"]',
      ),
    };

    Object.entries(elements).forEach(([setting, element]) => {
      if (element) {
        element.addEventListener("change", () => {
          const prevValue = this.settings[setting];

          if (setting === "audioEnabled") {
            const newValue = element.checked;
            this.settings[setting] = newValue;
            this.handleAudioSettingChange(prevValue, newValue);
          } else {
            this.settings[setting] = element.value;
            this.applyIndividualSetting(setting);
          }
        });
      }
    });
  }

  resetSettings() {
    // Reset to defaults
    this.settings = {
      theme: "auto",
      textSize: "medium",
      lineHeight: "normal",
      fontFamily: "serif",
      audioEnabled: true,
      autoSave: true,
      animations: true,
    };

    this.populateSettings();
    this.applySettings();
    this.modal.showNotification("Settings reset to defaults");
  }

  applySettings() {
    this.applyTheme();
    this.applyFontFamily();
    this.applyTextSize();
    this.applyLineHeight();
    this.applyAnimations();
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
      // Disable all transitions
      root.style.setProperty("--transition-fast", "0s");
      root.style.setProperty("--transition-medium", "0s");
      root.style.setProperty("--transition-slow", "0s");
      root.style.setProperty("--transition-very-slow", "0s");
    } else {
      // Restore default transitions
      root.style.setProperty("--transition-fast", "0.1s");
      root.style.setProperty("--transition-medium", "0.2s");
      root.style.setProperty("--transition-slow", "0.6s");
      root.style.setProperty("--transition-very-slow", "1s");
    }
  }

  loadSettings() {
    try {
      const stored = localStorage.getItem("ink-template-settings");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed) {
          this.settings = { ...this.settings, ...parsed };
        }
      }
    } catch (error) {
      window.errorManager.warning("Failed to load settings", error, "settings");
    }
  }

  storeSettings() {
    try {
      localStorage.setItem(
        "ink-template-settings",
        JSON.stringify(this.settings),
      );
    } catch (error) {
      window.errorManager.error("Failed to store settings", error, "settings");
    }
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

  isReady() {
    return !!(this.modal?.isReady() && document.documentElement);
  }

  getStats() {
    return {
      hasModal: !!this.modal,
      currentTheme: this.settings.theme,
      settingsCount: Object.keys(this.settings).length,
    };
  }
}
