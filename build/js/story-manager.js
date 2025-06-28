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
          window.errorManager.warning(
            `Failed to check if ${knotName} is special page`,
            error,
            "story",
          );
        }
      }

      console.log(
        `Found ${Object.keys(this.availablePages).length} special pages:`,
        Object.keys(this.availablePages).map(
          (knotName) =>
            `${this.availablePages[knotName].displayName} (${knotName})`,
        ),
      );
    } catch (error) {
      window.errorManager.error(
        "Failed to detect special pages",
        error,
        "story",
      );
    }
  }

  getSpecialPageInfo(knotName) {
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
          const trimmedTag = tag.trim();

          // Check for SPECIAL_PAGE with colon syntax: "SPECIAL_PAGE: Display Name"
          if (trimmedTag.toUpperCase().startsWith("SPECIAL_PAGE:")) {
            const displayName = trimmedTag.substring(13).trim(); // Remove "SPECIAL_PAGE:" prefix
            return {
              displayName: displayName || this.formatKnotName(knotName), // Fallback to formatted knot name
              isSpecialPage: true,
            };
          }
          // Check for legacy simple SPECIAL_PAGE tag
          else if (trimmedTag.toUpperCase() === "SPECIAL_PAGE") {
            return {
              displayName: this.formatKnotName(knotName), // Use formatted knot name as fallback
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
      const { content: storyContent, stoppedForUserInput } =
        this.generateContent();

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
      window.errorManager.error(
        "Failed to continue story without clearing",
        error,
        "story",
      );
    }
  }

  generateContent() {
    const content = [];
    let stoppedForUserInput = false;

    try {
      while (this.story.canContinue) {
        const text = this.story.Continue();
        const tags = this.story.currentTags || [];

        // Check for USER_INPUT tag FIRST, before skipping empty lines
        const hasUserInput = tags.some(
          (tag) =>
            tag.trim().toUpperCase().startsWith("USER_INPUT:") ||
            tag.trim().toUpperCase().startsWith("INPUT:"),
        );

        // If this line has USER_INPUT, process it and stop
        if (hasUserInput) {
          // Pass the text as placeholder
          const processedContent = this.contentProcessor?.process?.(text, tags);
          if (processedContent) {
            // Add the placeholder text to the content object
            processedContent.placeholderText = text.trim();
            content.push(processedContent);
          }
          stoppedForUserInput = true;
          break;
        }

        // Skip empty paragraphs (but only after checking for USER_INPUT)
        if (text.trim().length === 0) continue;

        // Process normal content
        const processedContent = this.contentProcessor?.process?.(text, tags);
        if (processedContent) {
          content.push(processedContent);
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
      window.errorManager.error(
        "Error generating story content",
        error,
        "story",
      );
    }

    return { content, stoppedForUserInput };
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
            this.restart();
            return false;
          default:
            return true;
        }
      }
      return true;
    } catch (error) {
      window.errorManager.error(
        "Failed to handle special action",
        error,
        "story",
      );
      return true;
    }
  }

  requestUserInput(variableName) {
    if (!variableName || typeof variableName !== "string") {
      window.errorManager.error(
        "Invalid variable name for user input",
        null,
        "story",
      );
      return;
    }

    // Create inline input element
    const inputContainer = document.createElement("div");
    inputContainer.className = "user-input-inline-container";
    inputContainer.innerHTML = `
    <div class="user-input-prompt">
      <input type="text" class="user-input-inline-field" 
             placeholder="Type your answer here..." 
             maxlength="100" autocomplete="off">
      <button class="user-input-submit-btn">Submit</button>
    </div>
    <div class="user-input-help">Press Enter or click Submit to continue</div>
  `;

    // Add to story container
    if (this.display?.container) {
      this.display.container.appendChild(inputContainer);

      const inputField = inputContainer.querySelector(
        ".user-input-inline-field",
      );
      const submitBtn = inputContainer.querySelector(".user-input-submit-btn");

      // Focus the input
      inputField.focus();

      // Handle submission
      const submitInput = () => {
        const userInput = inputField.value.trim();

        if (!userInput) {
          // Show validation error
          inputField.style.borderColor = "var(--color-important)";
          inputField.placeholder = "Please enter a value...";
          inputField.focus();
          return;
        }

        try {
          // Set the Ink variable
          this.story.variablesState.$(variableName, userInput);

          // Remove input container
          inputContainer.remove();

          // Add user's input as story text
          const responseElement = document.createElement("p");
          responseElement.className = "user-input-response";
          responseElement.textContent = userInput;
          this.display.container.appendChild(responseElement);

          // Continue the story
          this.continue();

          // Show success notification (optional)
          window.notificationManager?.success(
            `Set ${variableName} to: ${userInput}`,
          );
        } catch (error) {
          window.errorManager.error(
            "Failed to set user input variable",
            error,
            "story",
          );
          inputField.style.borderColor = "var(--color-important)";
          inputField.placeholder = "Error - please try again...";
        }
      };

      // Event listeners
      submitBtn.addEventListener("click", submitInput);
      inputField.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          submitInput();
        }
      });

      // Reset border color on input
      inputField.addEventListener("input", () => {
        inputField.style.borderColor = "";
      });
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
