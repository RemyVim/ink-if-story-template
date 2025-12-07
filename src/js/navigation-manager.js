import { errorManager, ERROR_SOURCES } from "./error-manager.js";
import { Utils } from "./utils.js";

const log = errorManager.forSource(ERROR_SOURCES.NAVIGATION_MANAGER);

class NavigationManager {
  constructor(storyManager) {
    this.storyManager = storyManager;
    this.dynamicButtons = new Map();
    this.dropdown = null;
    this.dropdownButton = null;

    if (!this.storyManager) {
      log.critical(
        "NavigationManager requires a story manager",
        new Error("Invalid story manager"),
        "navigation",
      );
      return;
    }

    this.setupButtons();
  }

  setupButtons() {
    this.setupCoreButtons();
    this.setupClickableTitle();
  }

  setupCoreButtons() {
    this.setupButton("rewind", () => {
      this.storyManager.confirmRestart();
    });

    // Note: Saves and settings buttons are handled by their respective managers
  }

  setupClickableTitle() {
    this.setupButton("title-restart", () => {
      this.storyManager.confirmRestart();
    });
  }

  /**
   * Setup a single button with event listener
   * @param {string} buttonId - ID of the button element
   * @param {Function} clickHandler - Function to call on click
   */
  setupButton(buttonId, clickHandler) {
    if (!buttonId || typeof clickHandler !== "function") {
      log.warning(
        `Invalid parameters for button ${buttonId}`,
        null,
        "navigation",
      );
      return;
    }

    const button = document.getElementById(buttonId);
    if (!button) {
      log.warning(`Button not found: ${buttonId}`, null, "navigation");
      return;
    }

    try {
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);

      newButton.addEventListener("click", (e) => {
        try {
          clickHandler(e);
        } catch (error) {
          log.error(`Button click failed: ${buttonId}`, error, "navigation");
        }
      });
    } catch (error) {
      log.warning(`Failed to setup button ${buttonId}`, error, "navigation");
    }
  }

  /**
   * Update navigation button visibility based on available special pages
   * @param {Object} availablePages - Object mapping knot names to page info
   * @param {Array} pageMenuOrder - Optional array defining page order and sections
   */
  updateVisibility(availablePages, pageMenuOrder = null) {
    if (!availablePages || typeof availablePages !== "object") {
      log.warning(
        "Invalid availablePages object passed to updateVisibility",
        null,
        "navigation",
      );
      return;
    }

    this.clearDynamicButtons();

    const pageCount = Object.keys(availablePages).length;
    this.createSlidePanel(availablePages, pageMenuOrder);
  }

  refresh() {
    const availablePages = this.storyManager?.availablePages || {};
    this.updateVisibility(availablePages);
  }

  reset() {
    this.setButtonEnabled("rewind", true);
    this.setButtonEnabled("saves-btn", true);
    this.setButtonEnabled("settings-btn", true);
    this.clearDynamicButtons();
    this.highlightActivePage(null);
  }

  cleanup() {
    this.clearDynamicButtons();
  }

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

  setButtonVisible(buttonId, visible) {
    const button = document.getElementById(buttonId);
    if (button) {
      button.style.display = visible ? "inline-block" : "none";
    }
  }

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

  setSpecialPageButtonVisible(knotName, visible) {
    const button = this.findPageButton(knotName);
    if (button) {
      button.style.display = visible ? "inline-block" : "none";
    }
  }

  updateSaveLoadButtons(hasSaves) {
    if (!this.storyManager.pages) return;

    const isOnSpecialPage = this.storyManager.pages.isViewingSpecialPage();
    this.setButtonEnabled("saves-btn", !isOnSpecialPage);
  }

  highlightActivePage(activeKnotName) {
    for (let [buttonId, button] of this.dynamicButtons) {
      button.classList.remove("active", "current-page");
    }

    if (activeKnotName) {
      const activeButton = this.findPageButton(activeKnotName);
      if (activeButton) {
        activeButton.classList.add("active", "current-page");
      }
    }
  }

  createSlidePanel(availablePages, pageMenuOrder) {
    const navControls = document.querySelector(".nav-controls");
    if (!navControls) return;

    this.menuButton = document.createElement("button");
    this.menuButton.type = "button";
    this.menuButton.id = "pages-menu-btn";
    this.menuButton.setAttribute("aria-label", "Menu");
    this.menuButton.innerHTML =
      '<span class="material-icons-outlined nav-icon" aria-hidden="true">menu</span>';

    this.slidePanel = document.createElement("nav");
    this.slidePanel.className = "slide-panel";
    this.slidePanel.setAttribute("aria-label", "Pages");
    this.slidePanel.setAttribute("aria-hidden", "true");

    const panelContent = document.createElement("div");
    panelContent.className = "panel-content";

    if (pageMenuOrder && pageMenuOrder.length > 0) {
      this.addOrderedPagesToPanel(panelContent, availablePages, pageMenuOrder);
    } else {
      this.addDefaultPagesToPanel(panelContent, availablePages);
    }

    this.slidePanel.appendChild(panelContent);

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "panel-close-bottom";
    closeButton.setAttribute("aria-label", "Close menu");
    closeButton.innerHTML =
      '<span class="material-icons-outlined" aria-hidden="true">expand_less</span>';
    this.menuButton.setAttribute("aria-expanded", "false");
    this.slidePanel.appendChild(closeButton);

    document.body.appendChild(this.slidePanel);

    const settingsBtn = document.getElementById("settings-btn");
    navControls.insertBefore(this.menuButton, settingsBtn);

    this.menuButton.addEventListener("click", (e) => {
      e.stopPropagation();
      this.togglePanel();
    });

    closeButton.addEventListener("click", () => {
      this.hidePanel();
    });

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

    this.dynamicButtons.set("pages-menu", this.menuButton);
  }

  addOrderedPagesToPanel(panelContent, availablePages, pageMenuOrder) {
    let currentSection = -1;
    const addedPages = new Set();

    pageMenuOrder.forEach((item) => {
      const pageInfo = availablePages[item.knotName];
      if (!pageInfo || !pageInfo.isSpecialPage) return;

      if (item.section !== currentSection && currentSection !== -1) {
        const separator = document.createElement("hr");
        separator.className = "panel-separator";
        panelContent.appendChild(separator);
      }
      currentSection = item.section;

      const link = this.createPageLink(item.knotName, pageInfo);
      panelContent.appendChild(link);
      addedPages.add(item.knotName);
    });

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

  addDefaultPagesToPanel(panelContent, availablePages) {
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
      this.menuButton?.focus();
    }
  }

  clearDynamicButtons() {
    if (this.slidePanel && this.slidePanel.parentNode) {
      this.slidePanel.parentNode.removeChild(this.slidePanel);
    }
    if (this.menuButton && this.menuButton.parentNode) {
      this.menuButton.parentNode.removeChild(this.menuButton);
    }
    this.slidePanel = null;
    this.menuButton = null;

    for (let [buttonId, button] of this.dynamicButtons) {
      if (button && button.parentNode) {
        button.parentNode.removeChild(button);
      }
    }
    this.dynamicButtons.clear();
  }

  getSpecialPageButtons() {
    const buttons = [];
    for (let [buttonId, buttonElement] of this.dynamicButtons) {
      const knotName = buttonId.replace("special-page-", "");
      const pageInfo = this.storyManager?.availablePages?.[knotName];

      buttons.push({
        buttonId,
        knotName,
        displayName: pageInfo?.displayName || Utils.formatKnotName(knotName),
        element: buttonElement,
        visible: buttonElement.style.display !== "none",
        enabled: !buttonElement.hasAttribute("disabled"),
      });
    }
    return buttons;
  }

  getButtonStates() {
    const states = {};
    const coreButtons = ["rewind", "saves-btn", "settings-btn"];

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

  findPageButton(knotName) {
    // Panel links aren't stored in dynamicButtons, search the panel directly
    if (!this.slidePanel) return null;

    const links = this.slidePanel.querySelectorAll(".panel-link");
    for (const link of links) {
      // Match by the click handler's knotName (stored in closure)
      // Since we can't access that, match by display name
      const pageInfo = this.storyManager?.availablePages?.[knotName];
      if (pageInfo && link.textContent === pageInfo.displayName) {
        return link;
      }
    }
    return null;
  }

  getPageDisplayName(knotName) {
    const pageInfo = this.storyManager?.availablePages?.[knotName];
    return pageInfo?.displayName || Utils.formatKnotName(knotName);
  }

  isReady() {
    return !!(this.storyManager && document.getElementById("rewind"));
  }

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
}

export { NavigationManager };
