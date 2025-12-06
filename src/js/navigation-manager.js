// navigation-manager.js
import { ErrorManager } from "./error-manager.js";

class NavigationManager {
  static errorSource = ErrorManager.SOURCES.NAVIGATION_MANAGER;

  constructor(storyManager) {
    this.storyManager = storyManager;
    this.dynamicButtons = new Map();
    this.dropdown = null;
    this.dropdownButton = null;

    if (!this.storyManager) {
      NavigationManager._critical(
        "NavigationManager requires a story manager",
        new Error("Invalid story manager"),
        "navigation",
      );
      return;
    }

    this.setupButtons();
  }

  static _error(message, error = null) {
    window.errorManager.error(message, error, NavigationManager.errorSource);
  }

  static _warning(message, error = null) {
    window.errorManager.warning(message, error, NavigationManager.errorSource);
  }

  static _critical(message, error = null) {
    window.errorManager.critical(message, error, NavigationManager.errorSource);
  }

  /**
   * Update navigation button visibility based on available special pages
   * @param {Object} availablePages - Object mapping knot names to page info
   * @param {Array} pageMenuOrder - Optional array defining page order and sections
   */
  updateVisibility(availablePages, pageMenuOrder = null) {
    if (!availablePages || typeof availablePages !== "object") {
      NavigationManager._warning(
        "Invalid availablePages object passed to updateVisibility",
        null,
        "navigation",
      );
      return;
    }

    // Remove existing dynamic buttons and panel
    this.clearDynamicButtons();

    const pageCount = Object.keys(availablePages).length;

    this.createSlidePanel(availablePages, pageMenuOrder);
  }

