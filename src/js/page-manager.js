import { errorManager, ERROR_SOURCES } from "./error-manager.js";
import { MarkdownProcessor } from "./markdown-processor.js";
import { TagRegistry, TAGS } from "./tag-registry.js";
import { Utils } from "./utils.js";

const log = errorManager.forSource(ERROR_SOURCES.PAGE_MANAGER);

/**
 * Manages special pages (reference content like help, credits, etc.)
 * that can be viewed without advancing the main story state.
 * Handles saving/restoring story state when entering/exiting special pages.
 */
class PageManager {
  /**
   * Creates the page manager.
   * @param {Object} storyManager - The StoryManager instance
   */
  constructor(storyManager) {
    this.storyManager = storyManager;
    this.tagProcessor = storyManager.TagProcessor;
    this.savedDisplayState = null;
    this.savedStoryState = null;
    this.currentPage = null;
    this.availablePages = {};
    this.pageMenuOrder = null;

    if (!this.storyManager) {
      log.critical(
        "PageManager requires a story manager",
        new Error("Invalid story manager")
      );
    }
  }

  /**
   * Show a special page by evaluating its knot
   * @param {string} knotName - Name of the knot to show (internal identifier)
   */
  show(knotName) {
    if (!knotName || typeof knotName !== "string") {
      log.warning("Invalid knotName passed to show");
      return;
    }

    if (!this.isSpecialPage(knotName)) {
      log.warning(`Page "${knotName}" is not marked as a special page`);
      return;
    }

    // Only save state if we're not already viewing a special page
    // This prevents overwriting the main story state when navigating between special pages
    if (!this.isViewingSpecialPage()) {
      this.saveCurrentState();
    }

    this.currentPage = knotName;

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
   * Returns from a special page to the main story, restoring the previous state.
   */
  returnToStory() {
    if (!this.currentPage) return;

    try {
      this.currentPage = null;

      if (!this.storyManager.display) {
        log.error("Display manager not available for return");
        return;
      }

      this.storyManager.display.clear();

      if (this.savedStoryState) {
        try {
          this.storyManager.story.state.LoadJson(this.savedStoryState);
        } catch (error) {
          log.error("Failed to restore story state", error);
          if (this.storyManager.savePoint) {
            this.storyManager.story.state.LoadJson(this.storyManager.savePoint);
          }
        }
      }

      if (this.savedDisplayState) {
        try {
          this.storyManager.display.restoreState(this.savedDisplayState);
        } catch (error) {
          log.error("Failed to restore display state", error);
          this.regenerateDisplayFromStoryState();
        }
      } else {
        this.regenerateDisplayFromStoryState();
      }

      this.storyManager.display.showHeader();
      this.storyManager.createChoices?.();
      this.storyManager.display.focusMarker("Returning to story");

      this.savedDisplayState = null;
      this.savedStoryState = null;
    } catch (error) {
      log.error("Failed to return to story", error);
    }
  }

  /**
   * Resets the page manager state (clears saved state and current page).
   */
  reset() {
    this.savedDisplayState = null;
    this.savedStoryState = null;
    this.currentPage = null;
  }

  /**
   * Checks if a special page is currently being viewed.
   * @returns {boolean} True if viewing a special page
   */
  isViewingSpecialPage() {
    return this.currentPage !== null;
  }

  /**
   * Checks if a knot is marked as a special page.
   * @param {string} knotName - The ink knot name
   * @returns {boolean} True if the knot is a special page
   */
  isSpecialPage(knotName) {
    const pageInfo = this.availablePages?.[knotName];
    return pageInfo && pageInfo.isSpecialPage;
  }

  /**
   * Checks if a special page exists by knot name.
   * @param {string} knotName - The ink knot name
   * @returns {boolean} True if the page exists
   */
  pageExists(knotName) {
    return this.isSpecialPage(knotName);
  }

  /**
   * Gets the knot name of the currently viewed special page.
   * @returns {string|null} The knot name, or null if not viewing a special page
   */
  getCurrentPageKnotName() {
    return this.currentPage || null;
  }

  /**
   * Gets the display name of the currently viewed special page.
   * @returns {string|null} The display name, or null if not viewing a special page
   */
  getCurrentPageDisplayName() {
    const knotName = this.getCurrentPageKnotName();
    return knotName ? this.getPageDisplayName(knotName) : null;
  }

  /**
   * Gets the display name for a special page, falling back to formatted knot name.
   * @param {string} knotName - The ink knot name
   * @returns {string} The display name
   */
  getPageDisplayName(knotName) {
    const pageInfo = this.availablePages?.[knotName];
    if (pageInfo && pageInfo.displayName) {
      return pageInfo.displayName;
    }

    return Utils.formatKnotName(knotName);
  }

  /**
   * Returns a copy of all available special pages.
   * @returns {Object.<string, {displayName: string, knotName: string, isSpecialPage: boolean}>}
   */
  getAvailablePages() {
    return { ...this.availablePages } || {};
  }

  /**
   * Returns display names for all available special pages.
   * @returns {Array<{knotName: string, displayName: string}>}
   */
  getAvailablePageDisplayNames() {
    const pages = this.getAvailablePages();
    return Object.keys(pages).map((knotName) => ({
      knotName: knotName,
      displayName: pages[knotName].displayName || this.formatKnotName(knotName),
    }));
  }

  /**
   * Finds a knot name by its display name.
   * @param {string} displayName - The display name to search for
   * @returns {string|null} The knot name, or null if not found
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
   * Gets detailed information about a special page including its content.
   * @param {string} knotName - The ink knot name
   * @returns {{knotName: string, displayName: string, isSpecialPage: boolean, content: string}|null}
   */
  getPageInfo(knotName) {
    const pageInfo = this.availablePages?.[knotName];
    if (!pageInfo) return null;

    return {
      knotName: knotName,
      displayName: pageInfo.displayName || Utils.formatKnotName(knotName),
      isSpecialPage: pageInfo.isSpecialPage,
      content: this.evaluatePageContent(knotName),
    };
  }

  /**
   * Evaluates a special page's content by running through its knot in a temporary story.
   * @param {string} knotName - The ink knot name
   * @returns {string} The page's text content
   * @private
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

        if (isFirstLine && this.containsOnlySpecialPageTag(text, tags)) {
          isFirstLine = false;
          continue;
        }
        isFirstLine = false;

        fullText += text;
      }

      return fullText.trim();
    } catch (error) {
      log.error("Failed to evaluate page content", error);
      return "";
    }
  }

  /**
   * Saves the current display and story state before viewing a special page.
   * @private
   */
  saveCurrentState() {
    if (this.storyManager.display) {
      this.savedDisplayState = this.storyManager.display.getState();
    }

    this.savedStoryState =
      this.storyManager.savePoint || this.storyManager.story.state.ToJson();
  }

  /**
   * Regenerates display content from the current story state (fallback recovery).
   * @private
   */
  regenerateDisplayFromStoryState() {
    const currentText = this.storyManager.story?.state?.currentText;
    if (currentText?.trim()) {
      const processedText = MarkdownProcessor.process(currentText);
      this.storyManager.display.render([{ text: processedText, classes: [] }]);
    }
  }

  /**
   * Generates processed content objects for a special page.
   * @param {string} knotName - The ink knot name
   * @returns {Array} Array of content objects ready for rendering
   * @private
   */
  generatePageContent(knotName) {
    try {
      const tempStory = this.createPageStory(knotName);
      return this.extractPageContent(tempStory);
    } catch (error) {
      log.error("Failed to generate page content", error);
      return [];
    }
  }

  /**
   * Creates a temporary story instance positioned at a special page knot.
   * @param {string} knotName - The ink knot name
   * @returns {Story} Temporary story instance
   * @private
   */
  createPageStory(knotName) {
    const tempStory = this.storyManager.createTempStory();
    const currentState = this.storyManager.story.state.ToJson();
    tempStory.state.LoadJson(currentState);
    tempStory.ChoosePathString(knotName);
    return tempStory;
  }

  /**
   * Extracts and processes all content from a temporary story.
   * @param {Story} tempStory - The temporary story instance
   * @returns {Array} Array of processed content objects
   * @private
   */
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

  /**
   * Processes a single line of page content into content objects.
   * @param {string} text - The line text
   * @param {string[]} tags - The line's tags
   * @param {boolean} isFirstLine - Whether this is the first line (may contain only SPECIAL_PAGE tag)
   * @returns {Array|null} Array of content objects, or null if line should be skipped
   * @private
   */
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
    if (text && text.trim().length > 0) {
      return false;
    }
    return TagRegistry.hasSpecialPageTag(tags);
  }

