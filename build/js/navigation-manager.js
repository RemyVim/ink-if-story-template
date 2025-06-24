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
   * @param {Object} availablePages - Object mapping knot names to page info
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
   * @param {Object} availablePages - Object mapping knot names to page info
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

    Object.keys(availablePages).forEach((knotName) => {
      const pageInfo = availablePages[knotName];
      if (pageInfo && pageInfo.isSpecialPage) {
        this.createSpecialPageButton(
          knotName,
          pageInfo,
          navControls,
          insertBefore,
        );
      }
    });
  }

  /**
   * Create a single special page button
   * @param {string} knotName - Knot name (used as internal identifier)
   * @param {Object} pageInfo - Page information including display name
   * @param {Element} container - Container to add the button to
   * @param {Element} insertBefore - Element to insert before
   */
  createSpecialPageButton(knotName, pageInfo, container, insertBefore) {
    const buttonId = `special-page-${knotName}`;

    // Don't create duplicate buttons
    if (this.dynamicButtons.has(buttonId)) {
      return;
    }

    const button = document.createElement("a");
    button.id = buttonId;
    button.href = "#";
    button.title = `View ${pageInfo.displayName}`;
    button.textContent = pageInfo.displayName; // Use the display name from the tag

    // Add click handler - use knot name for internal navigation
    button.addEventListener("click", (e) => {
      try {
        e.preventDefault();
        this.storyManager.pages.show(knotName); // Use knot name for navigation
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
   * Format page name for display - now uses the stored display name
   * @param {string} knotName - Raw knot name (used as key)
   * @returns {string} Display name from the tag or formatted knot name
   */
  formatPageName(knotName) {
    const pageInfo = this.storyManager.availablePages[knotName];
    if (pageInfo && pageInfo.displayName) {
      return pageInfo.displayName;
    }

    // Fallback to old formatting logic for backward compatibility
    return this.formatKnotName(knotName);
  }

  /**
   * Format knot names to readable display names (fallback method)
   * @param {string} knotName - Raw knot name
   * @returns {string} Formatted display name
   */
  formatKnotName(knotName) {
    // Convert camelCase and snake_case to readable format
    return knotName
      .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase to words
      .replace(/_/g, " ") // snake_case to words
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  /**
   * Get display name for a special page
   * @param {string} knotName - Knot name to get display name for
   * @returns {string} Display name or formatted knot name
   */
  getPageDisplayName(knotName) {
    const pageInfo = this.storyManager?.availablePages?.[knotName];
    if (pageInfo && pageInfo.displayName) {
      return pageInfo.displayName;
    }
    return this.formatKnotName(knotName);
  }

  /**
   * Find button element for a specific page
   * @param {string} knotName - Knot name to find button for
   * @returns {Element|null} Button element or null if not found
   */
  findPageButton(knotName) {
    const buttonId = `special-page-${knotName}`;
    return this.dynamicButtons.get(buttonId) || null;
  }

  /**
   * Update the display name of an existing button
   * @param {string} knotName - Knot name of the button to update
   * @param {string} newDisplayName - New display name
   */
  updateButtonDisplayName(knotName, newDisplayName) {
    const button = this.findPageButton(knotName);
    if (button && newDisplayName) {
      button.textContent = newDisplayName;
      button.title = `View ${newDisplayName}`;
    }
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
      button.style.opacity = "";
    } else {
      button.setAttribute("disabled", "disabled");
      button.style.cursor = "not-allowed";
      button.style.opacity = "0.5";
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
   * Enable or disable a special page button by knot name
   * @param {string} knotName - Knot name of the special page
   * @param {boolean} enabled - Whether the button should be enabled
   */
  setSpecialPageButtonEnabled(knotName, enabled) {
    const button = this.findPageButton(knotName);
    if (button) {
      if (enabled) {
        button.removeAttribute("disabled");
        button.style.cursor = "pointer";
        button.style.opacity = "";
      } else {
        button.setAttribute("disabled", "disabled");
        button.style.cursor = "not-allowed";
        button.style.opacity = "0.5";
      }
    }
  }

  /**
   * Show or hide a special page button by knot name
   * @param {string} knotName - Knot name of the special page
   * @param {boolean} visible - Whether the button should be visible
   */
  setSpecialPageButtonVisible(knotName, visible) {
    const button = this.findPageButton(knotName);
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
   * Highlight the currently active special page button
   * @param {string} activeKnotName - Knot name of the currently active page
   */
  highlightActivePage(activeKnotName) {
    // Remove highlight from all special page buttons
    for (let [buttonId, button] of this.dynamicButtons) {
      button.classList.remove("active", "current-page");
    }

    // Add highlight to active button
    if (activeKnotName) {
      const activeButton = this.findPageButton(activeKnotName);
      if (activeButton) {
        activeButton.classList.add("active", "current-page");
      }
    }
  }

  /**
   * Get all special page buttons with their information
   * @returns {Array} Array of button information objects
   */
  getSpecialPageButtons() {
    const buttons = [];
    for (let [buttonId, buttonElement] of this.dynamicButtons) {
      const knotName = buttonId.replace("special-page-", "");
      const pageInfo = this.storyManager?.availablePages?.[knotName];

      buttons.push({
        buttonId,
        knotName,
        displayName: pageInfo?.displayName || this.formatKnotName(knotName),
        element: buttonElement,
        visible: buttonElement.style.display !== "none",
        enabled: !buttonElement.hasAttribute("disabled"),
      });
    }
    return buttons;
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

    // Check dynamic buttons (special pages)
    for (let [buttonId, button] of this.dynamicButtons) {
      const knotName = buttonId.replace("special-page-", "");
      states[buttonId] = {
        visible: button.style.display !== "none",
        enabled: !button.hasAttribute("disabled"),
        exists: true,
        isDynamic: true,
        knotName: knotName,
        displayName: this.getPageDisplayName(knotName),
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

    // Remove any active highlights
    this.highlightActivePage(null);
  }

  /**
   * Refresh special page buttons based on current available pages
   */
  refresh() {
    const availablePages = this.storyManager?.availablePages || {};
    this.updateVisibility(availablePages);
  }

  /**
   * Get navigation statistics for debugging
   * @returns {Object} Navigation statistics
   */
  getStats() {
    const buttonStates = this.getButtonStates();
    const specialPageButtons = this.getSpecialPageButtons();
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
      specialPageButtons: specialPageButtons.length,
      specialPageButtonDetails: specialPageButtons,
    };
  }

  /**
   * Validate that navigation manager is working
   * @returns {boolean} True if navigation manager is ready
   */
  isReady() {
    return !!(this.storyManager && document.getElementById("rewind"));
  }

  /**
   * Get detailed information about navigation state
   * @returns {Object} Detailed navigation information
   */
  getNavigationInfo() {
    const currentPage = this.storyManager?.pages?.getCurrentPageKnotName();
    const availablePages = this.storyManager?.availablePages || {};

    return {
      currentPage: {
        knotName: currentPage,
        displayName: currentPage ? this.getPageDisplayName(currentPage) : null,
        isSpecialPage: !!currentPage,
      },
      availablePages: Object.keys(availablePages).map((knotName) => ({
        knotName,
        displayName: this.getPageDisplayName(knotName),
        hasButton: this.findPageButton(knotName) !== null,
      })),
      coreButtons: {
        restart: {
          exists: !!document.getElementById("rewind"),
          enabled: !document.getElementById("rewind")?.hasAttribute("disabled"),
        },
        saves: {
          exists: !!document.getElementById("saves-btn"),
          enabled: !document
            .getElementById("saves-btn")
            ?.hasAttribute("disabled"),
        },
        settings: {
          exists: !!document.getElementById("settings-btn"),
          enabled: !document
            .getElementById("settings-btn")
            ?.hasAttribute("disabled"),
        },
      },
    };
  }

  /**
   * Cleanup navigation manager resources
   */
  cleanup() {
    this.clearDynamicButtons();
  }
}
