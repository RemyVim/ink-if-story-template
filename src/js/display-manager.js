import { MarkdownProcessor } from "./markdown-processor.js";
import { DOMHelpers } from "./dom-helpers.js";
import { errorManager, ERROR_SOURCES } from "./error-manager.js";

const log = errorManager.forSource(ERROR_SOURCES.DISPLAY_MANAGER);

/**
 * Manages the story display area including content rendering,
 * choice presentation, animations, and scroll behavior.
 * Maintains display history for save/restore functionality.
 */
class DisplayManager {
  static CONTENT_SELECTOR =
    "p, h2, h3, h4, ul, blockquote, hr, figure, .stat-bar-container, .user-input-inline-container";
  /**
   * Creates the DisplayManager with dependencies
   * @param {Object} settings - SettingsManager instance for animation preferences
   */
  constructor(settings) {
    if (!settings) {
      log.warning(
        "DisplayManager created without settings: animations will default to on"
      );
    }
    this.settings = settings;
    this.storyManager = null; // Wired by main.js after StoryManager is created
    this.container = document.querySelector("#story");
    this.scrollContainer = document.querySelector(".outerContainer");
    this.history = [];
    this.maxHistory = null;
    this.focusMarkerIndex = null; // Tracks position in history for save/restore
    this.focusMarkerElement = null; // DOM element reference

    this.initFocusMarker();

    if (!this.container) {
      log.critical(
        "Story container element not found",
        new Error("Missing #story element")
      );
      return;
    }

    this.domHelpers = new DOMHelpers(this.container, this.settings);
  }

  /**
   * Creates the focus marker element for screen reader navigation.
   * @private
   */
  initFocusMarker() {
    this.focusMarkerElement = document.createElement("span");
    this.focusMarkerElement.id = "focus-marker";
    this.focusMarkerElement.className = "sr-only";
    this.focusMarkerElement.setAttribute("role", "group");
    this.focusMarkerElement.setAttribute("tabindex", "-1");
    this.focusMarkerElement.setAttribute("aria-label", "Story content");
  }

