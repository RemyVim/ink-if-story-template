import { errorManager, ERROR_SOURCES } from "./error-manager.js";

const log = errorManager.forSource(ERROR_SOURCES.DOM_HELPERS);

/**
 * DOM manipulation utilities scoped to a container element.
 * Provides methods for creating, querying, and removing elements
 * with consistent patterns used throughout the UI.
 */
class DOMHelpers {
  /**
   * Creates the DOMHelpers with dependencies
   * @param {HTMLElement} storyContainer - The container element for story content
   * @param {Object} [settings=null] - Settings object for configuration (e.g., tone indicator placement)
   */
  constructor(storyContainer, settings = null) {
    if (!storyContainer || !(storyContainer instanceof Element)) {
      log.critical(
        "Invalid story container provided to DOM helpers",
        new Error("Invalid story container")
      );
      return;
    }

    this.settings = settings;
    this.storyContainer = storyContainer;
  }

  /**
   * Creates and appends a paragraph element to the story container.
   * @param {string} text - HTML content for the paragraph
   * @param {string[]} [customClasses=[]] - CSS classes to apply
   * @returns {HTMLElement|null} The created paragraph element, or null on failure
   */
  createParagraph(text, customClasses = []) {
    if (!text || typeof text !== "string" || !text.trim()) {
      return null;
    }

    if (!Array.isArray(customClasses)) {
      log.warning(
        "Invalid customClasses passed to createParagraph - using empty array"
      );
      customClasses = [];
    }

    try {
      const paragraphElement = document.createElement("p");
      paragraphElement.innerHTML = text;

      for (const className of customClasses) {
        if (className && typeof className === "string") {
          paragraphElement.classList.add(className);
        }
      }

      this.storyContainer.appendChild(paragraphElement);
      return paragraphElement;
    } catch (error) {
      log.error("Failed to create paragraph", error);
      return null;
    }
  }

  /**
   * Create a choice element with optional key hint and tone indicators
   * @param {string} choiceText - Choice display text
   * @param {string[]} [customClasses] - Additional CSS classes
   * @param {boolean} [isClickable=true] - Whether choice is clickable
   * @param {string|null} [keyHint] - Keyboard shortcut hint (e.g., "1", "a")
   * @param {boolean} [showHint=true] - Whether to display the key hint
   * @param {Array} [toneIndicators] - Array of {icon, label} objects
   * @returns {HTMLElement|null}
   */
  createChoice(
    choiceText,
    customClasses = [],
    isClickable = true,
    keyHint = null,
    showHint = true,
    toneIndicators = [],
    choiceIndex = null,
    totalChoices = null,
    container = null
  ) {
    if (!choiceText || typeof choiceText !== "string") {
      log.warning("Invalid choiceText passed to createChoice");
      choiceText = "[Invalid Choice]";
    }

    if (!Array.isArray(customClasses)) {
      log.warning(
        "Invalid customClasses passed to createChoice - using empty array"
      );
      customClasses = [];
    }

    try {
      const choiceElement = document.createElement("button");
      choiceElement.type = "button";
      choiceElement.classList.add("choice");

      for (const className of customClasses) {
        if (className && typeof className === "string") {
          choiceElement.classList.add(className);
        }
      }

      if (!isClickable) {
        choiceElement.classList.add("unclickable");
        choiceElement.setAttribute("aria-disabled", "true");
        // Don't set the button as disabled otherwise screen readers skip over it
        // choiceElement.disabled = true;
      }

      let leadingToneHTML = "";
      let trailingToneHTML = "";
      let srOnlyLabels = "";

      if (toneIndicators.length > 0) {
        const labelList = toneIndicators.map((ind) => ind.label).join(", ");
        srOnlyLabels = `<span class="sr-only"> (${labelList})</span>`;

        const buildIconSpan = (indicator) => {
          const { icon } = indicator;
          const isMaterialIcon = /^[a-z_]+$/.test(icon);
          return isMaterialIcon
            ? `<span class="material-icons tone-icon" aria-hidden="true">${icon}</span>`
            : `<span class="tone-icon" aria-hidden="true">${icon}</span>`;
        };

        const allTrailing = this.settings?.toneIndicatorsTrailing;

        if (allTrailing) {
          const trailingSpans = toneIndicators.map(buildIconSpan).join("");
          trailingToneHTML = `<span class="tone-indicator-trailing" aria-hidden="true">${trailingSpans}</span>`;
        } else {
          leadingToneHTML = `<span class="tone-indicator-leading" aria-hidden="true">${buildIconSpan(toneIndicators[0])}</span>`;

          if (toneIndicators.length > 1) {
            const trailingSpans = toneIndicators
              .slice(1)
              .map(buildIconSpan)
              .join("");
            trailingToneHTML = `<span class="tone-indicator-trailing" aria-hidden="true">${trailingSpans}</span>`;
          }
        }
      }

      const hintPrefix =
        keyHint && showHint
          ? `<span class="choice-key-hint" aria-hidden="true">${keyHint}.</span> `
          : "";

      const choicePosition =
        choiceIndex !== null && totalChoices !== null
          ? ` ${choiceIndex} of ${totalChoices}: `
          : ": ";

      const srChoicePrefix = isClickable
        ? `<span class="sr-only">Choice${choicePosition}</span>`
        : `<span class="sr-only">Unavailable choice${choicePosition}</span>`;

      choiceElement.innerHTML = `${srChoicePrefix}${leadingToneHTML}${hintPrefix}${choiceText}${trailingToneHTML}${srOnlyLabels}`;

      const targetContainer = container || this.storyContainer;
      targetContainer.appendChild(choiceElement);
      return choiceElement;
    } catch (error) {
      log.error("Failed to create choice", error);
      return null;
    }
  }

