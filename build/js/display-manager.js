// display-manager.js
// Handles all display and DOM manipulation concerns

class DisplayManager {
  constructor() {
    this.container = document.querySelector("#story");
    this.scrollContainer = document.querySelector(".outerContainer");
    this.domHelpers = new DOMHelpers(this.container);
    this.history = [];
  }

  /**
   * Render an array of content items to the display
   * @param {Array} content - Array of content objects with text, classes, etc.
   */
  render(content) {
    content.forEach((item) => {
      this.createElement(item);
      this.trackInHistory(item);
    });
  }

  /**
   * Render an array of choice objects
   * @param {Array} choices - Array of choice objects with text, classes, onClick
   */
  renderChoices(choices) {
    choices.forEach((choice) => {
      const element = this.domHelpers.createChoice(
        choice.text,
        choice.classes || [],
        choice.isClickable !== false,
      );

      if (choice.isClickable !== false && choice.onClick) {
        this.domHelpers.addChoiceClickHandler(element, choice.onClick);
      }
    });
  }

  /**
   * Create a DOM element from a content object
   * @param {Object} content - Content object with text and classes
   * @returns {HTMLElement} The created element
   */
  createElement(content) {
    // Add defensive check
    if (!content || !content.text) {
      console.warn("createElement called with invalid content:", content);
      return null;
    }

    const processedText = MarkdownProcessor.process(content.text);
    return this.domHelpers.createParagraph(
      processedText,
      content.classes || [],
    );
  }

  /**
   * Clear all story content and reset history
   */
  clear() {
    this.domHelpers.clearStoryContent();
    this.history = [];
  }

  /**
   * Clear content but preserve history (for regenerating from saves)
   */
  clearContent() {
    this.domHelpers.clearStoryContent();
  }

  /**
   * Scroll the container to the top
   */
  scrollToTop() {
    this.domHelpers.scrollToTop(this.scrollContainer);
  }

  /**
   * Hide the story header
   */
  hideHeader() {
    this.domHelpers.setVisible(".header", false);
  }

  /**
   * Show the story header
   */
  showHeader() {
    this.domHelpers.setVisible(".header", true);
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
    this.history = state.history || [];
    this.clearContent();

    // Rebuild from history
    this.history.forEach((item) => {
      // Create content object in the expected format
      const content = {
        text: item.text,
        classes: item.classes || [],
      };
      this.createElement(content);
    });
  }

  /**
   * Track a content item in the display history
   * @param {Object} item - Content item to track
   */
  trackInHistory(item) {
    this.history.push({
      type: "paragraph",
      text: item.text, // Make sure text is always stored
      classes: item.classes || [],
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
}
