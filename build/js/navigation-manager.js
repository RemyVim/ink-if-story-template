// navigation-manager.js
// navigation-manager.js
class NavigationManager {
  constructor(storyManager) {
    this.storyManager = storyManager;
    this.dynamicButtons = new Map();
    this.dropdown = null;
    this.dropdownButton = null;

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

    // Remove existing dynamic buttons and panel
    this.clearDynamicButtons();

    const pageCount = Object.keys(availablePages).length;

    this.createSlidePanel(availablePages);
  }

  /**
   * Create a slide-down panel for special pages
   */
  createSlidePanel(availablePages) {
    const navControls = document.querySelector(".nav-controls");
    if (!navControls) return;

    // Create menu button
    this.menuButton = document.createElement("a");
    this.menuButton.id = "pages-menu-btn";
    this.menuButton.href = "#";
    this.menuButton.textContent = "Menu";

    // Create slide panel
    this.slidePanel = document.createElement("div");
    this.slidePanel.className = "slide-panel";

    // Create panel content
    const panelContent = document.createElement("div");
    panelContent.className = "panel-content";

    // Add pages to panel
    Object.keys(availablePages).forEach((knotName) => {
      const pageInfo = availablePages[knotName];
      if (pageInfo && pageInfo.isSpecialPage) {
        const link = document.createElement("a");
        link.href = "#";
        link.className = "panel-link";
        link.textContent = pageInfo.displayName;

        link.addEventListener("click", (e) => {
          e.preventDefault();
          this.hidePanel();
          this.storyManager.pages.show(knotName);
        });

        panelContent.appendChild(link);
      }
    });

    this.slidePanel.appendChild(panelContent);

    // Add close button at bottom
    const closeButton = document.createElement("button");
    closeButton.className = "panel-close-bottom";
    closeButton.innerHTML = "▲";
    closeButton.title = "Close menu";
    this.slidePanel.appendChild(closeButton);

    // Add panel to body
    document.body.appendChild(this.slidePanel);

    // Insert menu button before settings
    const settingsBtn = document.getElementById("settings-btn");
    navControls.insertBefore(this.menuButton, settingsBtn);

    // Event listeners
    this.menuButton.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.togglePanel();
    });

    closeButton.addEventListener("click", () => {
      this.hidePanel();
    });

    // Close panel when clicking outside
    document.addEventListener("click", (e) => {
      if (
        this.slidePanel &&
        this.slidePanel.classList.contains("show") &&
        !this.slidePanel.contains(e.target) &&
        e.target !== this.menuButton
      ) {
        this.hidePanel();
      }
    });

    // Track the menu button
    this.dynamicButtons.set("pages-menu", this.menuButton);
  }

  togglePanel() {
    if (this.slidePanel) {
      if (this.slidePanel.classList.contains("show")) {
        this.hidePanel();
      } else {
        this.showPanel();
      }
    }
  }

  showPanel() {
    if (this.slidePanel) {
      this.slidePanel.classList.add("show");
      this.menuButton?.classList.add("active");
    }
  }

  hidePanel() {
    if (this.slidePanel) {
      this.slidePanel.classList.remove("show");
      this.menuButton?.classList.remove("active");
    }
  }

  /**
   * Clear all dynamically created buttons
   */
  clearDynamicButtons() {
    // Remove slide panel if exists
    if (this.slidePanel && this.slidePanel.parentNode) {
      this.slidePanel.parentNode.removeChild(this.slidePanel);
    }
    if (this.menuButton && this.menuButton.parentNode) {
      this.menuButton.parentNode.removeChild(this.menuButton);
    }
    this.slidePanel = null;
    this.menuButton = null;

    // Remove individual buttons
    for (let [buttonId, button] of this.dynamicButtons) {
      if (button && button.parentNode) {
        button.parentNode.removeChild(button);
      }
    }
    this.dynamicButtons.clear();
  }

  /**
   * Create navigation buttons for special pages (when few pages)
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

    if (this.dynamicButtons.has(buttonId)) {
      return;
    }

    const button = document.createElement("a");
    button.id = buttonId;
    button.href = "#";
    button.title = `View ${pageInfo.displayName}`;
    button.textContent = pageInfo.displayName;

    button.addEventListener("click", (e) => {
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

    if (insertBefore) {
      container.insertBefore(button, insertBefore);
    } else {
      container.appendChild(button);
    }

    this.dynamicButtons.set(buttonId, button);
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

    if (this.dynamicButtons.has(buttonId)) {
      return;
    }

    const button = document.createElement("a");
    button.id = buttonId;
    button.href = "#";
    button.title = `View ${pageInfo.displayName}`;
    button.textContent = pageInfo.displayName;

    button.addEventListener("click", (e) => {
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

    if (insertBefore) {
      container.insertBefore(button, insertBefore);
    } else {
      container.appendChild(button);
    }

    this.dynamicButtons.set(buttonId, button);
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

    if (this.dynamicButtons.has(buttonId)) {
      return;
    }

    const button = document.createElement("a");
    button.id = buttonId;
    button.href = "#";
    button.title = `View ${pageInfo.displayName}`;
    button.textContent = pageInfo.displayName;

    button.addEventListener("click", (e) => {
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

    if (insertBefore) {
      container.insertBefore(button, insertBefore);
    } else {
      container.appendChild(button);
    }

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
    this.setupClickableTitle();
  }
  /**
   * Setup clickable title functionality for restarting the game
   */
  setupClickableTitle() {
    const titleElements = document.querySelectorAll(".nav-title");

    titleElements.forEach((titleElement) => {
      if (!titleElement) return;

      try {
        // Make it look clickable but subtle
        titleElement.style.cursor = "pointer";
        titleElement.style.userSelect = "none"; // Prevent text selection
        titleElement.style.transition = "opacity 0.2s ease";

        // Add subtle hover effect
        titleElement.addEventListener("mouseenter", () => {
          titleElement.style.opacity = "0.8";
        });

        titleElement.addEventListener("mouseleave", () => {
          titleElement.style.opacity = "1";
        });

        // Add click handler for restart
        titleElement.addEventListener("click", (e) => {
          try {
            e.preventDefault();
            this.storyManager.restart();
          } catch (error) {
            window.errorManager.error(
              "Failed to restart from title click",
              error,
              "navigation",
            );
          }
        });

        console.log("Title click-to-restart functionality enabled");
      } catch (error) {
        window.errorManager.warning(
          "Failed to setup clickable title",
          error,
          "navigation",
        );
      }
    });
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
