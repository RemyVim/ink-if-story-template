// display-manager.js
class DisplayManager {
  constructor() {
    this.container = document.querySelector("#story");
    this.scrollContainer = document.querySelector(".outerContainer");
    this.history = [];

    if (!this.container) {
      window.errorManager.critical(
        "Story container element not found",
        new Error("Missing #story element"),
        "display",
      );
      return;
    }

    this.domHelpers = new DOMHelpers(this.container);
  }

  /**
   * Render an array of content items to the display
   * @param {Array} content - Array of content objects with text, classes, etc.
   */
  render(content) {
    if (!Array.isArray(content)) {
      window.errorManager.warning(
        "Invalid content passed to render - expected array",
        null,
        "display",
      );
      return;
    }

    content.forEach((item, index) => {
      try {
        let element;

        switch (item.type) {
          case "statbar":
            element = this.createStatBar(item);
            break;
          case "image":
            element = this.createImage(item);
            break;
          case "user-input":
            element = this.createUserInput(item);
            break;
          case "paragraph":
          default:
            element = this.createElement(item);
            break;
        }
        if (element) {
          this.trackInHistory(item);
          if (this.shouldAnimateContent()) {
            this.fadeInElement(element);
          }
        }
      } catch (error) {
        window.errorManager.error(
          `Failed to render content item at index ${index}`,
          error,
          "display",
        );
      }
    });
  }

  /**
   * Render an array of choice objects
   * @param {Array} choices - Array of choice objects with text, classes, onClick
   */
  renderChoices(choices, showNumbers = true) {
    if (!Array.isArray(choices)) {
      window.errorManager.warning(
        "Invalid choices passed to renderChoices - expected array",
        null,
        "display",
      );
      return;
    }

    choices.forEach((choice, index) => {
      try {
        const element = this.domHelpers.createChoice(
          choice.text || "",
          choice.classes || [],
          choice.isClickable !== false,
          choice.keyHint,
          showNumbers,
          choice.toneIndicators || [],
        );
        if (choice.isClickable !== false && choice.onClick) {
          if (typeof choice.onClick === "function") {
            this.domHelpers.addChoiceClickHandler(element, choice.onClick);
          } else {
            window.errorManager.warning(
              `Choice at index ${index} has invalid onClick handler`,
              null,
              "display",
            );
          }
        }

        if (element && this.shouldAnimateContent()) {
          this.fadeInElement(element);
        }
      } catch (error) {
        window.errorManager.error(
          `Failed to render choice at index ${index}`,
          error,
          "display",
        );
      }
    });
  }

  /**
   * Create a DOM element from a content object
   * @param {Object} content - Content object with text and classes
   * @returns {HTMLElement|null} The created element or null if failed
   */
  createElement(content) {
    // Validate content object
    if (!content?.text || typeof content.text !== "string") {
      window.errorManager.warning(
        "createElement called with invalid content",
        null,
        "display",
      );
      return null;
    }

    if (!this.domHelpers) {
      window.errorManager.error(
        "Cannot create element - DOM helpers not available",
        null,
        "display",
      );
      return null;
    }

    try {
      const processedText = MarkdownProcessor.process(content.text);
      const element = this.domHelpers.createParagraph(
        processedText,
        content.classes || [],
      );

      if (element && this.shouldAnimateContent()) {
        this.fadeInElement(element);
      }

      return element;
    } catch (error) {
      window.errorManager.error("Failed to create element", error, "display");
      return null;
    }
  }

  createStatBar(item) {
    // Get the current variable value from the story
    let currentValue = 0;
    try {
      const storyValue =
        window.storyManager?.story?.variablesState?.[item.variableName];
      if (typeof storyValue === "number") {
        currentValue = storyValue;
      } else if (typeof storyValue === "string") {
        currentValue = parseFloat(storyValue) || 0;
      }
    } catch (error) {
      window.errorManager?.warning(
        `Failed to get variable "${item.variableName}" for stat bar`,
        error,
        "display",
      );
    }

    // Calculate fill percentage
    const range = item.max - item.min;
    const fillPercent =
      range !== 0 ? ((currentValue - item.min) / range) * 100 : 0;

    // Build the stat bar element
    const container = document.createElement("div");
    container.className = "stat-bar-container";

    if (item.isOpposed) {
      container.classList.add("stat-bar-opposed");

      container.innerHTML = `
      <div class="stat-bar-labels">
        <span class="stat-bar-label stat-bar-label-left">${item.leftLabel || item.variableName}</span>
        <span class="stat-bar-label stat-bar-label-right">${item.rightLabel || ""}</span>
      </div>
      <div class="stat-bar-track" role="progressbar"
           aria-valuenow="${currentValue}"
           aria-valuemin="${item.min}"
           aria-valuemax="${item.max}"
           aria-label="${item.leftLabel || item.variableName} versus ${item.rightLabel || ""}">
        <div class="stat-bar-fill" style="width: ${fillPercent}%"></div>
      </div>
    `;
    } else {
      const displayName =
        item.leftLabel ||
        item.variableName.charAt(0).toUpperCase() + item.variableName.slice(1);

      container.innerHTML = `
      <div class="stat-bar-header">
        <span class="stat-bar-label">${displayName}</span>
        <span class="stat-bar-value">${Math.round(currentValue)}</span>
      </div>
      <div class="stat-bar-track" role="progressbar"
           aria-valuenow="${currentValue}"
           aria-valuemin="${item.min}"
           aria-valuemax="${item.max}"
           aria-label="${displayName}: ${Math.round(currentValue)} out of ${item.max}">
        <div class="stat-bar-fill" style="width: ${fillPercent}%"></div>
      </div>
    `;
    }

    // Append to container
    this.container.appendChild(container);

    return container;
  }

