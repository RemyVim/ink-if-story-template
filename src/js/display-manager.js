import { ErrorManager } from "./error-manager.js";
import { MarkdownProcessor } from "./markdown-processor.js";
import { DOMHelpers } from "./dom-helpers.js";

class DisplayManager {
  static errorSource = ErrorManager.SOURCES.DISPLAY_MANAGER;
  constructor() {
    this.container = document.querySelector("#story");
    this.scrollContainer = document.querySelector(".outerContainer");
    this.history = [];

    if (!this.container) {
      DisplayManager._critical(
        "Story container element not found",
        new Error("Missing #story element"),
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
      DisplayManager._warning(
        "Invalid content passed to render - expected array",
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
        DisplayManager._error(
          `Failed to render content item at index ${index}`,
          error,
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
      DisplayManager._warning(
        "Invalid choices passed to renderChoices - expected array",
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
            DisplayManager._warning(
              `Choice at index ${index} has invalid onClick handler`,
            );
          }
        }

        if (element && this.shouldAnimateContent()) {
          this.fadeInElement(element);
        }
      } catch (error) {
        DisplayManager._error(
          `Failed to render choice at index ${index}`,
          error,
        );
      }
    });
  }

  createElement(content) {
    if (!content?.text || typeof content.text !== "string") {
      DisplayManager._warning("createElement called with invalid content");
      return null;
    }

    if (!this.domHelpers) {
      DisplayManager._error(
        "Cannot create element - DOM helpers not available",
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
      DisplayManager._error("Failed to create element", error);
      return null;
    }
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
      DisplayManager._warning(`Failed to load image: ${item.src}`);
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

  createStatBar(item) {
    const value = this.getStatValue(item.variableName);
    const calculations = this.calculateStatBarMetrics(item, value);

    const element = item.isOpposed
      ? this.renderOpposedStatBar(item, calculations)
      : this.renderSimpleStatBar(item, calculations);

    this.container.appendChild(element);
    return element;
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

    setTimeout(() => inputField.focus(), 100);

    const submitInput = () => {
      const userInput = inputField.value.trim();

      if (!userInput) {
        inputField.style.borderColor = "var(--color-important)";
        inputField.placeholder = "Please enter a value...";
        inputField.focus();
        return;
      }

      try {
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
        // and clear and re-render with variable now set
        window.storyManager.reprocessingAfterUserInput = true;
        window.storyManager.continue();
        window.storyManager.reprocessingAfterUserInput = false;
      } catch (error) {
        DisplayManager._error("Failed to set user input variable", error);
        inputField.style.borderColor = "var(--color-important)";
        inputField.placeholder = "Error - please try again...";
      }
    };

    submitBtn.addEventListener("click", submitInput);
    inputField.addEventListener("keypress", (e) => {
      if (e.key === "Enter") submitInput();
    });

    inputField.addEventListener("input", () => {
      inputField.style.borderColor = "";
    });

    return container;
  }

  getStatValue(variableName) {
    try {
      return window.storyManager?.story?.variablesState?.[variableName] ?? 0;
    } catch {
      return 0;
    }
  }

  /**
   * Calculate stat bar display metrics
   * @param {Object} item - Stat bar config with min, max, clamp
   * @param {number} currentValue - Current variable value
   * @returns {{fillPercent: number, displayValue: number, displayLeft: number, displayRight: number}}
   */
  calculateStatBarMetrics(item, currentValue) {
    const range = item.max - item.min;
    const fillPercent =
      range > 0
        ? Math.max(0, Math.min(100, ((currentValue - item.min) / range) * 100))
        : 0;

    const clampedValue = item.clamp
      ? Math.max(item.min, Math.min(item.max, currentValue))
      : currentValue;

    return {
      fillPercent,
      displayValue: Math.round(clampedValue),
      displayLeft: Math.round(Math.max(0, clampedValue - item.min)),
      displayRight: Math.round(Math.max(0, item.max - clampedValue)),
    };
  }

  renderSimpleStatBar(item, metrics) {
    const container = document.createElement("div");
    container.className = "stat-bar-container";

    const displayName =
      item.leftLabel ||
      item.variableName.charAt(0).toUpperCase() + item.variableName.slice(1);

    container.innerHTML = `
    <div class="stat-bar-header" aria-hidden="true">
      <span class="stat-bar-label">${displayName}</span>
      <span class="stat-bar-value">
        <span class="stat-bar-current">${metrics.displayValue}</span>/${item.max}
      </span>
    </div>
    <div class="stat-bar-track" role="progressbar"
         aria-valuenow="${metrics.displayValue}"
         aria-valuemin="${item.min}"
         aria-valuemax="${item.max}"
         aria-label="${displayName}: ${metrics.displayValue} out of ${item.max}">
      <div class="stat-bar-fill" style="width: ${metrics.fillPercent}%"></div>
    </div>
  `;

    return container;
  }

  renderOpposedStatBar(item, metrics) {
    const container = document.createElement("div");
    container.className = "stat-bar-container stat-bar-opposed";

    container.innerHTML = `
    <div class="stat-bar-labels" aria-hidden="true">
      <span class="stat-bar-label stat-bar-label-left">${item.leftLabel || item.variableName}</span>
      <span class="stat-bar-value">
        <span class="stat-bar-current">${metrics.displayLeft}</span>/
        <span class="stat-bar-current">${metrics.displayRight}</span>
      </span>
      <span class="stat-bar-label stat-bar-label-right">${item.rightLabel || ""}</span>
    </div>
    <div class="stat-bar-track" role="progressbar"
         aria-valuenow="${metrics.displayValue}"
         aria-valuemin="${item.min}"
         aria-valuemax="${item.max}"
         aria-label="${item.leftLabel || item.variableName} versus ${item.rightLabel || ""}">
      <div class="stat-bar-fill" style="width: ${metrics.fillPercent}%"></div>
    </div>
  `;

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

  clear() {
    if (!this.domHelpers) {
      DisplayManager._error("Cannot clear - DOM helpers not available");
      return;
    }

    this.domHelpers.clearStoryContent();
    this.history = [];
  }

  clearContent() {
    if (!this.domHelpers) {
      DisplayManager._error("Cannot clear content - DOM helpers not available");
      return;
    }

    this.domHelpers.clearStoryContent();
  }

  scrollToTop() {
    if (!this.scrollContainer) {
      DisplayManager._warning("Cannot scroll - scroll container not available");
      return;
    }

    if (!this.domHelpers) {
      DisplayManager._error("Cannot scroll - DOM helpers not available");
      return;
    }

    this.domHelpers.scrollToTop(this.scrollContainer);
  }

  hideHeader() {
    this.domHelpers?.setVisible?.(".header", false);
  }

  showHeader() {
    this.domHelpers?.setVisible?.(".header", true);
  }

  reset() {
    this.clear();
    this.showHeader();
  }

  /**
   * Get current display state for saving
   * @returns {{history: Array}}
   */
  getState() {
    return {
      history: [...this.history],
    };
  }

  /**
   * Restore display from saved state
   * @param {{history: Array}} state - Previously saved display state
   */
  restoreState(state) {
    if (!state || typeof state !== "object") {
      DisplayManager._warning("Invalid state passed to restoreState");
      return;
    }

    this.clearContent();

    // Don't set history directly - render will rebuild it
    const savedHistory = Array.isArray(state.history) ? state.history : [];
    this.history = [];

    if (savedHistory.length > 0) {
      this.render(savedHistory);
    }
  }

  trackInHistory(item) {
    if (!item || typeof item !== "object") {
      DisplayManager._warning("Invalid item passed to trackInHistory");
      return;
    }

    this.history.push({
      ...item,
      timestamp: Date.now(),
    });
  }

  getHistoryLength() {
    return this.history.length;
  }

  hasContent() {
    return this.history.length > 0;
  }

  recover() {
    if (!this.container) {
      this.container = document.querySelector("#story");
    }

    if (!this.scrollContainer) {
      this.scrollContainer = document.querySelector(".outerContainer");
    }

    if (!this.domHelpers && this.container) {
      this.domHelpers = new DOMHelpers(this.container);
    }

    if (!Array.isArray(this.history)) {
      this.history = [];
    }
  }

  isReady() {
    return !!(this.container && this.domHelpers);
  }

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

  static _error(message, error = null) {
    window.errorManager.error(message, error, DisplayManager.errorSource);
  }

  static _warning(message, error = null) {
    window.errorManager.warning(message, error, DisplayManager.errorSource);
  }

  static _critical(message, error = null) {
    window.errorManager.critical(message, error, DisplayManager.errorSource);
  }
}

export { DisplayManager };
