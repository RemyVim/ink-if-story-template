import { errorManager, ERROR_SOURCES } from "./error-manager.js";

const log = errorManager.forSource(ERROR_SOURCES.CHOICE_MANAGER);

/**
 * Generates choice objects from ink story choices.
 * Processes choice tags for styling and clickability,
 * adds keyboard hints, and creates special navigation choices.
 */
class ChoiceManager {
  /**
   * Creates the ChoiceManager with dependencies
   * @param {Object} storyManager - The StoryManager instance
   * @param {Object} storyManager.tagProcessor - Tag processor for parsing choice tags
   * @param {Object} storyManager.settings - Settings manager for tone indicators
   */
  constructor(storyManager) {
    this.storyManager = storyManager;
    this.tagProcessor = storyManager.tagProcessor;
  }

  /**
   * Generate choice objects from ink story choices
   * @param {Array} storyChoices - Raw choices from ink story
   * @returns {Array} Processed choice objects with text, classes, onClick, keyHint, etc.
   */
  generate(storyChoices) {
    if (!Array.isArray(storyChoices)) {
      log.error("Invalid storyChoices - expected array");
      return [];
    }

    return storyChoices.map((choice, index) => {
      try {
        const { customClasses, isClickable } =
          this.tagProcessor?.processChoiceTags?.(choice.tags || []) || {
            customClasses: [],
            isClickable: true,
          };

        const toneIndicators =
          this.storyManager?.settings?.getToneIndicators?.(choice.tags || []) ||
          [];

        return {
          text: choice.text || "",
          classes: customClasses,
          isClickable,
          onClick: () => this.selectChoice(index),
          originalIndex: index,
          tags: choice.tags || [],
          keyHint: this.getKeyHint(index),
          toneIndicators,
        };
      } catch (error) {
        log.error(`Failed to process choice at index ${index}`, error);

        return {
          text: choice.text || "Invalid choice",
          classes: ["error-choice"],
          isClickable: false,
          onClick: () => {},
          originalIndex: index,
          tags: [],
          toneIndicators: [],
        };
      }
    });
  }

  /**
   * Selects a choice by index and advances the story.
   * @param {number} choiceIndex - Zero-based index of the choice to select
   */
  selectChoice(choiceIndex) {
    if (typeof choiceIndex !== "number" || choiceIndex < 0) {
      log.error(`Invalid choice index: ${choiceIndex}`);
      return;
    }

    if (!this.storyManager) {
      log.error("Story manager not available");
      return;
    }

    try {
      this.storyManager.selectChoice(choiceIndex);
    } catch (error) {
      log.error("Failed to select choice", error);
    }
  }

  /**
   * Create a special choice (e.g., navigation buttons)
   * @param {string} text - Choice text
   * @param {Function} onClick - Click handler
   * @param {string[]} [classes] - Additional CSS classes
   * @returns {Object} Choice object with isSpecial: true
   */
  createSpecialChoice(text, onClick, classes = []) {
    if (typeof text !== "string" || typeof onClick !== "function") {
      log.error("Invalid parameters for special choice");
      return {
        text: text || "Error",
        classes: ["error-choice"],
        isClickable: false,
        onClick: () => {},
        isSpecial: true,
      };
    }

    const safeOnClick = () => {
      try {
        onClick();
      } catch (error) {
        log.error("Special choice click failed", error);
      }
    };

    return {
      text,
      classes: Array.isArray(classes) ? classes : [],
      isClickable: true,
      onClick: safeOnClick,
      isSpecial: true,
    };
  }

  /**
   * Creates a "Return to Story" navigation choice.
   * @param {Function} onReturn - Callback when the return button is clicked
   * @returns {Object} Special choice object with return-button styling
   */
  createReturnChoice(onReturn) {
    if (typeof onReturn !== "function") {
      log.error("onReturn must be a function");
      return this.createSpecialChoice("← Return to Story", () => {}, [
        "return-button",
        "error-choice",
      ]);
    }

    return this.createSpecialChoice("← Return to Story", onReturn, [
      "return-button",
    ]);
  }

  /**
   * Processes ink tags attached to a choice to extract styling and behavior.
   * @param {string[]} tags - Array of ink tags from the choice
   * @returns {{customClasses: string[], isClickable: boolean}} Processed tag results
   */
  processChoiceTags(tags) {
    if (!this.tagProcessor?.processChoiceTags) {
      log.warning("TagProcessor not available, using default choice behavior");
      return { customClasses: [], isClickable: true };
    }

    try {
      return this.tagProcessor.processChoiceTags(tags || []);
    } catch (error) {
      log.warning("Failed to process choice tags", error);
      return { customClasses: [], isClickable: true };
    }
  }

  /**
   * Get keyboard hint for a choice index (1-9, then a-z)
   * @param {number} index - Zero-based choice index
   * @returns {string} Hint character
   */
  getKeyHint(index) {
    if (index < 9) {
      return String(index + 1); // 1-9
    } else {
      // a-z for indices 9-34
      return String.fromCharCode(97 + (index - 9)); // 'a' = 97
    }
  }

  /**
   * Checks if at least one choice in the array is clickable.
   * @param {Array} choices - Array of choice objects
   * @returns {boolean} True if any choice is clickable (or has undefined isClickable)
   */
  hasClickableChoices(choices) {
    if (!Array.isArray(choices)) return false;
    return choices.some((choice) => choice?.isClickable !== false);
  }

  /**
   * Filters choices, optionally returning only clickable ones.
   * @param {Array} choices - Array of choice objects
   * @param {boolean} [clickableOnly=false] - If true, exclude non-clickable choices
   * @returns {Array} Filtered array of choices
   */
  filterChoices(choices, clickableOnly = false) {
    if (!Array.isArray(choices)) return [];
    if (!clickableOnly) return choices;
    return choices.filter((choice) => choice?.isClickable !== false);
  }

  /**
   * Validates that a choice object has the required properties.
   * @param {Object} choice - Choice object to validate
   * @returns {boolean} True if choice has both 'text' and 'onClick' properties
   */
  validateChoice(choice) {
    if (!choice || typeof choice !== "object") return false;
    return ["text", "onClick"].every((prop) => prop in choice);
  }

  /**
   * Returns statistics about an array of choices.
   * @param {Array} choices - Array of choice objects
   * @returns {{total: number, clickable: number, special: number, withClasses: number}} Choice statistics
   */
  getChoiceStats(choices) {
    if (!Array.isArray(choices)) {
      return { total: 0, clickable: 0, special: 0, withClasses: 0 };
    }

    return {
      total: choices.length,
      clickable: choices.filter((c) => c?.isClickable !== false).length,
      special: choices.filter((c) => c?.isSpecial).length,
      withClasses: choices.filter((c) => c?.classes?.length > 0).length,
    };
  }
}

export { ChoiceManager };
