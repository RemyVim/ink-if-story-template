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
    // Validate inputs
    if (!text || typeof text !== "string" || !text.trim()) {
      return null; // Return null for empty content
    }

    if (!Array.isArray(tags)) {
      window.errorManager.warning(
        "Invalid tags array provided to ContentProcessor.process",
        null,
        "content-processor",
      );
      tags = []; // Fallback to empty array
    }

    // Check if tag processor is available
    if (!this.tagProcessor?.processLineTags) {
      window.errorManager.error(
        "TagProcessor not available in ContentProcessor",
        null,
        "content-processor",
      );
      // Return basic content without tag processing
      return {
        text,
        classes: [],
        tags,
        hasSpecialAction: false,
        action: null,
      };
    }

    try {
      // Process tags to get classes and special actions
      const { customClasses, specialActions } =
        this.tagProcessor.processLineTags(tags);

      // Find special action
      const specialAction = this.findSpecialAction(specialActions);

      return {
        text,
        classes: customClasses || [],
        tags,
        hasSpecialAction: !!specialAction,
        action: specialAction?.(),
      };
    } catch (error) {
      window.errorManager.error(
        "Failed to process content",
        error,
        "content-processor",
      );
      return {
        text,
        classes: [],
        tags,
        hasSpecialAction: false,
        action: null,
      };
    }
  }

  /**
   * Find and return the first special action from the actions array
   * @param {Array} specialActions - Array of action functions
   * @returns {Function|null} Special action function or null
   */
  findSpecialAction(specialActions) {
    if (!Array.isArray(specialActions) || specialActions.length === 0) {
      return null;
    }

    return specialActions.find((actionFn) => {
      if (typeof actionFn !== "function") {
        window.errorManager.warning(
          "Non-function found in specialActions array",
          null,
          "content-processor",
        );
        return false;
      }

      try {
        const result = actionFn();
        return result === "RESTART" || result === "CLEAR";
      } catch (error) {
        window.errorManager.error(
          "Error executing special action function",
          error,
          "content-processor",
        );
        return false;
      }
    });
  }

  /**
   * Process multiple text/tag pairs
   * @param {Array} textTagPairs - Array of {text, tags} objects
   * @returns {Array} Array of processed content objects
   */
  processMultiple(textTagPairs) {
    if (!Array.isArray(textTagPairs)) {
      window.errorManager.error(
        "Invalid input to processMultiple - expected array",
        null,
        "content-processor",
      );
      return [];
    }

    const results = [];

    for (let i = 0; i < textTagPairs.length; i++) {
      const pair = textTagPairs[i];

      // Validate each pair
      if (!pair || typeof pair !== "object") {
        window.errorManager.warning(
          `Invalid text/tag pair at index ${i}`,
          null,
          "content-processor",
        );
        continue;
      }

      const { text, tags } = pair;
      const processed = this.process(text, tags);

      // Only add non-null results
      if (processed !== null) {
        results.push(processed);
      }
    }

    return results;
  }

  /**
   * Validate and sanitize content object
   * @param {Object} content - Content object to validate
   * @returns {Object|null} Validated content or null if invalid
   */
  validateContent(content) {
    if (!content || typeof content !== "object") {
      return null;
    }

    // Ensure required properties exist with safe defaults
    const validated = {
      text: typeof content.text === "string" ? content.text : "",
      classes: Array.isArray(content.classes) ? content.classes : [],
      tags: Array.isArray(content.tags) ? content.tags : [],
      hasSpecialAction: Boolean(content.hasSpecialAction),
      action: content.action || null,
    };

    // Validate text content
    if (!validated.text || !validated.text.trim()) {
      return null;
    }

    return validated;
  }

  /**
   * Get processor statistics for debugging
   * @returns {Object} Processor statistics
   */
  getStats() {
    return {
      hasTagProcessor: !!this.tagProcessor,
      processorType: this.tagProcessor?.constructor?.name || "unknown",
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Reset the content processor (useful for cleanup)
   */
  reset() {
    // Recreate tag processor if needed
    if (!this.tagProcessor) {
      this.tagProcessor = new TagProcessor();
    }
  }

  /**
   * Check if the processor is in a valid state
   * @returns {boolean} True if processor is ready to use
   */
  isReady() {
    return !!this.tagProcessor?.processLineTags;
  }
}
