// dom-helpers.js
class DOMHelpers {
  constructor(storyContainer) {
    if (!storyContainer || !(storyContainer instanceof Element)) {
      window.errorManager.critical(
        "Invalid story container provided to DOM helpers",
        new Error("Invalid story container"),
        "dom-helpers",
      );
      return;
    }

    this.storyContainer = storyContainer;
  }

  // Remove all elements that match the given selector
  removeAll(selector) {
    if (!selector || typeof selector !== "string") {
      window.errorManager.warning(
        "Invalid selector passed to removeAll",
        null,
        "dom-helpers",
      );
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
        window.errorManager.warning(
          `Failed to remove element at index ${i}`,
          error,
          "dom-helpers",
        );
      }
    }
  }

  // Used for hiding and showing elements
  setVisible(selector, visible) {
    if (!selector || typeof selector !== "string") {
      window.errorManager.warning(
        "Invalid selector passed to setVisible",
        null,
        "dom-helpers",
      );
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
        window.errorManager.warning(
          `Failed to set visibility for element at index ${i}`,
          error,
          "dom-helpers",
        );
      }
    }
  }

  // Create a paragraph element with text and classes
  createParagraph(text, customClasses = []) {
    if (!text || typeof text !== "string") {
      window.errorManager.warning(
        "Invalid text passed to createParagraph",
        null,
        "dom-helpers",
      );
      return null;
    }

    if (!Array.isArray(customClasses)) {
      window.errorManager.warning(
        "Invalid customClasses passed to createParagraph - using empty array",
        null,
        "dom-helpers",
      );
      customClasses = [];
    }

    try {
      const paragraphElement = document.createElement("p");
      paragraphElement.innerHTML = text;

      // Add custom classes safely
      for (const className of customClasses) {
        if (className && typeof className === "string") {
          paragraphElement.classList.add(className);
        }
      }

      this.storyContainer.appendChild(paragraphElement);
      return paragraphElement;
    } catch (error) {
      window.errorManager.error(
        "Failed to create paragraph",
        error,
        "dom-helpers",
      );
      return null;
    }
  }

  // Create a choice element
  createChoice(
    choiceText,
    customClasses = [],
    isClickable = true,
    keyHint = null,
    showHint = true,
  ) {
    if (!choiceText || typeof choiceText !== "string") {
      window.errorManager.warning(
        "Invalid choiceText passed to createChoice",
        null,
        "dom-helpers",
      );
      choiceText = "[Invalid Choice]";
    }

    if (!Array.isArray(customClasses)) {
      window.errorManager.warning(
        "Invalid customClasses passed to createChoice - using empty array",
        null,
        "dom-helpers",
      );
      customClasses = [];
    }

    try {
      const choiceParagraphElement = document.createElement("p");
      choiceParagraphElement.classList.add("choice");

      // Add custom classes safely
      for (const className of customClasses) {
        if (className && typeof className === "string") {
          choiceParagraphElement.classList.add(className);
        }
      }

      // Build the display text with optional hint
      const hintPrefix =
        keyHint && showHint
          ? `<span class="choice-key-hint">${keyHint}.</span> `
          : "";

      // Set choice content based on clickability
      if (isClickable) {
        choiceParagraphElement.innerHTML = `<a href='#'>${hintPrefix}${choiceText}</a>`;
      } else {
        choiceParagraphElement.innerHTML = `<span class='unclickable'>${hintPrefix}${choiceText}</span>`;
      }

      this.storyContainer.appendChild(choiceParagraphElement);
      return choiceParagraphElement;
    } catch (error) {
      window.errorManager.error(
        "Failed to create choice",
        error,
        "dom-helpers",
      );
      return null;
    }
  }

  // Add click handler to choice
  addChoiceClickHandler(choiceElement, callback) {
    if (!choiceElement || !(choiceElement instanceof Element)) {
      window.errorManager.warning(
        "Invalid choiceElement passed to addChoiceClickHandler",
        null,
        "dom-helpers",
      );
      return;
    }

    if (!callback || typeof callback !== "function") {
      window.errorManager.warning(
        "Invalid callback passed to addChoiceClickHandler",
        null,
        "dom-helpers",
      );
      return;
    }

    const choiceAnchor = choiceElement.querySelector("a");
    if (choiceAnchor) {
      choiceAnchor.addEventListener("click", function (event) {
        try {
          event.preventDefault();
          callback();
        } catch (error) {
          window.errorManager.error(
            "Choice click handler failed",
            error,
            "dom-helpers",
          );
        }
      });
    } else {
      window.errorManager.warning(
        "No anchor element found in choice for click handler",
        null,
        "dom-helpers",
      );
    }
  }

  // Clear story content but preserve certain elements
  clearStoryContent() {
    // Clear paragraphs and images safely
    this.removeAll("p");
    this.removeAll("img");
  }

  // Scroll container to top
  scrollToTop(container) {
    if (!container || !(container instanceof Element)) {
      window.errorManager.warning(
        "Invalid container passed to scrollToTop",
        null,
        "dom-helpers",
      );
      return;
    }

    try {
      if (typeof container.scrollTo === "function") {
        container.scrollTo(0, 0);
      } else if (typeof container.scrollTop !== "undefined") {
        container.scrollTop = 0;
        container.scrollLeft = 0;
      } else {
        window.errorManager.warning(
          "Container does not support scrolling operations",
          null,
          "dom-helpers",
        );
      }
    } catch (error) {
      window.errorManager.warning(
        "Failed to scroll to top",
        error,
        "dom-helpers",
      );
    }
  }

  /**
   * Validate that DOM helpers are in working condition
   * @returns {boolean} True if DOM helpers are ready
   */
  isReady() {
    return !!this.storyContainer?.parentNode;
  }

  /**
   * Get DOM helper statistics for debugging
   * @returns {Object} DOM statistics
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

  /**
   * Attempt to recover from errors by validating container
   */
  recover() {
    if (!this.storyContainer?.parentNode) {
      // Try to find the story container again
      const newContainer = document.querySelector("#story");
      if (newContainer) {
        this.storyContainer = newContainer;
        window.errorManager.warning(
          "DOM helpers recovered by finding new story container",
          null,
          "dom-helpers",
        );
      } else {
        window.errorManager.error(
          "DOM helpers recovery failed - no story container found",
          null,
          "dom-helpers",
        );
      }
    }
  }
}
