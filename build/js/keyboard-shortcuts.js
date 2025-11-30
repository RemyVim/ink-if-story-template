// keyboard-shortcuts.js
// Handles all keyboard shortcuts for the story application

class KeyboardShortcuts {
  constructor() {
    this.enabled = true;
    this.init();
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
          const confirmModal = new BaseModal({
            title: "Restart Story",
            className: "confirm-modal",
            maxWidth: "400px",
            showFooter: true,
          });
          confirmModal.showConfirmation(
            "Are you sure you want to restart the story from the beginning? Any unsaved progress will be lost.",
            () => window.storyManager.restart(),
            null,
            { title: "Restart Story" },
          );
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
      window.errorManager.error(
        "Keyboard shortcut failed",
        error,
        "navigation",
      );
    }
  }

  handleEscape(event) {
    if (window.storyManager.pages?.isViewingSpecialPage?.()) {
      try {
        window.storyManager.pages.returnToStory();
      } catch (error) {
        window.errorManager.error(
          "Failed to return from special page",
          error,
          "navigation",
        );
      }
    }
  }

  handleScrolling(event) {
    if (!this.isInStoryArea()) return false;
    const scrollContainer = document.querySelector(".outerContainer");
    if (!scrollContainer) return false;

    const smallScroll = window.innerHeight * 0.15;
    const largeScroll = window.innerHeight * 0.8;

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
