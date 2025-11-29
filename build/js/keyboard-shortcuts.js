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

    if (this.isTypingInInput(event)) return;

    if (event.ctrlKey || event.metaKey) {
      this.handleModifierShortcuts(event);
      return;
    }

    if (event.key === "Escape") {
      this.handleEscape(event);
      return;
    }

    // Skip if modal or panel is open
    if (this.isModalOpen()) return;

    if (this.handleScrolling(event)) return;

    this.handleChoiceSelection(event);
  }

  isTypingInInput(event) {
    return (
      event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA"
    );
  }

  isModalOpen() {
    const settingsModalOpen = window.storyManager?.settings?.modal?.isVisible;
    const savesModalOpen = window.storyManager?.saves?.modal?.modal?.isVisible;
    const slidePanel = window.storyManager?.navigation?.slidePanel;
    const menuPanelOpen = slidePanel
      ? slidePanel.classList.contains("show")
      : false;

    return settingsModalOpen || savesModalOpen || menuPanelOpen;
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
          if (confirm("Restart the story from the beginning?")) {
            window.storyManager.restart();
          }
          break;
        case ",":
          event.preventDefault();
          window.storyManager.settings?.showSettings?.();
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
