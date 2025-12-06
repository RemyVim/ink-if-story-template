// keyboard-shortcuts.js
// Handles all keyboard shortcuts for the story application
import { ErrorManager } from "./error-manager.js";

const SMALL_SCROLL_PERCENT = 0.15; // ~15% of viewport
const LARGE_SCROLL_PERCENT = 0.8; // ~80% of viewport

class KeyboardShortcuts {
  static errorSource = ErrorManager.SOURCES.KEYBOARD_SHORTCUTS;

  constructor() {
    this.enabled = !window.Utils.isMobile();
    this.init();
  }

  static _error(message, error = null) {
    window.errorManager.error(message, error, KeyboardShortcuts.errorSource);
  }

  static _warning(message, error = null) {
    window.errorManager.warning(message, error, KeyboardShortcuts.errorSource);
  }

  static _critical(message, error = null) {
    window.errorManager.critical(message, error, KeyboardShortcuts.errorSource);
  }

  init() {
    document.addEventListener("keydown", (event) => this.handleKeyDown(event));
  }

  handleKeyDown(event) {
    // Only handle shortcuts if story manager is initialized
    if (!window.storyManager || !this.enabled) return;

    // Ignore Alt key combinations (used by browser/OS)
    if (event.altKey) return;

    if (this.isTypingInInput(event)) return;

    if (event.ctrlKey || event.metaKey) {
      this.handleModifierShortcuts(event);
      return;
    }

    if (event.key === "Escape") {
      this.handleEscape(event);
      return;
    }

    if (this.handleScrolling(event)) return;

    this.handleChoiceSelection(event);
  }

  isTypingInInput(event) {
    return (
      event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA"
    );
  }

  isInStoryArea() {
    const active = document.activeElement;
    const outerContainer = document.querySelector(".outerContainer");

    return active === document.body || outerContainer?.contains(active);
  }

  handleModifierShortcuts(event) {
    try {
      switch (event.key) {
        case "s":
          event.preventDefault();
          window.storyManager.saves?.showSaveDialog?.();
          break;
        case "r":
          event.preventDefault();
          window.storyManager.confirmRestart();
          break;
        case ",":
          event.preventDefault();
          window.storyManager.settings?.showSettings?.();
          break;
        case "h":
          event.preventDefault();
          window.keyboardHelpModal?.show?.();
          break;
      }
    } catch (error) {
      KeyboardShortcuts._error("Keyboard shortcut failed", error);
    }
  }

  handleEscape(event) {
    if (window.storyManager.pages?.isViewingSpecialPage?.()) {
      try {
        window.storyManager.pages.returnToStory();
      } catch (error) {
        KeyboardShortcuts._error("Failed to return from special page", error);
      }
    }
  }

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

  handleChoiceSelection(event) {
    if (!this.isInStoryArea()) return;

    const choices = window.storyManager.story?.currentChoices;
    if (!choices || choices.length === 0) return;

    const key = event.key.toLowerCase();
    let choiceIndex = null;

    // Check for 1-9
    if (key >= "1" && key <= "9") {
      choiceIndex = parseInt(key) - 1;
    }
    // Check for a-z (for choices 10+)
    else if (key >= "a" && key <= "z") {
      choiceIndex = 9 + (key.charCodeAt(0) - 97);
    }

    // Validate and select
    if (choiceIndex !== null && choiceIndex < choices.length) {
      event.preventDefault();
      window.storyManager.selectChoice(choiceIndex);
    }
  }

  /**
   * Enable keyboard shortcuts
   */
  enable() {
    this.enabled = true;
  }

  /**
   * Disable keyboard shortcuts
   */
  disable() {
    this.enabled = false;
  }
}

// Initialize keyboard shortcuts when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.keyboardShortcuts = new KeyboardShortcuts();
  });
} else {
  window.keyboardShortcuts = new KeyboardShortcuts();
}

export { KeyboardShortcuts };
