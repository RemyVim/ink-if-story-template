// Enhanced Story Controller with knot-based pages
class StoryController {
  constructor(storyContent) {
    this.story = new inkjs.Story(storyContent);
    this.savePoint = "";
    this.currentPage = null; // Track if we're in a special page

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

    this.init();
  }

  init() {
    // Process global tags and setup theme
    const globalTagTheme = this.tagProcessor.processGlobalTags(
      this.story.globalTags,
    );
    this.themeManager.setup(globalTagTheme);

    // Detect available special pages
    this.detectSpecialPages();

    // Setup save/load state
    const hasSave = this.loadFromSave();
    this.setupButtons(hasSave);

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

      // Create paragraphs
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

        if (shouldRestart) {
          this.restart();
          return;
        }
      }

      // Create paragraph with processed markdown
      const processedText = MarkdownProcessor.process(paragraphText);
      this.domHelpers.createParagraph(processedText, customClasses);
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

    // Continue the story
    this.continueStory();
  }

  restart() {
    this.story.ResetState();
    this.currentPage = null;
    this.storyStateBeforePage = null;
    this.domHelpers.setVisible(".header", true);
    this.savePoint = this.story.state.toJson();
    this.continueStory(true);
    this.domHelpers.scrollToTop(this.outerScrollContainer);
  }

  saveGame() {
    // Only save main story state, not special pages
    const stateToSave = this.currentPage
      ? this.storyStateBeforePage
      : this.savePoint;
    const success = this.storyState.save(stateToSave);
    if (success) {
      document.getElementById("reload").removeAttribute("disabled");
    }
    return success;
  }

  loadFromSave() {
    const savedState = this.storyState.load();
    if (savedState) {
      this.story.state.LoadJson(savedState);
      return true;
    }
    return false;
  }

  setupButtons(hasSave) {
    // Restart button
    const rewindEl = document.getElementById("rewind");
    if (rewindEl) {
      rewindEl.addEventListener("click", () => {
        this.domHelpers.clearStoryContent();
        this.domHelpers.setVisible(".header", false);
        this.restart();
      });
    }

    // Save button
    const saveEl = document.getElementById("save");
    if (saveEl) {
      saveEl.addEventListener("click", () => {
        this.saveGame();
      });
    }

    // Load button
    const reloadEl = document.getElementById("reload");
    if (!hasSave) {
      reloadEl.setAttribute("disabled", "disabled");
    }
    reloadEl.addEventListener("click", () => {
      if (reloadEl.getAttribute("disabled")) return;

      this.domHelpers.clearStoryContent();
      const savedState = this.storyState.load();
      if (savedState) {
        this.story.state.LoadJson(savedState);
      }
      this.continueStory(true);
    });

    // Theme switch button
    const themeSwitchEl = document.getElementById("theme-switch");
    if (themeSwitchEl) {
      themeSwitchEl.addEventListener("click", () => {
        this.themeManager.toggle();
      });
    }

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
