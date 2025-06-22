// page-manager.js
class PageManager {
  constructor(storyManager) {
    this.storyManager = storyManager;
    this.tagProcessor = new TagProcessor();
    this.savedDisplayState = null;
    this.savedStoryState = null;

    if (!this.storyManager) {
      window.errorManager.critical(
        "PageManager requires a story manager",
        new Error("Invalid story manager"),
        "pages",
      );
    }
  }

  /**
   * Show a special page by evaluating its knot
   * @param {string} pageName - Name of the page/knot to show
   */
  show(pageName) {
    if (!pageName || typeof pageName !== "string") {
      window.errorManager.warning(
        "Invalid pageName passed to show",
        null,
        "pages",
      );
      return;
    }

    // Check if this is actually a special page
    if (!this.isSpecialPage(pageName)) {
      window.errorManager.warning(
        `Page "${pageName}" is not marked as a special page`,
        null,
        "pages",
      );
      return;
    }

    // Save current state before showing special page
    this.saveCurrentState();

    // Mark that we're in a special page
    this.storyManager.currentPage = pageName;

    // Clear current content and generate new content
    if (this.storyManager.display) {
      this.storyManager.display.clear();

      const content = this.generatePageContent(pageName);
      if (content.length > 0) {
        this.storyManager.display.render(content);
      }

      this.addReturnButton();
      this.storyManager.display.scrollToTop();
    }
  }

  /**
   * Check if a page is marked as a special page
   * @param {string} pageName - Name of the page to check
   * @returns {boolean} True if it's a special page
   */
  isSpecialPage(pageName) {
    return !!(pageName && this.storyManager?.availablePages?.[pageName]);
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
   * @param {string} pageName - Name of the page to generate
   * @returns {Array} Array of content objects
   */
  generatePageContent(pageName) {
    try {
      // Create a temporary story instance to evaluate the special page
      const tempStory = new inkjs.Story(this.storyManager.story.ToJson());
      tempStory.ChoosePathString(pageName);

      const content = [];
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

        // Skip empty paragraphs
        if (!text?.trim()) continue;

        // Process any tags in the page content
        let customClasses = ["special-page"];

        if (this.tagProcessor?.processLineTags) {
          try {
            const { customClasses: tagClasses } =
              this.tagProcessor.processLineTags(tags);
            customClasses = customClasses.concat(tagClasses || []);
          } catch (error) {
            window.errorManager.warning(
              "Failed to process tags for special page content",
              error,
              "pages",
            );
          }
        }

        content.push({
          text,
          classes: customClasses,
        });
      }

      return content;
    } catch (error) {
      window.errorManager.error(
        "Failed to generate page content",
        error,
        "pages",
      );
      return [];
    }
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

    // Check if tags only contain SPECIAL_PAGE
    if (!Array.isArray(tags) || tags.length === 0) {
      return false;
    }

    const hasSpecialPageTag = tags.some(
      (tag) => tag.trim().toUpperCase() === "SPECIAL_PAGE",
    );

    // If it has the special page tag and only whitespace/empty content,
    // treat it as just a marker line
    return hasSpecialPageTag && (!text || text.trim().length === 0);
  }

  /**
   * Add a return button to navigate back to the main story
   */
  addReturnButton() {
    if (!this.storyManager.choices || !this.storyManager.display) {
      window.errorManager.error(
        "Required managers not available for return button",
        null,
        "pages",
      );
      return;
    }

    try {
      const returnChoice = this.storyManager.choices.createReturnChoice(() => {
        this.returnToStory();
      });

      this.storyManager.display.renderChoices([returnChoice]);
    } catch (error) {
      window.errorManager.error("Failed to add return button", error, "pages");
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
        window.errorManager.error(
          "Display manager not available for return",
          null,
          "pages",
        );
        return;
      }

      // Clear current display
      this.storyManager.display.clear();

      // Restore the saved story state if we have one
      if (this.savedStoryState) {
        try {
          this.storyManager.story.state.LoadJson(this.savedStoryState);
        } catch (error) {
          window.errorManager.error(
            "Failed to restore story state",
            error,
            "pages",
          );
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
          window.errorManager.error(
            "Failed to restore display state",
            error,
            "pages",
          );
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
      window.errorManager.error("Failed to return to story", error, "pages");
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
   * Get the name of the current special page
   * @returns {string|null} Name of current page or null
   */
  getCurrentPageName() {
    return this.storyManager?.currentPage || null;
  }

  /**
   * Check if a specific page exists in the story
   * @param {string} pageName - Name of the page to check
   * @returns {boolean} True if the page exists
   */
  pageExists(pageName) {
    return this.isSpecialPage(pageName);
  }

  /**
   * Get all available special pages
   * @returns {Object} Object mapping page names to availability
   */
  getAvailablePages() {
    return { ...this.storyManager?.availablePages } || {};
  }

  /**
   * Evaluate a page without changing the current display
   * @param {string} pageName - Name of the page to evaluate
   * @returns {string} The text content of the page
   */
  evaluatePageContent(pageName) {
    if (!this.pageExists(pageName)) return "";

    try {
      const tempStory = new inkjs.Story(this.storyManager.story.ToJson());
      tempStory.ChoosePathString(pageName);

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
      window.errorManager.error(
        "Failed to evaluate page content",
        error,
        "pages",
      );
      return "";
    }
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
    return {
      hasStoryManager: !!this.storyManager,
      hasTagProcessor: !!this.tagProcessor,
      currentPage: this.getCurrentPageName(),
      isViewingSpecialPage: this.isViewingSpecialPage(),
      availablePageCount: Object.keys(availablePages).length,
      hasSavedState: !!(this.savedDisplayState || this.savedStoryState),
    };
  }

  /**
   * Check if page manager is ready to use
   * @returns {boolean} True if page manager is operational
   */
  isReady() {
    return !!(this.storyManager?.story && this.storyManager?.display);
  }
}
