// story-manager.js
// Main story orchestration class - coordinates all subsystems

class StoryManager {
  constructor(storyContent) {
    this.story = new inkjs.Story(storyContent);
    this.savePoint = "";
    this.currentPage = null;
    this.availablePages = {};

    this.initializeSubsystems();
    this.detectFeatures();
    this.setupInitialState();
  }

  /**
   * Initialize all subsystem managers
   */
  initializeSubsystems() {
    // Core display and interaction systems
    this.display = new DisplayManager();
    this.contentProcessor = new ContentProcessor();

    // Settings and theme (initialize early since other systems depend on them)
    this.settings = new SettingsManager(new ThemeManager(), new StoryState());

    // Navigation and pages
    this.navigation = new NavigationManager(this);
    this.pages = new PageManager(this);
    this.choices = new ChoiceManager(this);

    // Save system
    this.saves = new SaveManager(this);
  }

  /**
   * Detect which special features/pages are available in the story
   */
  detectFeatures() {
    this.availablePages = {
      content_warnings: this.story.HasFunction("content_warnings"),
      about: this.story.HasFunction("about"),
      stats_page: this.story.HasFunction("stats_page"),
      inventory: this.story.HasFunction("inventory"),
      help: this.story.HasFunction("help"),
      credits: this.story.HasFunction("credits"),
    };
  }

  /**
   * Setup initial application state
   */
  setupInitialState() {
    // Process global tags for theme and metadata
    const globalTagTheme = this.contentProcessor.processGlobalTags(
      this.story.globalTags,
    );

    // Setup theme (this is handled by settings manager now)
    // Update navigation based on available features
    this.navigation.updateVisibility(this.availablePages);

    // Set initial save point and start
    this.savePoint = this.story.state.toJson();
    this.continue(true);
  }

  /**
   * Continue the story, generating new content and choices
   * @param {boolean} isFirstTime - Whether this is the initial story start
   */
  continue(isFirstTime = false) {
    // Don't continue if viewing a special page
    if (this.currentPage) return;

    if (!isFirstTime) {
      this.display.clear();
      this.display.scrollToTop();
    }

    // Generate story content
    const storyContent = this.generateContent();

    // Render content if any was generated
    if (storyContent.length > 0) {
      this.display.render(storyContent);
    }

    // Generate and render choices
    this.createChoices();
  }

  /**
   * Generate content from the current story state
   * @returns {Array} Array of content objects
   */
  generateContent() {
    const content = [];

    while (this.story.canContinue) {
      const text = this.story.Continue();
      const tags = this.story.currentTags || [];

      // Skip empty paragraphs
      if (text.trim().length === 0) continue;

      // Process content with tags
      const processedContent = this.contentProcessor.process(text, tags);

      // Handle special actions
      if (processedContent.hasSpecialAction) {
        const shouldContinue = this.handleSpecialAction(
          processedContent.action,
        );
        if (!shouldContinue) {
          break; // Stop processing if restart was triggered
        }
      }

      content.push(processedContent);
    }

    return content;
  }

  /**
   * Handle special actions like CLEAR and RESTART
   * @param {string} action - The special action to handle
   * @returns {boolean} Whether to continue processing content
   */
  handleSpecialAction(action) {
    switch (action) {
      case "CLEAR":
        this.display.clear();
        this.display.hideHeader();
        return true; // Continue processing

      case "RESTART":
        this.restart();
        return false; // Stop processing

      default:
        return true; // Continue processing
    }
  }

  /**
   * Create and render choices from the current story state
   */
  createChoices() {
    if (this.story.currentChoices && this.story.currentChoices.length > 0) {
      const choices = this.choices.generate(this.story.currentChoices);
      this.display.renderChoices(choices);
    }
  }

  /**
   * Handle choice selection
   * @param {number} choiceIndex - Index of the selected choice
   */
  selectChoice(choiceIndex) {
    // Remove existing choices from display
    this.display.container.querySelectorAll(".choice").forEach((choice) => {
      choice.remove();
    });

    // Tell the story where to go next
    this.story.ChooseChoiceIndex(choiceIndex);

    // Update save point
    this.savePoint = this.story.state.toJson();

    // Continue the story
    this.continue();

    // Auto-save if enabled
    this.saves.autosave();
  }

  /**
   * Restart the story from the beginning
   */
  restart() {
    this.story.ResetState();
    this.currentPage = null;
    this.display.reset();
    this.savePoint = this.story.state.toJson();
    this.continue(true);
    this.display.scrollToTop();
  }

  /**
   * Get the current complete state for saving
   * @returns {Object} Current state object
   */
  getCurrentState() {
    return {
      gameState: this.story.state.toJson(),
      displayState: this.display.getState(),
      currentPage: this.currentPage,
      savePoint: this.savePoint,
      timestamp: Date.now(),
    };
  }

  /**
   * Load a previously saved state
   * @param {Object} state - State object to load
   */
  loadState(state) {
    try {
      // Load game state
      this.story.state.LoadJson(state.gameState);

      // Restore other state
      this.currentPage = state.currentPage || null;
      this.savePoint = state.savePoint || this.story.state.toJson();

      // Restore display if available
      if (state.displayState) {
        this.display.restoreState(state.displayState);
      } else {
        // Fallback for older saves
        this.display.clear();
        this.regenerateCurrentDisplay();
      }

      // Regenerate choices
      this.createChoices();

      // Scroll to top
      this.display.scrollToTop();
    } catch (error) {
      console.error("Failed to load state:", error);
      throw error;
    }
  }

  /**
   * Regenerate display from current story state (fallback for old saves)
   */
  regenerateCurrentDisplay() {
    const currentText = this.story.state.currentText;

    if (currentText && currentText.trim().length > 0) {
      const content = [
        {
          text: currentText,
          classes: [],
        },
      ];
      this.display.render(content);
    }
  }

  /**
   * Check if the story can continue
   * @returns {boolean} True if the story can continue
   */
  canContinue() {
    return this.story.canContinue;
  }

  /**
   * Check if there are choices available
   * @returns {boolean} True if choices are available
   */
  hasChoices() {
    return this.story.currentChoices && this.story.currentChoices.length > 0;
  }

  /**
   * Check if the story has ended
   * @returns {boolean} True if the story has ended
   */
  hasEnded() {
    return !this.canContinue() && !this.hasChoices();
  }

  /**
   * Get current story statistics
   * @returns {Object} Story statistics
   */
  getStats() {
    return {
      currentTurnIndex: this.story.state.currentTurnIndex,
      hasEnded: this.hasEnded(),
      canContinue: this.canContinue(),
      hasChoices: this.hasChoices(),
      currentPage: this.currentPage,
      displayLength: this.display.getHistoryLength(),
    };
  }

  /**
   * Get information about available features
   * @returns {Object} Available features information
   */
  getFeatureInfo() {
    return {
      availablePages: { ...this.availablePages },
      hasGlobalTags: this.story.globalTags && this.story.globalTags.length > 0,
      hasCurrentTags:
        this.story.currentTags && this.story.currentTags.length > 0,
    };
  }

  /**
   * Cleanup resources (call when disposing of the story manager)
   */
  cleanup() {
    // Clean up any resources, event listeners, etc.
    if (this.saves) {
      this.saves.cleanup && this.saves.cleanup();
    }

    if (this.settings) {
      this.settings.cleanup && this.settings.cleanup();
    }
  }
}
