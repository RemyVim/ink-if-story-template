class StoryController {
  constructor(storyContent) {
    this.story = new inkjs.Story(storyContent);
    this.savePoint = "";
    this.currentPage = null; // Track if we're in a special page

    // Track display history for saves
    this.displayHistory = [];

    // Get DOM elements
    this.storyContainer = document.querySelector("#story");
    this.outerScrollContainer = document.querySelector(".outerContainer");

    // Initialize modules
    this.domHelpers = new DOMHelpers(this.storyContainer);
    this.tagProcessor = new TagProcessor(
      this.storyContainer,
      this.outerScrollContainer,
    );
    this.themeManager = new ThemeManager();
    this.storyState = new StoryState();

    // Initialize settings manager
    this.settingsManager = new SettingsManager(
      this.themeManager,
      this.storyState,
    );

    this.init();
  }

  init() {
    // Process global tags and setup theme
    const globalTagTheme = this.tagProcessor.processGlobalTags(
      this.story.globalTags,
    );

    // Setup theme with settings integration
    this.themeManager.setup(globalTagTheme, this.settingsManager);

    // Initialize saves manager
    this.savesManager = new SavesManager(this, this.storyState);

    // Detect available special pages
    this.detectSpecialPages();

    // Setup buttons
    this.setupButtons();

    // Set initial save point
    this.savePoint = this.story.state.toJson();

    // Start the story
    this.continueStory(true);
  }

  // Detect which special knots exist in the story
  detectSpecialPages() {
    this.availablePages = {
      content_warnings: this.story.HasFunction("content_warnings"),
      about: this.story.HasFunction("about"),
      stats_page: this.story.HasFunction("stats_page"),
      inventory: this.story.HasFunction("inventory"),
      help: this.story.HasFunction("help"),
      credits: this.story.HasFunction("credits"),
    };

    // Hide nav buttons for pages that don't exist
    this.updateNavigation();
  }

  updateNavigation() {
    const navMappings = {
      "content-warnings": "content_warnings",
      "about-btn": "about",
      "stats-btn": "stats_page",
      "inventory-btn": "inventory",
      "help-btn": "help",
      credits: "credits",
    };

    for (const [buttonId, knotName] of Object.entries(navMappings)) {
      const button = document.getElementById(buttonId);
      if (button) {
        if (this.availablePages[knotName]) {
          button.style.display = "inline-block";
        } else {
          button.style.display = "none";
        }
      }
    }
  }

  // Create paragraph and track it in display history
  createParagraphWithHistory(text, customClasses = []) {
    const paragraphElement = this.domHelpers.createParagraph(
      text,
      customClasses,
    );

    // Track this content in display history
    this.displayHistory.push({
      type: "paragraph",
      content: text,
      classes: customClasses,
      timestamp: Date.now(),
    });

    return paragraphElement;
  }

  // Show a special page by evaluating its knot
  showSpecialPage(knotName) {
    if (!this.availablePages[knotName]) {
      console.warn(`Page "${knotName}" does not exist in the story`);
      return;
    }

    // Mark that we're in a special page
    this.currentPage = knotName;

    // Clear current content
    this.domHelpers.clearStoryContent();

    // Create a temporary story instance to evaluate the special page
    // This way we don't mess with the main story state
    const tempStory = new inkjs.Story(this.story.ToJson());
    tempStory.ChoosePathString(knotName);

    // Get the page content as separate paragraphs
    while (tempStory.canContinue) {
      const paragraphText = tempStory.Continue();

      // Skip empty paragraphs
      if (paragraphText.trim().length === 0) {
        continue;
      }

      // Process any tags in the page content
      const tags = tempStory.currentTags;
      const { customClasses } = this.tagProcessor.processLineTags(tags);

      // Create paragraphs (don't track special pages in history)
      const processedText = MarkdownProcessor.process(paragraphText);
      this.domHelpers.createParagraph(processedText, [
        "special-page",
        ...customClasses,
      ]);
    }

    // Add a return button
    this.addReturnButton();

    // Scroll to top
    this.domHelpers.scrollToTop(this.outerScrollContainer);
  }

  addReturnButton() {
    const returnButton = this.domHelpers.createChoice(
      "← Return to Story",
      ["return-button"],
      true,
    );
    this.domHelpers.addChoiceClickHandler(returnButton, () => {
      this.returnToStory();
    });
  }

  returnToStory() {
    if (!this.currentPage) return;

    // Restore to the proper save point (not the incomplete storyStateBeforePage)
    this.story.state.LoadJson(this.savePoint);
    this.storyStateBeforePage = null;
    this.currentPage = null;

    // Clear page content and regenerate from the save point
    this.domHelpers.clearStoryContent();

    // Use continueStory with firstTime=true to regenerate content properly
    this.continueStory(true);
  }

  continueStory(firstTime = false) {
    // Don't continue if we're viewing a special page
    if (this.currentPage) return;

    // Clear everything when starting a new section (except on very first load)
    if (!firstTime) {
      this.domHelpers.clearStoryContent();
      this.domHelpers.scrollToTop(this.outerScrollContainer);
      this.storyContainer.style.height = "";
      // Clear display history when starting fresh
      this.displayHistory = [];
    }

    // Generate story text - loop through available content
    while (this.story.canContinue) {
      const paragraphText = this.story.Continue();
      const tags = this.story.currentTags;

      // Skip empty paragraphs
      if (paragraphText.trim().length === 0) {
        continue;
      }

      // Process tags
      const { customClasses, specialActions } =
        this.tagProcessor.processLineTags(tags);

      // Handle special actions first
      let shouldRestart = false;
      let shouldClear = false;

      for (const action of specialActions) {
        const result = action();
        if (result === "RESTART") {
          shouldRestart = true;
        } else if (result === "CLEAR") {
          shouldClear = true;
        }
      }

      // Handle special tags
      if (shouldClear || shouldRestart) {
        this.domHelpers.clearStoryContent();
        this.domHelpers.setVisible(".header", false);
        this.displayHistory = []; // Clear history on clear/restart

        if (shouldRestart) {
          this.restart();
          return;
        }
      }

      // Create paragraph with processed markdown and track it
      const processedText = MarkdownProcessor.process(paragraphText);
      this.createParagraphWithHistory(processedText, customClasses);
    }

    // Create choices
    this.createChoices();
  }

  createChoices() {
    this.story.currentChoices.forEach((choice) => {
      const { customClasses, isClickable } =
        this.tagProcessor.processChoiceTags(choice.tags);

      const choiceElement = this.domHelpers.createChoice(
        choice.text,
        customClasses,
        isClickable,
      );

      if (isClickable) {
        this.domHelpers.addChoiceClickHandler(choiceElement, () => {
          this.selectChoice(choice.index);
        });
      }
    });
  }

  selectChoice(choiceIndex) {
    // Remove all existing choices
    this.domHelpers.removeAll(".choice");

    // Tell the story where to go next
    this.story.ChooseChoiceIndex(choiceIndex);

    // Update save point
    this.savePoint = this.story.state.toJson();

    // Continue the story FIRST - this generates new content and choices
    this.continueStory();

    // THEN auto-save if enabled - now it captures the complete state with choices
    if (this.settingsManager.getSetting("autoSave")) {
      // Update save point again to include the new content
      this.savePoint = this.story.state.toJson();
      this.savesManager.autosave();
    }
  }

  restart() {
    this.story.ResetState();
    this.currentPage = null;
    this.storyStateBeforePage = null;
    this.displayHistory = []; // Clear display history
    this.domHelpers.setVisible(".header", true);
    this.savePoint = this.story.state.toJson();
    this.continueStory(true);
    this.domHelpers.scrollToTop(this.outerScrollContainer);
  }

  // Get current display state for saving
  getCurrentDisplayState() {
    return {
      history: [...this.displayHistory], // Copy the array
      currentPage: this.currentPage,
    };
  }

  // Restore display state from save
  restoreDisplayState(displayState) {
    this.displayHistory = displayState.history || [];
    this.currentPage = displayState.currentPage || null;

    // Clear and rebuild the display
    this.domHelpers.clearStoryContent();

    // Recreate all the paragraphs from history
    for (const item of this.displayHistory) {
      if (item.type === "paragraph") {
        this.domHelpers.createParagraph(item.content, item.classes || []);
      }
    }
  }

  // Clear display history
  clearDisplayHistory() {
    this.displayHistory = [];
  }

  setupButtons() {
    // Restart button
    const rewindEl = document.getElementById("rewind");
    if (rewindEl) {
      rewindEl.addEventListener("click", () => {
        this.domHelpers.clearStoryContent();
        this.domHelpers.setVisible(".header", false);
        this.restart();
      });
    }

    // Note: Save/Load buttons are now handled by SavesManager

    // Special page buttons
    this.setupSpecialPageButtons();
  }

  setupSpecialPageButtons() {
    const pageButtons = {
      "content-warnings": "content_warnings",
      "about-btn": "about",
      "stats-btn": "stats_page",
      "inventory-btn": "inventory",
      "help-btn": "help",
      credits: "credits",
    };

    for (const [buttonId, knotName] of Object.entries(pageButtons)) {
      const button = document.getElementById(buttonId);
      if (button && this.availablePages[knotName]) {
        button.addEventListener("click", (e) => {
          e.preventDefault();
          this.showSpecialPage(knotName);
        });
      }
    }
  }
}
