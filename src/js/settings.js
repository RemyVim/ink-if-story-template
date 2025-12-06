// settings.js
class SettingsManager {
  static errorSource = ErrorManager.SOURCES.SETTINGS_MANAGER;

  constructor() {
    this.settings = this.getDefaults();

    this.toneIndicatorsAvailable = false;
    this.authorToneIndicators = true;
    this.toneIndicatorsTrailing = false;
    this.toneMap = {}; // Will be populated from global tags
    this.authorChoiceNumbering = "auto";

    this.init();
  }

  init() {
    this.loadSettings();
    this.createSettingsModal();
    this.setupEventListeners();
    this.setupThemeDetection();
    this.applySettings();
  }

  static _error(message, error = null) {
    window.errorManager.error(message, error, SettingsManager.errorSource);
  }

  static _warning(message, error = null) {
    window.errorManager.warning(message, error, SettingsManager.errorSource);
  }

  static _critical(message, error = null) {
    window.errorManager.critical(message, error, SettingsManager.errorSource);
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

  createSettingsModal() {
    this.modal = new BaseModal({
      title: "Settings",
      className: "settings-modal",
      maxWidth: "500px",
      onShow: () => this.populateSettings(),
      onHide: () => this.saveSettings(),
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
   * Process global tags from the story for initial author setup
   * @param {Array} globalTags - Array of global tags from the story
   */
  processGlobalTags(globalTags) {
    if (!Array.isArray(globalTags)) return;

    const { TAGS, getTagDef } = window.TagRegistry || {};
    if (!TAGS || !getTagDef) return;

    for (const tag of globalTags) {
      if (typeof tag !== "string") continue;

      const { tagDef, tagValue, invalid } = TagRegistry.parseTag(tag);
      if (invalid) continue;

      switch (tagDef) {
        case TAGS.THEME:
          // Only apply global theme if user hasn't set a preference
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
          // 'on' = always show, 'off' = never show, 'auto' = keyboard only (default)
          const numMode = tagValue.toLowerCase();
          if (numMode === "off") {
            this.authorChoiceNumbering = "off";
          } else if (numMode === "on") {
            this.authorChoiceNumbering = "on";
          } else {
            this.authorChoiceNumbering = "auto";
          }

          // Only apply if user hasn't set a preference
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

  applyTheme() {
    const body = document.body;
    const html = document.documentElement;
    if (!body) return;

    // Remove existing theme classes from both html and body
    body.classList.remove("dark");
    html.classList.remove("dark");

    if (this.settings.theme === "dark") {
      body.classList.add("dark");
      html.classList.add("dark");
    } else if (this.settings.theme === "auto") {
      // Use system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      if (prefersDark) {
        body.classList.add("dark");
        html.classList.add("dark");
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
    const audioAvailable = window.StoryFeatures?.hasAudio;

    return `
      ${this.renderSettingsTabs()}
      <div class="settings-panels">
        ${this.renderReadingPanel()}
        ${this.renderAccessibilityPanel()}
        ${this.renderAudioPanel()}
      </div>
  `;
  }

  renderSettingsTabs() {
    const audioAvailable = window.StoryFeatures?.hasAudio;
    return `
    <div class="settings-tabs" role="tablist" aria-label="Settings categories">
      ${this.renderSettingsTab("reading", "auto_stories", "Reading", true)}
      ${this.renderSettingsTab("accessibility", "accessibility_new", "Accessibility")}
      ${audioAvailable ? this.renderSettingsTab("audio", "volume_up", "Audio") : ""}
    </div>
    `;
  }

  renderSettingsTab(id, icon, label, isActive = false) {
    return `
      <button role="tab" class="settings-tab ${isActive ? "active" : ""}" 
              id="tab-${id}"
              data-tab="${id}" 
              aria-selected="${isActive}" 
              aria-controls="panel-${id}"
              tabindex="${isActive ? "0" : "-1"}">
        <span class="material-icons" aria-hidden="true">${icon}</span>
        <span class="sr-only">${label}</span>
      </button>
    `;
  }

  renderReadingPanel() {
    return `
    <div role="tabpanel" class="settings-panel active" id="panel-reading" aria-labelledby="tab-reading">
    ${this.renderDropdownSetting("theme", "setting-theme", "Theme", [
      { value: "auto", label: "Auto (System)" },
      { value: "light", label: "Light" },
      { value: "dark", label: "Dark" },
    ])}
    ${this.renderDropdownSetting("fontFamily", "setting-font", "Font Family", [
      { value: "serif", label: "Serif" },
      { value: "sans", label: "Sans-serif" },
      { value: "dyslexic", label: "OpenDyslexic" },
    ])}
    ${this.renderDropdownSetting("textSize", "setting-size", "Text Size", [
      { value: "small", label: "Small" },
      { value: "medium", label: "Medium" },
      { value: "large", label: "Large" },
      { value: "xl", label: "Extra Large" },
    ])}
    ${this.renderDropdownSetting(
      "lineHeight",
      "setting-lineheight",
      "Line Height",
      [
        { value: "tight", label: "Tight" },
        { value: "normal", label: "Normal" },
        { value: "loose", label: "Loose" },
      ],
    )}
      ${this.renderCheckboxSetting("autoSave", "Auto Save Progress")}
    </div>
    `;
  }

  renderAccessibilityPanel() {
    return `
    <div role="tabpanel" class="settings-panel" id="panel-accessibility" aria-labelledby="tab-accessibility">

      ${this.renderCheckboxSetting("animations", "Enable Animations")}
      ${
        this.toneIndicatorsAvailable
          ? this.renderCheckboxSetting(
              "toneIndicators",
              "Show tone indicators on choices",
            )
          : ""
      }
      ${this.renderDropdownSetting(
        "choiceNumbering",
        "setting-choicenumbering",
        "Choice Number Hints",
        [
          { value: "auto", label: "Auto (hide on mobile)" },
          { value: "on", label: "Always Show" },
          { value: "off", label: "Always Hide" },
        ],
      )}
      ${
        window.keyboardHelpModal?.isAvailable()
          ? this.renderCheckboxSetting(
              "keyboardShortcuts",
              "Enable Keyboard Shortcuts",
            )
          : ""
      }
      ${
        window.keyboardHelpModal?.isAvailable()
          ? this.renderButtonSetting("keyboard-help-btn", "Keyboard Shortcuts")
          : ""
      }
    </div>
  `;
  }

  renderAudioPanel() {
    if (!window.StoryFeatures?.hasAudio) return "";

    return `
    <div role="tabpanel" class="settings-panel" id="panel-audio" aria-labelledby="tab-audio">
      ${this.renderCheckboxSetting("audioEnabled", "Enable Audio")}
    </div>`;
  }

  renderCheckboxSetting(name, label) {
    return `
      <div class="setting-item">
        <label class="setting-checkbox-label">
          <input type="checkbox" name="${name}" class="setting-checkbox">
          <span>${label}</span>
        </label>
      </div>`;
  }

  renderDropdownSetting(name, id, label, options) {
    const optionsHtml = options
      .map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
      .join("\n          ");

    return `
      <div class="setting-item">
        <label class="setting-label" for="${id}">${label}</label>
        <select name="${name}" id="${id}" class="setting-select">
          ${optionsHtml}
        </select>
      </div>`;
  }

  renderButtonSetting(className, label) {
    return `
      <div class="setting-item">
        <button type="button" class="${className}">${label}</button>
      </div>`;
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
      SettingsManager._error("Cannot show settings - modal not available");
      return;
    }

    this.modal.show((modal) => {
      // Set content
      modal.setContent(this.getSettingsHTML());

      // Set footer with single "Done" button (auto-save handles persistence)
      const footer = modal.getFooter();
      if (footer) {
        footer.innerHTML = "";
        footer.style.display = "flex";
        footer.style.justifyContent = "space-between";

        const resetBtn = modal.createButton("Reset to Defaults", {
          variant: "secondary",
          onClick: () => this.resetSettings(),
        });

        const doneBtn = modal.createButton("Done", {
          variant: "primary",
          onClick: () => this.hideSettings(),
        });

        footer.appendChild(resetBtn);
        footer.appendChild(doneBtn);
      }

      // Setup tab switching
      this.setupTabSwitching();

      // Setup real-time preview
      this.setupRealtimePreview();
      this.updateKeyboardHelpButtonVisibility();

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
      toneIndicators: this.modal.modalElement.querySelector(
        'input[name="toneIndicators"]',
      ),
      choiceNumbering: this.modal.modalElement.querySelector(
        'select[name="choiceNumbering"]',
      ),
      keyboardShortcuts: this.modal.modalElement.querySelector(
        'input[name="keyboardShortcuts"]',
      ),
    };

    Object.entries(elements).forEach(([setting, element]) => {
      if (element) {
        element.addEventListener("change", () => {
          if (element.type === "checkbox") {
            this.settings[setting] = element.checked;
          } else {
            this.settings[setting] = element.value;
          }
          this.applyIndividualSetting(setting);
        });
      }
    });
  }

  /**
   * Set up tab switching functionality
   */
  setupTabSwitching() {
    if (!this.modal?.modalElement) return;

    const tabs = this.modal.modalElement.querySelectorAll(".settings-tab");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => this.switchTab(tab.dataset.tab));
      tab.addEventListener("keydown", (e) => this.handleTabKeydown(e, tabs));
    });
  }

  /**
   * Switch to a specific tab
   * @param {string} tabId - The tab identifier to switch to
   */
  switchTab(tabId) {
    if (!this.modal?.modalElement) return;

    // Update tab buttons
    const tabs = this.modal.modalElement.querySelectorAll(".settings-tab");
    tabs.forEach((tab) => {
      const isActive = tab.dataset.tab === tabId;
      tab.classList.toggle("active", isActive);
      tab.setAttribute("aria-selected", isActive);
      tab.setAttribute("tabindex", isActive ? "0" : "-1");
    });

    // Update panels
    const panels = this.modal.modalElement.querySelectorAll(".settings-panel");
    panels.forEach((panel) => {
      panel.classList.toggle("active", panel.id === `panel-${tabId}`);
    });
  }

  /**
   * Handle keyboard navigation within tabs
   * @param {KeyboardEvent} e - The keyboard event
   * @param {NodeList} tabs - All tab elements
   */
  handleTabKeydown(e, tabs) {
    const tabArray = Array.from(tabs);
    const currentIndex = tabArray.findIndex((tab) => tab === e.target);

    let newIndex;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        newIndex = (currentIndex + 1) % tabArray.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        newIndex = (currentIndex - 1 + tabArray.length) % tabArray.length;
        break;
      case "Home":
        e.preventDefault();
        newIndex = 0;
        break;
      case "End":
        e.preventDefault();
        newIndex = tabArray.length - 1;
        break;
      default:
        return;
    }

    tabArray[newIndex].focus();
    this.switchTab(tabArray[newIndex].dataset.tab);
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

  /**
   * Apply choice numbering setting to container
   */
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
      { name: "choiceNumbering", value: this.settings.choiceNumbering },
      { name: "toneIndicators", checked: this.settings.toneIndicators },
      { name: "keyboardShortcuts", checked: this.settings.keyboardShortcuts },
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

    const getValue = (name, isCheckbox = false) => {
      const element = this.modal.modalElement.querySelector(`[name="${name}"]`);
      return element ? (isCheckbox ? element.checked : element.value) : null;
    };

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
    this.settings.choiceNumbering =
      getValue("choiceNumbering") || this.settings.choiceNumbering;
    this.settings.toneIndicators =
      getValue("toneIndicators", true) ?? this.settings.toneIndicators;
    this.settings.keyboardShortcuts =
      getValue("keyboardShortcuts", true) ?? this.settings.keyboardShortcuts;

    this.handleAudioSettingChange(prevAudioEnabled, this.settings.audioEnabled);
    this.storeSettings();
    this.applySettings();

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
      SettingsManager._warning("Failed to handle audio setting change", error);
    }
  }

  resetSettings() {
    this.settings = this.getDefaults();

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
    this.applyChoiceNumbering();
    this.applyKeyboardShortcuts();
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

  /**
   * Apply keyboard shortcuts setting
   */
  applyKeyboardShortcuts() {
    if (this.settings.keyboardShortcuts) {
      window.keyboardShortcuts?.enable?.();
    } else {
      window.keyboardShortcuts?.disable?.();
    }

    // Update button visibility if modal is open
    this.updateKeyboardHelpButtonVisibility();
  }

  /**
   * Show/hide keyboard help button based on shortcuts setting
   */
  updateKeyboardHelpButtonVisibility() {
    const helpBtn =
      this.modal?.modalElement?.querySelector(".keyboard-help-btn");
    if (helpBtn) {
      // Hide the entire setting-item container, not just the button
      helpBtn.closest(".setting-item").style.display = this.settings
        .keyboardShortcuts
        ? ""
        : "none";
    }
  }

  refreshChoices() {
    if (
      window.storyManager?.display?.domHelpers &&
      window.storyManager?.story?.currentChoices?.length > 0
    ) {
      // Re-render existing choices
      window.storyManager.display.domHelpers.removeAll(".choice");
      window.storyManager.createChoices();
    }
  }

  loadSettings() {
    try {
      const parsed = this.getStoredSettings();
      if (parsed) {
        this.settings = { ...this.settings, ...parsed };
      }
    } catch (error) {
      SettingsManager._warning("Failed to load settings", error);
    }
  }

  storeSettings() {
    try {
      localStorage.setItem(
        "ink-template-settings",
        JSON.stringify(this.settings),
      );
    } catch (error) {
      SettingsManager._error("Failed to store settings", error);
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
}
