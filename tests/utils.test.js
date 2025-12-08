import { Utils } from "../src/js/utils.js";

describe("Utils", () => {
  describe("levenshteinDistance", () => {
    test("returns 0 for identical strings", () => {
      expect(Utils.levenshteinDistance("hello", "hello")).toBe(0);
      expect(Utils.levenshteinDistance("", "")).toBe(0);
    });

    test("returns length of other string when one is empty", () => {
      expect(Utils.levenshteinDistance("", "hello")).toBe(5);
      expect(Utils.levenshteinDistance("hello", "")).toBe(5);
    });

    test("counts single character difference", () => {
      expect(Utils.levenshteinDistance("cat", "bat")).toBe(1); // substitution
      expect(Utils.levenshteinDistance("cat", "cats")).toBe(1); // insertion
      expect(Utils.levenshteinDistance("cats", "cat")).toBe(1); // deletion
    });

    test("handles multiple differences", () => {
      expect(Utils.levenshteinDistance("kitten", "sitting")).toBe(3);
      expect(Utils.levenshteinDistance("saturday", "sunday")).toBe(3);
    });

    test("is case-sensitive", () => {
      expect(Utils.levenshteinDistance("Hello", "hello")).toBe(1);
      expect(Utils.levenshteinDistance("ABC", "abc")).toBe(3);
    });

    test("handles completely different strings", () => {
      expect(Utils.levenshteinDistance("abc", "xyz")).toBe(3);
    });

    // Real-world use case: tag typo suggestions
    test("detects similar tag names (typos)", () => {
      expect(Utils.levenshteinDistance("IMAGE", "IMGE")).toBe(1); // missing A
      expect(Utils.levenshteinDistance("IMAGE", "IAMGE")).toBe(2); // transposition
      expect(Utils.levenshteinDistance("CLEAR", "CLER")).toBe(1); // missing A
      expect(Utils.levenshteinDistance("AUDIO", "ADUIO")).toBe(2); // transposition
    });

    // Edge cases
    test("handles single character strings", () => {
      expect(Utils.levenshteinDistance("a", "b")).toBe(1);
      expect(Utils.levenshteinDistance("a", "a")).toBe(0);
    });
  });

  describe("formatKnotName", () => {
    test("converts camelCase to Title Case", () => {
      expect(Utils.formatKnotName("characterSheet")).toBe("Character Sheet");
    });

    test("converts snake_case to Title Case", () => {
      expect(Utils.formatKnotName("character_sheet")).toBe("Character Sheet");
    });

    test("handles single word", () => {
      expect(Utils.formatKnotName("inventory")).toBe("Inventory");
    });

    test("handles mixed camelCase and snake_case", () => {
      expect(Utils.formatKnotName("myCharacter_info")).toBe(
        "My Character Info"
      );
    });

    test("handles already lowercase", () => {
      expect(Utils.formatKnotName("credits")).toBe("Credits");
    });

    test("consecutive capitals treated as single word", () => {
      expect(Utils.formatKnotName("NPCDialogue")).toBe("Npc Dialogue");
    });
  });
});
