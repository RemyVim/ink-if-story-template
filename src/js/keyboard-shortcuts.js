import { Utils } from "./utils.js";
import { errorManager, ERROR_SOURCES } from "./error-manager.js";

const log = errorManager.forSource(ERROR_SOURCES.KEYBOARD_SHORTCUTS);

const SMALL_SCROLL_PERCENT = 0.15; // ~15% of viewport
const LARGE_SCROLL_PERCENT = 0.8; // ~80% of viewport

/**
 * Handles keyboard input for story navigation, choice selection, and scrolling.
 * Automatically disabled on mobile devices. Can be toggled via settings.
 */
class KeyboardShortcuts {
  /**
   * Creates the keyboard shortcuts handler (disabled by default on mobile).
   */
  constructor() {
    this.enabled = !Utils.isMobile();
    this.storyManager = null; // Wired by main.js
    this.keyboardHelpModal = null; // Wired by main.js
    this.init();
  }

  /**
   * Registers the global keydown event listener.
   * @private
   */
  init() {
    document.addEventListener("keydown", (event) => this.handleKeyDown(event));
  }

  /**
   * Enables keyboard shortcut handling.
   */
  enable() {
    this.enabled = true;
  }

  /**
   * Disables keyboard shortcut handling.
   */
  disable() {
    this.enabled = false;
  }

  /**
   * Main keydown event handler. Routes to appropriate sub-handlers based on key pressed.
   * @param {KeyboardEvent} event - The keyboard event
   * @private
   */
  handleKeyDown(event) {
    if (!this.storyManager || !this.enabled) return;

    // Ignore Alt key combinations (used by browser/OS)
    if (event.altKey) return;

    if (this.isTypingInInput(event)) return;

    if (event.ctrlKey || event.metaKey) {
      this.handleModifierShortcuts(event);
      return;
    }

    if (event.key === "Escape") {
      this.handleEscape();
      return;
    }

    if (this.handleScrolling(event)) return;

    this.handleChoiceSelection(event);
  }

  /**
   * Handles Ctrl/Cmd shortcuts for menus and actions.
   * Ctrl+S: saves, Ctrl+R: restart, Ctrl+,: settings, Ctrl+H: help
   * @param {KeyboardEvent} event - The keyboard event
   * @private
   */
  handleModifierShortcuts(event) {
    try {
      switch (event.key) {
        case "s":
          event.preventDefault();
          this.storyManager.saves?.showSaveDialog?.();
          break;
        case "r":
          event.preventDefault();
          this.storyManager.confirmRestart();
          break;
        case ",":
          event.preventDefault();
          this.storyManager.settings?.showSettings?.();
          break;
        case "h":
          event.preventDefault();
          this.keyboardHelpModal?.show?.();
          break;
      }
    } catch (error) {
      log.error("Keyboard shortcut failed", error);
    }
  }

  /**
   * Handles Escape key to return from special pages.
   * @private
   */
  handleEscape() {
    if (this.storyManager.pages?.isViewingSpecialPage?.()) {
      try {
        this.storyManager.pages.returnToStory();
      } catch (error) {
        log.error("Failed to return from special page", error);
      }
    }
  }

  /**
   * Handles arrow keys, Page Up/Down, Home/End for scrolling.
   * @param {KeyboardEvent} event - The keyboard event
   * @returns {boolean} True if the event was handled, false otherwise
   * @private
   */
  handleScrolling(event) {
    if (!this.isInStoryArea()) return false;
    const scrollContainer = document.querySelector(".outerContainer");
    if (!scrollContainer) return false;

    const smallScroll = window.innerHeight * SMALL_SCROLL_PERCENT;
    const largeScroll = window.innerHeight * LARGE_SCROLL_PERCENT;

    switch (event.key) {
      case "ArrowUp":
        event.preventDefault();
        scrollContainer.scrollBy({ top: -smallScroll, behavior: "smooth" });
        return true;
      case "ArrowDown":
        event.preventDefault();
        scrollContainer.scrollBy({ top: smallScroll, behavior: "smooth" });
        return true;
      case "PageUp":
        event.preventDefault();
        scrollContainer.scrollBy({ top: -largeScroll, behavior: "smooth" });
        return true;
      case "PageDown":
        event.preventDefault();
        scrollContainer.scrollBy({ top: largeScroll, behavior: "smooth" });
        return true;
      case "Home":
        event.preventDefault();
        scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
        return true;
      case "End":
        event.preventDefault();
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: "smooth",
        });
        return true;
    }

    return false;
  }

  /**
   * Handles 1-9 and A-Z keys for selecting story choices.
   * 1-9 select choices 1-9, A-Z select choices 10-35.
   * @param {KeyboardEvent} event - The keyboard event
   * @private
   */
  handleChoiceSelection(event) {
    if (!this.isInStoryArea()) return;

    const choices = this.storyManager.story?.currentChoices;
    if (!choices || choices.length === 0) return;

    const key = event.key.toLowerCase();
    let choiceIndex = null;

    if (key >= "1" && key <= "9") {
      choiceIndex = parseInt(key) - 1;
    } else if (key >= "a" && key <= "z") {
      // Check for a-z (for choices 10+)
      choiceIndex = 9 + (key.charCodeAt(0) - 97);
    }

    if (choiceIndex !== null && choiceIndex < choices.length) {
      event.preventDefault();
      this.storyManager.selectChoice(choiceIndex);
    }
  }

  /**
   * Checks if the user is currently typing in an input or textarea.
   * @param {KeyboardEvent} event - The keyboard event
   * @returns {boolean} True if focus is on an input element
   * @private
   */
  isTypingInInput(event) {
    return (
      event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA"
    );
  }

  /**
   * Checks if focus is within the story area (not in a modal or other UI).
   * @returns {boolean} True if the story area is active
   * @private
   */
  isInStoryArea() {
    const active = document.activeElement;
    const outerContainer = document.querySelector(".outerContainer");

    return active === document.body || outerContainer?.contains(active);
  }
}

export { KeyboardShortcuts };
