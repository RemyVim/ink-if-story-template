import { ChoiceManager } from "../../src/js/choice-manager.js";

describe("ChoiceManager", () => {
  let choiceManager;

  beforeEach(() => {
    vi.clearAllMocks();
    const mockStoryManager = {
      tagProcessor: {
        processChoiceTags: vi.fn(() => ({
          customClasses: [],
          isClickable: true,
        })),
      },
      settings: {
        getToneIndicators: vi.fn(() => []),
      },
    };
    choiceManager = new ChoiceManager(mockStoryManager);
  });

  describe("getKeyHint", () => {
    test("returns 1-9 for indices 0-8", () => {
      expect(choiceManager.getKeyHint(0)).toBe("1");
      expect(choiceManager.getKeyHint(1)).toBe("2");
      expect(choiceManager.getKeyHint(8)).toBe("9");
    });

    test("returns a-z for indices 9+", () => {
      expect(choiceManager.getKeyHint(9)).toBe("a");
      expect(choiceManager.getKeyHint(10)).toBe("b");
      expect(choiceManager.getKeyHint(34)).toBe("z");
    });

    test("handles boundary between numbers and letters", () => {
      expect(choiceManager.getKeyHint(8)).toBe("9");
      expect(choiceManager.getKeyHint(9)).toBe("a");
    });
  });

  describe("hasClickableChoices", () => {
    test("returns true when at least one choice is clickable", () => {
      const choices = [
        { text: "A", isClickable: false },
        { text: "B", isClickable: true },
      ];
      expect(choiceManager.hasClickableChoices(choices)).toBe(true);
    });

    test("returns true when isClickable is undefined (default clickable)", () => {
      const choices = [{ text: "A" }];
      expect(choiceManager.hasClickableChoices(choices)).toBe(true);
    });

    test("returns false when all choices are unclickable", () => {
      const choices = [
        { text: "A", isClickable: false },
        { text: "B", isClickable: false },
      ];
      expect(choiceManager.hasClickableChoices(choices)).toBe(false);
    });

    test("returns false for empty array", () => {
      expect(choiceManager.hasClickableChoices([])).toBe(false);
    });

    test("returns false for non-array input", () => {
      expect(choiceManager.hasClickableChoices(null)).toBe(false);
      expect(choiceManager.hasClickableChoices(undefined)).toBe(false);
      expect(choiceManager.hasClickableChoices("string")).toBe(false);
    });
  });

  describe("filterChoices", () => {
    const choices = [
      { text: "A", isClickable: true },
      { text: "B", isClickable: false },
      { text: "C" }, // undefined = clickable
    ];

    test("returns all choices when clickableOnly is false", () => {
      expect(choiceManager.filterChoices(choices, false)).toHaveLength(3);
    });

    test("returns only clickable choices when clickableOnly is true", () => {
      const result = choiceManager.filterChoices(choices, true);
      expect(result).toHaveLength(2);
      expect(result.map((c) => c.text)).toEqual(["A", "C"]);
    });

    test("returns empty array for non-array input", () => {
      expect(choiceManager.filterChoices(null)).toEqual([]);
      expect(choiceManager.filterChoices(undefined)).toEqual([]);
    });

    test("defaults to returning all choices", () => {
      expect(choiceManager.filterChoices(choices)).toHaveLength(3);
    });
  });

  describe("validateChoice", () => {
    test("returns true for valid choice with text and onClick", () => {
      const choice = { text: "Hello", onClick: () => {} };
      expect(choiceManager.validateChoice(choice)).toBe(true);
    });

    test("returns false when text is missing", () => {
      const choice = { onClick: () => {} };
      expect(choiceManager.validateChoice(choice)).toBe(false);
    });

    test("returns false when onClick is missing", () => {
      const choice = { text: "Hello" };
      expect(choiceManager.validateChoice(choice)).toBe(false);
    });

    test("returns false for null/undefined", () => {
      expect(choiceManager.validateChoice(null)).toBe(false);
      expect(choiceManager.validateChoice(undefined)).toBe(false);
    });

    test("returns false for non-object input", () => {
      expect(choiceManager.validateChoice("string")).toBe(false);
      expect(choiceManager.validateChoice(123)).toBe(false);
    });
  });

  describe("getChoiceStats", () => {
    test("returns correct statistics for mixed choices", () => {
      const choices = [
        { text: "A", isClickable: true, classes: ["highlight"] },
        { text: "B", isClickable: false, isSpecial: true },
        { text: "C", classes: [] },
        { text: "D", isSpecial: true, classes: ["btn"] },
      ];
      const stats = choiceManager.getChoiceStats(choices);
      expect(stats.total).toBe(4);
      expect(stats.clickable).toBe(3); // A, C, D (B is false)
      expect(stats.special).toBe(2); // B, D
      expect(stats.withClasses).toBe(2); // A, D (C has empty array)
    });

    test("returns zeros for empty array", () => {
      const stats = choiceManager.getChoiceStats([]);
      expect(stats).toEqual({
        total: 0,
        clickable: 0,
        special: 0,
        withClasses: 0,
      });
    });

    test("returns zeros for non-array input", () => {
      expect(choiceManager.getChoiceStats(null)).toEqual({
        total: 0,
        clickable: 0,
        special: 0,
        withClasses: 0,
      });
    });
  });

  describe("createSpecialChoice", () => {
    test("creates valid special choice with text and onClick", () => {
      const onClick = vi.fn();
      const choice = choiceManager.createSpecialChoice("Back", onClick, [
        "btn",
      ]);

      expect(choice.text).toBe("Back");
      expect(choice.classes).toEqual(["btn"]);
      expect(choice.isClickable).toBe(true);
      expect(choice.isSpecial).toBe(true);
      expect(typeof choice.onClick).toBe("function");
    });

    test("wraps onClick in safe handler", () => {
      const onClick = vi.fn();
      const choice = choiceManager.createSpecialChoice("Back", onClick);

      choice.onClick();
      expect(onClick).toHaveBeenCalled();
    });

    test("returns error choice for invalid text", () => {
      const choice = choiceManager.createSpecialChoice(null, () => {});

      expect(choice.classes).toContain("error-choice");
      expect(choice.isClickable).toBe(false);
    });

    test("returns error choice for invalid onClick", () => {
      const choice = choiceManager.createSpecialChoice(
        "Back",
        "not-a-function"
      );

      expect(choice.classes).toContain("error-choice");
      expect(choice.isClickable).toBe(false);
    });

    test("defaults to empty classes array", () => {
      const choice = choiceManager.createSpecialChoice("Back", () => {});
      expect(choice.classes).toEqual([]);
    });
  });

  describe("createReturnChoice", () => {
    test("creates return choice with correct text", () => {
      const onReturn = vi.fn();
      const choice = choiceManager.createReturnChoice(onReturn);

      expect(choice.text).toContain("Return to Story");
      expect(choice.classes).toContain("return-button");
      expect(choice.isSpecial).toBe(true);
    });

    test("returns error choice when onReturn is not a function", () => {
      const choice = choiceManager.createReturnChoice("not-a-function");

      expect(choice.classes).toContain("error-choice");
    });
  });
});
