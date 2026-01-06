import { Story } from "inkjs";
import { notificationManager } from "./notification-manager.js";
import { InkFunctions } from "./ink-functions.js";
import { BaseModal } from "./base-modal.js";
import { errorManager, ERROR_SOURCES } from "./error-manager.js";

const log = errorManager.forSource(ERROR_SOURCES.STORY_MANAGER);

/**
 * Central coordinator for the ink story engine.
 * Manages story state, content generation, choices, saves, and special pages.
 * Dependencies are injected via constructor and wired by main.js.
 */
class StoryManager {
  /**
   * Creates the story manager with injected dependencies.
   * @param {Object} storyContent - Compiled ink story JSON
   * @param {Object} options - Injected dependencies
   * @param {Object} options.display - DisplayManager instance
   * @param {Object} options.settings - SettingsManager instance
   * @param {Object} options.contentProcessor - ContentProcessor instance
   */
  constructor(storyContent, { display, settings, contentProcessor }) {
    try {
      this.story = new Story(storyContent);
      InkFunctions.bindAll(this.story, this);

      this.savePoint = "";
      this.autoClear = false; // Default: continuous display (Inky behavior)
      this.queuedPage = null;
      this.queuedModal = null;
      this.display = display;
      this.settings = settings;
      this.contentProcessor = contentProcessor;

      // Wired by main.js after construction
      this.pages = null;
      this.choices = null;
      this.navigation = null;
      this.saves = null;
    } catch (error) {
      log.critical("Failed to initialize story", error);
      throw error;
    }
  }

  /**
   * Starts the story after all dependencies have been wired.
   * Detects special pages, processes global tags, and begins content generation.
   * @throws {Error} If required dependencies are not wired
   */
  start() {
    const required = {
      display: this.display,
      settings: this.settings,
      contentProcessor: this.contentProcessor,
      pages: this.pages,
      choices: this.choices,
      navigation: this.navigation,
      saves: this.saves,
    };

    const missing = Object.entries(required)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missing.length > 0) {
      throw new Error(
        `StoryManager.start() called before wiring dependencies: ${missing.join(", ")}`
      );
    }

    this.pages.detectSpecialPages();