  createImage(item) {
    const imageElement = document.createElement("img");
    imageElement.src = item.src;
    imageElement.className = "story-image";

    if (item.altText) {
      imageElement.alt = item.altText;
    } else {
      imageElement.alt = "";
    }

    if (item.alignment) {
      imageElement.classList.add(`image-${item.alignment}`);
    }

    if (item.width) {
      imageElement.style.width = item.width;
    }

    imageElement.onerror = () => {
      window.errorManager.warning(
        `Failed to load image: ${item.src}`,
        null,
        "display",
      );
    };

    let elementToInsert;

    if (item.showCaption && item.altText) {
      const figure = document.createElement("figure");
      figure.className = "story-figure";

      if (item.alignment) {
        figure.classList.add(`figure-${item.alignment}`);
        imageElement.classList.remove(`image-${item.alignment}`);
      }

      if (item.width) {
        figure.style.width = item.width;
        imageElement.style.width = "100%";
      }

      const figcaption = document.createElement("figcaption");
      figcaption.className = "story-caption";
      figcaption.textContent = item.altText;

      figure.appendChild(imageElement);
      figure.appendChild(figcaption);
      elementToInsert = figure;
    } else {
      elementToInsert = imageElement;
    }

    this.container.appendChild(elementToInsert);

    return elementToInsert;
  }

  createUserInput(item) {
    const container = document.createElement("div");
    container.className = "user-input-inline-container";

    const placeholder = item.placeholder || "Type your answer here...";

    container.innerHTML = `
    <div class="user-input-prompt">
      <input type="text" class="user-input-inline-field" 
             placeholder="${placeholder}" 
             maxlength="100" autocomplete="off">
      <button class="user-input-submit-btn">Submit</button>
    </div>
    <div class="user-input-help">Press Enter or click Submit to continue</div>
  `;

    this.container.appendChild(container);

    const inputField = container.querySelector(".user-input-inline-field");
    const submitBtn = container.querySelector(".user-input-submit-btn");

    // Focus the input
    setTimeout(() => inputField.focus(), 100);

    // Handle submission
    const submitInput = () => {
      const userInput = inputField.value.trim();

      if (!userInput) {
        inputField.style.borderColor = "var(--color-important)";
        inputField.placeholder = "Please enter a value...";
        inputField.focus();
        return;
      }

      try {
        // Set the Ink variable
        window.storyManager.story.variablesState.$(
          item.variableName,
          userInput,
        );

        // Restore state to before this content batch and re-set variable
        if (window.storyManager.stateBeforeUserInput) {
          window.storyManager.story.state.LoadJson(
            window.storyManager.stateBeforeUserInput,
          );
          window.storyManager.story.variablesState.$(
            item.variableName,
            userInput,
          );
          window.storyManager.stateBeforeUserInput = null;
        }

        // Set flag so content-processor knows to skip input on re-process
        window.storyManager.reprocessingAfterUserInput = true;

        // Continue the story (clears and re-renders with variable now set)
        window.storyManager.continue();

        // Clear the flag after continue completes
        window.storyManager.reprocessingAfterUserInput = false;
      } catch (error) {
        window.errorManager.error(
          "Failed to set user input variable",
          error,
          "display",
        );
        inputField.style.borderColor = "var(--color-important)";
        inputField.placeholder = "Error - please try again...";
      }
    };

    // Event listeners
    submitBtn.addEventListener("click", submitInput);
    inputField.addEventListener("keypress", (e) => {
      if (e.key === "Enter") submitInput();
    });

    inputField.addEventListener("input", () => {
      inputField.style.borderColor = "";
    });

    return container;
  }