  /**
   * Attaches a click event handler to a choice element's anchor.
   * @param {HTMLElement} choiceElement - The choice paragraph element containing an anchor
   * @param {Function} callback - Function to call when the choice is clicked
   */
  addChoiceClickHandler(choiceElement, callback) {
    if (!choiceElement || !(choiceElement instanceof Element)) {
      log.warning("Invalid choiceElement passed to addChoiceClickHandler");
      return;
    }

    if (!callback || typeof callback !== "function") {
      log.warning("Invalid callback passed to addChoiceClickHandler");
      return;
    }

    choiceElement.addEventListener("click", function (event) {
      try {
        event.preventDefault();
        callback();
      } catch (error) {
        log.error("Choice click handler failed", error);
      }
    });
  }

  /**
   * Merges consecutive elements of the same type (ul, blockquote) into single elements.
   * Called after rendering to fix lists/quotes that were processed line-by-line.
   */
  mergeConsecutiveElements() {
    this.mergeElementsByTag("ul");
    this.mergeElementsByTag("blockquote");
  }

  /**
   * Merges consecutive elements of a given tag into the first one.
   * @param {string} tagName - The tag name to merge (e.g., 'ul', 'blockquote')
   * @private
   */
  mergeElementsByTag(tagName) {
    const elements = this.storyContainer.querySelectorAll(tagName);

    for (let i = elements.length - 1; i >= 0; i--) {
      const current = elements[i];
      const next = current.nextElementSibling;

      if (next && next.tagName.toLowerCase() === tagName.toLowerCase()) {
        // Move all children from next into current
        while (next.firstChild) {
          current.appendChild(next.firstChild);
        }
        next.remove();
      }
    }
  }

  /**
   * Removes all elements matching a selector from the story container.
   * @param {string} selector - CSS selector for elements to remove
   */
  removeAll(selector) {
    if (!selector || typeof selector !== "string") {
      log.warning("Invalid selector passed to removeAll");
      return;
    }

    const allElements = this.storyContainer.querySelectorAll(selector);

    for (let i = 0; i < allElements.length; i++) {
      const el = allElements[i];
      try {
        if (el?.parentNode) {
          el.parentNode.removeChild(el);
        }
      } catch (error) {
        log.warning(`Failed to remove element at index ${i}`, error);
      }
    }
  }

  /**
   * Sets visibility of elements by adding/removing the 'invisible' class.
   * @param {string} selector - CSS selector for target elements
   * @param {boolean} visible - Whether elements should be visible
   */
  setVisible(selector, visible) {
    if (!selector || typeof selector !== "string") {
      log.warning("Invalid selector passed to setVisible");
      return;
    }

    const allElements = this.storyContainer.querySelectorAll(selector);

    for (let i = 0; i < allElements.length; i++) {
      const el = allElements[i];
      try {
        if (!el?.classList) continue;

        if (!visible) {
          el.classList.add("invisible");
        } else {
          el.classList.remove("invisible");
        }
      } catch (error) {
        log.warning(
          `Failed to set visibility for element at index ${i}`,
          error
        );
      }
    }
  }

  /**
   * Removes all story content elements (paragraphs, images, figures, stat bars, inputs).
   */
  clearStoryContent() {
    this.removeAll("p");
    this.removeAll("h2");
    this.removeAll("h3");
    this.removeAll("h4");
    this.removeAll("ul");
    this.removeAll("blockquote");
    this.removeAll("hr");
    this.removeAll("img");
    this.removeAll("figure");
    this.removeAll(".stat-bar-container");
    this.removeAll(".user-input-inline-container");
    this.removeAll(".choices-container");
  }

  /**
   * Scrolls a container element to the top.
   * @param {HTMLElement} container - The scrollable container element
   */
  scrollToTop(container) {
    if (!container || !(container instanceof Element)) {
      log.warning("Invalid container passed to scrollToTop");
      return;
    }

    try {
      if (typeof container.scrollTo === "function") {
        container.scrollTo(0, 0);
      } else if (typeof container.scrollTop !== "undefined") {
        container.scrollTop = 0;
        container.scrollLeft = 0;
      } else {
        log.warning("Container does not support scrolling operations");
      }
    } catch (error) {
      log.warning("Failed to scroll to top", error);
    }
  }

  /**
   * Attempts to recover the story container reference if it was lost.
   * Useful after dynamic DOM changes or errors.
   */
  recover() {
    if (!this.storyContainer?.parentNode) {
      const newContainer = document.querySelector("#story");
      if (newContainer) {
        this.storyContainer = newContainer;
        log.warning("DOM helpers recovered by finding new story container");
      } else {
        log.error("DOM helpers recovery failed - no story container found");
      }
    }
  }

  /**
   * Checks whether the DOM helper is ready for use.
   * @returns {boolean} True if the story container exists and is attached to the DOM
   */
  isReady() {
    return !!this.storyContainer?.parentNode;
  }

  /**
   * Returns diagnostic information about the story container's state.
   * @returns {{hasContainer: boolean, containerTagName?: string, containerChildren?: number, containerText?: number, paragraphCount?: number, choiceCount?: number, imageCount?: number}}
   */
  getStats() {
    if (!this.storyContainer) {
      return { hasContainer: false };
    }

    return {
      hasContainer: true,
      containerTagName: this.storyContainer.tagName,
      containerChildren: this.storyContainer.children.length,
      containerText: this.storyContainer.textContent.length,
      paragraphCount: this.storyContainer.querySelectorAll("p").length,
      choiceCount: this.storyContainer.querySelectorAll(".choice").length,
      imageCount: this.storyContainer.querySelectorAll("img").length,
    };
  }
}

export { DOMHelpers };
