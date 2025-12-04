// choice-manager.js
class ChoiceManager {
  static errorSource = ErrorManager.SOURCES.CHOICE_MANAGER;
  constructor(storyManager) {
    this.storyManager = storyManager;
    this.tagProcessor = window.tagProcessor;
  }

  static _error(message, error = null) {
    window.errorManager.error(message, error, ChoiceManager.errorSource);
  }

  static _warning(message, error = null) {
    window.errorManager.warning(message, error, ChoiceManager.errorSource);
  }

  static _critical(message, error = null) {
    window.errorManager.critical(message, error, ChoiceManager.errorSource);
  }

  /**
   * Generate choice objects from ink story choices
   * @param {Array} storyChoices - Array of choices from ink story
   * @returns {Array} Array of processed choice objects
   */
  generate(storyChoices) {
    if (!Array.isArray(storyChoices)) {
      ChoiceManager._error("Invalid storyChoices - expected array");
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
        ChoiceManager._error(
          `Failed to process choice at index ${index}`,
          error,
        );

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
   * Handle choice selection
   * @param {number} choiceIndex - Index of the selected choice
   */
  selectChoice(choiceIndex) {
    if (typeof choiceIndex !== "number" || choiceIndex < 0) {
      ChoiceManager._error(`Invalid choice index: ${choiceIndex}`);
      return;
    }

    if (!this.storyManager) {
      ChoiceManager._error("Story manager not available");
      return;
    }

    try {
      this.storyManager.selectChoice(choiceIndex);
    } catch (error) {
      ChoiceManager._error("Failed to select choice", error);
    }
  }

  /**
   * Create a special choice (like return buttons)
   * @param {string} text - Choice text
   * @param {Function} onClick - Click handler
   * @param {Array} classes - Additional CSS classes
   * @returns {Object} Choice object
   */
  createSpecialChoice(text, onClick, classes = []) {
    if (typeof text !== "string" || typeof onClick !== "function") {
      ChoiceManager._error("Invalid parameters for special choice");
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
        ChoiceManager._error("Special choice click failed", error);
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
   * Create a return-to-story choice
   * @param {Function} onReturn - Function to call when returning
   * @returns {Object} Return choice object
   */
  createReturnChoice(onReturn) {
    if (typeof onReturn !== "function") {
      ChoiceManager._error("onReturn must be a function");
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
   * Process choice tags for styling and behavior
   * @param {Array} tags - Choice tags
   * @returns {Object} Processed tag information
   */
  processChoiceTags(tags) {
    if (!this.tagProcessor?.processChoiceTags) {
      ChoiceManager._warning(
        "TagProcessor not available, using default choice behavior",
      );
      return { customClasses: [], isClickable: true };
    }

    try {
      return this.tagProcessor.processChoiceTags(tags || []);
    } catch (error) {
      ChoiceManager._warning("Failed to process choice tags", error);
      return { customClasses: [], isClickable: true };
    }
  }

  /**
   * Get the keyboard hint character for a choice at a given index
   * @param {number} index - The zero-based index of the choice
   * @returns {string} The keyboard hint character (1-9 for indices 0-8, a-z for indices 9-34)
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
   * Check if there are any choices available
   * @param {Array} choices - Array of choice objects
   * @returns {boolean} True if there are clickable choices
   */
  hasClickableChoices(choices) {
    if (!Array.isArray(choices)) return false;
    return choices.some((choice) => choice?.isClickable !== false);
  }

  /**
   * Filter choices by clickability
   * @param {Array} choices - Array of choice objects
   * @param {boolean} clickableOnly - If true, return only clickable choices
   * @returns {Array} Filtered choices
   */
  filterChoices(choices, clickableOnly = false) {
    if (!Array.isArray(choices)) return [];
    if (!clickableOnly) return choices;
    return choices.filter((choice) => choice?.isClickable !== false);
  }

  /**
   * Validate a choice object
   * @param {Object} choice - Choice object to validate
   * @returns {boolean} True if choice is valid
   */
  validateChoice(choice) {
    if (!choice || typeof choice !== "object") return false;
    return ["text", "onClick"].every((prop) => prop in choice);
  }

  /**
   * Get choice statistics for debugging
   * @param {Array} choices - Array of choice objects
   * @returns {Object} Choice statistics
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
