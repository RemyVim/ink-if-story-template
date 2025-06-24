// story-manager.js
class StoryManager {
  constructor(storyContent) {
    try {
      this.story = new inkjs.Story(storyContent);
      this.savePoint = "";
      this.currentPage = null;
      this.availablePages = {};

      this.initializeSubsystems();
      this.detectSpecialPages(); // Changed from detectFeatures
      this.setupInitialState();
    } catch (error) {
      window.errorManager.critical(
        "Failed to initialize story",
        error,
        "story",
      );
      throw error;
    }
  }

  initializeSubsystems() {
    // Core display and interaction systems with lite error handling
    this.display = this.safeInit(() => new DisplayManager(), "display");
    this.contentProcessor = this.safeInit(
      () => new ContentProcessor(),
      "content",
    );
    this.settings = this.safeInit(() => new SettingsManager(), "settings");
    this.pages = this.safeInit(() => new PageManager(this), "pages");
    this.choices = this.safeInit(() => new ChoiceManager(this), "choices");
    this.navigation = this.safeInit(
      () => new NavigationManager(this),
      "navigation",
    );
    this.saves = this.safeInit(() => new SaveSystem(this), "saves");

    // Check if critical systems failed to initialize
    if (!this.display || !this.story) {
      throw new Error("Critical systems failed to initialize");
    }
  }

  safeInit(initFunc, componentName) {
    try {
      return initFunc();
    } catch (error) {
      window.errorManager.error(
        `Failed to initialize ${componentName}`,
        error,
        "story",
      );
      return null;
    }
  }

  // New method to detect special pages by scanning for SPECIAL_PAGE tag
  detectSpecialPages() {
    this.availablePages = {};

    try {
      // Get all named content from the main container
      const namedContent = this.story.mainContentContainer.namedContent;

      for (let [knotName, knotContent] of namedContent) {
        try {
          // Check if this knot is marked as a special page
          if (this.isSpecialPage(knotName)) {
            this.availablePages[knotName] = true;
          }
        } catch (error) {
          window.errorManager.warning(
            `Failed to check if ${knotName} is special page`,
            error,
            "story",
          );
        }
      }

      console.log(
        `Found ${Object.keys(this.availablePages).length} special pages:`,
        Object.keys(this.availablePages),
      );
    } catch (error) {
      window.errorManager.error(
        "Failed to detect special pages",
        error,
        "story",
      );
    }
  }