  shouldAnimateContent() {
    try {
      const settings = window.storyManager?.settings;
      if (!settings?.getSetting) {
        return true;
      }
      const result = settings.getSetting("animations") === true;
      return result;
    } catch (error) {
      console.log("Error checking animations, defaulting to true");
      return true;
    }
  }
  fadeInElement(element) {
    if (!element) return;
    try {
      element.style.opacity = "0";
      element.offsetHeight; // Force reflow
      element.style.opacity = "1";
    } catch (error) {
      element.style.opacity = "1";
    }
  }

  /**
   * Clear all story content and reset history
   */
  clear() {
    if (!this.domHelpers) {
      window.errorManager.error(
        "Cannot clear - DOM helpers not available",
        null,
        "display",
      );
      return;
    }

    this.domHelpers.clearStoryContent();
    this.history = [];
  }

  /**
   * Clear content but preserve history (for regenerating from saves)
   */
  clearContent() {
    if (!this.domHelpers) {
      window.errorManager.error(
        "Cannot clear content - DOM helpers not available",
        null,
        "display",
      );
      return;
    }

    this.domHelpers.clearStoryContent();
  }

  /**
   * Scroll the container to the top
   */
  scrollToTop() {
    if (!this.scrollContainer) {
      window.errorManager.warning(
        "Cannot scroll - scroll container not available",
        null,
        "display",
      );
      return;
    }

    if (!this.domHelpers) {
      window.errorManager.error(
        "Cannot scroll - DOM helpers not available",
        null,
        "display",
      );
      return;
    }

    this.domHelpers.scrollToTop(this.scrollContainer);
  }

  /**
   * Hide the story header
   */
  hideHeader() {
    this.domHelpers?.setVisible?.(".header", false);
  }

  /**
   * Show the story header
   */
  showHeader() {
    this.domHelpers?.setVisible?.(".header", true);
  }

  /**
   * Get the current display state for saving
   * @returns {Object} Current display state
   */
  getState() {
    return {
      history: [...this.history], // Copy the array
    };
  }

  /**
   * Restore display state from a saved state
   * @param {Object} state - Previously saved display state
   */
  restoreState(state) {
    if (!state || typeof state !== "object") {
      window.errorManager.warning(
        "Invalid state passed to restoreState",
        null,
        "display",
      );
      return;
    }

    this.clearContent();

    // Don't set history directly - render will rebuild it
    const savedHistory = Array.isArray(state.history) ? state.history : [];
    this.history = [];

    // Re-render all saved items (this will rebuild history too)
    if (savedHistory.length > 0) {
      this.render(savedHistory);
    }
  }

  /**
   * Track a content item in the display history
   * @param {Object} item - Content item to track
   */
  trackInHistory(item) {
    if (!item || typeof item !== "object") {
      window.errorManager.warning(
        "Invalid item passed to trackInHistory",
        null,
        "display",
      );
      return;
    }

    this.history.push({
      ...item,
      timestamp: Date.now(),
    });
  }

  /**
   * Reset the display to initial state
   */
  reset() {
    this.clear();
    this.showHeader();
  }

  /**
   * Get the number of items in display history
   * @returns {number} Number of items in history
   */
  getHistoryLength() {
    return this.history.length;
  }

  /**
   * Check if display has any content
   * @returns {boolean} True if display has content
   */
  hasContent() {
    return this.history.length > 0;
  }

  /**
   * Get display statistics for debugging
   * @returns {Object} Display statistics
   */
  getStats() {
    return {
      historyLength: this.history.length,
      hasContainer: !!this.container,
      hasScrollContainer: !!this.scrollContainer,
      hasDomHelpers: !!this.domHelpers,
      containerElementCount: this.container
        ? this.container.children.length
        : 0,
    };
  }

  /**
   * Validate that the display manager is in a working state
   * @returns {boolean} True if display manager is ready to use
   */
  isReady() {
    return !!(this.container && this.domHelpers);
  }

  /**
   * Attempt to recover from a broken state
   */
  recover() {
    // Try to re-find container elements
    if (!this.container) {
      this.container = document.querySelector("#story");
    }

    if (!this.scrollContainer) {
      this.scrollContainer = document.querySelector(".outerContainer");
    }

    // Try to recreate DOM helpers if missing
    if (!this.domHelpers && this.container) {
      this.domHelpers = new DOMHelpers(this.container);
    }

    // Clear any corrupted history
    if (!Array.isArray(this.history)) {
      this.history = [];
    }
  }
}
