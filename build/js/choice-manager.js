// choice-manager.js
class ChoiceManager {
  constructor(storyManager) {
    this.storyManager = storyManager;
    this.tagProcessor = new TagProcessor();
  }

  /**
   * Generate choice objects from ink story choices
   * @param {Array} storyChoices - Array of choices from ink story
   * @returns {Array} Array of processed choice objects
   */
  generate(storyChoices) {
    if (!Array.isArray(storyChoices)) {
      window.errorManager.error(
        "Invalid storyChoices - expected array",
        null,
        "choice-manager",
      );
      return [];
    }

    return storyChoices.map((choice, index) => {
      try {
        const { customClasses, isClickable } =
          this.tagProcessor?.processChoiceTags?.(choice.tags || []) || {
            customClasses: [],
            isClickable: true,
          };

        return {
          text: choice.text || "",
          classes: customClasses,
          isClickable,
          onClick: () => this.selectChoice(index),
          originalIndex: index,
          tags: choice.tags || [],
          keyHint: this.getKeyHint(index),
        };
      } catch (error) {
        window.errorManager.error(
          `Failed to process choice at index ${index}`,
          error,
          "choice-manager",
        );

        // Return safe fallback choice
        return {
          text: choice.text || "Invalid choice",
          classes: ["error-choice"],
          isClickable: false,
          onClick: () => {},
          originalIndex: index,
          tags: [],
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
      window.errorManager.error(
        `Invalid choice index: ${choiceIndex}`,
        null,
        "choice-manager",
      );
      return;
    }

    if (!this.storyManager) {
      window.errorManager.error(
        "Story manager not available",
        null,
        "choice-manager",
      );
      return;
    }

    try {
      this.storyManager.selectChoice(choiceIndex);
    } catch (error) {
      window.errorManager.error(
        "Failed to select choice",
        error,
        "choice-manager",
      );
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
      window.errorManager.error(
        "Invalid parameters for special choice",
        null,
        "choice-manager",
      );
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
        window.errorManager.error(
          "Special choice click failed",
          error,
          "choice-manager",
        );
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
      window.errorManager.error(
        "onReturn must be a function",
        null,
        "choice-manager",
      );
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
      window.errorManager.warning(
        "TagProcessor not available, using default choice behavior",
        null,
        "choice-manager",
      );
      return { customClasses: [], isClickable: true };
    }

    try {
      return this.tagProcessor.processChoiceTags(tags || []);
    } catch (error) {
      window.errorManager.warning(
        "Failed to process choice tags",
        error,
        "choice-manager",
      );
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
