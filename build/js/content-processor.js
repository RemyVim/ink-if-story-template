// content-processor.js
// Handles text and tag processing for story content

class ContentProcessor {
  constructor() {
    this.tagProcessor = new TagProcessor();
  }

  /**
   * Process story text and tags into a content object
   * @param {string} text - Raw text from the story
   * @param {Array} tags - Array of tags from the story
   * @returns {Object} Processed content object
   */
  process(text, tags = []) {
    // Process tags to get classes and special actions
    const { customClasses, specialActions } =
      this.tagProcessor.processLineTags(tags);

    // Check for special actions
    const specialAction = this.findSpecialAction(specialActions);

    return {
      text,
      classes: customClasses,
      tags,
      hasSpecialAction: !!specialAction,
      action: specialAction,
      isEmpty: text.trim().length === 0,
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
      .filter((content) => !content.isEmpty); // Filter out empty content
  }

  /**
   * Find the first special action from a list of action functions
   * @param {Array} specialActions - Array of action functions
   * @returns {string|null} Special action name or null
   */
  findSpecialAction(specialActions) {
    for (const actionFunction of specialActions) {
      const result = actionFunction();
      if (result === "RESTART" || result === "CLEAR") {
        return result;
      }
    }
    return null;
  }

  /**
   * Process content specifically for special pages
   * @param {string} text - Raw text from the story
   * @param {Array} tags - Array of tags from the story
   * @returns {Object} Processed content object with special page classes
   */
  processSpecialPageContent(text, tags = []) {
    const content = this.process(text, tags);

    // Add special page class
    content.classes = ["special-page", ...content.classes];

    return content;
  }

  /**
   * Process global tags for theme and metadata
   * @param {Array} globalTags - Array of global tags
   * @returns {Object} Processed global tag information
   */
  processGlobalTags(globalTags = []) {
    return this.tagProcessor.processGlobalTags(globalTags);
  }

  /**
   * Check if content has a specific class
   * @param {Object} content - Content object
   * @param {string} className - Class name to check for
   * @returns {boolean} True if content has the class
   */
  hasClass(content, className) {
    return content.classes.includes(className);
  }

  /**
   * Add a class to content
   * @param {Object} content - Content object to modify
   * @param {string} className - Class name to add
   */
  addClass(content, className) {
    if (!this.hasClass(content, className)) {
      content.classes.push(className);
    }
  }

  /**
   * Remove a class from content
   * @param {Object} content - Content object to modify
   * @param {string} className - Class name to remove
   */
  removeClass(content, className) {
    const index = content.classes.indexOf(className);
    if (index > -1) {
      content.classes.splice(index, 1);
    }
  }

  /**
   * Filter content by classes
   * @param {Array} contentArray - Array of content objects
   * @param {Array} classNames - Array of class names to filter by
   * @param {boolean} mustHaveAll - If true, content must have all classes
   * @returns {Array} Filtered content array
   */
  filterByClasses(contentArray, classNames, mustHaveAll = false) {
    return contentArray.filter((content) => {
      if (mustHaveAll) {
        return classNames.every((className) =>
          this.hasClass(content, className),
        );
      } else {
        return classNames.some((className) =>
          this.hasClass(content, className),
        );
      }
    });
  }

  /**
   * Extract plain text from content (without markdown formatting)
   * @param {Object} content - Content object
   * @returns {string} Plain text content
   */
  getPlainText(content) {
    // This is a simple approach - could be enhanced with proper markdown parsing
    return content.text
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
      .replace(/\*(.*?)\*/g, "$1") // Remove italic
      .replace(/`(.*?)`/g, "$1") // Remove code
      .replace(/!\[.*?\]\(.*?\)/g, "") // Remove images
      .replace(/\[.*?\]\(.*?\)/g, "") // Remove links
      .trim();
  }

  /**
   * Get a summary of content (first N characters)
   * @param {Object} content - Content object
   * @param {number} maxLength - Maximum length of summary
   * @returns {string} Content summary
   */
  getSummary(content, maxLength = 100) {
    const plainText = this.getPlainText(content);

    if (plainText.length <= maxLength) {
      return plainText;
    }

    return plainText.substring(0, maxLength - 3) + "...";
  }
}
