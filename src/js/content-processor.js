import { TagRegistry, TAGS } from "./tag-registry.js";
import { errorManager, ERROR_SOURCES } from "./error-manager.js";

const log = errorManager.forSource(ERROR_SOURCES.CONTENT_PROCESSOR);

class ContentProcessor {
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

  isReady() {
    return !!this.tagProcessor?.processLineTags;
  }

  getStats() {
    return {
      hasTagProcessor: !!this.tagProcessor,
      processorType: this.tagProcessor?.constructor?.name || "unknown",
      timestamp: new Date().toISOString(),
    };
  }
}

export { ContentProcessor };
