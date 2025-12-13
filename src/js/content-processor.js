import { TagRegistry, TAGS } from "./tag-registry.js";
import { errorManager, ERROR_SOURCES } from "./error-manager.js";

const log = errorManager.forSource(ERROR_SOURCES.CONTENT_PROCESSOR);

/**
 * Processes raw ink story output into renderable content objects.
 * Handles text paragraphs, images, user input fields, and special content types.
 * Coordinates with TagProcessor for tag-based effects and styling.
 */
class ContentProcessor {
  /**
   * Creates the ContentProcessor with dependencies
   * @param {Object} tagProcessor - TagProcessor instance for parsing ink tags
   */
  constructor(tagProcessor) {
    if (!tagProcessor) {
      log.warning("ContentProcessor created without tagProcessor");
    }
    this.tagProcessor = tagProcessor;
    this.storyManager = null; // Wired by main.js after StoryManager is created
  }

  /**
   * Process story text and tags into a content object
   * @param {string} text - Raw text from the story
   * @param {Array} tags - Array of tags from the story
   * @returns {Object|null} Processed content object or null if empty
   */
  process(text, tags) {
    if (TAGS && Array.isArray(tags)) {
      const contentOverride = this.checkContentTypeTags(tags, text);
      if (contentOverride) return contentOverride;
    }

    return this.createParagraph(text, tags);
  }

  /**
   * Creates a paragraph content object from text and tags.
   * @param {string} text - The paragraph text
   * @param {string[]} tags - Array of ink tags associated with this line
   * @returns {{type: string, text: string, classes: string[], tags: string[], hasSpecialAction: boolean, action: *}}
   * @private
   */
  createParagraph(text, tags) {
    if (!Array.isArray(tags)) {
      log.warning("Invalid tags array provided to createParagraph");
      tags = [];
    }

    if (!this.tagProcessor?.processLineTags) {
      log.error("TagProcessor not available in ContentProcessor");
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
   * Checks tags for content-type overrides (STATBAR, USER_INPUT, IMAGE).
   * If found, returns specialized content object(s) instead of a paragraph.
   * @param {string[]} tags - Array of ink tags to check
   * @param {string} text - The accompanying text (may be included with the content)
   * @returns {Object|Array|null} Content object(s) if override found, null otherwise
   * @private
   */
  checkContentTypeTags(tags, text) {
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

  /**
   * Creates image content object(s) from an IMAGE tag.
   * Returns both image and paragraph if text accompanies the tag.
   * @param {string} tagValue - The IMAGE tag value (e.g., "hero.png left 50%")
   * @param {string} text - Any text on the same line
   * @param {string[]} tags - All tags for this line
   * @returns {Object|Array} Image content object, or array with image and paragraph
   * @private
   */
  handleImageContent(tagValue, text, tags) {
    const imageData = this.parseImageTag(tagValue);

    if (!text?.trim()) {
      return {
        type: "image",
        ...imageData,
      };
    }

    return [
      {
        type: "image",
        ...imageData,
      },
      this.createParagraph(text, tags),
    ];
  }

  /**
   * Creates stat bar content object(s) from STATBAR tag(s).
   * Supports multiple stat bars on the same line.
   * @param {string[]} tags - All tags for this line (may contain multiple STATBAR tags)
   * @param {string} text - Any text on the same line
   * @returns {Object|Array} Stat bar content object(s), optionally with paragraph
   * @private
   */
  handleStatBarContent(tags, text) {
    const parsedTags = tags.map((t) => TagRegistry.parseTag(t));
    const statBarTags = parsedTags.filter(
      ({ tagDef, invalid }) => tagDef === TAGS.STATBAR && !invalid
    );

    const statBars = statBarTags.map(({ tagValue }) => ({
      type: "statbar",
      ...this.parseStatBarTag(tagValue),
    }));

    if (text?.trim()) {
      return [...statBars, this.createParagraph(text, tags)];
    }

    return statBars.length === 1 ? statBars[0] : statBars;
  }

  /**
   * Creates user input content object from USER_INPUT tag.
   * Returns null if the variable already has a value (after input submission).
   * @param {string} tagValue - The USER_INPUT tag value (e.g., "player_name \"Enter name\"")
   * @returns {Object|null} User input content object, or null if already submitted
   * @private
   */
  handleUserInputContent(tagValue) {
    const userInputData = this.parseUserInputTag(tagValue);

    // Check if variable already has a value (re-processing after input was submitted)
    const currentValue =
      this.storyManager?.story?.variablesState?.[userInputData.variableName];

    if (
      currentValue &&
      currentValue !== "" &&
      this.storyManager?.reprocessingAfterUserInput
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

  /**
   * Parse IMAGE tag value into image data object.
   * @param {string} value - The tag value (e.g., "hero.png left 40% caption "Alt text"")
   * @returns {{src: string, alignment: string|null, width: string|null, altText: string|null, showCaption: boolean}}
   */
  parseImageTag(value) {
    const imageValue = value.trim();

    let altText = null;
    let remainingValue = imageValue;
    const altTextMatch = imageValue.match(/"([^"]*)"/);
    if (altTextMatch) {
      altText = altTextMatch[1];
      remainingValue = imageValue.replace(/"([^"]*)"/, "").trim();
    }

    const parts = remainingValue.split(/\s+/).filter((p) => p);
    const src = parts[0] || null;

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
   * Parse STATBAR tag value
   * @param {string} value - e.g., "health 0 100 "HP"" or "morality "Evil" "Good""
   * @returns {{variableName: string, min: number, max: number, leftLabel: string|null, rightLabel: string|null, isOpposed: boolean, clamp: boolean}}
   */
  parseStatBarTag(value) {
    const statValue = value.trim();

    const quotedStrings = [];
    const quoteRegex = /"([^"]*)"/g;
    let match;

    while ((match = quoteRegex.exec(statValue)) !== null) {
      quotedStrings.push(match[1]);
    }

    const remainingValue = statValue.replace(/"[^"]*"/g, "").trim();
    const parts = remainingValue.split(/\s+/).filter((p) => p);
    const shouldClamp = parts.some((p) => p.toLowerCase() === "clamp");
    const variableName = parts[0] || null;

    let min = 0;
    let max = 100;
    const numbers = parts
      .slice(1)
      .map((p) => ({ value: parseFloat(p), original: p }))
      .filter((p) => !isNaN(p.value));

    if (numbers.length === 2) {
      min = numbers[0].value;
      max = numbers[1].value;
    } else if (numbers.length === 1) {
      log.warning(
        `STATBAR "${variableName}" has only one number - provide both min and max (e.g., "0 100")`
      );
    } else if (numbers.length > 2) {
      log.warning(
        `STATBAR "${variableName}" has too many numbers - provide only min and max (e.g., "0 100")`
      );
    }

    if (numbers.length === 2 && min >= max) {
      log.warning(
        `STATBAR "${variableName}" has min (${min}) >= max (${max}) - bar will not display correctly`
      );
    }

    let leftLabel = null;
    let rightLabel = null;
    let isOpposed = false;

    if (quotedStrings.length === 1) {
      leftLabel = quotedStrings[0];
    } else if (quotedStrings.length >= 2) {
      leftLabel = quotedStrings[0];
      rightLabel = quotedStrings[1];
      isOpposed = true;
    }
    if (quotedStrings.length > 2) {
      log.warning(
        `STATBAR "${variableName}" has ${quotedStrings.length} labels - only first two are used`
      );
    }

    const keywords = ["clamp"];
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i].toLowerCase();
      const isNumber = !isNaN(parseFloat(parts[i]));
      const isKeyword = keywords.includes(part);

      if (!isNumber && !isKeyword) {
        log.warning(
          `STATBAR "${variableName}" has unquoted text "${parts[i]}" - use quotes for labels (e.g., "Label")`
        );
        break;
      }
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
   * Parse USER_INPUT tag value
   * @param {string} value - e.g., "player_name "Enter your name""
   * @returns {{variableName: string, placeholder: string}}
   */
  parseUserInputTag(value) {
    const inputValue = value.trim();

    let placeholder = "";
    let remainingValue = inputValue;
    const placeholderMatch = inputValue.match(/"([^"]*)"/);
    if (placeholderMatch) {
      placeholder = placeholderMatch[1];
      remainingValue = inputValue.replace(/"([^"]*)"/, "").trim();
    }

    const parts = remainingValue.split(/\s+/).filter((p) => p);
    const variableName = parts[0];

    return {
      variableName,
      placeholder,
    };
  }

