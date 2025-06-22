// page-manager.js
// Handles special page functionality (about, credits, etc.)

class PageManager {
  constructor(storyManager) {
    this.storyManager = storyManager;
    this.tagProcessor = new TagProcessor();

    // Store the display state before entering special pages
    this.savedDisplayState = null;
    this.savedStoryState = null;
  }

  /**
   * Show a special page by evaluating its knot
   * @param {string} pageName - Name of the page/knot to show
   */
  show(pageName) {
    if (!this.storyManager.availablePages[pageName]) {
      console.warn(`Page "${pageName}" does not exist in the story`);
      return;
    }

    // Save current state before showing special page
    this.saveCurrentState();

    // Mark that we're in a special page
    this.storyManager.currentPage = pageName;

    // Clear current content
    this.storyManager.display.clear();

    // Generate and render page content
    const content = this.generatePageContent(pageName);
    this.storyManager.display.render(content);

    // Add return button
    this.addReturnButton();

    // Scroll to top
    this.storyManager.display.scrollToTop();
  }

  /**
   * Save the current display and story state before entering special page
   */
  saveCurrentState() {
    // Save current display state
    this.savedDisplayState = this.storyManager.display.getState();

    // Save current story state (use the existing savePoint if available)
    this.savedStoryState =
      this.storyManager.savePoint || this.storyManager.story.state.ToJson();
  }

  /**
   * Generate content for a special page
   * @param {string} pageName - Name of the page to generate
   * @returns {Array} Array of content objects
   */
  generatePageContent(pageName) {
    // Create a temporary story instance to evaluate the special page
    // This way we don't mess with the main story state
    const tempStory = new inkjs.Story(this.storyManager.story.ToJson());
    tempStory.ChoosePathString(pageName);

    const content = [];

    while (tempStory.canContinue) {
      const text = tempStory.Continue();

      // Skip empty paragraphs
      if (text.trim().length === 0) continue;

      // Process any tags in the page content
      const tags = tempStory.currentTags || [];
      const { customClasses } = this.tagProcessor.processLineTags(tags);

      content.push({
        text,
        classes: ["special-page", ...customClasses],
      });
    }

    return content;
  }

  /**
   * Add a return button to navigate back to the main story
   */
  addReturnButton() {
    const returnChoice = this.storyManager.choices.createReturnChoice(() => {
      this.returnToStory();
    });

    this.storyManager.display.renderChoices([returnChoice]);
  }

  /**
   * Return from special page to the main story
   */
  returnToStory() {
    if (!this.storyManager.currentPage) return;

    // Clear the current page flag
    this.storyManager.currentPage = null;

    // Clear current display
    this.storyManager.display.clear();

    // Restore the saved story state if we have one
    if (this.savedStoryState) {
      try {
        this.storyManager.story.state.LoadJson(this.savedStoryState);
      } catch (error) {
        console.error("Failed to restore story state:", error);
        // Fallback to the current savePoint
        this.storyManager.story.state.LoadJson(this.storyManager.savePoint);
      }
    }

    // Restore the saved display state if we have it
    if (this.savedDisplayState) {
      try {
        this.storyManager.display.restoreState(this.savedDisplayState);
      } catch (error) {
        console.error("Failed to restore display state:", error);
        // Fallback to regenerating from story state
        this.regenerateDisplayFromStoryState();
      }
    } else {
      // Fallback to regenerating from story state
      this.regenerateDisplayFromStoryState();
    }

    // Show header and regenerate choices
    this.storyManager.display.showHeader();
    this.storyManager.createChoices();

    // Scroll to top
    this.storyManager.display.scrollToTop();

    // Clean up saved states
    this.savedDisplayState = null;
    this.savedStoryState = null;
  }

  /**
   * Regenerate display from current story state (fallback method)
   */
  regenerateDisplayFromStoryState() {
    const currentText = this.storyManager.story.state.currentText;

    if (currentText && currentText.trim().length > 0) {
      const processedText = MarkdownProcessor.process(currentText);
      this.storyManager.display.render([
        {
          text: processedText,
          classes: [],
        },
      ]);
    }
  }

  /**
   * Check if currently viewing a special page
   * @returns {boolean} True if viewing a special page
   */
  isViewingSpecialPage() {
    return this.storyManager.currentPage !== null;
  }

  /**
   * Get the name of the current special page
   * @returns {string|null} Name of current page or null
   */
  getCurrentPageName() {
    return this.storyManager.currentPage;
  }

  /**
   * Check if a specific page exists in the story
   * @param {string} pageName - Name of the page to check
   * @returns {boolean} True if the page exists
   */
  pageExists(pageName) {
    return this.storyManager.availablePages[pageName] || false;
  }

  /**
   * Get all available special pages
   * @returns {Object} Object mapping page names to availability
   */
  getAvailablePages() {
    return { ...this.storyManager.availablePages };
  }

  /**
   * Evaluate a page without changing the current display
   * @param {string} pageName - Name of the page to evaluate
   * @returns {string} The text content of the page
   */
  evaluatePageContent(pageName) {
    if (!this.pageExists(pageName)) {
      return "";
    }

    const tempStory = new inkjs.Story(this.storyManager.story.ToJson());
    tempStory.ChoosePathString(pageName);

    let fullText = "";
    while (tempStory.canContinue) {
      fullText += tempStory.Continue();
    }

    return fullText.trim();
  }

  /**
   * Reset the page manager state (useful for cleanup)
   */
  reset() {
    this.savedDisplayState = null;
    this.savedStoryState = null;
    this.storyManager.currentPage = null;
  }
}
