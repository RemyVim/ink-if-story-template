// settings.js
class SettingsManager {
  constructor() {
    this.modalElement = null;
    this.settings = {
      theme: "auto", // 'light', 'dark', 'auto'
      textSize: "medium", // 'small', 'medium', 'large', 'xl'
      lineHeight: "normal", // 'tight', 'normal', 'loose'
      fontFamily: "serif", // 'serif', 'sans', 'dyslexic'
      audioEnabled: true,
      autoSave: true,
      animations: true,
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

  createSettingsModal() {
    if (!document.body) return;

    // Create modal backdrop
    const modalBackdrop = document.createElement("div");
    modalBackdrop.className = "settings-modal-backdrop";
    modalBackdrop.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.5); z-index: 1000; display: none;
      opacity: 0; transition: opacity 0.3s ease;
    `;

    // Create modal content
    const modalContent = document.createElement("div");
    modalContent.className = "settings-modal-content";
    modalContent.style.cssText = `
      position: fixed; top: 50%; left: 50%;
      transform: translate(-50%, -50%) scale(0.9);
      background: var(--color-background);
      border: 1px solid var(--color-border-medium);
      border-radius: var(--border-radius-lg);
      padding: 2rem; max-width: 500px; width: 90%; max-height: 80vh;
      overflow-y: auto; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      transition: transform 0.3s ease; z-index: 1001;
    `;

    modalContent.innerHTML = this.getModalHTML();
    modalBackdrop.appendChild(modalContent);
    document.body.appendChild(modalBackdrop);
    this.modalElement = modalBackdrop;

    this.setupModalHoverEffects();
  }

  getModalHTML() {
    return `
      <div class="settings-header">
        <h2 style="margin: 0 0 1.5rem 0; color: var(--color-text-strong); font-size: 1.5rem;">Settings</h2>
        <button class="settings-close" style="
          position: absolute; top: 1rem; right: 1rem; background: none; border: none;
          font-size: 1.5rem; color: var(--color-text-secondary); cursor: pointer;
          padding: 0.5rem; border-radius: var(--border-radius);
        ">&times;</button>
      </div>

      <div class="settings-section">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text-strong); font-size: 1.1rem;">Appearance</h3>
        
        <div class="setting-item" style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; color: var(--color-text-primary); font-weight: 600;">Theme</label>
          <select name="theme" style="
            width: 100%; padding: 0.5rem; border: 1px solid var(--color-border-medium);
            border-radius: var(--border-radius); background: var(--color-background);
            color: var(--color-text-primary); font-size: 1rem;
          ">
            <option value="auto">Auto (System)</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div class="setting-item" style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; color: var(--color-text-primary); font-weight: 600;">Font Family</label>
          <select name="fontFamily" style="
            width: 100%; padding: 0.5rem; border: 1px solid var(--color-border-medium);
            border-radius: var(--border-radius); background: var(--color-background);
            color: var(--color-text-primary); font-size: 1rem;
          ">
            <option value="serif">Merriweather (Serif)</option>
            <option value="sans">Inter (Sans-serif)</option>
            <option value="dyslexic">OpenDyslexic (Accessibility)</option>
          </select>
        </div>

        <div class="setting-item" style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; color: var(--color-text-primary); font-weight: 600;">Text Size</label>
          <select name="textSize" style="
            width: 100%; padding: 0.5rem; border: 1px solid var(--color-border-medium);
            border-radius: var(--border-radius); background: var(--color-background);
            color: var(--color-text-primary); font-size: 1rem;
          ">
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="xl">Extra Large</option>
          </select>
        </div>

        <div class="setting-item" style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; color: var(--color-text-primary); font-weight: 600;">Line Height</label>
          <select name="lineHeight" style="
            width: 100%; padding: 0.5rem; border: 1px solid var(--color-border-medium);
            border-radius: var(--border-radius); background: var(--color-background);
            color: var(--color-text-primary); font-size: 1rem;
          ">
            <option value="tight">Tight (1.4)</option>
            <option value="normal">Normal (1.7)</option>
            <option value="loose">Loose (2.0)</option>
          </select>
        </div>
      </div>

      <div class="settings-section">
        <h3 style="margin: 1.5rem 0 1rem 0; color: var(--color-text-strong); font-size: 1.1rem;">Experience</h3>
        
        <div class="setting-item" style="margin-bottom: 1rem;">
          <label style="display: flex; align-items: center; gap: 0.5rem; color: var(--color-text-primary); cursor: pointer;">
            <input type="checkbox" name="audioEnabled" style="
              width: 1.2rem; height: 1.2rem; accent-color: var(--color-accent-primary);
            ">
            <span>Enable Audio</span>
          </label>
        </div>

        <div class="setting-item" style="margin-bottom: 1rem;">
          <label style="display: flex; align-items: center; gap: 0.5rem; color: var(--color-text-primary); cursor: pointer;">
            <input type="checkbox" name="autoSave" style="
              width: 1.2rem; height: 1.2rem; accent-color: var(--color-accent-primary);
            ">
            <span>Auto Save Progress</span>
          </label>
        </div>

        <div class="setting-item" style="margin-bottom: 1rem;">
          <label style="display: flex; align-items: center; gap: 0.5rem; color: var(--color-text-primary); cursor: pointer;">
            <input type="checkbox" name="animations" style="
              width: 1.2rem; height: 1.2rem; accent-color: var(--color-accent-primary);
            ">
            <span>Enable Animations</span>
          </label>
        </div>
      </div>

      <div class="settings-actions" style="margin-top: 2rem; text-align: right; border-top: 1px solid var(--color-border-light); padding-top: 1rem;">
        <button class="settings-reset" style="
          padding: 0.5rem 1rem; margin-right: 1rem; background: none;
          border: 1px solid var(--color-border-medium); border-radius: var(--border-radius);
          color: var(--color-text-secondary); cursor: pointer; transition: all 0.2s ease;
        ">Reset to Defaults</button>
        <button class="settings-save" style="
          padding: 0.5rem 1.5rem; background: var(--color-accent-primary); color: white;
          border: none; border-radius: var(--border-radius); cursor: pointer;
          font-weight: 600; transition: all 0.2s ease;
        ">Save Settings</button>
      </div>
    `;
  }

  setupModalHoverEffects() {
    if (!this.modalElement) return;

    const resetBtn = this.modalElement.querySelector(".settings-reset");
    const saveBtn = this.modalElement.querySelector(".settings-save");
    const closeBtn = this.modalElement.querySelector(".settings-close");

    if (resetBtn) {
      resetBtn.addEventListener("mouseenter", () => {
        resetBtn.style.background = "var(--color-hover-bg)";
      });
      resetBtn.addEventListener("mouseleave", () => {
        resetBtn.style.background = "none";
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener("mouseenter", () => {
        saveBtn.style.background = "var(--color-accent-dark)";
      });
      saveBtn.addEventListener("mouseleave", () => {
        saveBtn.style.background = "var(--color-accent-primary)";
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("mouseenter", () => {
        closeBtn.style.background = "var(--color-hover-bg)";
      });
      closeBtn.addEventListener("mouseleave", () => {
        closeBtn.style.background = "none";
      });
    }
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

    if (!this.modalElement) return;

    // Modal event listeners
    const closeBtn = this.modalElement.querySelector(".settings-close");
    const saveBtn = this.modalElement.querySelector(".settings-save");
    const resetBtn = this.modalElement.querySelector(".settings-reset");
    const backdrop = this.modalElement;

    closeBtn?.addEventListener("click", () => this.hideSettings());
    saveBtn?.addEventListener("click", () => this.saveSettings());
    resetBtn?.addEventListener("click", () => this.resetSettings());

    // Close on backdrop click
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) {
        this.hideSettings();
      }
    });

    // Close on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.modalElement.style.display === "block") {
        this.hideSettings();
      }
    });

    // Real-time preview for some settings
    this.setupRealtimePreview();
  }

  setupRealtimePreview() {
    if (!this.modalElement) return;

    const elements = {
      theme: this.modalElement.querySelector('select[name="theme"]'),
      fontFamily: this.modalElement.querySelector('select[name="fontFamily"]'),
      textSize: this.modalElement.querySelector('select[name="textSize"]'),
      lineHeight: this.modalElement.querySelector('select[name="lineHeight"]'),
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

  showSettings() {
    if (!this.modalElement) {
      window.errorManager.error(
        "Cannot show settings - modal not available",
        null,
        "settings",
      );
      return;
    }

    this.populateSettings();
    this.modalElement.style.display = "block";

    // Trigger animation
    requestAnimationFrame(() => {
      if (this.modalElement) {
        this.modalElement.style.opacity = "1";
        const content = this.modalElement.querySelector(
          ".settings-modal-content",
        );
        if (content) {
          content.style.transform = "translate(-50%, -50%) scale(1)";
        }
      }
    });
  }

  hideSettings() {
    if (!this.modalElement) return;

    this.modalElement.style.opacity = "0";
    const content = this.modalElement.querySelector(".settings-modal-content");
    if (content) {
      content.style.transform = "translate(-50%, -50%) scale(0.9)";
    }

    setTimeout(() => {
      if (this.modalElement) {
        this.modalElement.style.display = "none";
      }
    }, 300);
  }

  populateSettings() {
    if (!this.modalElement) return;

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
      const element = this.modalElement.querySelector(`[name="${name}"]`);
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
    if (!this.modalElement) return;

    // Get values from form
    const getValue = (name, isCheckbox = false) => {
      const element = this.modalElement.querySelector(`[name="${name}"]`);
      return element ? (isCheckbox ? element.checked : element.value) : null;
    };

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

    this.storeSettings();
    this.applySettings();
    this.hideSettings();

    this.showNotification("Settings saved successfully!");
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
    this.showNotification("Settings reset to defaults");
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

  showNotification(message) {
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed; bottom: 20px; right: 20px; background: var(--color-accent-primary);
      color: white; padding: 1rem 1.5rem; border-radius: var(--border-radius-lg);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); z-index: 2000; font-weight: 600;
      transform: translateY(100px); opacity: 0; transition: all 0.3s ease;
    `;
    notification.textContent = message;

    if (!document.body) return;
    document.body.appendChild(notification);

    // Animate in
    requestAnimationFrame(() => {
      notification.style.transform = "translateY(0)";
      notification.style.opacity = "1";
    });

    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = "translateY(100px)";
      notification.style.opacity = "0";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
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
    return !!(this.modalElement && document.documentElement);
  }

  getStats() {
    return {
      hasModal: !!this.modalElement,
      currentTheme: this.settings.theme,
      settingsCount: Object.keys(this.settings).length,
    };
  }
}
