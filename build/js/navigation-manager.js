// navigation-manager.js
class NavigationManager {
  constructor(storyManager) {
    this.storyManager = storyManager;
    this.dynamicButtons = new Map(); // Track dynamically created buttons

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
   * Update navigation button visibility based on available special pages
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

    // Remove existing dynamic buttons
    this.clearDynamicButtons();

    // Create buttons for each special page
    this.createSpecialPageButtons(availablePages);
  }

  /**
   * Clear all dynamically created buttons
   */
  clearDynamicButtons() {
    for (let [buttonId, button] of this.dynamicButtons) {
      if (button && button.parentNode) {
        button.parentNode.removeChild(button);
      }
    }
    this.dynamicButtons.clear();
  }

  /**
   * Create navigation buttons for special pages
   * @param {Object} availablePages - Object mapping page names to availability
   */
  createSpecialPageButtons(availablePages) {
    const navControls = document.querySelector(".nav-controls");
    if (!navControls) {
      window.errorManager.warning(
        "Navigation controls container not found",
        null,
        "navigation",
      );
      return;
    }

    // Get the settings button to insert before it
    const settingsBtn = document.getElementById("settings-btn");
    const insertBefore = settingsBtn || null;

    Object.keys(availablePages).forEach((pageName) => {
      if (availablePages[pageName]) {
        this.createSpecialPageButton(pageName, navControls, insertBefore);
      }
    });
  }

  /**
   * Create a single special page button
   * @param {string} pageName - Name of the special page
   * @param {Element} container - Container to add the button to
   * @param {Element} insertBefore - Element to insert before
   */
  createSpecialPageButton(pageName, container, insertBefore) {
    const buttonId = `special-page-${pageName}`;

    // Don't create duplicate buttons
    if (this.dynamicButtons.has(buttonId)) {
      return;
    }

    const button = document.createElement("a");
    button.id = buttonId;
    button.href = "#";
    button.title = `View ${this.formatPageName(pageName)}`;
    button.textContent = this.formatPageName(pageName);

    // Add click handler
    button.addEventListener("click", (e) => {
      try {
        e.preventDefault();
        this.storyManager.pages.show(pageName);
      } catch (error) {
        window.errorManager.error(
          "Failed to show special page",
          error,
          "navigation",
        );
      }
    });

    // Insert the button
    if (insertBefore) {
      container.insertBefore(button, insertBefore);
    } else {
      container.appendChild(button);
    }

    // Track the button
    this.dynamicButtons.set(buttonId, button);
  }

  /**
   * Format page name for display
   * @param {string} pageName - Raw page name
   * @returns {string} Formatted display name
   */
  formatPageName(pageName) {
    // Convert camelCase and snake_case to readable format
    return pageName
      .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase to words
      .replace(/_/g, " ") // snake_case to words
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  /**
   * Setup all navigation button event listeners
   */
  setupButtons() {
    this.setupCoreButtons();
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
      window.errorManager.warning(
        `Button not found: ${buttonId}`,
        null,
        "navigation",
      );
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
    const coreButtons = ["rewind", "saves-btn", "settings-btn"];

    // Check core buttons
    coreButtons.forEach((buttonId) => {
      const button = document.getElementById(buttonId);
      if (button) {
        states[buttonId] = {
          visible: button.style.display !== "none",
          enabled: !button.hasAttribute("disabled"),
          exists: true,
          isDynamic: false,
        };
      } else {
        states[buttonId] = {
          visible: false,
          enabled: false,
          exists: false,
          isDynamic: false,
        };
      }
    });

    // Check dynamic buttons
    for (let [buttonId, button] of this.dynamicButtons) {
      states[buttonId] = {
        visible: button.style.display !== "none",
        enabled: !button.hasAttribute("disabled"),
        exists: true,
        isDynamic: true,
      };
    }

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

    // Clear dynamic buttons
    this.clearDynamicButtons();
  }

  /**
   * Get navigation statistics for debugging
   * @returns {Object} Navigation statistics
   */
  getStats() {
    const buttonStates = this.getButtonStates();
    const totalButtons = Object.keys(buttonStates).length;
    const dynamicButtons = Object.values(buttonStates).filter(
      (s) => s.isDynamic,
    ).length;
    const existingButtons = Object.values(buttonStates).filter(
      (s) => s.exists,
    ).length;
    const visibleButtons = Object.values(buttonStates).filter(
      (s) => s.visible,
    ).length;

    return {
      hasStoryManager: !!this.storyManager,
      totalButtons,
      dynamicButtons,
      existingButtons,
      visibleButtons,
      trackedDynamicButtons: this.dynamicButtons.size,
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
