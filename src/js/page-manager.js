// page-manager.js
import { ErrorManager } from "./error-manager.js";

class PageManager {
  static errorSource = ErrorManager.SOURCES.PAGE_MANAGER;
  constructor(storyManager) {
    this.storyManager = storyManager;
    this.tagProcessor = window.tagProcessor;
    this.savedDisplayState = null;
    this.savedStoryState = null;

    if (!this.storyManager) {
      PageManager._critical(
        "PageManager requires a story manager",
        new Error("Invalid story manager"),
      );
    }
  }

  static _error(message, error = null) {
    window.errorManager.error(message, error, PageManager.errorSource);
  }

  static _warning(message, error = null) {
    window.errorManager.warning(message, error, PageManager.errorSource);
  }

  static _critical(message, error = null) {
    window.errorManager.critical(message, error, PageManager.errorSource);
  }

  /**
   * Show a special page by evaluating its knot
   * @param {string} knotName - Name of the knot to show (internal identifier)
   */
  show(knotName) {
    if (!knotName || typeof knotName !== "string") {
      PageManager._warning("Invalid knotName passed to show");
      return;
    }

    // Check if this is actually a special page
    if (!this.isSpecialPage(knotName)) {
      PageManager._warning(
        `Page "${knotName}" is not marked as a special page`,
      );
      return;
    }

    // Only save state if we're not already viewing a special page
    // This prevents overwriting the main story state when navigating between special pages
    if (!this.isViewingSpecialPage()) {
      this.saveCurrentState();
    }

    // Mark that we're in a special page (use knot name internally)
    this.storyManager.currentPage = knotName;

    // Clear current content and generate new content
    if (this.storyManager.display) {
      this.storyManager.display.clear();

      const content = this.generatePageContent(knotName);
      if (content.length > 0) {
        this.storyManager.display.render(content);
      }

      this.addReturnButton();
      this.storyManager.display.scrollToTop();
    }
  }

  /**
   * Check if a page is marked as a special page
   * @param {string} knotName - Name of the knot to check
   * @returns {boolean} True if it's a special page
   */
  isSpecialPage(knotName) {
    const pageInfo = this.storyManager?.availablePages?.[knotName];
    return pageInfo && pageInfo.isSpecialPage;
  }

  /**
   * Get the display name for a special page
   * @param {string} knotName - Name of the knot
   * @returns {string} Display name from tag or formatted knot name
   */
  getPageDisplayName(knotName) {
    const pageInfo = this.storyManager?.availablePages?.[knotName];
    if (pageInfo && pageInfo.displayName) {
      return pageInfo.displayName;
    }

    // Fallback to formatting the knot name
    return this.formatKnotName(knotName);
  }

