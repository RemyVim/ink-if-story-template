// content-processor.js
import { ErrorManager } from "./error-manager.js";
import { TagRegistry } from "./tag-registry.js";

class ContentProcessor {
  static errorSource = ErrorManager.SOURCES.CONTENT_PROCESSOR;
  constructor() {
    this.tagProcessor = window.tagProcessor;
  }

  static _error(message, error = null) {
    window.errorManager.error(message, error, ContentProcessor.errorSource);
  }

  static _warning(message, error = null) {
    window.errorManager.warning(message, error, ContentProcessor.errorSource);
  }

  static _critical(message, error = null) {
    window.errorManager.critical(message, error, ContentProcessor.errorSource);
  }

  /**
   * Process story text and tags into a content object
   * @param {string} text - Raw text from the story
   * @param {Array} tags - Array of tags from the story
   * @returns {Object|null} Processed content object or null if empty
   */
  process(text, tags) {
    const { TAGS } = window.TagRegistry || {};

    if (TAGS && Array.isArray(tags)) {
      const contentOverride = this.checkContentTypeTags(tags, text);
      if (contentOverride) return contentOverride;
    }

    return this.createParagraph(text, tags);
  }

  checkContentTypeTags(tags, text) {
    const { TAGS } = window.TagRegistry;

    for (const tag of tags) {
      if (typeof tag !== "string") continue;

      const { tagDef, tagValue, invalid } = TagRegistry.parseTag(tag);
      if (invalid) continue;

      switch (tagDef) {
        case TAGS.STATBAR:
          return this.handleStatBarContent(tags, text);
        case TAGS.USER_INPUT:
          return this.handleUserInputContent(tagValue);
        case TAGS.IMAGE:
          return this.handleImageContent(tagValue, text, tags);
      }
    }

    return null; // No content-type override found
  }

  handleImageContent(tagValue, text, tags) {
    const imageData = this.parseImageTag(tagValue);

    // Pure image (no accompanying text)
    if (!text?.trim()) {
      return {
        type: "image",
        ...imageData,
      };
    }

    // Image + text: return both as array (image first)
    return [
      {
        type: "image",
        ...imageData,
      },
      this.createParagraph(text, tags),
    ];
  }

  handleStatBarContent(tags, text) {
    const { TAGS } = window.TagRegistry;

    // Collect ALL statbar tags (there could be multiple)
    const parsedTags = tags.map((t) => TagRegistry.parseTag(t));
    const statBarTags = parsedTags.filter(
      ({ tagDef, invalid }) => tagDef === TAGS.STATBAR && !invalid,
    );

    const statBars = statBarTags.map(({ tagValue }) => ({
      type: "statbar",
      ...this.parseStatBarTag(tagValue),
    }));

    // If there's also text, include it as a paragraph
    if (text?.trim()) {
      return [...statBars, this.createParagraph(text, tags)];
    }

    // Return single statbar or array of statbars
    return statBars.length === 1 ? statBars[0] : statBars;
  }

  handleUserInputContent(tagValue) {
    const userInputData = this.parseUserInputTag(tagValue);

    // Check if variable already has a value (re-processing after input was submitted)
    const currentValue =
      window.storyManager?.story?.variablesState?.[userInputData.variableName];

    if (
      currentValue &&
      currentValue !== "" &&
      window.storyManager?.reprocessingAfterUserInput
    ) {
      // Variable already set AND we're re-processing after submit
      // Return null to fall through to normal paragraph processing
      return null;
    }

    return {
      type: "user-input",
      ...userInputData,
    };
  }

  createParagraph(text, tags) {
    if (!Array.isArray(tags)) {
      ContentProcessor._warning(
        "Invalid tags array provided to createParagraph",
      );
      tags = [];
    }

    if (!this.tagProcessor?.processLineTags) {
      ContentProcessor._error("TagProcessor not available in ContentProcessor");
      return {
        type: "paragraph",
        text,
        classes: [],
        tags,
        hasSpecialAction: false,
        action: null,
      };
    }

    const { customClasses, specialActions } =
      this.tagProcessor.processLineTags(tags);
    const specialAction = this.findSpecialAction(specialActions);

    return {
      type: "paragraph",
      text,
      classes: customClasses || [],
      tags,
      hasSpecialAction: !!specialAction,
      action: specialAction?.(),
    };
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
        ContentProcessor._warning("Non-function found in specialActions array");
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
        ContentProcessor._error(
          "Error executing special action function",
          error,
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

    const shouldClamp = parts.some((p) => p.toLowerCase() === "clamp");

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
      clamp: shouldClamp,
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
export { ContentProcessor };
