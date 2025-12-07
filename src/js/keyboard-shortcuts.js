import { Utils } from "./utils.js";
import { errorManager, ERROR_SOURCES } from "./error-manager.js";

const log = errorManager.forSource(ERROR_SOURCES.KEYBOARD_SHORTCUTS);

const SMALL_SCROLL_PERCENT = 0.15; // ~15% of viewport
const LARGE_SCROLL_PERCENT = 0.8; // ~80% of viewport

class KeyboardShortcuts {
  constructor() {
    this.enabled = !Utils.isMobile();
    this.storyManager = null; // Wired by main.js
    this.keyboardHelpModal = null; // Wired by main.js
    this.init();
  }

  init() {
    document.addEventListener("keydown", (event) => this.handleKeyDown(event));
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

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
      this.handleEscape(event);
      return;
    }

    if (this.handleScrolling(event)) return;

    this.handleChoiceSelection(event);
  }

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

  handleEscape(event) {
    if (this.storyManager.pages?.isViewingSpecialPage?.()) {
      try {
        this.storyManager.pages.returnToStory();
      } catch (error) {
        log.error("Failed to return from special page", error);
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
}

export { KeyboardShortcuts };