  /**
   * Format knot names for display (fallback when no display name is specified)
   * @param {string} knotName - Raw knot name
   * @returns {string} Formatted display name
   */
  formatKnotName(knotName) {
    return knotName
      .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase to words
      .replace(/_/g, " ") // snake_case to words
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  /**
   * Save the current display and story state before entering special page
   */
  saveCurrentState() {
    // Save current display state
    if (this.storyManager.display) {
      this.savedDisplayState = this.storyManager.display.getState();
    }

    // Save current story state
    this.savedStoryState =
      this.storyManager.savePoint || this.storyManager.story.state.ToJson();
  }

  /**
   * Generate content for a special page
   * @param {string} knotName - Name of the knot to generate content for
   * @returns {Array} Array of content objects
   */
  generatePageContent(knotName) {
    try {
      const tempStory = this.createPageStory(knotName);
      return this.extractPageContent(tempStory);
    } catch (error) {
      PageManager._error("Failed to generate page content");
      return [];
    }
  }

  createPageStory(knotName) {
    const tempStory = this.storyManager.createTempStory();
    const currentState = this.storyManager.story.state.ToJson();
    tempStory.state.LoadJson(currentState);
    tempStory.ChoosePathString(knotName);
    return tempStory;
  }

  extractPageContent(tempStory) {
    const content = [];
    let isFirstLine = true;

    while (tempStory.canContinue) {
      const text = tempStory.Continue();
      const tags = tempStory.currentTags || [];

      const items = this.processPageLine(text, tags, isFirstLine);
      isFirstLine = false;

      if (items) {
        content.push(...items);
      }
    }

    return content;
  }

  processPageLine(text, tags, isFirstLine) {
    // Skip first line if only SPECIAL_PAGE tag
    if (isFirstLine && this.containsOnlySpecialPageTag(text, tags)) {
      return null;
    }

    const hasAnyTag = tags.some((tag) => typeof tag === "string" && tag.trim());
    if (!text?.trim() && !hasAnyTag) {
      return null;
    }

    const processed = this.storyManager.contentProcessor.process(text, tags);
    const items = Array.isArray(processed) ? processed : [processed];

    return items
      .map((item) => {
        if (item && (item.type === "paragraph" || !item.type)) {
          item.classes = ["special-page", ...(item.classes || [])];
        }
        return item;
      })
      .filter(Boolean);
  }

  /**
   * Check if text/tags only contain the SPECIAL_PAGE marker
   * @param {string} text - The text content
   * @param {Array} tags - The tags array
   * @returns {boolean} True if this line only marks the page as special
   */
  containsOnlySpecialPageTag(text, tags) {
    // If there's actual text content, it's not just a marker
    if (text && text.trim().length > 0) {
      return false;
    }
    return TagRegistry.hasSpecialPageTag(tags);
  }

  /**
   * Add a return button to navigate back to the main story
   */
  addReturnButton() {
    if (!this.storyManager.choices || !this.storyManager.display) {
      PageManager._error("Required managers not available for return button");
      return;
    }

    try {
      const returnChoice = this.storyManager.choices.createReturnChoice(() => {
        this.returnToStory();
      });

      this.storyManager.display.renderChoices([returnChoice], false);
    } catch (error) {
      PageManager._error("Failed to add return button", error);
    }
  }

  /**
   * Return from special page to the main story
   */
  returnToStory() {
    if (!this.storyManager.currentPage) return;

    try {
      // Clear the current page flag
      this.storyManager.currentPage = null;

      if (!this.storyManager.display) {
        PageManager._error("Display manager not available for return");
        return;
      }

      // Clear current display
      this.storyManager.display.clear();

      // Restore the saved story state if we have one
      if (this.savedStoryState) {
        try {
          this.storyManager.story.state.LoadJson(this.savedStoryState);
        } catch (error) {
          PageManager._error("Failed to restore story state", error);
          // Fallback to the current savePoint
          if (this.storyManager.savePoint) {
            this.storyManager.story.state.LoadJson(this.storyManager.savePoint);
          }
        }
      }

      // Restore the saved display state if we have it
      if (this.savedDisplayState) {
        try {
          this.storyManager.display.restoreState(this.savedDisplayState);
        } catch (error) {
          PageManager._error("Failed to restore display state", error);
          this.regenerateDisplayFromStoryState();
        }
      } else {
        this.regenerateDisplayFromStoryState();
      }

      // Show header and regenerate choices
      this.storyManager.display.showHeader();
      this.storyManager.createChoices?.();
      this.storyManager.display.scrollToTop();

      // Clean up saved states
      this.savedDisplayState = null;
      this.savedStoryState = null;
    } catch (error) {
      PageManager._error("Failed to return to story", error);
    }
  }

  /**
   * Regenerate display from current story state (fallback method)
   */
  regenerateDisplayFromStoryState() {
    const currentText = this.storyManager.story?.state?.currentText;
    if (currentText?.trim()) {
      const processedText = MarkdownProcessor.process(currentText);
      this.storyManager.display.render([{ text: processedText, classes: [] }]);
    }
  }

  /**
   * Check if currently viewing a special page
   * @returns {boolean} True if viewing a special page
   */
  isViewingSpecialPage() {
    return this.storyManager?.currentPage !== null;
  }

  /**
   * Get the knot name of the current special page
   * @returns {string|null} Knot name of current page or null
   */
  getCurrentPageKnotName() {
    return this.storyManager?.currentPage || null;
  }

  /**
   * Get the display name of the current special page
   * @returns {string|null} Display name of current page or null
   */
  getCurrentPageDisplayName() {
    const knotName = this.getCurrentPageKnotName();
    return knotName ? this.getPageDisplayName(knotName) : null;
  }

  /**
   * Check if a specific page exists in the story
   * @param {string} knotName - Name of the knot to check
   * @returns {boolean} True if the page exists
   */
  pageExists(knotName) {
    return this.isSpecialPage(knotName);
  }

  /**
   * Get all available special pages with their information
   * @returns {Object} Object mapping knot names to page info
   */
  getAvailablePages() {
    return { ...this.storyManager?.availablePages } || {};
  }

  /**
   * Get a list of all special page display names
   * @returns {Array} Array of display names
   */
  getAvailablePageDisplayNames() {
    const pages = this.getAvailablePages();
    return Object.keys(pages).map((knotName) => ({
      knotName: knotName,
      displayName: pages[knotName].displayName || this.formatKnotName(knotName),
    }));
  }

  /**
   * Find a knot name by its display name
   * @param {string} displayName - Display name to search for
   * @returns {string|null} Knot name or null if not found
   */
  findKnotByDisplayName(displayName) {
    const pages = this.getAvailablePages();
    for (const [knotName, pageInfo] of Object.entries(pages)) {
      if (pageInfo.displayName === displayName) {
        return knotName;
      }
    }
    return null;
  }

  /**
   * Evaluate a page without changing the current display
   * @param {string} knotName - Name of the knot to evaluate
   * @returns {string} The text content of the page
   */
  evaluatePageContent(knotName) {
    if (!this.pageExists(knotName)) return "";

    try {
      const tempStory = this.storyManager.createTempStory();
      tempStory.ChoosePathString(knotName);

      let fullText = "";
      let isFirstLine = true;

      while (tempStory.canContinue) {
        const text = tempStory.Continue();
        const tags = tempStory.currentTags || [];

        // Skip the first line if it only contains the SPECIAL_PAGE tag
        if (isFirstLine && this.containsOnlySpecialPageTag(text, tags)) {
          isFirstLine = false;
          continue;
        }
        isFirstLine = false;

        fullText += text;
      }

      return fullText.trim();
    } catch (error) {
      PageManager._error("Failed to evaluate page content", error);
      return "";
    }
  }

  /**
   * Get detailed information about a specific page
   * @param {string} knotName - Name of the knot
   * @returns {Object|null} Page information or null if not found
   */
  getPageInfo(knotName) {
    const pageInfo = this.storyManager?.availablePages?.[knotName];
    if (!pageInfo) return null;

    return {
      knotName: knotName,
      displayName: pageInfo.displayName || this.formatKnotName(knotName),
      isSpecialPage: pageInfo.isSpecialPage,
      content: this.evaluatePageContent(knotName),
    };
  }

  /**
   * Reset the page manager state (useful for cleanup)
   */
  reset() {
    this.savedDisplayState = null;
    this.savedStoryState = null;
    if (this.storyManager) {
      this.storyManager.currentPage = null;
    }
  }

  /**
   * Get page manager statistics for debugging
   * @returns {Object} Page statistics
   */
  getStats() {
    const availablePages = this.getAvailablePages();
    const currentKnotName = this.getCurrentPageKnotName();
    const currentDisplayName = this.getCurrentPageDisplayName();

    return {
      hasStoryManager: !!this.storyManager,
      hasTagProcessor: !!this.tagProcessor,
      currentPageKnotName: currentKnotName,
      currentPageDisplayName: currentDisplayName,
      isViewingSpecialPage: this.isViewingSpecialPage(),
      availablePageCount: Object.keys(availablePages).length,
      hasSavedState: !!(this.savedDisplayState || this.savedStoryState),
      pageDisplayNames: this.getAvailablePageDisplayNames(),
    };
  }

  /**
   * Check if page manager is ready to use
   * @returns {boolean} True if page manager is operational
   */
  isReady() {
    return !!(this.storyManager?.story && this.storyManager?.display);
  }

  /**
   * Validate that all special pages are accessible
   * @returns {Object} Validation results
   */
  validatePages() {
    const results = {
      valid: [],
      invalid: [],
      errors: [],
    };

    const pages = this.getAvailablePages();

    for (const [knotName, pageInfo] of Object.entries(pages)) {
      try {
        const content = this.evaluatePageContent(knotName);
        if (content.length > 0) {
          results.valid.push({
            knotName,
            displayName: pageInfo.displayName,
            contentLength: content.length,
          });
        } else {
          results.invalid.push({
            knotName,
            displayName: pageInfo.displayName,
            reason: "No content generated",
          });
        }
      } catch (error) {
        results.errors.push({
          knotName,
          displayName: pageInfo.displayName,
          error: error.message,
        });
      }
    }

    return results;
  }
}
export { PageManager };
