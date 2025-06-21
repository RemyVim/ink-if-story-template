// navigation-manager.js
// Handles navigation setup and button interactions

class NavigationManager {
  constructor(storyManager) {
    this.storyManager = storyManager;
    this.buttonMappings = {
      "content-warnings": "content_warnings",
      "about-btn": "about",
      "stats-btn": "stats_page",
      "inventory-btn": "inventory",
      "help-btn": "help",
      credits: "credits",
    };

    this.setupButtons();
  }

  /**
   * Update navigation button visibility based on available pages
   * @param {Object} availablePages - Object mapping page names to availability
   */
  updateVisibility(availablePages) {
    Object.entries(this.buttonMappings).forEach(([buttonId, knotName]) => {
      const button = document.getElementById(buttonId);
      if (button) {
        const isAvailable = availablePages[knotName] || false;
        button.style.display = isAvailable ? "inline-block" : "none";
      }
    });
  }

  /**
   * Setup all navigation button event listeners
   */
  setupButtons() {
    this.setupCoreButtons();
    this.setupSpecialPageButtons();
  }

  /**
   * Setup core navigation buttons (restart, save, load, settings)
   */
  setupCoreButtons() {
    // Restart button
    this.setupButton("rewind", () => {
      this.storyManager.restart();
    });

    // Saves button - handled by save manager
    // (Save manager sets up its own button listener)

    // Settings button - handled by settings manager
    // (Settings manager sets up its own button listener)
  }

  /**
   * Setup special page navigation buttons
   */
  setupSpecialPageButtons() {
    Object.entries(this.buttonMappings).forEach(([buttonId, knotName]) => {
      this.setupButton(buttonId, (e) => {
        e.preventDefault();
        this.storyManager.pages.show(knotName);
      });
    });
  }

  /**
   * Setup a single button with event listener
   * @param {string} buttonId - ID of the button element
   * @param {Function} clickHandler - Function to call on click
   */
  setupButton(buttonId, clickHandler) {
    const button = document.getElementById(buttonId);
    if (button) {
      button.addEventListener("click", clickHandler);
    }
  }

  /**
   * Enable or disable a navigation button
   * @param {string} buttonId - ID of the button element
   * @param {boolean} enabled - Whether the button should be enabled
   */
  setButtonEnabled(buttonId, enabled) {
    const button = document.getElementById(buttonId);
    if (button) {
      if (enabled) {
        button.removeAttribute("disabled");
        button.style.cursor = "pointer";
      } else {
        button.setAttribute("disabled", "disabled");
        button.style.cursor = "not-allowed";
      }
    }
  }

  /**
   * Show or hide a navigation button
   * @param {string} buttonId - ID of the button element
   * @param {boolean} visible - Whether the button should be visible
   */
  setButtonVisible(buttonId, visible) {
    const button = document.getElementById(buttonId);
    if (button) {
      button.style.display = visible ? "inline-block" : "none";
    }
  }

  /**
   * Update save/load button states based on save availability
   * @param {boolean} hasSaves - Whether saves are available
   */
  updateSaveLoadButtons(hasSaves) {
    // Saves button is always enabled when not on a special page
    const isOnSpecialPage = this.storyManager.pages.isViewingSpecialPage();
    this.setButtonEnabled("saves-btn", !isOnSpecialPage);
  }

  /**
   * Get the current state of all navigation buttons
   * @returns {Object} Object with button states
   */
  getButtonStates() {
    const states = {};

    // Check all buttons with IDs
    [
      "rewind",
      "saves-btn",
      "settings-btn",
      ...Object.keys(this.buttonMappings),
    ].forEach((buttonId) => {
      const button = document.getElementById(buttonId);
      if (button) {
        states[buttonId] = {
          visible: button.style.display !== "none",
          enabled: !button.hasAttribute("disabled"),
        };
      }
    });

    return states;
  }

  /**
   * Reset all navigation buttons to default state
   */
  reset() {
    // Enable core buttons
    this.setButtonEnabled("rewind", true);
    this.setButtonEnabled("saves-btn", true);
    this.setButtonEnabled("settings-btn", true);
  }
}
