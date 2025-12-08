import { SettingsManager } from "../../src/js/settings-manager.js";
import { TagRegistry } from "../../src/js/tag-registry.js";

describe("SettingsManager", () => {
  describe("getToneIndicators", () => {
    let settings;

    beforeEach(() => {
      TagRegistry.clearTones();
      TagRegistry.registerTone("flirty", "😏");
      TagRegistry.registerTone("angry", "whatshot");
      TagRegistry.registerTone("sarcastic", "🙄");

      settings = Object.create(SettingsManager.prototype);
      settings.settings = { toneIndicators: true };
      settings.toneIndicatorsAvailable = true;
    });

    afterEach(() => {
      TagRegistry.clearTones();
    });

    test("returns matching indicators for tags", () => {
      const result = settings.getToneIndicators(["flirty", "angry"]);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ label: "flirty", icon: "😏" });
      expect(result[1]).toEqual({ label: "angry", icon: "whatshot" });
    });

    test("returns empty array when toneIndicators setting is off", () => {
      settings.settings.toneIndicators = false;
      const result = settings.getToneIndicators(["flirty"]);
      expect(result).toEqual([]);
    });

    test("returns empty array when toneIndicatorsAvailable is false", () => {
      settings.toneIndicatorsAvailable = false;
      const result = settings.getToneIndicators(["flirty"]);
      expect(result).toEqual([]);
    });

    test("ignores tags not in toneMap", () => {
      const result = settings.getToneIndicators(["flirty", "unknown", "angry"]);
      expect(result).toHaveLength(2);
    });

    test("handles case-insensitively", () => {
      const result = settings.getToneIndicators(["FLIRTY", "Angry"]);
      expect(result).toHaveLength(2);
    });

    test("skips non-string tags", () => {
      const result = settings.getToneIndicators([
        null,
        "flirty",
        123,
        undefined,
      ]);
      expect(result).toHaveLength(1);
    });

    test("returns empty array for empty tags", () => {
      expect(settings.getToneIndicators([])).toEqual([]);
    });

    test("trims whitespace from tags", () => {
      const result = settings.getToneIndicators(["  flirty  ", "\tangry\n"]);
      expect(result).toHaveLength(2);
      expect(result[0].label).toBe("flirty");
    });

    test("handles non-array input gracefully", () => {
      expect(() => settings.getToneIndicators(null)).toThrow();
      expect(() => settings.getToneIndicators(undefined)).toThrow();
    });
  });
});