  /**
   * Finds the first valid special action from an array of action functions.
   * Special actions include RESTART, CLEAR, or page navigation objects.
   * @param {Function[]} specialActions - Array of action functions to check
   * @returns {Function|null} The first valid action function, or null if none found
   * @private
   */
  findSpecialAction(specialActions) {
    if (!Array.isArray(specialActions) || specialActions.length === 0) {
      return null;
    }

    return specialActions.find((actionFn) => {
      if (typeof actionFn !== "function") {
        log.warning("Non-function found in specialActions array");
        return false;
      }

      try {
        const result = actionFn();
        return (
          result === "RESTART" ||
          result === "CLEAR" ||
          (typeof result === "object" && result !== null)
        );
      } catch (error) {
        log.error("Error executing special action function", error);
        return false;
      }
    });
  }

  /**
   * Checks whether the processor is ready to process content.
   * @returns {boolean} True if tagProcessor is available and functional
   */
  isReady() {
    return !!this.tagProcessor?.processLineTags;
  }

  /**
   * Returns diagnostic information about the processor's state.
   * @returns {{hasTagProcessor: boolean, processorType: string, timestamp: string}}
   */
  getStats() {
    return {
      hasTagProcessor: !!this.tagProcessor,
      processorType: this.tagProcessor?.constructor?.name || "unknown",
      timestamp: new Date().toISOString(),
    };
  }
}

export { ContentProcessor };
