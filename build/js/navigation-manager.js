// navigation-manager.js
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

    if (!this.storyManager) {
      window.errorManager.critical(
        "NavigationManager requires a story manager",
        new Error("Invalid story manager"),
        "navigation",
      );
      return;
    }

    this.setupButtons();
  }

  /**
   * Update navigation button visibility based on available pages
   * @param {Object} availablePages - Object mapping page names to availability
   */
  updateVisibility(availablePages) {
    if (!availablePages || typeof availablePages !== "object") {
      window.errorManager.warning(
        "Invalid availablePages object passed to updateVisibility",
        null,
        "navigation",
      );
      return;
    }

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

    // Note: Saves and settings buttons are handled by their respective managers
  }

  /**
   * Setup special page navigation buttons
   */
  setupSpecialPageButtons() {
    if (!this.storyManager.pages) {
      window.errorManager.warning(
        "Pages manager not available for special page buttons",
        null,
        "navigation",
      );
      return;
    }

    Object.entries(this.buttonMappings).forEach(([buttonId, knotName]) => {
      this.setupButton(buttonId, (e) => {
        try {
          e.preventDefault();
          this.storyManager.pages.show(knotName);
        } catch (error) {
          window.errorManager.error(
            "Failed to show special page",
            error,
            "navigation",
          );
        }
      });
    });
  }

  /**
   * Setup a single button with event listener
   * @param {string} buttonId - ID of the button element
   * @param {Function} clickHandler - Function to call on click
   */
  setupButton(buttonId, clickHandler) {
    if (!buttonId || typeof clickHandler !== "function") {
      window.errorManager.warning(
        `Invalid parameters for button ${buttonId}`,
        null,
        "navigation",
      );
      return;
    }

    const button = document.getElementById(buttonId);
    if (!button) {
      // Don't warn for optional special page buttons
      if (!this.isOptionalButton(buttonId)) {
        window.errorManager.warning(
          `Button not found: ${buttonId}`,
          null,
          "navigation",
        );
      }
      return;
    }

    try {
      // Clone button to remove existing listeners
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);

      newButton.addEventListener("click", (e) => {
        try {
          clickHandler(e);
        } catch (error) {
          window.errorManager.error(
            `Button click failed: ${buttonId}`,
            error,
            "navigation",
          );
        }
      });
    } catch (error) {
      window.errorManager.warning(
        `Failed to setup button ${buttonId}`,
        error,
        "navigation",
      );
    }
  }

  /**
   * Check if a button is optional (special page buttons that may not exist)
   * @param {string} buttonId - Button ID to check
   * @returns {boolean} True if button is optional
   */
  isOptionalButton(buttonId) {
    return Object.keys(this.buttonMappings).includes(buttonId);
  }

  /**
   * Enable or disable a navigation button
   * @param {string} buttonId - ID of the button element
   * @param {boolean} enabled - Whether the button should be enabled
   */
  setButtonEnabled(buttonId, enabled) {
    const button = document.getElementById(buttonId);
    if (!button) return;

    if (enabled) {
      button.removeAttribute("disabled");
      button.style.cursor = "pointer";
    } else {
      button.setAttribute("disabled", "disabled");
      button.style.cursor = "not-allowed";
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
    if (!this.storyManager.pages) return;

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
    const allButtons = [
      "rewind",
      "saves-btn",
      "settings-btn",
      ...Object.keys(this.buttonMappings),
    ];

    allButtons.forEach((buttonId) => {
      const button = document.getElementById(buttonId);
      if (button) {
        states[buttonId] = {
          visible: button.style.display !== "none",
          enabled: !button.hasAttribute("disabled"),
          exists: true,
        };
      } else {
        states[buttonId] = {
          visible: false,
          enabled: false,
          exists: false,
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

    // Reset special page button visibility
    Object.keys(this.buttonMappings).forEach((buttonId) => {
      this.setButtonVisible(buttonId, false);
    });
  }

  /**
   * Get navigation statistics for debugging
   * @returns {Object} Navigation statistics
   */
  getStats() {
    const buttonStates = this.getButtonStates();
    const totalButtons = Object.keys(buttonStates).length;
    const existingButtons = Object.values(buttonStates).filter(
      (s) => s.exists,
    ).length;
    const visibleButtons = Object.values(buttonStates).filter(
      (s) => s.visible,
    ).length;
    const enabledButtons = Object.values(buttonStates).filter(
      (s) => s.enabled,
    ).length;

    return {
      hasStoryManager: !!this.storyManager,
      totalButtons,
      existingButtons,
      visibleButtons,
      enabledButtons,
      buttonMappings: Object.keys(this.buttonMappings).length,
    };
  }

  /**
   * Validate that navigation manager is working
   * @returns {boolean} True if navigation manager is ready
   */
  isReady() {
    return !!(this.storyManager && document.getElementById("rewind"));
  }
}
