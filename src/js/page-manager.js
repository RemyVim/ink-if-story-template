import { errorManager, ERROR_SOURCES } from "./error-manager.js";
import { MarkdownProcessor } from "./markdown-processor.js";
import { TagRegistry } from "./tag-registry.js";
import { Utils } from "./utils.js";

const log = errorManager.forSource(ERROR_SOURCES.PAGE_MANAGER);

class PageManager {
  constructor(storyManager) {
    this.storyManager = storyManager;
    this.tagProcessor = storyManager.TagProcessor;
    this.savedDisplayState = null;
    this.savedStoryState = null;

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

    this.storyManager.currentPage = knotName;

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

  returnToStory() {
    if (!this.storyManager.currentPage) return;

    try {
      this.storyManager.currentPage = null;

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
      this.storyManager.display.scrollToTop();

      this.savedDisplayState = null;
      this.savedStoryState = null;
    } catch (error) {
      log.error("Failed to return to story", error);
    }
  }

  reset() {
    this.savedDisplayState = null;
    this.savedStoryState = null;
    if (this.storyManager) {
      this.storyManager.currentPage = null;
    }
  }

  isViewingSpecialPage() {
    return this.storyManager?.currentPage !== null;
  }

  isSpecialPage(knotName) {
    const pageInfo = this.storyManager?.availablePages?.[knotName];
    return pageInfo && pageInfo.isSpecialPage;
  }

  pageExists(knotName) {
    return this.isSpecialPage(knotName);
  }

  getCurrentPageKnotName() {
    return this.storyManager?.currentPage || null;
  }

  getCurrentPageDisplayName() {
    const knotName = this.getCurrentPageKnotName();
    return knotName ? this.getPageDisplayName(knotName) : null;
  }

  getPageDisplayName(knotName) {
    const pageInfo = this.storyManager?.availablePages?.[knotName];
    if (pageInfo && pageInfo.displayName) {
      return pageInfo.displayName;
    }

    return Utils.formatKnotName(knotName);
  }

  getAvailablePages() {
    return { ...this.storyManager?.availablePages } || {};
  }

  getAvailablePageDisplayNames() {
    const pages = this.getAvailablePages();
    return Object.keys(pages).map((knotName) => ({
      knotName: knotName,
      displayName: pages[knotName].displayName || this.formatKnotName(knotName),
    }));
  }

  findKnotByDisplayName(displayName) {
    const pages = this.getAvailablePages();
    for (const [knotName, pageInfo] of Object.entries(pages)) {
      if (pageInfo.displayName === displayName) {
        return knotName;
      }
    }
    return null;
  }

  getPageInfo(knotName) {
    const pageInfo = this.storyManager?.availablePages?.[knotName];
    if (!pageInfo) return null;

    return {
      knotName: knotName,
      displayName: pageInfo.displayName || Utils.formatKnotName(knotName),
      isSpecialPage: pageInfo.isSpecialPage,
      content: this.evaluatePageContent(knotName),
    };
  }

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

  saveCurrentState() {
    // Save current display state
    if (this.storyManager.display) {
      this.savedDisplayState = this.storyManager.display.getState();
    }

    // Save current story state
    this.savedStoryState =
      this.storyManager.savePoint || this.storyManager.story.state.ToJson();
  }

  regenerateDisplayFromStoryState() {
    const currentText = this.storyManager.story?.state?.currentText;
    if (currentText?.trim()) {
      const processedText = MarkdownProcessor.process(currentText);
      this.storyManager.display.render([{ text: processedText, classes: [] }]);
    }
  }

  generatePageContent(knotName) {
    try {
      const tempStory = this.createPageStory(knotName);
      return this.extractPageContent(tempStory);
    } catch (error) {
      log.error("Failed to generate page content", error);
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
    if (text && text.trim().length > 0) {
      return false;
    }
    return TagRegistry.hasSpecialPageTag(tags);
  }

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

  isReady() {
    return !!(this.storyManager?.story && this.storyManager?.display);
  }

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
