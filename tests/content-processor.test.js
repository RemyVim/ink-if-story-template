import { ContentProcessor } from "../src/js/content-processor.js";
import { errorManager } from "../src/js/error-manager.js";

describe("ContentProcessor", () => {
  let processor;

  beforeEach(() => {
    vi.clearAllMocks();
    const mockTagProcessor = {
      processLineTags: vi.fn(() => ({ customClasses: [], specialActions: [] })),
      processChoiceTags: vi.fn(() => ({
        customClasses: [],
        isClickable: true,
      })),
    };
    processor = new ContentProcessor(mockTagProcessor);
  });

  describe("parseImageTag", () => {
    test("parses simple image source", () => {
      const result = processor.parseImageTag("hero.png");
      expect(result.src).toBe("hero.png");
      expect(result.alignment).toBeNull();
      expect(result.width).toBeNull();
      expect(result.altText).toBeNull();
      expect(result.showCaption).toBe(false);
    });

    test("parses image with alignment", () => {
      const result = processor.parseImageTag("hero.png left");
      expect(result.src).toBe("hero.png");
      expect(result.alignment).toBe("left");
      expect(result.width).toBeNull();
      expect(result.altText).toBeNull();
      expect(result.showCaption).toBe(false);
    });

    test("parses image with width", () => {
      const result = processor.parseImageTag("hero.png 50%");
      expect(result.src).toBe("hero.png");
      expect(result.alignment).toBeNull();
      expect(result.width).toBe("50%");
      expect(result.altText).toBeNull();
      expect(result.showCaption).toBe(false);
    });

    test("parses image with px width", () => {
      const result = processor.parseImageTag("hero.png 200px");
      expect(result.src).toBe("hero.png");
      expect(result.alignment).toBeNull();
      expect(result.width).toBe("200px");
      expect(result.altText).toBeNull();
      expect(result.showCaption).toBe(false);
    });

    test("parses image with alt text", () => {
      const result = processor.parseImageTag('hero.png "A brave hero"');
      expect(result.src).toBe("hero.png");
      expect(result.alignment).toBeNull();
      expect(result.width).toBeNull();
      expect(result.altText).toBe("A brave hero");
      expect(result.showCaption).toBe(false);
    });

    test("parses image with caption flag", () => {
      const result = processor.parseImageTag("hero.png caption");
      expect(result.src).toBe("hero.png");
      expect(result.alignment).toBeNull();
      expect(result.width).toBeNull();
      expect(result.altText).toBeNull();
      expect(result.showCaption).toBe(true);
    });

    test("parses complex image tag with all options", () => {
      const result = processor.parseImageTag(
        'hero.png center 40% caption "The Hero"',
      );
      expect(result.src).toBe("hero.png");
      expect(result.alignment).toBe("center");
      expect(result.width).toBe("40%");
      expect(result.altText).toBe("The Hero");
      expect(result.showCaption).toBe(true);
    });

    test("handles different alignment values", () => {
      expect(processor.parseImageTag("img.png left").alignment).toBe("left");
      expect(processor.parseImageTag("img.png right").alignment).toBe("right");
      expect(processor.parseImageTag("img.png center").alignment).toBe(
        "center",
      );
    });

    test("handles different width units", () => {
      expect(processor.parseImageTag("img.png 50%").width).toBe("50%");
      expect(processor.parseImageTag("img.png 200px").width).toBe("200px");
      expect(processor.parseImageTag("img.png 10em").width).toBe("10em");
      expect(processor.parseImageTag("img.png 5rem").width).toBe("5rem");
      expect(processor.parseImageTag("img.png 50vw").width).toBe("50vw");
    });

    test("handles empty input", () => {
      const result = processor.parseImageTag("");
      expect(result.src).toBeNull();
      expect(result.alignment).toBeNull();
      expect(result.width).toBeNull();
      expect(result.altText).toBeNull();
      expect(result.showCaption).toBe(false);
    });

    test("handles path with directories", () => {
      const result = processor.parseImageTag("assets/images/hero.png");
      expect(result.src).toBe("assets/images/hero.png");
    });

    test("handles URL as source", () => {
      const result = processor.parseImageTag(
        "https://example.com/hero.png left",
      );
      expect(result.src).toBe("https://example.com/hero.png");
      expect(result.alignment).toBe("left");
    });

    test("alignment is case-insensitive", () => {
      expect(processor.parseImageTag("img.png LEFT").alignment).toBe("left");
      expect(processor.parseImageTag("img.png Center").alignment).toBe(
        "center",
      );
    });

    test("caption is case-insensitive", () => {
      expect(processor.parseImageTag("img.png CAPTION").showCaption).toBe(true);
      expect(processor.parseImageTag("img.png Caption").showCaption).toBe(true);
    });

    test("handles extra whitespace", () => {
      const result = processor.parseImageTag("  hero.png   left   50%  ");
      expect(result.src).toBe("hero.png");
      expect(result.alignment).toBe("left");
      expect(result.width).toBe("50%");
    });

    test("handles empty quoted alt text", () => {
      const result = processor.parseImageTag('hero.png ""');
      expect(result.altText).toBe("");
    });

    test("ignores invalid width without unit", () => {
      const result = processor.parseImageTag("hero.png 50");
      expect(result.width).toBeNull();
    });

    test("uses last valid alignment when multiple provided", () => {
      // Note: last value wins (like CSS)
      const result = processor.parseImageTag("hero.png left right");
      expect(result.alignment).toBe("right");
    });
  });

  describe("parseUserInputTag", () => {
    test("parses simple variable name", () => {
      const result = processor.parseUserInputTag("player_name");
      expect(result.variableName).toBe("player_name");
      expect(result.placeholder).toBe("");
    });

    test("parses variable with placeholder", () => {
      const result = processor.parseUserInputTag(
        'player_name "Enter your name"',
      );
      expect(result.variableName).toBe("player_name");
      expect(result.placeholder).toBe("Enter your name");
    });

    test("handles whitespace", () => {
      const result = processor.parseUserInputTag("  my_var  ");
      expect(result.variableName).toBe("my_var");
    });
  });

  describe("parseStatBarTag", () => {
    test("parses simple stat bar", () => {
      const result = processor.parseStatBarTag("health");
      expect(result.variableName).toBe("health");
      expect(result.min).toBe(0);
      expect(result.max).toBe(100);
      expect(result.leftLabel).toBeNull();
      expect(result.rightLabel).toBeNull();
      expect(result.isOpposed).toBe(false);
      expect(result.clamp).toBe(false);
    });

    test("parses stat bar with custom range", () => {
      const result = processor.parseStatBarTag("health 0 50");
      expect(result.variableName).toBe("health");
      expect(result.min).toBe(0);
      expect(result.max).toBe(50);
      expect(result.leftLabel).toBeNull();
      expect(result.rightLabel).toBeNull();
      expect(result.isOpposed).toBe(false);
      expect(result.clamp).toBe(false);
    });

    test("parses stat bar with single label", () => {
      const result = processor.parseStatBarTag('health "Health Points"');
      expect(result.variableName).toBe("health");
      expect(result.min).toBe(0);
      expect(result.max).toBe(100);
      expect(result.leftLabel).toBe("Health Points");
      expect(result.rightLabel).toBeNull();
      expect(result.isOpposed).toBe(false);
      expect(result.clamp).toBe(false);
    });

    test("parses opposed stat bar with two labels", () => {
      const result = processor.parseStatBarTag('morality "Evil" "Good"');
      expect(result.variableName).toBe("morality");
      expect(result.min).toBe(0);
      expect(result.max).toBe(100);
      expect(result.leftLabel).toBe("Evil");
      expect(result.rightLabel).toBe("Good");
      expect(result.isOpposed).toBe(true);
      expect(result.clamp).toBe(false);
    });

    test("parses stat bar with clamp", () => {
      const result = processor.parseStatBarTag("health 0 100 clamp");
      expect(result.variableName).toBe("health");
      expect(result.min).toBe(0);
      expect(result.max).toBe(100);
      expect(result.leftLabel).toBeNull();
      expect(result.rightLabel).toBeNull();
      expect(result.isOpposed).toBe(false);
      expect(result.clamp).toBe(true);
    });

    test("parses complex stat bar", () => {
      const result = processor.parseStatBarTag(
        'alignment -50 50 "Chaos" "Order" clamp',
      );
      expect(result.variableName).toBe("alignment");
      expect(result.min).toBe(-50);
      expect(result.max).toBe(50);
      expect(result.leftLabel).toBe("Chaos");
      expect(result.rightLabel).toBe("Order");
      expect(result.isOpposed).toBe(true);
      expect(result.clamp).toBe(true);
    });

    test("handles empty input", () => {
      const result = processor.parseStatBarTag("");
      expect(result.variableName).toBeNull();
    });

    test("handles whitespace", () => {
      const result = processor.parseStatBarTag("  health   0   100  ");
      expect(result.variableName).toBe("health");
      expect(result.min).toBe(0);
      expect(result.max).toBe(100);
    });

    test("clamp is case-insensitive", () => {
      expect(processor.parseStatBarTag("health CLAMP").clamp).toBe(true);
      expect(processor.parseStatBarTag("health Clamp").clamp).toBe(true);
    });

    test("handles decimal range values", () => {
      const result = processor.parseStatBarTag("progress 0.5 1.5");
      expect(result.min).toBe(0.5);
      expect(result.max).toBe(1.5);
    });

    test("warns when only one number provided", () => {
      const result = processor.parseStatBarTag("health 50");
      expect(result.min).toBe(0);
      expect(result.max).toBe(100);
      expect(errorManager.warning).toHaveBeenCalledWith(
        expect.stringContaining("only one number"),
      );
    });

    test("warns when more than two numbers provided", () => {
      const result = processor.parseStatBarTag("health 50 100 200");
      expect(result.min).toBe(0);
      expect(result.max).toBe(100);
      expect(errorManager.warning).toHaveBeenCalledWith(
        expect.stringContaining("too many numbers"),
      );
    });

    test("warns when more than two labels provided", () => {
      const result = processor.parseStatBarTag('stat "One" "Two" "Three"');
      expect(result.leftLabel).toBe("One");
      expect(result.rightLabel).toBe("Two");
      expect(errorManager.warning).toHaveBeenCalledWith(
        expect.stringContaining("only first two are used"),
      );
    });

    test("handles labels with special characters", () => {
      const result = processor.parseStatBarTag(
        'stat "Health (HP)" "Mana & Magic"',
      );
      expect(result.leftLabel).toBe("Health (HP)");
      expect(result.rightLabel).toBe("Mana & Magic");
    });

    test("handles range with labels and clamp in any order", () => {
      const result = processor.parseStatBarTag(
        'stat clamp "Left" -1000 1000 "Right"',
      );
      expect(result.variableName).toBe("stat");
      expect(result.min).toBe(-1000);
      expect(result.max).toBe(1000);
      expect(result.leftLabel).toBe("Left");
      expect(result.rightLabel).toBe("Right");
      expect(result.isOpposed).toBe(true);
      expect(result.clamp).toBe(true);
    });

    test("warns about unquoted labels", () => {
      const result = processor.parseStatBarTag("health abc xyz");
      expect(result.min).toBe(0);
      expect(result.max).toBe(100);
      expect(result.leftLabel).toBeNull();
      expect(result.rightLabel).toBeNull();
      expect(errorManager.warning).toHaveBeenCalledWith(
        expect.stringContaining("use quotes for labels"),
      );
    });

    test("warns when min greater than max", () => {
      const result = processor.parseStatBarTag("health 100 0");
      expect(result.min).toBe(100);
      expect(result.max).toBe(0);
      expect(errorManager.warning).toHaveBeenCalledWith(
        expect.stringContaining("min (100) >= max (0)"),
      );
    });

    test("warns when min equals max", () => {
      const result = processor.parseStatBarTag("health 50 50");
      expect(result.min).toBe(50);
      expect(result.max).toBe(50);
      expect(errorManager.warning).toHaveBeenCalledWith(
        expect.stringContaining("min (50) >= max (50)"),
      );
    });

    test("handles empty quoted label", () => {
      const result = processor.parseStatBarTag('health ""');
      expect(result.leftLabel).toBe("");
    });

    test("handles variable name with underscores", () => {
      const result = processor.parseStatBarTag("player_health 0 100");
      expect(result.variableName).toBe("player_health");
    });

    test("handles variable name with numbers", () => {
      const result = processor.parseStatBarTag("stat1 0 100");
      expect(result.variableName).toBe("stat1");
    });

    test("ignores duplicate clamp keyword", () => {
      const result = processor.parseStatBarTag("health clamp clamp");
      expect(result.variableName).toBe("health");
      expect(result.leftLabel).toBeNull();
      expect(result.rightLabel).toBeNull();
      expect(result.clamp).toBe(true);
    });
  });

  describe("findSpecialAction", () => {
    test("returns null for empty array", () => {
      expect(processor.findSpecialAction([])).toBeNull();
    });

    test("returns null for non-array", () => {
      expect(processor.findSpecialAction(null)).toBeNull();
      expect(processor.findSpecialAction(undefined)).toBeNull();
    });

    test("finds RESTART action", () => {
      const actions = [() => "RESTART"];
      const result = processor.findSpecialAction(actions);
      expect(result).toBeDefined();
      expect(result()).toBe("RESTART");
    });

    test("finds CLEAR action", () => {
      const actions = [() => "CLEAR"];
      const result = processor.findSpecialAction(actions);
      expect(result).toBeDefined();
      expect(result()).toBe("CLEAR");
    });

    test("finds object action", () => {
      const actions = [() => ({ type: "custom" })];
      const result = processor.findSpecialAction(actions);
      expect(result).toBeDefined();
    });

    test("skips non-special actions", () => {
      const actions = [() => "NOT_SPECIAL", () => "RESTART"];
      const result = processor.findSpecialAction(actions);
      expect(result()).toBe("RESTART");
    });

    test("skips non-function items with warning", () => {
      const actions = ["not a function", () => "RESTART"];
      const result = processor.findSpecialAction(actions);
      expect(result()).toBe("RESTART");
    });

    test("returns first special action when multiple exist", () => {
      const actions = [() => "CLEAR", () => "RESTART"];
      const result = processor.findSpecialAction(actions);
      expect(result()).toBe("CLEAR");
    });

    test("handles function that throws error", () => {
      const actions = [
        () => {
          throw new Error("oops");
        },
        () => "RESTART",
      ];
      const result = processor.findSpecialAction(actions);
      expect(result()).toBe("RESTART");
      expect(errorManager.error).toHaveBeenCalled();
    });

    test("returns undefined when no special actions found", () => {
      const actions = [() => "NOT_SPECIAL", () => "ALSO_NOT"];
      const result = processor.findSpecialAction(actions);
      expect(result).toBeUndefined();
    });

    test("treats null return as non-special", () => {
      const actions = [() => null, () => "RESTART"];
      const result = processor.findSpecialAction(actions);
      expect(result()).toBe("RESTART");
    });

    test("treats array return as object (special)", () => {
      // typeof [] === 'object'
      const actions = [() => ["something"]];
      const result = processor.findSpecialAction(actions);
      expect(result).toBeDefined();
    });

    test("verifies warning is called for non-function", () => {
      processor.findSpecialAction(["not a function"]);
      expect(errorManager.warning).toHaveBeenCalledWith(
        expect.stringContaining("Non-function"),
      );
    });
  });
});
