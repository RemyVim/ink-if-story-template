// Main story controller that orchestrates everything
class StoryController {
  constructor(storyContent) {
    // Initialize story
    this.story = new inkjs.Story(storyContent);
    this.savePoint = "";

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

    // Setup save/load state
    const hasSave = this.loadFromSave();
    this.setupButtons(hasSave);

    // Set initial save point
    this.savePoint = this.story.state.toJson();

    // Start the story
    this.continueStory(true);
  }

  continueStory(firstTime = false) {
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
    this.domHelpers.setVisible(".header", true);
    this.savePoint = this.story.state.toJson();
    this.continueStory(true);
    this.domHelpers.scrollToTop(this.outerScrollContainer);
  }

  saveGame() {
    const success = this.storyState.save(this.savePoint);
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
  }
}