    try {
      // Process global tags for theme, metadata, and menu order
      this.settings.processGlobalTags(this.story.globalTags);
      if (this.settings.maxHistory) {
        this.display.setMaxHistory(this.settings.maxHistory);
      }
      this.pages.processMenuOrderTag(this.story.globalTags);
      this.navigation.updateVisibility(
        this.pages.availablePages,
        this.pages.pageMenuOrder
      );
      // Set initial save point and start
      this.savePoint = this.story.state.ToJson();
      this.continue(true);
    } catch (error) {
      log.error("Failed to setup initial state", error);
    }
  }

  /**
   * Continues the story, generating and rendering new content.
   * Clears display (unless first time), processes content, and creates choices.
   * @param {boolean} [isFirstTime=false] - Whether this is the initial story load
   */
  continue(isFirstTime = false) {
    try {
      if (this.pages?.isViewingSpecialPage()) return;

      const previousContentCount =
        this.display?.getContentElementCount?.() || 0;

      if (!isFirstTime) {
        if (this.autoClear) {
          // Auto-clear mode: clear screen
          this.display?.clear?.();
          this.display?.scrollToTop?.();
        } else {
          // Continuous display mode: just remove choices, keep content
          this.display?.removeChoices?.();
        }
      }

      const {
        content: storyContent,
        stoppedForUserInput,
        stateBeforeUserInput,
      } = this.generateContent();

      if (storyContent.length > 0) {
        this.display?.render?.(storyContent);
        document.dispatchEvent(
          new CustomEvent("story:content", {
            detail: { content: storyContent },
          })
        );

        // Position focus marker at new content
        if (!isFirstTime) {
          let markerPosition;
          if (this.userInputMarkerPosition != null) {
            // After user input: position where the input field was
            markerPosition = this.userInputMarkerPosition;
          } else if (this.autoClear) {
            // Auto-clear: marker at start of content
            markerPosition = 0;
          } else {
            // Continuous: marker at first new element
            markerPosition = previousContentCount;
          }
          this.display?.positionFocusMarkerAtNewContent?.(markerPosition);
          if (this.userInputMarkerPosition != null) {
            this.display?.focusMarker?.("Input submitted");
          } else {
            this.display?.focusMarker?.(); // Silent focus, no announcement
          }
        } else {
          // First load: position marker at start, don't focus (let page load naturally)
          this.display?.positionFocusMarkerAtNewContent?.(0);
        }
      }

      // Fire start event on first load
      // Use setTimeout to ensure window.InkTemplate.storyManager is assigned
      if (isFirstTime) {
        setTimeout(
          () => document.dispatchEvent(new CustomEvent("story:start")),
          0
        );
      }

      // Store state for user input restoration
      if (stoppedForUserInput && stateBeforeUserInput) {
        this.stateBeforeUserInput = stateBeforeUserInput;
      }

      // Only generate choices if we didn't stop for user input
      if (!stoppedForUserInput) {
        this.createChoices();
      }

      if (!stoppedForUserInput && this.hasEnded()) {
        document.dispatchEvent(new CustomEvent("story:end"));
      }

      // Update save point after generating new content
      this.savePoint = this.story.state.ToJson();

      // Check if OPEN_PAGE was called - show it now that content is fully rendered
      if (this.queuedPage) {
        const pageToShow = this.queuedPage;
        this.queuedPage = null;
        this.pages.show(pageToShow);
      }

      // Check if a modal was queued (OPEN_SAVES, OPEN_SETTINGS)
      if (this.queuedModal) {
        const modalToShow = this.queuedModal;
        this.queuedModal = null;
        if (modalToShow === "saves") {
          this.saves?.modal?.show?.();
        } else if (modalToShow === "settings") {
          this.settings?.settingsModal?.show?.();
        }
      }
    } catch (error) {
      log.error("Failed to continue story", error);
    }
  }

  /**
   * Generates and renders the current story choices.
   * @private
   */
  createChoices() {
    try {
      if (this.story.currentChoices?.length > 0) {
        const choices = this.choices?.generate?.(this.story.currentChoices);
        if (choices) {
          // Always include hints in HTML - CSS handles visibility via container class
          this.display?.renderChoices?.(choices, true);
        }
      }
    } catch (error) {
      log.error("Failed to create choices", error, "choices");
    }
  }

  /**
   * Selects a choice by index and continues the story.
   * Removes existing choices, advances the story, triggers autosave.
   * @param {number} choiceIndex - Index of the choice to select
   */
  selectChoice(choiceIndex) {
    try {
      if (
        typeof choiceIndex !== "number" ||
        choiceIndex < 0 ||
        choiceIndex >= this.story.currentChoices.length
      ) {
        throw new Error(`Invalid choice index: ${choiceIndex}`);
      }

      this.display?.container
        ?.querySelectorAll?.(".choice")
        .forEach((choice) => {
          choice.remove();
        });

      this.story.ChooseChoiceIndex(choiceIndex);
      document.dispatchEvent(
        new CustomEvent("story:choice", {
          detail: { index: choiceIndex },
        })
      );

      this.savePoint = this.story.state.ToJson();

      this.continue();
      this.saves?.autosave?.();
    } catch (error) {
      log.error("Failed to select choice", error, "navigation");
    }
  }

  /**
   * Restarts the story from the beginning.
   * Resets story state, display, and page manager.
   */
  restart() {
    try {
      document.dispatchEvent(new CustomEvent("story:restart"));
      this.story.ResetState();
      this.display?.reset?.();
      this.pages?.reset?.();
      this.savePoint = this.story.state.ToJson();
      this.autoClear = false;
      this.continue(true);
      this.display?.scrollToTop?.();

      notificationManager.success?.("Story restarted from the beginning");
    } catch (error) {
      log.error("Failed to restart story", error);
    }
  }

  /**
   * Show confirmation dialog before restarting
   * Called by all restart entry points (keyboard, button, title, tag)
   */
  confirmRestart() {
    BaseModal.confirm({
      title: "Restart Story",
      message:
        "Are you sure you want to restart the story from the beginning? Any unsaved progress will be lost.",
      confirmText: "Restart",
      cancelText: "Cancel",
      confirmVariant: "primary",
      onConfirm: () => this.restart(),
    });
  }

  /**
   * Generates content by advancing the story until choices or user input.
   * @returns {{content: Array, stoppedForUserInput: boolean, stateBeforeUserInput: string|null}}
   * @private
   */
  generateContent() {
    const content = [];
    let stoppedForUserInput = false;

    // Save state once at start — used to replay after user input
    const stateAtStart = this.story.state.ToJson();

    try {
      while (this.story.canContinue) {
        const text = this.story.Continue();
        const tags = this.story.currentTags || [];

        if (text.trim().length === 0 && tags.length === 0) continue;

        const processedContent = this.contentProcessor?.process?.(text, tags);
        if (processedContent) {
          if (Array.isArray(processedContent)) {
            content.push(...processedContent);
            if (processedContent.some((item) => item.type === "user-input")) {
              stoppedForUserInput = true;
              break;
            }
          } else {
            content.push(processedContent);
            if (processedContent.type === "user-input") {
              stoppedForUserInput = true;
              break;
            }
          }
        }

        if (processedContent?.hasSpecialAction) {
          const shouldContinue = this.handleSpecialAction(
            processedContent.action
          );
          if (!shouldContinue) {
            break;
          }
        }
      }
    } catch (error) {
      log.error("Error generating story content", error);
    }

    return {
      content,
      stoppedForUserInput,
      stateBeforeUserInput: stoppedForUserInput ? stateAtStart : null,
    };
  }

  /**
   * Handles special actions like CLEAR and RESTART from content tags.
   * @param {string} actionResult - The action to handle
   * @returns {boolean} True if story should continue processing, false to stop
   * @private
   */
  handleSpecialAction(actionResult) {
    try {
      if (typeof actionResult === "string") {
        switch (actionResult) {
          case "CLEAR":
            this.display?.clear?.();
            this.display?.hideHeader?.();
            return true;
          case "AUTOCLEAR_ON":
            this.autoClear = true;
            return true;
          case "AUTOCLEAR_OFF":
            this.autoClear = false;
            return true;
          case "RESTART":
            this.confirmRestart();
            return true;
          default:
            return true;
        }
      }
      return true;
    } catch (error) {
      log.error("Failed to handle special action", error);
      return true;
    }
  }

  /**
   * Gets the complete current state for saving.
   * @returns {{gameState: string, displayState: Object|null, currentPage: string|null, savePoint: string, timestamp: number}}
   */
  getCurrentState() {
    try {
      return {
        gameState: this.story.state.ToJson(),
        displayState: this.display?.getState?.() || null,
        currentPage: this.pages?.currentPage,
        savePoint: this.savePoint,
        timestamp: Date.now(),
        autoClear: this.autoClear,
      };
    } catch (error) {
      log.error("Failed to get current state", error);
      return {};
    }
  }

  /**
   * Loads a previously saved state.
   * Restores story state, display, and recreates choices.
   * @param {Object} state - The saved state object
   * @param {string} state.gameState - Serialized ink story state
   * @param {Object} [state.displayState] - Saved display history
   * @param {string} [state.currentPage] - Current special page knot name
   * @param {string} [state.savePoint] - Serialized save point state
   */
  loadState(state) {
    try {
      if (!state?.gameState) {
        throw new Error("Invalid save state");
      }

      const testStory = this.createTempStory();
      testStory.state.LoadJson(state.gameState);

      this.story.state.LoadJson(state.gameState);
      this.pages.currentPage = state.currentPage || null;
      this.savePoint = state.savePoint || this.story.state.ToJson();
      this.autoClear = state.autoClear ?? false;

      this.pages?.reset?.();

      // Restore stateBeforeUserInput if it was saved
      this.stateBeforeUserInput = state.stateBeforeUserInput || null;

      let hasUserInput = false;

      if (state.displayState) {
        this.display?.restoreState?.(state.displayState);

        // Check if we saved while actually waiting for user input
        // (stateBeforeUserInput is only set when input is pending, not after submission)
        hasUserInput = state.stateBeforeUserInput != null;
      } else {
        this.display?.clear?.();
        this.regenerateCurrentDisplay();
      }

      // Only create choices if there's no pending user input
      if (!hasUserInput) {
        this.createChoices();
      }

      this.display?.focusMarker?.("Continuing story");
    } catch (error) {
      log.error("Failed to load state", error, "save-system");
    }
  }

  /**
   * Regenerates display from current story text (fallback recovery).
   * @private
   */
  regenerateCurrentDisplay() {
    try {
      const currentText = this.story.state.currentText;

      if (currentText?.trim?.().length > 0) {
        const content = [
          {
            text: currentText,
            classes: [],
          },
        ];
        this.display?.render?.(content);
      }
    } catch (error) {
      log.error("Failed to regenerate display", error, "display");
    }
  }

  /**
   * Checks if the story can continue (has more content to generate).
   * @returns {boolean} True if story.canContinue is true
   */
  canContinue() {
    try {
      return this.story.canContinue;
    } catch (error) {
      log.warning("Failed to check canContinue", error);
      return false;
    }
  }

  /**
   * Checks if the story currently has choices available.
   * @returns {boolean} True if there are current choices
   */
  hasChoices() {
    try {
      return this.story.currentChoices?.length > 0;
    } catch (error) {
      log.warning("Failed to check hasChoices", error);
      return false;
    }
  }

  /**
   * Checks if the story has ended (no more content or choices).
   * @returns {boolean} True if story cannot continue and has no choices
   */
  hasEnded() {
    return !this.canContinue() && !this.hasChoices();
  }

  /**
   * Create a temporary story instance with external functions bound
   * @returns {Story} A new story instance with functions bound
   */
  createTempStory() {
    const tempStory = new Story(this.story.ToJson());
    InkFunctions.bindAll(tempStory, this);
    return tempStory;
  }

  /**
   * Returns diagnostic information about the story state.
   * @returns {{currentTurnIndex: number, hasEnded: boolean, canContinue: boolean, hasChoices: boolean, currentPage: string|null, displayLength: number, specialPagesFound: number}}
   */
  getStats() {
    try {
      return {
        currentTurnIndex: this.story.state.currentTurnIndex,
        hasEnded: this.hasEnded(),
        canContinue: this.canContinue(),
        hasChoices: this.hasChoices(),
        currentPage: this.pages?.currentPage,
        displayLength: this.display?.getHistoryLength?.() || 0,
        specialPagesFound: Object.keys(this.pages?.availablePages || {}).length,
      };
    } catch (error) {
      log.warning("Failed to get stats", error);
      return {};
    }
  }

  /**
   * Returns information about available story features.
   * @returns {{availablePages: Object, hasGlobalTags: boolean, hasCurrentTags: boolean, specialPageCount: number}}
   */
  getFeatureInfo() {
    return {
      availablePages: { ...this.pages?.availablePages },
      hasGlobalTags: this.story.globalTags?.length > 0,
      hasCurrentTags: this.story.currentTags?.length > 0,
      specialPageCount: Object.keys(this.pages?.availablePages || {}).length,
    };
  }

  /**
   * Cleans up resources when the story manager is disposed.
   */
  cleanup() {
    try {
      this.saves?.cleanup?.();
      this.settings?.cleanup?.();
      this.pages?.reset?.();
    } catch (error) {
      log.warning("Failed to cleanup", error, "system");
    }
  }
}

export { StoryManager };
