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
        const element = this.createElement(item);
        if (element) {
          this.trackInHistory(item);
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

      if (
        content.classes &&
        content.classes.includes("user-input-placeholder")
      ) {
        // This is a user input placeholder
        this.convertToUserInput(
          element,
          content.classes,
          content.placeholderText,
        );
      } else if (content.classes && content.classes.includes("has-image")) {
        // This is an image placeholder
        this.handleImageForParagraph(element, content.classes);
      } else if (element && this.shouldAnimateContent()) {
        this.fadeInElement(element);
      }

      return element;
    } catch (error) {
      window.errorManager.error("Failed to create element", error, "display");
      return null;
    }
  }

  convertToUserInput(
    element,
    classes,
    placeholderText = "Type your answer here...",
  ) {
    if (!element) return;
    const varClass = classes.find((cls) => cls.startsWith("user-input-var-"));
    if (!varClass) return;
    const variableName = varClass.replace("user-input-var-", "");

    // Check for [] to use empty placeholder
    if (placeholderText === "[]") {
      placeholderText = "";
    } else if (placeholderText && placeholderText.includes("{")) {
      placeholderText = placeholderText.replace(/\{[^}]+\}/g, "___");
    }

    element.innerHTML = `
    <div class="user-input-inline-container">
      <div class="user-input-prompt">
        <input type="text" class="user-input-inline-field" 
               placeholder="${placeholderText}" 
               maxlength="100" autocomplete="off">
        <button class="user-input-submit-btn">Submit</button>
      </div>
      <div class="user-input-help">Press Enter or click Submit to continue</div>
    </div>
  `;

    const inputField = element.querySelector(".user-input-inline-field");
    const submitBtn = element.querySelector(".user-input-submit-btn");

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
        window.storyManager.story.variablesState.$(variableName, userInput);

        // Replace input with user's response
        element.innerHTML = `<span class="user-input-response">${userInput}</span>`;

        // Continue the story
        window.storyManager.continueWithoutClearing();
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
  }

  /**
   * Create and insert an image element for a paragraph with a pending image.
   * Supports optional alignment, width, alt text, and visible captions.
   * @param {HTMLElement} element - The paragraph element to insert the image before
   * @param {string[]} classes - CSS classes containing the image ID (pattern: "image-img_*")
   */
  handleImageForParagraph(element, classes) {
    if (!element || !window._pendingImages) return;

    // Find the image ID from classes
    const imageClass = classes.find((cls) => cls.startsWith("image-img_"));
    if (!imageClass) return;

    const imageId = imageClass.replace("image-", "");
    const imageData = window._pendingImages.find((img) => img.id === imageId);

    if (!imageData) return;

    window._pendingImages = window._pendingImages.filter(
      (img) => img.id !== imageId,
    );

    const imageElement = document.createElement("img");
    imageElement.src = imageData.src;
    imageElement.className = "story-image";

    if (imageData.altText) {
      imageElement.alt = imageData.altText;
    } else {
      imageElement.alt = ""; // Empty alt for decorative images
    }

    if (imageData.alignment) {
      imageElement.classList.add(`image-${imageData.alignment}`);
    }

    if (imageData.width) {
      imageElement.style.width = imageData.width;
    }

    imageElement.onerror = () => {
      window.errorManager.warning(
        `Failed to load image: ${imageData.src}`,
        null,
        "display",
      );
    };

    let elementToInsert;

    if (imageData.showCaption && imageData.altText) {
      const figure = document.createElement("figure");
      figure.className = "story-figure";

      if (imageData.alignment) {
        figure.classList.add(`figure-${imageData.alignment}`);
        imageElement.classList.remove(`image-${imageData.alignment}`);
      }

      if (imageData.width) {
        figure.style.width = imageData.width;
        imageElement.style.width = "100%";
      }

      const figcaption = document.createElement("figcaption");
      figcaption.className = "story-caption";
      figcaption.textContent = imageData.altText;

      figure.appendChild(imageElement);
      figure.appendChild(figcaption);
      elementToInsert = figure;
    } else {
      elementToInsert = imageElement;
    }

    // Always insert BEFORE this paragraph (inline positioning)
    element.parentNode.insertBefore(elementToInsert, element);

    // Apply fade-in animation if enabled
    if (this.shouldAnimateContent()) {
      this.fadeInElement(elementToInsert);
    }
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

    this.history = Array.isArray(state.history) ? state.history : [];
    this.clearContent();

    // Rebuild from history
    this.history.forEach((item, index) => {
      try {
        const content = {
          text: item.text || "",
          classes: Array.isArray(item.classes) ? item.classes : [],
        };
        this.createElement(content);
      } catch (error) {
        window.errorManager.error(
          `Failed to restore history item at index ${index}`,
          error,
          "display",
        );
      }
    });
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
      type: "paragraph",
      text: item.text || "",
      classes: Array.isArray(item.classes) ? item.classes : [],
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