  /**
   * Adds a "Return to Story" button at the bottom of the special page.
   * @private
   */
  addReturnButton() {
    if (!this.storyManager.choices || !this.storyManager.display) {
      log.error("Required managers not available for return button");
      return;
    }

    try {
      const returnChoice = this.storyManager.choices.createReturnChoice(() => {
        this.returnToStory();
      });

      this.storyManager.display.renderChoices([returnChoice], false);
    } catch (error) {
      log.error("Failed to add return button", error);
    }
  }

  /**
   * Scans all ink story knots to find those marked as special pages.
   * Populates this.availablePages with page info.
   * @private
   */
  detectSpecialPages() {
    this.availablePages = {};

    try {
      const namedContent =
        this.storyManager.story.mainContentContainer.namedContent;

      for (const knotName of namedContent.keys()) {
        try {
          const pageInfo = this.getSpecialPageInfo(knotName);
          if (pageInfo) {
            this.availablePages[knotName] = {
              displayName: pageInfo.displayName,
              knotName: knotName,
              isSpecialPage: true,
            };
          }
        } catch (error) {
          log.warning(`Failed to check if ${knotName} is special page`, error);
        }
      }
    } catch (error) {
      log.error("Failed to detect special pages", error);
    }
  }

  /**
   * Checks if a knot is a special page and returns its info.
   * @param {string} knotName - The ink knot name to check
   * @returns {{displayName: string, isSpecialPage: boolean}|null} Page info or null
   * @private
   */
  getSpecialPageInfo(knotName) {
    if (!TAGS || !TagRegistry.getTagDef) return null;

    try {
      const tempStory = this.storyManager.createTempStory();
      tempStory.ChoosePathString(knotName);

      if (tempStory.canContinue) {
        tempStory.Continue();

        const tags = tempStory.currentTags || [];

        for (const tag of tags) {
          if (typeof tag !== "string") continue;

          const { tagDef, tagValue } = TagRegistry.parseTag(tag);

          if (tagDef === TAGS.SPECIAL_PAGE) {
            return {
              displayName: tagValue?.trim() || Utils.formatKnotName(knotName),
              isSpecialPage: true,
            };
          }
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Processes the PAGE_MENU global tag to set page ordering.
   * @param {string[]} globalTags - Array of global tags from the story
   * @private
   */
  processMenuOrderTag(globalTags) {
    if (!Array.isArray(globalTags)) return;

    for (const tag of globalTags) {
      if (typeof tag !== "string") continue;

      const colonIndex = tag.indexOf(":");
      if (colonIndex === -1) continue;

      const property = tag.substring(0, colonIndex).trim().toUpperCase();
      const value = tag.substring(colonIndex + 1).trim();

      if (TagRegistry.getTagDef(property) === TAGS.PAGE_MENU) {
        this.pageMenuOrder = this.parseMenuOrder(value);
        break;
      }
    }
  }

  /**
   * Parses a menu order string into structured page order data.
   * Format: "page1, page2,, page3" where ",," separates sections.
   * @param {string} menuString - The menu order string
   * @returns {Array<{knotName: string, section: number}>|null} Parsed order or null
   * @private
   */
  parseMenuOrder(menuString) {
    const sections = menuString.split(",,").map((s) => s.trim());
    const menuOrder = [];

    sections.forEach((section, sectionIndex) => {
      const pages = section
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p);

      pages.forEach((pageName) => {
        if (this.availablePages[pageName]) {
          menuOrder.push({
            knotName: pageName,
            section: sectionIndex,
          });
        } else {
          console.warn(
            `Page '${pageName}' in PAGE_MENU not found in special pages`
          );
        }
      });
    });

    return menuOrder.length > 0 ? menuOrder : null;
  }

  /**
   * Checks whether the page manager is ready for use.
   * @returns {boolean} True if story and display are available
   */
  isReady() {
    return !!(this.storyManager?.story && this.storyManager?.display);
  }

  /**
   * Returns diagnostic information about the page manager's state.
   * @returns {{hasStoryManager: boolean, hasTagProcessor: boolean, currentPageKnotName: string|null, currentPageDisplayName: string|null, isViewingSpecialPage: boolean, availablePageCount: number, hasSavedState: boolean, pageDisplayNames: Array}}
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
   * Validates all special pages by attempting to generate their content.
   * Useful for debugging and ensuring all pages are properly configured.
   * @returns {{valid: Array, invalid: Array, errors: Array}}
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
