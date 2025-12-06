// story-manager.js
class StoryManager {
  static errorSource = ErrorManager.SOURCES.STORY_MANAGER;

  constructor(storyContent) {
    try {
      this.story = new inkjs.Story(storyContent);
      InkFunctions.bindAll(this.story);
      this.savePoint = "";
      this.currentPage = null;
      this.availablePages = {};
      this.pageMenuOrder = null;

      // Get tag constants from registry
      const { TAGS } = window.TagRegistry || {};

      this.initializeSubsystems();
      this.detectSpecialPages();
      this.setupInitialState();
    } catch (error) {
      StoryManager._critical("Failed to initialize story", error);
      throw error;
    }
  }

  static _error(message, error = null) {
    window.errorManager.error(message, error, StoryManager.errorSource);
  }

  static _warning(message, error = null) {
    window.errorManager.warning(message, error, StoryManager.errorSource);
  }

  static _critical(message, error = null) {
    window.errorManager.critical(message, error, StoryManager.errorSource);
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
      StoryManager._error(`Failed to initialize ${componentName}`, error);
      return null;
    }
  }

  /**
   * Create a temporary story instance with external functions bound
   * @returns {Story} A new story instance with functions bound
   */
  createTempStory() {
    const tempStory = new inkjs.Story(this.story.ToJson());
    InkFunctions.bindAll(tempStory);
    return tempStory;
  }

  detectSpecialPages() {
    this.availablePages = {};

    try {
      // Get all named content from the main container
      const namedContent = this.story.mainContentContainer.namedContent;

      for (let [knotName, knotContent] of namedContent) {
        try {
          // Check if this knot is marked as a special page and get its display name
          const pageInfo = this.getSpecialPageInfo(knotName);
          if (pageInfo) {
            // Store both the display name and knot name
            this.availablePages[knotName] = {
              displayName: pageInfo.displayName,
              knotName: knotName,
              isSpecialPage: true,
            };
          }
        } catch (error) {
          StoryManager._warning(
            `Failed to check if ${knotName} is special page`,
            error,
          );
        }
      }
    } catch (error) {
      StoryManager._error("Failed to detect special pages", error);
    }
  }

  getSpecialPageInfo(knotName) {
    const { TAGS, getTagDef } = window.TagRegistry || {};
    if (!TAGS || !getTagDef) return null;

    try {
      const tempStory = this.createTempStory();
      tempStory.ChoosePathString(knotName);

      if (tempStory.canContinue) {
        tempStory.Continue();

        const tags = tempStory.currentTags || [];

        for (const tag of tags) {
          if (typeof tag !== "string") continue;

          const { tagDef, tagValue } = TagRegistry.parseTag(tag);

          if (tagDef === TAGS.SPECIAL_PAGE) {
            return {
              displayName: tagValue?.trim() || this.formatKnotName(knotName),
              isSpecialPage: true,
            };
          }
        }
      }
      return null;
    } catch (error) {
      // If we can't navigate to it, it's not a valid knot
      return null;
    }
  }

  // Check if a knot is marked as a special page
  isSpecialPage(knotName) {
    return this.getSpecialPageInfo(knotName) !== null;
  }

  formatKnotName(knotName) {
    return knotName
      .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase to words
      .replace(/_/g, " ") // snake_case to words
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  setupInitialState() {
    try {
      // Process global tags for theme, metadata, and menu order
      this.settings?.processGlobalTags?.(this.story.globalTags);
      this.processMenuOrderTag(this.story.globalTags);

      // Update navigation based on available special pages
      this.navigation?.updateVisibility?.(
        this.availablePages,
        this.pageMenuOrder,
      );

      // Set initial save point and start
      this.savePoint = this.story.state.ToJson();
      this.continue(true);
    } catch (error) {
      StoryManager._error("Failed to setup initial state", error);
    }
  }

  processMenuOrderTag(globalTags) {
    if (!Array.isArray(globalTags)) return;

    for (const tag of globalTags) {
      if (typeof tag !== "string") continue;

      const colonIndex = tag.indexOf(":");
      if (colonIndex === -1) continue;

      const property = tag.substring(0, colonIndex).trim().toUpperCase();
      const value = tag.substring(colonIndex + 1).trim();

      if (getTagDef(property) === TAGS.PAGE_MENU) {
        this.pageMenuOrder = this.parseMenuOrder(value);
        break;
      }
    }
  }

  parseMenuOrder(menuString) {
    // Parse format: "page1, page2,, page3, page4"
    // Double commas (,,) separate sections, single commas separate items within sections
    const sections = menuString.split(",,").map((s) => s.trim());
    const menuOrder = [];

    sections.forEach((section, sectionIndex) => {
      const pages = section
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p);

      pages.forEach((pageName) => {
        // Check if this page exists in availablePages
        if (this.availablePages[pageName]) {
          menuOrder.push({
            knotName: pageName,
            section: sectionIndex,
          });
        } else {
          console.warn(
            `Page '${pageName}' in PAGE_MENU not found in special pages`,
          );
        }
      });
    });

    return menuOrder.length > 0 ? menuOrder : null;
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
      const {
        content: storyContent,
        stoppedForUserInput,
        stateBeforeUserInput,
      } = this.generateContent();

      // Render content if any was generated
      if (storyContent.length > 0) {
        this.display?.render?.(storyContent);
      }

      // Store state for user input restoration
      if (stoppedForUserInput && stateBeforeUserInput) {
        this.stateBeforeUserInput = stateBeforeUserInput;
      }

      // Only generate choices if we didn't stop for user input
      if (!stoppedForUserInput) {
        this.createChoices();
      }

      // Update save point after generating new content
      this.savePoint = this.story.state.ToJson();
    } catch (error) {
      StoryManager._error("Failed to continue story", error);
    }
  }

  continueWithoutClearing() {
    try {
      // Don't continue if viewing a special page
      if (this.currentPage) return;

      // Generate story content without clearing display
      const { content: storyContent } = this.generateContent(); // Destructure here

      // Render content if any was generated
      if (storyContent.length > 0) {
        this.display?.render?.(storyContent);
      }

      // Generate and render choices
      this.createChoices();

      // Update save point after generating new content
      this.savePoint = this.story.state.ToJson();
    } catch (error) {
      StoryManager._error("Failed to continue story without clearing", error);
    }
  }

  generateContent() {
    const content = [];
    let stoppedForUserInput = false;

    // Save state once at start — used to replay after user input
    const stateAtStart = this.story.state.ToJson();

    try {
      while (this.story.canContinue) {
        const text = this.story.Continue();
        const tags = this.story.currentTags || [];

        // Skip empty paragraphs
        if (text.trim().length === 0 && tags.length === 0) continue;

        // Process normal content
        const processedContent = this.contentProcessor?.process?.(text, tags);
        if (processedContent) {
          // Handle both single items and arrays
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

        // Handle other special actions
        if (processedContent?.hasSpecialAction) {
          const shouldContinue = this.handleSpecialAction(
            processedContent.action,
          );
          if (!shouldContinue) {
            break;
          }
        }
      }
    } catch (error) {
      StoryManager._error("Error generating story content", error);
    }

    return {
      content,
      stoppedForUserInput,
      stateBeforeUserInput: stoppedForUserInput ? stateAtStart : null,
    };
  }

  handleSpecialAction(actionResult) {
    try {
      if (typeof actionResult === "string") {
        // Handle existing string actions (CLEAR, RESTART)
        switch (actionResult) {
          case "CLEAR":
            this.display?.clear?.();
            this.display?.hideHeader?.();
            return true;
          case "RESTART":
            this.confirmRestart();
            return false;
          default:
            return true;
        }
      }
      return true;
    } catch (error) {
      StoryManager._error("Failed to handle special action", error);
      return true;
    }
  }

  createChoices() {
    try {
      if (this.story.currentChoices?.length > 0) {
        const choices = this.choices?.generate?.(this.story.currentChoices);
        if (choices) {
          // Always include hints in HTML - CSS handles visibility via container class
          // TODO: Fix this to remove unused parameter
          this.display?.renderChoices?.(choices, true);
        }
      }
    } catch (error) {
      StoryManager._error("Failed to create choices", error, "choices");
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
      StoryManager._error("Failed to select choice", error, "navigation");
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
      StoryManager._error("Failed to restart story", error);
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
      StoryManager._error("Failed to get current state", error);
      return {};
    }
  }

  loadState(state) {
    try {
      if (!state?.gameState) {
        throw new Error("Invalid save state");
      }

      // Test the state first
      const testStory = this.createTempStory();
      testStory.state.LoadJson(state.gameState);

      // Apply to real story
      this.story.state.LoadJson(state.gameState);
      this.currentPage = state.currentPage || null;
      this.savePoint = state.savePoint || this.story.state.ToJson();

      this.pages?.reset?.();

      // Restore stateBeforeUserInput if it was saved
      this.stateBeforeUserInput = state.stateBeforeUserInput || null;

      let hasUserInput = false;

      if (state.displayState) {
        this.display?.restoreState?.(state.displayState);

        // Check if the restored state has a pending user-input
        hasUserInput = state.displayState.history?.some(
          (item) => item.type === "user-input",
        );
      } else {
        this.display?.clear?.();
        this.regenerateCurrentDisplay();
      }

      // Only create choices if there's no pending user input
      if (!hasUserInput) {
        this.createChoices();
      }

      this.display?.scrollToTop?.();
    } catch (error) {
      StoryManager._error("Failed to load state", error, "save-system");
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
      StoryManager._error("Failed to regenerate display", error, "display");
    }
  }

  canContinue() {
    try {
      return this.story.canContinue;
    } catch (error) {
      StoryManager._warning("Failed to check canContinue", error);
      return false;
    }
  }

  hasChoices() {
    try {
      return this.story.currentChoices?.length > 0;
    } catch (error) {
      StoryManager._warning("Failed to check hasChoices", error);
      return false;
    }
  }

  hasEnded() {
    return !this.canContinue() && !this.hasChoices();
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
      StoryManager._warning("Failed to get stats", error);
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
      StoryManager._warning("Failed to cleanup", error, "system");
    }
  }
}
