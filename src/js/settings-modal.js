import { BaseModal } from "./base-modal.js";
import { StoryFeatures } from "./tag-registry.js";
import { errorManager, ERROR_SOURCES } from "./error-manager.js";

const log = errorManager.forSource(ERROR_SOURCES.SETTINGS_MANAGER);

class SettingsModal {
  constructor(settingsManager) {
    if (!settingsManager) {
      throw new Error("SettingsModal requires a SettingsManager instance");
    }
    this.settingsManager = settingsManager;
    this.modal = null;

    // These will be wired by main.js
    this.keyboardHelpModal = null;

    this.init();
  }

  init() {
    this.createModal();
    this.setupEventListeners();
  }

  createModal() {
    this.modal = new BaseModal({
      title: "Settings",
      className: "settings-modal",
      maxWidth: "500px",
      onShow: () => this.populateSettings(),
      onHide: () => this.saveSettings(),
    });
  }

  setupEventListeners() {
    const settingsBtn = document.getElementById("settings-btn");
    if (settingsBtn) {
      settingsBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.show();
      });
    }
  }

  show() {
    if (!this.modal?.isReady()) {
      log.error("Cannot show settings - modal not available");
      return;
    }

    this.modal.show((modal) => {
      modal.setContent(this.getSettingsHTML());

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
          onClick: () => this.hide(),
        });

        footer.appendChild(resetBtn);
        footer.appendChild(doneBtn);
      }

      this.setupTabSwitching();
      this.setupRealtimePreview();
      this.updateKeyboardHelpButtonVisibility();

      const helpBtn =
        this.modal.modalElement.querySelector(".keyboard-help-btn");
      if (helpBtn) {
        helpBtn.addEventListener("click", () => {
          this.hide();
          this.keyboardHelpModal?.show?.();
        });
      }
    });
  }

  hide() {
    this.modal?.hide();
  }

  isReady() {
    return !!this.modal?.isReady();
  }

  resetSettings() {
    this.settingsManager.resetToDefaults();
    this.populateSettings();
    this.modal.showNotification("Settings reset to defaults");
  }

  saveSettings() {
    if (!this.modal?.modalElement) return;

    const getValue = (name, isCheckbox = false) => {
      const element = this.modal.modalElement.querySelector(`[name="${name}"]`);
      return element ? (isCheckbox ? element.checked : element.value) : null;
    };

    const prevAudioEnabled = this.settingsManager.settings.audioEnabled;

    const settings = this.settingsManager.settings;
    settings.theme = getValue("theme") || settings.theme;
    settings.fontFamily = getValue("fontFamily") || settings.fontFamily;
    settings.textSize = getValue("textSize") || settings.textSize;
    settings.lineHeight = getValue("lineHeight") || settings.lineHeight;
    settings.audioEnabled =
      getValue("audioEnabled", true) ?? settings.audioEnabled;
    settings.autoSave = getValue("autoSave", true) ?? settings.autoSave;
    settings.animations = getValue("animations", true) ?? settings.animations;
    settings.choiceNumbering =
      getValue("choiceNumbering") || settings.choiceNumbering;
    settings.toneIndicators =
      getValue("toneIndicators", true) ?? settings.toneIndicators;
    settings.keyboardShortcuts =
      getValue("keyboardShortcuts", true) ?? settings.keyboardShortcuts;

    this.settingsManager.handleAudioSettingChange(
      prevAudioEnabled,
      settings.audioEnabled,
    );
    this.settingsManager.storeSettings();
    this.settingsManager.applySettings();

    this.modal.showNotification("Settings saved successfully!");
  }

  populateSettings() {
    if (!this.modal?.modalElement) return;

    const settings = this.settingsManager.settings;
    const elements = [
      { name: "theme", value: settings.theme },
      { name: "fontFamily", value: settings.fontFamily },
      { name: "textSize", value: settings.textSize },
      { name: "lineHeight", value: settings.lineHeight },
      { name: "audioEnabled", checked: settings.audioEnabled },
      { name: "autoSave", checked: settings.autoSave },
      { name: "animations", checked: settings.animations },
      { name: "choiceNumbering", value: settings.choiceNumbering },
      { name: "toneIndicators", checked: settings.toneIndicators },
      { name: "keyboardShortcuts", checked: settings.keyboardShortcuts },
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
            this.settingsManager.settings[setting] = element.checked;
          } else {
            this.settingsManager.settings[setting] = element.value;
          }
          this.settingsManager.applyIndividualSetting(setting);
        });
      }
    });
  }

  setupTabSwitching() {
    if (!this.modal?.modalElement) return;

    const tabs = this.modal.modalElement.querySelectorAll(".settings-tab");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => this.switchTab(tab.dataset.tab));
      tab.addEventListener("keydown", (e) => this.handleTabKeydown(e, tabs));
    });
  }

  switchTab(tabId) {
    if (!this.modal?.modalElement) return;

    const tabs = this.modal.modalElement.querySelectorAll(".settings-tab");
    tabs.forEach((tab) => {
      const isActive = tab.dataset.tab === tabId;
      tab.classList.toggle("active", isActive);
      tab.setAttribute("aria-selected", isActive);
      tab.setAttribute("tabindex", isActive ? "0" : "-1");
    });

    const panels = this.modal.modalElement.querySelectorAll(".settings-panel");
    panels.forEach((panel) => {
      panel.classList.toggle("active", panel.id === `panel-${tabId}`);
    });
  }

  handleTabKeydown(event, tabs) {
    const tabsArray = Array.from(tabs);
    const currentIndex = tabsArray.findIndex((tab) => tab === event.target);

    let newIndex;
    switch (event.key) {
      case "ArrowRight":
        newIndex = (currentIndex + 1) % tabsArray.length;
        break;
      case "ArrowLeft":
        newIndex = (currentIndex - 1 + tabsArray.length) % tabsArray.length;
        break;
      case "Home":
        newIndex = 0;
        break;
      case "End":
        newIndex = tabsArray.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    tabsArray[newIndex].focus();
    this.switchTab(tabsArray[newIndex].dataset.tab);
  }

  updateKeyboardHelpButtonVisibility() {
    if (!this.modal?.modalElement) return;
    const helpBtn = this.modal.modalElement.querySelector(".keyboard-help-btn");
    if (helpBtn) {
      const shouldShow =
        this.keyboardHelpModal?.isAvailable() &&
        this.settingsManager.settings.keyboardShortcuts;
      helpBtn.style.display = shouldShow ? "" : "none";
    }
  }

  getSettingsHTML() {
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
    return `
    <div role="tablist" class="settings-tabs" aria-label="Settings categories">
      ${this.renderSettingsTab("reading", "menu_book", "Reading", true)}
      ${this.renderSettingsTab("accessibility", "accessibility", "Accessibility")}
      ${StoryFeatures.hasAudio ? this.renderSettingsTab("audio", "volume_up", "Audio") : ""}
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
        this.settingsManager.toneIndicatorsAvailable
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
        this.keyboardHelpModal?.isAvailable()
          ? this.renderCheckboxSetting(
              "keyboardShortcuts",
              "Enable Keyboard Shortcuts",
            )
          : ""
      }
      ${
        this.keyboardHelpModal?.isAvailable()
          ? this.renderButtonSetting("keyboard-help-btn", "Keyboard Shortcuts")
          : ""
      }
    </div>
    `;
  }

  renderAudioPanel() {
    if (!StoryFeatures.hasAudio) return "";

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
}

export { SettingsModal };