  /**
   * Render an array of content items to the display
   * @param {Array} content - Array of content objects with text, classes, etc.
   */
  render(content) {
    if (!Array.isArray(content)) {
      log.warning("Invalid content passed to render - expected array");
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
        log.error(`Failed to render content item at index ${index}`, error);
      }
    });

    // Merge consecutive lists and blockquotes that were processed separately
    this.domHelpers?.mergeConsecutiveElements?.();
  }

  /**
   * Render an array of choice objects
   * @param {Array} choices - Array of choice objects with text, classes, onClick
   */
  renderChoices(choices, showNumbers = true) {
    if (!Array.isArray(choices)) {
      log.warning("Invalid choices passed to renderChoices - expected array");
      return;
    }

    const totalChoices = choices.length;

    const choicesContainer = document.createElement("div");
    choicesContainer.className = "choices-container";
    choicesContainer.setAttribute("role", "region");
    choicesContainer.setAttribute(
      "aria-label",
      `${totalChoices} choices available`
    );
    this.container.appendChild(choicesContainer);

    choices.forEach((choice, index) => {
      try {
        const element = this.domHelpers.createChoice(
          choice.text || "",
          choice.classes || [],
          choice.isClickable !== false,
          choice.keyHint,
          showNumbers,
          choice.toneIndicators || [],
          index + 1,
          totalChoices,
          choicesContainer
        );

        if (choice.isClickable !== false && choice.onClick) {
          if (typeof choice.onClick === "function") {
            this.domHelpers.addChoiceClickHandler(element, choice.onClick);
          } else {
            log.warning(`Choice at index ${index} has invalid onClick handler`);
          }
        }

        if (element && this.shouldAnimateContent()) {
          this.fadeInElement(element);
        }
      } catch (error) {
        log.error(`Failed to render choice at index ${index}`, error);
      }
    });
  }

  /**
   * Creates and appends an element from content data.
   * Processes markdown and applies CSS classes from tags.
   * Handles block elements (headers, lists, etc.) without wrapping in <p>.
   * @param {Object} content - Content object with text and classes
   * @param {string} content.text - The paragraph text (may contain markdown)
   * @param {string[]} [content.classes] - CSS classes to apply
   * @returns {HTMLElement|null} The created element, or null on failure
   * @private
   */
  createElement(content) {
    if (!content?.text || typeof content.text !== "string") {
      log.warning("createElement called with invalid content");
      return null;
    }

    if (!this.domHelpers) {
      log.error("Cannot create element - DOM helpers not available");
      return null;
    }

    try {
      const processedText = MarkdownProcessor.process(content.text);

      // Check if the processed text starts with a block-level element
      const blockElementPattern = /^<(h[2-4]|ul|blockquote|hr)/i;
      const isBlockElement = blockElementPattern.test(processedText.trim());

      let element;
      if (isBlockElement) {
        // Insert block elements directly without <p> wrapper
        const wrapper = document.createElement("div");
        wrapper.innerHTML = processedText;
        element = wrapper.firstElementChild;

        // Apply custom classes if any
        if (content.classes?.length) {
          for (const className of content.classes) {
            if (className && typeof className === "string") {
              element.classList.add(className);
            }
          }
        }

        this.domHelpers.storyContainer.appendChild(element);
      } else {
        // Regular paragraph content
        element = this.domHelpers.createParagraph(
          processedText,
          content.classes || []
        );
      }

      if (element && this.shouldAnimateContent()) {
        this.fadeInElement(element);
      }

      return element;
    } catch (error) {
      log.error("Failed to create element", error);
      return null;
    }
  }

  /**
   * Creates and appends an image element, optionally wrapped in a figure with caption.
   * @param {Object} item - Image content object
   * @param {string} item.src - Image source URL
   * @param {string} [item.altText] - Alt text for accessibility
   * @param {string} [item.alignment] - 'left', 'right', or 'center'
   * @param {string} [item.width] - CSS width value (e.g., '50%', '200px')
   * @param {boolean} [item.showCaption] - Whether to display altText as a caption
   * @returns {HTMLElement} The created image or figure element
   * @private
   */
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
      log.warning(`Failed to load image: ${item.src}`);
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

  /**
   * Creates and appends a stat bar element (simple or opposed).
   * @param {Object} item - Stat bar content object
   * @param {string} item.variableName - Ink variable name to display
   * @param {number} item.min - Minimum value for the bar
   * @param {number} item.max - Maximum value for the bar
   * @param {boolean} [item.isOpposed] - Whether to render as opposed bar (two labels)
   * @param {string} [item.leftLabel] - Label for left side / bar name
   * @param {string} [item.rightLabel] - Label for right side (opposed bars only)
   * @param {boolean} [item.clamp] - Whether to clamp displayed value to min/max
   * @returns {HTMLElement} The created stat bar container element
   * @private
   */
  createStatBar(item) {
    const value = this.getStatValue(item.variableName);
    const calculations = this.calculateStatBarMetrics(item, value);

    const element = item.isOpposed
      ? this.renderOpposedStatBar(item, calculations)
      : this.renderSimpleStatBar(item, calculations);

    this.container.appendChild(element);
    return element;
  }

  /**
   * Creates and appends a user text input field with submit button.
   * Handles input submission and updates the ink variable.
   * @param {Object} item - User input content object
   * @param {string} item.variableName - Ink variable name to set with user's input
   * @param {string} [item.placeholder] - Placeholder text for the input field
   * @returns {HTMLElement} The created input container element
   * @private
   */
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

    // Don't auto-focus - let users Tab to input after reading prompt
    // This improves screen reader experience
    // setTimeout(() => inputField.focus(), 100);

    const submitInput = () => {
      const userInput = inputField.value.trim();

      if (!userInput) {
        inputField.style.borderColor = "var(--color-important)";
        inputField.placeholder = "Please enter a value...";
        inputField.focus();
        return;
      }

      try {
        this.storyManager.story.variablesState.$(item.variableName, userInput);

        // Restore state to before this content batch and re-set variable
        if (this.storyManager.stateBeforeUserInput) {
          this.storyManager.story.state.LoadJson(
            this.storyManager.stateBeforeUserInput
          );
          this.storyManager.story.variablesState.$(
            item.variableName,
            userInput
          );
          this.storyManager.stateBeforeUserInput = null;
        }

        // Remove content from focus marker onwards (will be regenerated)
        // Returns element count at user-input position for marker placement
        const markerPosition = this.truncateFromFocusMarker();

        // Set flag so content-processor knows to skip input on re-process
        this.storyManager.reprocessingAfterUserInput = true;
        this.storyManager.userInputMarkerPosition = markerPosition;
        this.storyManager.continue();
        this.storyManager.reprocessingAfterUserInput = false;
        this.storyManager.userInputMarkerPosition = null;
      } catch (error) {
        log.error("Failed to set user input variable", error);
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

  /**
   * Retrieves the current value of an ink variable for stat bar display.
   * @param {string} variableName - Name of the ink variable
   * @returns {number} The variable's value, or 0 if not found
   * @private
   */
  getStatValue(variableName) {
    try {
      return this.storyManager?.story?.variablesState?.[variableName] ?? 0;
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

  /**
   * Renders a simple (non-opposed) stat bar with label, value, and fill.
   * @param {Object} item - Stat bar config
   * @param {Object} metrics - Calculated metrics from calculateStatBarMetrics
   * @returns {HTMLElement} The stat bar container element
   * @private
   */
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
       aria-valuetext="${displayName}: ${metrics.displayValue} out of ${item.max}">
        <div class="stat-bar-fill" style="width: ${metrics.fillPercent}%"></div>
    </div>
  `;

    return container;
  }

  /**
   * Renders an opposed stat bar with left/right labels and split values.
   * @param {Object} item - Stat bar config with leftLabel and rightLabel
   * @param {Object} metrics - Calculated metrics from calculateStatBarMetrics
   * @returns {HTMLElement} The stat bar container element
   * @private
   */
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
       aria-valuetext="${item.leftLabel || item.variableName}: ${metrics.displayLeft} versus ${item.rightLabel || ""}: ${metrics.displayRight}">
        <div class="stat-bar-fill" style="width: ${metrics.fillPercent}%"></div>
    </div>
  `;

    return container;
  }

  /**
   * Positions the focus marker before a specific element.
   * @param {HTMLElement} beforeElement - Element to insert marker before
   * @param {number|null} historyIndex - Index in history for save/restore
   */
  positionFocusMarker(beforeElement, historyIndex = null) {
    if (!this.focusMarkerElement || !beforeElement?.parentNode) return;

    beforeElement.parentNode.insertBefore(
      this.focusMarkerElement,
      beforeElement
    );
    this.focusMarkerIndex = historyIndex;
  }

  /**
   * Positions the focus marker at a specific history index.
   * Used when restoring from a save.
   * @param {number} index - History index
   */
  positionFocusMarkerAtIndex(index) {
    if (!this.container) return;

    const contentElements = this.container.querySelectorAll(
      DisplayManager.CONTENT_SELECTOR
    );

    const targetElement = contentElements[index];
    if (targetElement) {
      this.positionFocusMarker(targetElement, index);
    } else if (contentElements.length > 0) {
      const lastElement = contentElements[contentElements.length - 1];
      this.positionFocusMarker(lastElement, contentElements.length - 1);
    }
  }

  /**
   * Positions marker before the first new content element.
   * @param {number} previousHistoryLength - History length before new content was added
   */
  positionFocusMarkerAtNewContent(previousHistoryLength) {
    if (!this.container) return;

    const contentElements = this.container.querySelectorAll(
      DisplayManager.CONTENT_SELECTOR
    );

    if (previousHistoryLength < contentElements.length) {
      const firstNewElement = contentElements[previousHistoryLength];
      this.positionFocusMarker(firstNewElement, previousHistoryLength);
    }
  }

  /**
   * Sets the maximum history size.
   * @param {number|null} limit - Max items, or null for unlimited
   */
  setMaxHistory(limit) {
    this.maxHistory = typeof limit === "number" && limit > 0 ? limit : null;
  }

  /**
   * Focuses the marker element and optionally updates its aria-label.
   * Scrolls the marker into view respecting reduced motion preferences.
   * @param {string} [ariaLabel] - Optional label to set before focusing
   */
  focusMarker(ariaLabel) {
    if (!this.focusMarkerElement) return;

    if (ariaLabel) {
      this.focusMarkerElement.setAttribute("aria-label", ariaLabel);
    } else {
      // Remove label for silent focus
      this.focusMarkerElement.removeAttribute("aria-label");
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    this.focusMarkerElement.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });

    // Focus after scroll (or immediately if reduced motion)
    const focusDelay = prefersReducedMotion ? 0 : 300;
    setTimeout(() => {
      this.focusMarkerElement.focus();
    }, focusDelay);
  }

  /**
   * Resets the focus marker (removes from DOM but keeps reference).
   * Called when display is cleared.
   */
  resetFocusMarker() {
    if (this.focusMarkerElement?.parentNode) {
      this.focusMarkerElement.parentNode.removeChild(this.focusMarkerElement);
    }
    this.focusMarkerIndex = null;
  }

  /**
   * Removes all content from the focus marker position onwards.
   * Used when rolling back after user input submission.
   * @returns {number|null} The element count at the user-input field, for marker positioning
   */
  truncateFromFocusMarker() {
    if (!this.focusMarkerElement?.parentNode) return null;

    // Find where the user-input container is (for marker positioning after regeneration)
    let elementsBeforeInput = null;
    const userInputContainer = this.container.querySelector(
      ".user-input-inline-container"
    );
    if (userInputContainer) {
      const allElements = this.container.querySelectorAll(
        DisplayManager.CONTENT_SELECTOR
      );
      elementsBeforeInput = 0;
      for (const el of allElements) {
        if (el === userInputContainer) break;
        elementsBeforeInput++;
      }
    }

    let elementsAfterMarker = 0;
    let sibling = this.focusMarkerElement.nextSibling;
    while (sibling) {
      if (sibling.nodeType === Node.ELEMENT_NODE) {
        elementsAfterMarker++;
      }
      sibling = sibling.nextSibling;
    }

    while (this.focusMarkerElement.nextSibling) {
      this.focusMarkerElement.nextSibling.remove();
    }

    if (elementsAfterMarker > 0 && this.history.length >= elementsAfterMarker) {
      this.history.length = this.history.length - elementsAfterMarker;
    }

    this.resetFocusMarker();
    return elementsBeforeInput;
  }

  /**
   * Returns the count of content elements currently in the DOM.
   * Used for focus marker positioning.
   * @returns {number} Count of content elements
   */
  getContentElementCount() {
    if (!this.container) return 0;

    const contentElements = this.container.querySelectorAll(
      DisplayManager.CONTENT_SELECTOR
    );
    return contentElements.length;
  }

  /**
   * Checks whether content animations are enabled in settings.
   * @returns {boolean} True if animations should play (defaults to true)
   * @private
   */
  shouldAnimateContent() {
    return this.settings?.getSetting("animations") !== false;
  }

  /**
   * Applies a fade-in animation to an element.
   * @param {HTMLElement} element - Element to animate
   * @private
   */
  fadeInElement(element) {
    if (!element) return;
    try {
      element.style.opacity = "0";
      element.offsetHeight; // Force reflow
      element.style.opacity = "1";
    } catch {
      element.style.opacity = "1";
    }
  }

  /**
   * Clears all story content from the display and resets history.
   */
  clear() {
    if (!this.domHelpers) {
      log.error("Cannot clear — DOM helpers not available");
      return;
    }

    this.domHelpers.clearStoryContent();
    this.history = [];
    this.resetFocusMarker();
  }

  /**
   * Removes choice elements without clearing other content.
   * Used in continuous display mode when advancing the story.
   */
  removeChoices() {
    this.domHelpers?.removeAll?.(".choices-container");
  }

  /**
   * Clears story content from the display without resetting history.
   */
  clearContent() {
    if (!this.domHelpers) {
      log.error("Cannot clear content - DOM helpers not available");
      return;
    }

    this.domHelpers.clearStoryContent();
  }

  /**
   * Scrolls the story container to the top.
   */
  scrollToTop() {
    if (!this.scrollContainer) {
      log.warning("Cannot scroll - scroll container not available");
      return;
    }

    if (!this.domHelpers) {
      log.error("Cannot scroll - DOM helpers not available");
      return;
    }

    this.domHelpers.scrollToTop(this.scrollContainer);
  }

  /**
   * Hides the page header element.
   */
  hideHeader() {
    this.domHelpers?.setVisible?.(".header", false);
  }

  /**
   * Shows the page header element.
   */
  showHeader() {
    this.domHelpers?.setVisible?.(".header", true);
  }

  /**
   * Resets the display to initial state (clears content and shows header).
   */
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
      focusMarkerIndex: this.focusMarkerIndex,
    };
  }

  /**
   * Restore display from saved state
   * @param {{history: Array}} state - Previously saved display state
   */
  restoreState(state) {
    if (!state || typeof state !== "object") {
      log.warning("Invalid state passed to restoreState");
      return;
    }

    this.clearContent();
    this.resetFocusMarker();

    const savedHistory = Array.isArray(state.history) ? state.history : [];
    this.history = [];

    if (savedHistory.length > 0) {
      this.render(savedHistory);
    }

    const markerIndex = state.focusMarkerIndex;
    if (markerIndex !== null && markerIndex !== undefined) {
      this.positionFocusMarkerAtIndex(markerIndex);
    } else if (savedHistory.length > 0) {
      this.positionFocusMarkerAtIndex(savedHistory.length - 1);
    }
  }

  /**
   * Adds a content item to the display history with a timestamp.
   * @param {Object} item - Content item to track
   * @private
   */
  trackInHistory(item) {
    if (!item || typeof item !== "object") {
      log.warning("Invalid item passed to trackInHistory");
      return;
    }

    this.history.push({
      ...item,
      timestamp: Date.now(),
    });

    if (this.maxHistory && this.history.length > this.maxHistory) {
      const overflow = this.history.length - this.maxHistory;
      this.history.splice(0, overflow);
    }
  }

  /**
   * Returns the number of items in display history.
   * @returns {number} History length
   */
  getHistoryLength() {
    return this.history.length;
  }

  /**
   * Checks whether any content has been rendered.
   * @returns {boolean} True if history contains items
   */
  hasContent() {
    return this.history.length > 0;
  }

  /**
   * Attempts to recover DOM references if they were lost.
   * Useful after dynamic page changes or errors.
   */
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

  /**
   * Checks whether the display manager is ready to render.
   * @returns {boolean} True if container and DOM helpers are available
   */
  isReady() {
    return !!(this.container && this.domHelpers);
  }

  /**
   * Returns diagnostic information about the display manager's state.
   * @returns {{historyLength: number, hasContainer: boolean, hasScrollContainer: boolean, hasDomHelpers: boolean, containerElementCount: number}}
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
}

export { DisplayManager };
