// content-processor.js
class ContentProcessor {
  constructor() {
    this.tagProcessor = window.tagProcessor;
  }

  /**
   * Process story text and tags into a content object
   * @param {string} text - Raw text from the story
   * @param {Array} tags - Array of tags from the story
   * @returns {Object|null} Processed content object or null if empty
   */
  process(text, tags) {
    const { TAGS, getTagDef } = window.TagRegistry || {};

    // Check tags for content-type tags (IMAGE, STATBAR, USER_INPUT)
    if (TAGS && getTagDef && Array.isArray(tags)) {
      for (const tag of tags) {
        if (typeof tag !== "string") continue;

        const { tagDef, tagValue, invalid } = TagRegistry.parseTag(tag);
        if (invalid) continue;

        if (tagDef === TAGS.IMAGE) {
          const imageData = this.parseImageTag(tagValue);

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

        if (tagDef === TAGS.STATBAR) {
          // Collect ALL statbar tags (there could be multiple)
          const parsedTags = tags.map((t) => TagRegistry.parseTag(t));
          const statBarTags = parsedTags.filter(
            ({ tagDef: def, invalid }) => def === TAGS.STATBAR && !invalid,
          );

          const statBars = statBarTags.map(({ tagValue: val }) => ({
            type: "statbar",
            ...this.parseStatBarTag(val),
          }));

          // If there's also text, include it as a paragraph
          if (text && typeof text === "string" && text.trim()) {
            return [
              ...statBars,
              {
                type: "paragraph",
                text,
                classes:
                  this.tagProcessor?.processLineTags?.(tags)?.customClasses ||
                  [],
                tags,
                hasSpecialAction: false,
                action: null,
              },
            ];
          }

          // Return single statbar or array of statbars
          return statBars.length === 1 ? statBars[0] : statBars;
        }

        if (tagDef === TAGS.USER_INPUT) {
          const userInputData = this.parseUserInputTag(tagValue);

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
            break;
          }

          // Either variable not set, OR we're visiting fresh — show input field
          return {
            type: "user-input",
            ...userInputData,
          };
        }
      }
    }

    // Normal paragraph processing
    if (!Array.isArray(tags)) {
      window.errorManager.warning(
        "Invalid tags array provided to ContentProcessor.process",
        null,
        "content-processor",
      );
      tags = [];
    }

    if (!this.tagProcessor?.processLineTags) {
      window.errorManager.error(
        "TagProcessor not available in ContentProcessor",
        null,
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

    try {
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
