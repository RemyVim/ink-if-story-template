// page-manager.js
// Handles special page functionality (about, credits, etc.)

class PageManager {
  constructor(storyManager) {
    this.storyManager = storyManager;
    this.tagProcessor = new TagProcessor();
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

    // Restore story state to the save point
    this.storyManager.story.state.LoadJson(this.storyManager.savePoint);
    this.storyManager.currentPage = null;

    // Clear and regenerate display from save point
    this.storyManager.display.clear();
    this.storyManager.continue(true);
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
}