  /**
   * Create a slide-down panel for special pages
   */
  createSlidePanel(availablePages, pageMenuOrder) {
    const navControls = document.querySelector(".nav-controls");
    if (!navControls) return;

    // Create menu button
    this.menuButton = document.createElement("button");
    this.menuButton.type = "button";
    this.menuButton.id = "pages-menu-btn";
    this.menuButton.setAttribute("aria-label", "Menu");
    this.menuButton.innerHTML =
      '<span class="material-icons-outlined nav-icon" aria-hidden="true">menu</span>';

    // Create slide panel
    this.slidePanel = document.createElement("nav");
    this.slidePanel.className = "slide-panel";
    this.slidePanel.setAttribute("aria-label", "Pages");
    this.slidePanel.setAttribute("aria-hidden", "true");

    // Create panel content
    const panelContent = document.createElement("div");
    panelContent.className = "panel-content";

    // Add pages to panel based on order or default
    if (pageMenuOrder && pageMenuOrder.length > 0) {
      this.addOrderedPagesToPanel(panelContent, availablePages, pageMenuOrder);
    } else {
      this.addDefaultPagesToPanel(panelContent, availablePages);
    }

    this.slidePanel.appendChild(panelContent);

    // Add close button at bottom
    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "panel-close-bottom";
    closeButton.setAttribute("aria-label", "Close menu");
    closeButton.innerHTML =
      '<span class="material-icons-outlined" aria-hidden="true">expand_less</span>';
    this.menuButton.setAttribute("aria-expanded", "false");
    this.slidePanel.appendChild(closeButton);

    // Add panel to body
    document.body.appendChild(this.slidePanel);

    // Insert menu button before settings
    const settingsBtn = document.getElementById("settings-btn");
    navControls.insertBefore(this.menuButton, settingsBtn);

    // Event listeners
    this.menuButton.addEventListener("click", (e) => {
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

  /**
   * Add ordered pages to panel based on PAGE_MENU tag
   */
  addOrderedPagesToPanel(panelContent, availablePages, pageMenuOrder) {
    let currentSection = -1;
    const addedPages = new Set();

    pageMenuOrder.forEach((item) => {
      const pageInfo = availablePages[item.knotName];
      if (!pageInfo || !pageInfo.isSpecialPage) return;

      // Add section separator if section changed
      if (item.section !== currentSection && currentSection !== -1) {
        const separator = document.createElement("hr");
        separator.className = "panel-separator";
        panelContent.appendChild(separator);
      }
      currentSection = item.section;

      // Add the page link
      const link = this.createPageLink(item.knotName, pageInfo);
      panelContent.appendChild(link);
      addedPages.add(item.knotName);
    });

    // Add any pages not in the menu order at the end
    const unorderedPages = Object.keys(availablePages).filter(
      (knotName) =>
        !addedPages.has(knotName) && availablePages[knotName].isSpecialPage,
    );

    if (unorderedPages.length > 0 && addedPages.size > 0) {
      const separator = document.createElement("hr");
      separator.className = "panel-separator";
      panelContent.appendChild(separator);
    }

    unorderedPages.forEach((knotName) => {
      const pageInfo = availablePages[knotName];
      const link = this.createPageLink(knotName, pageInfo);
      panelContent.appendChild(link);
    });
  }

  /**
   * Add pages to panel in default order (alphabetical)
   */
  addDefaultPagesToPanel(panelContent, availablePages) {
    // Sort pages alphabetically by display name
    const sortedPages = Object.keys(availablePages)
      .filter((knotName) => availablePages[knotName]?.isSpecialPage)
      .sort((a, b) => {
        const nameA = availablePages[a].displayName.toLowerCase();
        const nameB = availablePages[b].displayName.toLowerCase();
        return nameA.localeCompare(nameB);
      });

    sortedPages.forEach((knotName) => {
      const pageInfo = availablePages[knotName];
      const link = this.createPageLink(knotName, pageInfo);
      panelContent.appendChild(link);
    });
  }

  /**
   * Create a page link element
   */
  createPageLink(knotName, pageInfo) {
    const link = document.createElement("a");
    link.href = "#";
    link.className = "panel-link";
    link.textContent = pageInfo.displayName;

    link.addEventListener("click", (e) => {
      e.preventDefault();
      this.hidePanel();
      this.storyManager.pages.show(knotName);
    });

    return link;
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
      this.slidePanel.setAttribute("aria-hidden", "false");
      this.menuButton?.classList.add("active");
      this.menuButton?.setAttribute("aria-expanded", "true");

      // Focus the first link in the panel
      const firstLink = this.slidePanel.querySelector(".panel-link");
      if (firstLink) {
        firstLink.focus();
      }
    }
  }

  hidePanel() {
    if (this.slidePanel) {
      this.slidePanel.classList.remove("show");
      this.slidePanel.setAttribute("aria-hidden", "true");
      this.menuButton?.classList.remove("active");
      this.menuButton?.setAttribute("aria-expanded", "false");

      // Return focus to the menu button
      this.menuButton?.focus();
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
   * Setup clickable title functionality for restarting the game
   */
  setupClickableTitle() {
    this.setupButton("title-restart", () => {
      this.storyManager.confirmRestart();
    });
  }
  /**
   * Setup all navigation button event listeners
   */
  setupButtons() {
    this.setupCoreButtons();
    this.setupClickableTitle();
  }

  /**
   * Setup core navigation buttons (restart, save, load, settings)
   */
  setupCoreButtons() {
    this.setupButton("rewind", () => {
      this.storyManager.confirmRestart();
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
      NavigationManager._warning(
        `Invalid parameters for button ${buttonId}`,
        null,
        "navigation",
      );
      return;
    }

    const button = document.getElementById(buttonId);
    if (!button) {
      NavigationManager._warning(
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
          NavigationManager._error(
            `Button click failed: ${buttonId}`,
            error,
            "navigation",
          );
        }
      });
    } catch (error) {
      NavigationManager._warning(
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
        displayName:
          pageInfo?.displayName || window.Utils.formatKnotName(knotName),
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
export { NavigationManager };
