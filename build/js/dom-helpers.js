// DOM manipulation helper functions
class DOMHelpers {
  constructor(storyContainer) {
    this.storyContainer = storyContainer;
  }

  // Remove all elements that match the given selector
  removeAll(selector) {
    const allElements = this.storyContainer.querySelectorAll(selector);
    for (let i = 0; i < allElements.length; i++) {
      const el = allElements[i];
      el.parentNode.removeChild(el);
    }
  }

  // Used for hiding and showing elements
  setVisible(selector, visible) {
    const allElements = this.storyContainer.querySelectorAll(selector);
    for (let i = 0; i < allElements.length; i++) {
      const el = allElements[i];
      if (!visible) {
        el.classList.add("invisible");
      } else {
        el.classList.remove("invisible");
      }
    }
  }

  // Create a paragraph element with text and classes
  createParagraph(text, customClasses = []) {
    const paragraphElement = document.createElement("p");
    paragraphElement.innerHTML = text;

    // Add custom classes
    for (const className of customClasses) {
      paragraphElement.classList.add(className);
    }

    this.storyContainer.appendChild(paragraphElement);
    return paragraphElement;
  }

  // Create a choice element
  createChoice(choiceText, customClasses = [], isClickable = true) {
    const choiceParagraphElement = document.createElement("p");
    choiceParagraphElement.classList.add("choice");

    // Add custom classes
    for (const className of customClasses) {
      choiceParagraphElement.classList.add(className);
    }

    if (isClickable) {
      choiceParagraphElement.innerHTML = `<a href='#'>${choiceText}</a>`;
    } else {
      choiceParagraphElement.innerHTML = `<span class='unclickable'>${choiceText}</span>`;
    }

    this.storyContainer.appendChild(choiceParagraphElement);
    return choiceParagraphElement;
  }

  // Add click handler to choice
  addChoiceClickHandler(choiceElement, callback) {
    const choiceAnchor = choiceElement.querySelector("a");
    if (choiceAnchor) {
      choiceAnchor.addEventListener("click", function (event) {
        event.preventDefault();
        callback();
      });
    }
  }

  // Clear story content but preserve certain elements
  clearStoryContent() {
    this.removeAll("p");
    this.removeAll("img");
  }

  // Scroll container to top
  scrollToTop(container) {
    container.scrollTo(0, 0);
  }
}
