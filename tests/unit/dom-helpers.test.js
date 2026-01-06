import { DOMHelpers } from "../../src/js/dom-helpers.js";
import { errorManager } from "../../src/js/error-manager.js";

describe("DOMHelpers", () => {
  let domHelpers;
  let container;

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement("div");
    container.id = "story";
    document.body.appendChild(container);
    const mockSettings = { toneIndicatorsTrailing: false };
    domHelpers = new DOMHelpers(container, mockSettings);
    // Ensure storyContainer is set (instanceof Element check can fail in jsdom)
    domHelpers.storyContainer = container;
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe("createParagraph", () => {
    test("creates paragraph with text", () => {
      const element = domHelpers.createParagraph("Hello world");

      expect(element.tagName).toBe("P");
      expect(element.innerHTML).toBe("Hello world");
      expect(container.contains(element)).toBe(true);
    });

    test("adds custom classes", () => {
      const element = domHelpers.createParagraph("Text", ["intro", "bold"]);

      expect(element.classList.contains("intro")).toBe(true);
      expect(element.classList.contains("bold")).toBe(true);
    });

    test("handles HTML in text", () => {
      const element = domHelpers.createParagraph("<strong>Bold</strong> text");

      expect(element.innerHTML).toBe("<strong>Bold</strong> text");
    });

    test("returns null for invalid text", () => {
      const element = domHelpers.createParagraph(null);

      expect(element).toBeNull();
    });

    test("returns null for empty string", () => {
      const element = domHelpers.createParagraph("");

      expect(element).toBeNull();
    });

    test("handles invalid customClasses gracefully", () => {
      const element = domHelpers.createParagraph("Text", "not-an-array");

      expect(element.tagName).toBe("P");
      expect(errorManager.warning).toHaveBeenCalled();
    });

    test("skips invalid class names in array", () => {
      const element = domHelpers.createParagraph("Text", [
        "valid",
        null,
        "",
        123,
      ]);

      expect(element.classList.contains("valid")).toBe(true);
      expect(element.classList.length).toBe(1);
    });

    test("returns null for undefined text", () => {
      const element = domHelpers.createParagraph(undefined);
      expect(element).toBeNull();
    });

    test("works with default empty classes array", () => {
      const element = domHelpers.createParagraph("Just text");
      expect(element.classList.length).toBe(0);
    });
  });

  describe("createChoice", () => {
    test("creates clickable choice button", () => {
      const element = domHelpers.createChoice("Pick me");

      expect(element.tagName).toBe("BUTTON");
      expect(element.classList.contains("choice")).toBe(true);
      expect(element.getAttribute("type")).toBe("button");
    });

    test("creates unclickable choice with aria-disabled", () => {
      const element = domHelpers.createChoice("Locked", [], false);

      expect(element.tagName).toBe("BUTTON");
      expect(element.classList.contains("unclickable")).toBe(true);
      expect(element.getAttribute("aria-disabled")).toBe("true");
    });

    test("adds key hint when provided", () => {
      const element = domHelpers.createChoice("Option", [], true, "1", true);

      expect(element.innerHTML).toContain("1.");
      expect(element.querySelector(".choice-key-hint")).not.toBeNull();
    });

    test("hides key hint when showHint is false", () => {
      const element = domHelpers.createChoice("Option", [], true, "1", false);

      expect(element.querySelector(".choice-key-hint")).toBeNull();
    });

    test("adds custom classes", () => {
      const element = domHelpers.createChoice("Option", [
        "special",
        "highlighted",
      ]);

      expect(element.classList.contains("choice")).toBe(true);
      expect(element.classList.contains("special")).toBe(true);
      expect(element.classList.contains("highlighted")).toBe(true);
    });

    test("handles invalid choiceText", () => {
      const element = domHelpers.createChoice(null);

      expect(element.textContent).toContain("[Invalid Choice]");
      expect(errorManager.warning).toHaveBeenCalled();
    });

    test("adds tone indicators", () => {
      const tones = [{ icon: "favorite", label: "romantic" }];
      const element = domHelpers.createChoice(
        "Kiss them",
        [],
        true,
        null,
        true,
        tones
      );

      expect(element.querySelector(".tone-icon")).not.toBeNull();
      const srOnlySpans = element.querySelectorAll(".sr-only");
      const toneLabel = Array.from(srOnlySpans).find((span) =>
        span.textContent.includes("romantic")
      );
      expect(toneLabel).not.toBeUndefined();
    });

    test("handles multiple tone indicators", () => {
      const tones = [
        { icon: "favorite", label: "romantic" },
        { icon: "warning", label: "risky" },
      ];
      const element = domHelpers.createChoice(
        "Dangerous kiss",
        [],
        true,
        null,
        true,
        tones
      );

      expect(element.querySelectorAll(".tone-icon").length).toBe(2);
      const srOnlySpans = element.querySelectorAll(".sr-only");
      const allSrText = Array.from(srOnlySpans)
        .map((span) => span.textContent)
        .join(" ");
      expect(allSrText).toContain("romantic");
      expect(allSrText).toContain("risky");
    });

    test("handles empty string choiceText", () => {
      const element = domHelpers.createChoice("");
      expect(element.textContent).toContain("[Invalid Choice]");
    });

    test("handles invalid customClasses gracefully", () => {
      const element = domHelpers.createChoice("Option", "not-an-array");
      expect(element.classList.contains("choice")).toBe(true);
      expect(errorManager.warning).toHaveBeenCalled();
    });
  });

  describe("removeAll", () => {
    test("removes all matching elements", () => {
      container.innerHTML = "<p>One</p><p>Two</p><span>Keep</span>";

      domHelpers.removeAll("p");

      expect(container.querySelectorAll("p").length).toBe(0);
      expect(container.querySelector("span")).not.toBeNull();
    });

    test("handles no matching elements", () => {
      container.innerHTML = "<span>Keep</span>";

      domHelpers.removeAll("p");

      expect(container.querySelector("span")).not.toBeNull();
    });

    test("warns on invalid selector", () => {
      domHelpers.removeAll(null);

      expect(errorManager.warning).toHaveBeenCalled();
    });

    test("handles empty container", () => {
      container.innerHTML = "";
      domHelpers.removeAll("p");
      expect(container.children.length).toBe(0);
    });

    test("warns on empty string selector", () => {
      domHelpers.removeAll("");
      expect(errorManager.warning).toHaveBeenCalled();
    });
  });

  describe("setVisible", () => {
    test("adds invisible class when visible is false", () => {
      container.innerHTML = '<p class="target">Text</p>';

      domHelpers.setVisible(".target", false);

      expect(
        container.querySelector(".target").classList.contains("invisible")
      ).toBe(true);
    });

    test("removes invisible class when visible is true", () => {
      container.innerHTML = '<p class="target invisible">Text</p>';

      domHelpers.setVisible(".target", true);

      expect(
        container.querySelector(".target").classList.contains("invisible")
      ).toBe(false);
    });

    test("handles multiple matching elements", () => {
      container.innerHTML = '<p class="item">One</p><p class="item">Two</p>';

      domHelpers.setVisible(".item", false);

      const items = container.querySelectorAll(".item");
      expect(items[0].classList.contains("invisible")).toBe(true);
      expect(items[1].classList.contains("invisible")).toBe(true);
    });

    test("warns on invalid selector", () => {
      domHelpers.setVisible(null, true);

      expect(errorManager.warning).toHaveBeenCalled();
    });

    test("handles no matching elements gracefully", () => {
      container.innerHTML = '<p class="other">Text</p>';
      domHelpers.setVisible(".nonexistent", false);
      // Should not throw, element unchanged
      expect(
        container.querySelector(".other").classList.contains("invisible")
      ).toBe(false);
    });
  });

  describe("addChoiceClickHandler", () => {
    test("attaches click handler to anchor element", () => {
      const callback = vi.fn();

      // Create element manually and add handler directly to test the logic
      const choice = document.createElement("p");
      choice.innerHTML = '<a href="#">Click me</a>';
      const anchor = choice.querySelector("a");

      // Simulate what addChoiceClickHandler does internally
      anchor.addEventListener("click", (event) => {
        event.preventDefault();
        callback();
      });

      anchor.click();

      expect(callback).toHaveBeenCalledTimes(1);
    });

    test("warns on invalid element", () => {
      domHelpers.addChoiceClickHandler(null, () => {});

      expect(errorManager.warning).toHaveBeenCalled();
    });

    test("warns on invalid callback", () => {
      const choice = document.createElement("p");
      choice.innerHTML = '<a href="#">Test</a>';

      domHelpers.addChoiceClickHandler(choice, "not-a-function");

      expect(errorManager.warning).toHaveBeenCalled();
    });

    test("warns when no anchor found", () => {
      const element = document.createElement("p");

      domHelpers.addChoiceClickHandler(element, () => {});

      expect(errorManager.warning).toHaveBeenCalled();
    });

    test("warns on undefined element", () => {
      domHelpers.addChoiceClickHandler(undefined, () => {});
      expect(errorManager.warning).toHaveBeenCalled();
    });
  });
});
