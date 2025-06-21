// choice-manager.js
// Handles choice generation and interaction logic

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
    return storyChoices.map((choice, index) => {
      const { customClasses, isClickable } =
        this.tagProcessor.processChoiceTags(choice.tags || []);

      return {
        text: choice.text,
        classes: customClasses,
        isClickable,
        onClick: () => this.selectChoice(index),
        originalIndex: index,
        tags: choice.tags || [],
      };
    });
  }

  /**
   * Handle choice selection
   * @param {number} choiceIndex - Index of the selected choice
   */
  selectChoice(choiceIndex) {
    // Delegate back to story manager
    this.storyManager.selectChoice(choiceIndex);
  }

  /**
   * Create a special choice (like return buttons)
   * @param {string} text - Choice text
   * @param {Function} onClick - Click handler
   * @param {Array} classes - Additional CSS classes
   * @returns {Object} Choice object
   */
  createSpecialChoice(text, onClick, classes = []) {
    return {
      text,
      classes,
      isClickable: true,
      onClick,
      isSpecial: true,
    };
  }

  /**
   * Create a return-to-story choice
   * @param {Function} onReturn - Function to call when returning
   * @returns {Object} Return choice object
   */
  createReturnChoice(onReturn) {
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
    return this.tagProcessor.processChoiceTags(tags);
  }

  /**
   * Check if there are any choices available
   * @param {Array} choices - Array of choice objects
   * @returns {boolean} True if there are clickable choices
   */
  hasClickableChoices(choices) {
    return choices.some((choice) => choice.isClickable !== false);
  }

  /**
   * Filter choices by clickability
   * @param {Array} choices - Array of choice objects
   * @param {boolean} clickableOnly - If true, return only clickable choices
   * @returns {Array} Filtered choices
   */
  filterChoices(choices, clickableOnly = false) {
    if (!clickableOnly) return choices;
    return choices.filter((choice) => choice.isClickable !== false);
  }
}
