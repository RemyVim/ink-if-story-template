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
    let imageTag = null;
    if (Array.isArray(tags)) {
      imageTag = tags.find(
        (tag) =>
          typeof tag === "string" &&
          tag.trim().toUpperCase().startsWith("IMAGE:"),
      );
    }

    if (imageTag && typeof imageTag === "string") {
      const imageValue = imageTag.substring(imageTag.indexOf(":") + 1).trim();
      const imageData = this.parseImageTag(imageValue);

      // Only return pure image type if there's no text
      if (!text || typeof text !== "string" || !text.trim()) {
        return {
          type: "image",
          ...imageData,
        };
      }

      // If there's both text AND image, return both as an array
      // Image comes first, then the paragraph
      return [
        {
          type: "image",
          ...imageData,
        },
        {
          type: "paragraph",
          text,
          classes:
            this.tagProcessor?.processLineTags?.(tags)?.customClasses || [],
          tags,
          hasSpecialAction: false,
          action: null,
        },
      ];
    }

    // Check for STATBAR tag before validating text
    const statBarTag =
      Array.isArray(tags) &&
      tags.find(
        (tag) =>
          typeof tag === "string" &&
          tag.trim().toUpperCase().startsWith("STATBAR:"),
      );

    if (statBarTag) {
      const statBarValue = statBarTag
        .substring(statBarTag.indexOf(":") + 1)
        .trim();
      const statBarData = this.parseStatBarTag(statBarValue);
      return {
        type: "statbar",
        ...statBarData,
      };
    }

    // Check for USER_INPUT tag and return typed content
    let userInputTag = null;
    if (Array.isArray(tags)) {
      userInputTag = tags.find(
        (tag) =>
          typeof tag === "string" &&
          (tag.trim().toUpperCase().startsWith("USER_INPUT:") ||
            tag.trim().toUpperCase().startsWith("INPUT:")),
      );
    }

    if (userInputTag && typeof userInputTag === "string") {
      const userInputValue = userInputTag
        .substring(userInputTag.indexOf(":") + 1)
        .trim();
      const userInputData = this.parseUserInputTag(userInputValue);

      // Check if variable already has a value (re-processing after input was submitted)
      const currentValue =
        window.storyManager?.story?.variablesState?.[
          userInputData.variableName
        ];

      if (
        currentValue &&
        currentValue !== "" &&
        window.storyManager?.reprocessingAfterUserInput
      ) {
        // Variable already set AND we're re-processing after submit
        // Fall through to normal paragraph processing
      } else {
        // Either variable not set, OR we're visiting fresh — show input field
        return {
          type: "user-input",
          ...userInputData,
        };
      }
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
        type: "paragraph",
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
        type: "paragraph",
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
        type: "paragraph",
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
        // Handle both string actions and object actions
        return (
          result === "RESTART" ||
          result === "CLEAR" ||
          typeof result === "object"
        );
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

  parseStatBarTag(value) {
    const statValue = value.trim();

    // Extract all quoted strings first
    const quotedStrings = [];
    const quoteRegex = /"([^"]*)"/g;
    let match;

    while ((match = quoteRegex.exec(statValue)) !== null) {
      quotedStrings.push(match[1]);
    }

    // Remove quoted strings from remaining value
    const remainingValue = statValue.replace(/"[^"]*"/g, "").trim();

    // Parse remaining parts (variable name and optional min/max)
    const parts = remainingValue.split(/\s+/).filter((p) => p);

    // First part is always the variable name
    const variableName = parts[0];

    // Check for min/max values (two consecutive numbers)
    let min = 0;
    let max = 100;

    if (parts.length >= 3) {
      const possibleMin = parseFloat(parts[1]);
      const possibleMax = parseFloat(parts[2]);

      if (!isNaN(possibleMin) && !isNaN(possibleMax)) {
        min = possibleMin;
        max = possibleMax;
      }
    }

    // Determine labels based on quoted strings count
    let leftLabel = null;
    let rightLabel = null;
    let isOpposed = false;

    if (quotedStrings.length === 1) {
      // Single label = display name for single stat
      leftLabel = quotedStrings[0];
    } else if (quotedStrings.length >= 2) {
      // Two labels = opposed stat
      leftLabel = quotedStrings[0];
      rightLabel = quotedStrings[1];
      isOpposed = true;
    }

    return {
      variableName,
      min,
      max,
      leftLabel,
      rightLabel,
      isOpposed,
    };
  }

  /**
   * Parse IMAGE tag value into image data object.
   * @param {string} value - The tag value (e.g., "hero.png left 40% caption "Alt text"")
   * @returns {{src: string, alignment: string|null, width: string|null, altText: string|null, showCaption: boolean}}
   */
  parseImageTag(value) {
    const imageValue = value.trim();

    // Extract quoted alt text first
    let altText = null;
    let remainingValue = imageValue;
    const altTextMatch = imageValue.match(/"([^"]*)"/);
    if (altTextMatch) {
      altText = altTextMatch[1];
      remainingValue = imageValue.replace(/"([^"]*)"/, "").trim();
    }

    // Parse remaining parts
    const parts = remainingValue.split(/\s+/).filter((p) => p);
    const src = parts[0];

    let alignment = null;
    let width = null;
    let showCaption = false;

    for (let j = 1; j < parts.length; j++) {
      const part = parts[j].toLowerCase();
      if (["left", "right", "center"].includes(part)) {
        alignment = part;
      } else if (part === "caption") {
        showCaption = true;
      } else if (part.match(/^\d+(%|px|em|rem|vw)$/)) {
        width = part;
      }
    }

    return { src, alignment, width, altText, showCaption };
  }

  /**
   * Parse USER_INPUT tag value into user input data object.
   * Supported formats:
   *   # USER_INPUT: variable_name
   *   # USER_INPUT: variable_name "Placeholder text"
   *
   * @param {string} value - The tag value
   * @returns {{variableName: string, placeholder: string}}
   */
  parseUserInputTag(value) {
    const inputValue = value.trim();

    // Extract quoted placeholder first
    let placeholder = "";
    let remainingValue = inputValue;
    const placeholderMatch = inputValue.match(/"([^"]*)"/);
    if (placeholderMatch) {
      placeholder = placeholderMatch[1];
      remainingValue = inputValue.replace(/"([^"]*)"/, "").trim();
    }

    // Parse remaining parts
    const parts = remainingValue.split(/\s+/).filter((p) => p);

    // First part is always the variable name
    const variableName = parts[0];

    return {
      variableName,
      placeholder,
    };
  }
}
