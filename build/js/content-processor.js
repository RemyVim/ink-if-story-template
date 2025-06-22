// content-processor.js

class ContentProcessor {
  constructor() {
    this.tagProcessor = new TagProcessor();
  }

  /**
   * Process story text and tags into a content object
   * @param {string} text - Raw text from the story
   * @param {Array} tags - Array of tags from the story
   * @returns {Object|null} Processed content object or null if empty
   */
  process(text, tags = []) {
    if (!text || text.trim().length === 0) {
      return null; // Return null for empty content
    }

    // Process tags to get classes and special actions
    const { customClasses, specialActions } =
      this.tagProcessor.processLineTags(tags);

    // Find special action (inline logic instead of separate method)
    const specialAction = specialActions.find((actionFn) => {
      const result = actionFn();
      return result === "RESTART" || result === "CLEAR";
    });

    return {
      text,
      classes: customClasses,
      tags,
      hasSpecialAction: !!specialAction,
      action: specialAction?.(),
    };
  }

  /**
   * Process multiple text/tag pairs
   * @param {Array} textTagPairs - Array of {text, tags} objects
   * @returns {Array} Array of processed content objects
   */
  processMultiple(textTagPairs) {
    return textTagPairs
      .map(({ text, tags }) => this.process(text, tags))
      .filter((content) => content !== null); // Filter out null/empty content
  }
}
