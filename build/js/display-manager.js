// display-manager.js
class DisplayManager {
  constructor() {
    this.container = document.querySelector("#story");
    this.scrollContainer = document.querySelector(".outerContainer");
    this.history = [];

    if (!this.container) {
      window.errorManager.critical(
        "Story container element not found",
        new Error("Missing #story element"),
        "display",
      );
      return;
    }

    this.domHelpers = new DOMHelpers(this.container);
  }

  /**
   * Render an array of content items to the display
   * @param {Array} content - Array of content objects with text, classes, etc.
   */
  render(content) {
    if (!Array.isArray(content)) {
      window.errorManager.warning(
        "Invalid content passed to render - expected array",
        null,
        "display",
      );
      return;
    }

    content.forEach((item, index) => {
      try {
        const element = this.createElement(item);
        if (element) {
          this.trackInHistory(item);
        }
      } catch (error) {
        window.errorManager.error(
          `Failed to render content item at index ${index}`,
          error,
          "display",
        );
      }
    });
  }

  /**
   * Render an array of choice objects
   * @param {Array} choices - Array of choice objects with text, classes, onClick
   */
  renderChoices(choices) {
    if (!Array.isArray(choices)) {
      window.errorManager.warning(
        "Invalid choices passed to renderChoices - expected array",
        null,
        "display",
      );
      return;
    }

    choices.forEach((choice, index) => {
      try {
        const element = this.domHelpers.createChoice(
          choice.text || "",
          choice.classes || [],
          choice.isClickable !== false,
        );

        if (choice.isClickable !== false && choice.onClick) {
          if (typeof choice.onClick === "function") {
            this.domHelpers.addChoiceClickHandler(element, choice.onClick);
          } else {
            window.errorManager.warning(
              `Choice at index ${index} has invalid onClick handler`,
              null,
              "display",
            );
          }
        }
      } catch (error) {
        window.errorManager.error(
          `Failed to render choice at index ${index}`,
          error,
          "display",
        );
      }
    });
  }

  /**
   * Create a DOM element from a content object
   * @param {Object} content - Content object with text and classes
   * @returns {HTMLElement|null} The created element or null if failed
   */
  createElement(content) {
    // Validate content object
    if (!content?.text || typeof content.text !== "string") {
      window.errorManager.warning(
        "createElement called with invalid content",
        null,
        "display",
      );
      return null;
    }

    if (!this.domHelpers) {
      window.errorManager.error(
        "Cannot create element - DOM helpers not available",
        null,
        "display",
      );
      return null;
    }

    try {
      const processedText = MarkdownProcessor.process(content.text);
      return this.domHelpers.createParagraph(
        processedText,
        content.classes || [],
      );
    } catch (error) {
      window.errorManager.error("Failed to create element", error, "display");
      return null;
    }
  }

  /**
   * Clear all story content and reset history
   */
  clear() {
    if (!this.domHelpers) {
      window.errorManager.error(
        "Cannot clear - DOM helpers not available",
        null,
        "display",
      );
      return;
    }

    this.domHelpers.clearStoryContent();
    this.history = [];
  }

  /**
   * Clear content but preserve history (for regenerating from saves)
   */
  clearContent() {
    if (!this.domHelpers) {
      window.errorManager.error(
        "Cannot clear content - DOM helpers not available",
        null,
        "display",
      );
      return;
    }

    this.domHelpers.clearStoryContent();
  }

  /**
   * Scroll the container to the top
   */
  scrollToTop() {
    if (!this.scrollContainer) {
      window.errorManager.warning(
        "Cannot scroll - scroll container not available",
        null,
        "display",
      );
      return;
    }

    if (!this.domHelpers) {
      window.errorManager.error(
        "Cannot scroll - DOM helpers not available",
        null,
        "display",
      );
      return;
    }

    this.domHelpers.scrollToTop(this.scrollContainer);
  }

  /**
   * Hide the story header
   */
  hideHeader() {
    this.domHelpers?.setVisible?.(".header", false);
  }

  /**
   * Show the story header
   */
  showHeader() {
    this.domHelpers?.setVisible?.(".header", true);
  }

  /**
   * Get the current display state for saving
   * @returns {Object} Current display state
   */
  getState() {
    return {
      history: [...this.history], // Copy the array
    };
  }

  /**
   * Restore display state from a saved state
   * @param {Object} state - Previously saved display state
   */
  restoreState(state) {
    if (!state || typeof state !== "object") {
      window.errorManager.warning(
        "Invalid state passed to restoreState",
        null,
        "display",
      );
      return;
    }

    this.history = Array.isArray(state.history) ? state.history : [];
    this.clearContent();

    // Rebuild from history
    this.history.forEach((item, index) => {
      try {
        const content = {
          text: item.text || "",
          classes: Array.isArray(item.classes) ? item.classes : [],
        };
        this.createElement(content);
      } catch (error) {
        window.errorManager.error(
          `Failed to restore history item at index ${index}`,
          error,
          "display",
        );
      }
    });
  }

  /**
   * Track a content item in the display history
   * @param {Object} item - Content item to track
   */
  trackInHistory(item) {
    if (!item || typeof item !== "object") {
      window.errorManager.warning(
        "Invalid item passed to trackInHistory",
        null,
        "display",
      );
      return;
    }

    this.history.push({
      type: "paragraph",
      text: item.text || "",
      classes: Array.isArray(item.classes) ? item.classes : [],
      timestamp: Date.now(),
    });
  }

  /**
   * Reset the display to initial state
   */
  reset() {
    this.clear();
    this.showHeader();
  }

  /**
   * Get the number of items in display history
   * @returns {number} Number of items in history
   */
  getHistoryLength() {
    return this.history.length;
  }

  /**
   * Check if display has any content
   * @returns {boolean} True if display has content
   */
  hasContent() {
    return this.history.length > 0;
  }

  /**
   * Get display statistics for debugging
   * @returns {Object} Display statistics
   */
  getStats() {
    return {
      historyLength: this.history.length,
      hasContainer: !!this.container,
      hasScrollContainer: !!this.scrollContainer,
      hasDomHelpers: !!this.domHelpers,
      containerElementCount: this.container
        ? this.container.children.length
        : 0,
    };
  }

  /**
   * Validate that the display manager is in a working state
   * @returns {boolean} True if display manager is ready to use
   */
  isReady() {
    return !!(this.container && this.domHelpers);
  }

  /**
   * Attempt to recover from a broken state
   */
  recover() {
    // Try to re-find container elements
    if (!this.container) {
      this.container = document.querySelector("#story");
    }

    if (!this.scrollContainer) {
      this.scrollContainer = document.querySelector(".outerContainer");
    }

    // Try to recreate DOM helpers if missing
    if (!this.domHelpers && this.container) {
      this.domHelpers = new DOMHelpers(this.container);
    }

    // Clear any corrupted history
    if (!Array.isArray(this.history)) {
      this.history = [];
    }
  }
}