  // Check if a knot is marked as a special page
  isSpecialPage(knotName) {
    try {
      // Create a temporary story to test the knot
      const tempStory = new inkjs.Story(this.story.ToJson());

      // Try to navigate to the knot
      tempStory.ChoosePathString(knotName);

      // Check the first line for SPECIAL_PAGE tag
      if (tempStory.canContinue) {
        tempStory.Continue();
        const tags = tempStory.currentTags || [];

        // Look for SPECIAL_PAGE tag
        for (let tag of tags) {
          if (tag.trim().toUpperCase() === "SPECIAL_PAGE") {
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      // If we can't navigate to it, it's not a valid knot
      return false;
    }
  }

  setupInitialState() {
    try {
      // Process global tags for theme and metadata
      this.settings?.processGlobalTags?.(this.story.globalTags);

      // Update navigation based on available special pages
      this.navigation?.updateVisibility?.(this.availablePages);

      // Set initial save point and start
      this.savePoint = this.story.state.ToJson();
      this.continue(true);
    } catch (error) {
      window.errorManager.error(
        "Failed to setup initial state",
        error,
        "story",
      );
    }
  }

  continue(isFirstTime = false) {
    try {
      // Don't continue if viewing a special page
      if (this.currentPage) return;

      if (!isFirstTime) {
        this.display?.clear?.();
        this.display?.scrollToTop?.();
      }

      // Generate story content
      const storyContent = this.generateContent();

      // Render content if any was generated
      if (storyContent.length > 0) {
        this.display?.render?.(storyContent);
      }

      // Generate and render choices
      this.createChoices();

      // Update save point after generating new content
      this.savePoint = this.story.state.ToJson();
    } catch (error) {
      window.errorManager.error("Failed to continue story", error, "story");
    }
  }

  generateContent() {
    const content = [];

    try {
      while (this.story.canContinue) {
        const text = this.story.Continue();
        const tags = this.story.currentTags || [];

        // Skip empty paragraphs
        if (text.trim().length === 0) continue;

        // Process content with tags
        const processedContent = this.contentProcessor?.process?.(text, tags);

        // Handle special actions
        if (processedContent?.hasSpecialAction) {
          const shouldContinue = this.handleSpecialAction(
            processedContent.action,
          );
          if (!shouldContinue) {
            break; // Stop processing if restart was triggered
          }
        }

        if (processedContent) {
          content.push(processedContent);
        }
      }
    } catch (error) {
      window.errorManager.error(
        "Error generating story content",
        error,
        "story",
      );
      // Return what we have so far
    }

    return content;
  }

  handleSpecialAction(action) {
    try {
      switch (action) {
        case "CLEAR":
          this.display?.clear?.();
          this.display?.hideHeader?.();
          return true; // Continue processing

        case "RESTART":
          this.restart();
          return false; // Stop processing

        default:
          return true; // Continue processing
      }
    } catch (error) {
      window.errorManager.error(
        "Failed to handle special action",
        error,
        "story",
      );
      return true;
    }
  }

  createChoices() {
    try {
      if (this.story.currentChoices?.length > 0) {
        const choices = this.choices?.generate?.(this.story.currentChoices);
        if (choices) {
          this.display?.renderChoices?.(choices);
        }
      }
    } catch (error) {
      window.errorManager.error("Failed to create choices", error, "choices");
    }
  }

  selectChoice(choiceIndex) {
    try {
      // Validate choice index
      if (
        typeof choiceIndex !== "number" ||
        choiceIndex < 0 ||
        choiceIndex >= this.story.currentChoices.length
      ) {
        throw new Error(`Invalid choice index: ${choiceIndex}`);
      }

      // Remove existing choices from display
      this.display?.container
        ?.querySelectorAll?.(".choice")
        .forEach((choice) => {
          choice.remove();
        });

      // Tell the story where to go next
      this.story.ChooseChoiceIndex(choiceIndex);

      // Update save point before continuing
      this.savePoint = this.story.state.ToJson();

      // Continue the story
      this.continue();

      // Auto-save if enabled
      this.saves?.autosave?.();
    } catch (error) {
      window.errorManager.error("Failed to select choice", error, "navigation");
    }
  }

  restart() {
    try {
      this.story.ResetState();
      this.currentPage = null;
      this.display?.reset?.();

      // Reset page manager state
      this.pages?.reset?.();

      this.savePoint = this.story.state.ToJson();
      this.continue(true);
      this.display?.scrollToTop?.();

      // Show restart notification
      window.notificationManager?.success?.(
        "Story restarted from the beginning",
      );
    } catch (error) {
      window.errorManager.error("Failed to restart story", error, "story");
    }
  }

  getCurrentState() {
    try {
      return {
        gameState: this.story.state.ToJson(),
        displayState: this.display?.getState?.() || null,
        currentPage: this.currentPage,
        savePoint: this.savePoint,
        timestamp: Date.now(),
      };
    } catch (error) {
      window.errorManager.error("Failed to get current state", error, "story");
      return {};
    }
  }

  loadState(state) {
    try {
      if (!state?.gameState) {
        throw new Error("Invalid save state");
      }

      // Test the state first
      const testStory = new inkjs.Story(this.story.ToJson());
      testStory.state.LoadJson(state.gameState);

      // Apply to real story
      this.story.state.LoadJson(state.gameState);
      this.currentPage = state.currentPage || null;
      this.savePoint = state.savePoint || this.story.state.ToJson();

      this.pages?.reset?.();

      if (state.displayState) {
        this.display?.restoreState?.(state.displayState);
      } else {
        this.display?.clear?.();
        this.regenerateCurrentDisplay();
      }

      this.createChoices();
      this.display?.scrollToTop?.();
    } catch (error) {
      window.errorManager.error("Failed to load state", error, "save-system");
    }
  }

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
      window.errorManager.error(
        "Failed to regenerate display",
        error,
        "display",
      );
    }
  }

  canContinue() {
    try {
      return this.story.canContinue;
    } catch (error) {
      window.errorManager.warning(
        "Failed to check canContinue",
        error,
        "story",
      );
      return false;
    }
  }

  hasChoices() {
    try {
      return this.story.currentChoices?.length > 0;
    } catch (error) {
      window.errorManager.warning("Failed to check hasChoices", error, "story");
      return false;
    }
  }

  hasEnded() {
    return !this.canContinue() && !this.hasChoices();
  }

  getStats() {
    try {
      return {
        currentTurnIndex: this.story.state.currentTurnIndex,
        hasEnded: this.hasEnded(),
        canContinue: this.canContinue(),
        hasChoices: this.hasChoices(),
        currentPage: this.currentPage,
        displayLength: this.display?.getHistoryLength?.() || 0,
        specialPagesFound: Object.keys(this.availablePages).length,
      };
    } catch (error) {
      window.errorManager.warning("Failed to get stats", error, "story");
      return {};
    }
  }

  getFeatureInfo() {
    return {
      availablePages: { ...this.availablePages },
      hasGlobalTags: this.story.globalTags?.length > 0,
      hasCurrentTags: this.story.currentTags?.length > 0,
      specialPageCount: Object.keys(this.availablePages).length,
    };
  }

  cleanup() {
    try {
      this.saves?.cleanup?.();
      this.settings?.cleanup?.();
      this.pages?.reset?.();
    } catch (error) {
      window.errorManager.warning("Failed to cleanup", error, "system");
    }
  }
}
