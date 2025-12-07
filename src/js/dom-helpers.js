import { ErrorManager } from "./error-manager.js";

class DOMHelpers {
  static errorSource = ErrorManager.SOURCES.DOM_HELPERS;

  constructor(storyContainer) {
    if (!storyContainer || !(storyContainer instanceof Element)) {
      DOMHelpers._critical(
        "Invalid story container provided to DOM helpers",
        new Error("Invalid story container"),
      );
      return;
    }

    this.storyContainer = storyContainer;
  }

  createParagraph(text, customClasses = []) {
    if (!text || typeof text !== "string") {
      DOMHelpers._warning("Invalid text passed to createParagraph");
      return null;
    }

    if (!Array.isArray(customClasses)) {
      DOMHelpers._warning(
        "Invalid customClasses passed to createParagraph - using empty array",
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
      DOMHelpers._error("Failed to create paragraph", error);
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
  ) {
    if (!choiceText || typeof choiceText !== "string") {
      DOMHelpers._warning("Invalid choiceText passed to createChoice");
      choiceText = "[Invalid Choice]";
    }

    if (!Array.isArray(customClasses)) {
      DOMHelpers._warning(
        "Invalid customClasses passed to createChoice - using empty array",
      );
      customClasses = [];
    }

    try {
      const choiceParagraphElement = document.createElement("p");
      choiceParagraphElement.classList.add("choice");

      for (const className of customClasses) {
        if (className && typeof className === "string") {
          choiceParagraphElement.classList.add(className);
        }
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

        const allTrailing =
          window.storyManager?.settings?.toneIndicatorsTrailing;

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
          ? `<span class="choice-key-hint">${keyHint}.</span> `
          : "";

      if (isClickable) {
        choiceParagraphElement.innerHTML = `<a href="#" role="button" aria-roledescription="choice">${leadingToneHTML}${hintPrefix}${choiceText}${trailingToneHTML}${srOnlyLabels}</a>`;
      } else {
        choiceParagraphElement.innerHTML = `<span class="unclickable" aria-roledescription="unavailable choice">${leadingToneHTML}${hintPrefix}${choiceText}${trailingToneHTML}${srOnlyLabels}</span>`;
      }

      this.storyContainer.appendChild(choiceParagraphElement);
      return choiceParagraphElement;
    } catch (error) {
      DOMHelpers._error("Failed to create choice", error);
      return null;
    }
  }

  addChoiceClickHandler(choiceElement, callback) {
    if (!choiceElement || !(choiceElement instanceof Element)) {
      DOMHelpers._warning(
        "Invalid choiceElement passed to addChoiceClickHandler",
      );
      return;
    }

    if (!callback || typeof callback !== "function") {
      DOMHelpers._warning("Invalid callback passed to addChoiceClickHandler");
      return;
    }

    const choiceAnchor = choiceElement.querySelector("a");
    if (choiceAnchor) {
      choiceAnchor.addEventListener("click", function (event) {
        try {
          event.preventDefault();
          callback();
        } catch (error) {
          DOMHelpers._error("Choice click handler failed", error);
        }
      });
    } else {
      DOMHelpers._warning(
        "No anchor element found in choice for click handler",
      );
    }
  }

  removeAll(selector) {
    if (!selector || typeof selector !== "string") {
      DOMHelpers._warning("Invalid selector passed to removeAll");
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
        DOMHelpers._warning(`Failed to remove element at index ${i}`, error);
      }
    }
  }

  setVisible(selector, visible) {
    if (!selector || typeof selector !== "string") {
      DOMHelpers._warning("Invalid selector passed to setVisible");
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
        DOMHelpers._warning(
          `Failed to set visibility for element at index ${i}`,
          error,
        );
      }
    }
  }

  clearStoryContent() {
    this.removeAll("p");
    this.removeAll("img");
    this.removeAll("figure");
    this.removeAll(".stat-bar-container");
    this.removeAll(".user-input-inline-container");
  }

  scrollToTop(container) {
    if (!container || !(container instanceof Element)) {
      DOMHelpers._warning("Invalid container passed to scrollToTop");
      return;
    }

    try {
      if (typeof container.scrollTo === "function") {
        container.scrollTo(0, 0);
      } else if (typeof container.scrollTop !== "undefined") {
        container.scrollTop = 0;
        container.scrollLeft = 0;
      } else {
        DOMHelpers._warning("Container does not support scrolling operations");
      }
    } catch (error) {
      DOMHelpers._warning("Failed to scroll to top", error);
    }
  }

  recover() {
    if (!this.storyContainer?.parentNode) {
      const newContainer = document.querySelector("#story");
      if (newContainer) {
        this.storyContainer = newContainer;
        DOMHelpers._warning(
          "DOM helpers recovered by finding new story container",
        );
      } else {
        DOMHelpers._error(
          "DOM helpers recovery failed - no story container found",
        );
      }
    }
  }

  isReady() {
    return !!this.storyContainer?.parentNode;
  }

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

  static _error(message, error = null) {
    window.errorManager.error(message, error, DOMHelpers.errorSource);
  }

  static _warning(message, error = null) {
    window.errorManager.warning(message, error, DOMHelpers.errorSource);
  }

  static _critical(message, error = null) {
    window.errorManager.critical(message, error, DOMHelpers.errorSource);
  }
}
export { DOMHelpers };
