import { DisplayManager } from "../src/js/display-manager.js";

describe("DisplayManager", () => {
  let displayManager;

  beforeEach(() => {
    vi.clearAllMocks();
    // Constructor will log a critical error about missing #story element,
    // but that's fine: we're testing methods that don't need DOM
    displayManager = new DisplayManager();
  });

  describe("calculateStatBarMetrics", () => {
    test("calculates correct fill percent for value in middle of range", () => {
      const item = { min: 0, max: 100, clamp: false };
      const result = displayManager.calculateStatBarMetrics(item, 50);

      expect(result.fillPercent).toBe(50);
      expect(result.displayValue).toBe(50);
    });

    test("calculates correct fill percent for non-zero min", () => {
      const item = { min: 10, max: 110, clamp: false };
      const result = displayManager.calculateStatBarMetrics(item, 60);

      expect(result.fillPercent).toBe(50);
      expect(result.displayValue).toBe(60);
    });

    test("clamps fill percent to 0 when value below min", () => {
      const item = { min: 0, max: 100, clamp: false };
      const result = displayManager.calculateStatBarMetrics(item, -20);

      expect(result.fillPercent).toBe(0);
      expect(result.displayValue).toBe(-20);
    });

    test("clamps fill percent to 100 when value above max", () => {
      const item = { min: 0, max: 100, clamp: false };
      const result = displayManager.calculateStatBarMetrics(item, 150);

      expect(result.fillPercent).toBe(100);
      expect(result.displayValue).toBe(150);
    });

    test("clamps displayValue when clamp is true", () => {
      const item = { min: 0, max: 100, clamp: true };
      const result = displayManager.calculateStatBarMetrics(item, 150);

      expect(result.fillPercent).toBe(100);
      expect(result.displayValue).toBe(100);
    });

    test("clamps displayValue to min when clamp is true", () => {
      const item = { min: 0, max: 100, clamp: true };
      const result = displayManager.calculateStatBarMetrics(item, -50);

      expect(result.fillPercent).toBe(0);
      expect(result.displayValue).toBe(0);
    });

    test("returns 0 fillPercent when range is zero", () => {
      const item = { min: 50, max: 50, clamp: false };
      const result = displayManager.calculateStatBarMetrics(item, 50);

      expect(result.fillPercent).toBe(0);
    });

    test("calculates displayLeft and displayRight for opposed bars", () => {
      const item = { min: 0, max: 100, clamp: false };
      const result = displayManager.calculateStatBarMetrics(item, 30);

      expect(result.displayLeft).toBe(30);
      expect(result.displayRight).toBe(70);
    });

    test("displayLeft and displayRight stay non-negative", () => {
      const item = { min: 0, max: 100, clamp: false };
      const result = displayManager.calculateStatBarMetrics(item, -20);

      expect(result.displayLeft).toBe(0);
      expect(result.displayRight).toBe(120); // max - value i.e. max - -20 = 120
    });

    test("rounds displayValue to integer", () => {
      const item = { min: 0, max: 100, clamp: false };
      const result = displayManager.calculateStatBarMetrics(item, 33.7);

      expect(result.displayValue).toBe(34);
    });

    test("handles negative min and max values", () => {
      const item = { min: -50, max: 50, clamp: false };
      const result = displayManager.calculateStatBarMetrics(item, 0);

      expect(result.fillPercent).toBe(50); // 0 is middle of -50 to 50
      expect(result.displayValue).toBe(0);
      expect(result.displayLeft).toBe(50); // 0 - (-50) = 50
      expect(result.displayRight).toBe(50); // 50 - 0 = 50
    });

    test("value exactly at min", () => {
      const item = { min: 0, max: 100, clamp: false };
      const result = displayManager.calculateStatBarMetrics(item, 0);

      expect(result.fillPercent).toBe(0);
      expect(result.displayLeft).toBe(0);
      expect(result.displayRight).toBe(100);
    });

    test("value exactly at max", () => {
      const item = { min: 0, max: 100, clamp: false };
      const result = displayManager.calculateStatBarMetrics(item, 100);

      expect(result.fillPercent).toBe(100);
      expect(result.displayLeft).toBe(100);
      expect(result.displayRight).toBe(0);
    });

    test("displayRight stays non-negative when value exceeds max", () => {
      const item = { min: 0, max: 100, clamp: false };
      const result = displayManager.calculateStatBarMetrics(item, 150);

      expect(result.displayRight).toBe(0); // max(0, 100 - 150)
    });

    test("returns 0 fillPercent when min > max (invalid config)", () => {
      const item = { min: 100, max: 0, clamp: false };
      const result = displayManager.calculateStatBarMetrics(item, 50);

      expect(result.fillPercent).toBe(0); // range is negative, so returns 0
    });
  });

  describe("trackInHistory", () => {
    test("adds item with timestamp to history", () => {
      const item = { type: "paragraph", text: "Hello" };
      displayManager.trackInHistory(item);

      expect(displayManager.history.length).toBe(1);
      expect(displayManager.history[0].text).toBe("Hello");
      expect(displayManager.history[0].timestamp).toBeDefined();
    });

    test("rejects invalid item", () => {
      displayManager.trackInHistory(null);
      expect(displayManager.history.length).toBe(0);
    });
  });

  describe("shouldAnimateContent", () => {
    test("returns true when settings is null", () => {
      const dm = new DisplayManager(null);
      expect(dm.shouldAnimateContent()).toBe(true);
    });

    test("returns true when animations setting is true", () => {
      const mockSettings = { getSetting: vi.fn(() => true) };
      const dm = new DisplayManager(mockSettings);
      expect(dm.shouldAnimateContent()).toBe(true);
    });

    test("returns false when animations setting is false", () => {
      const mockSettings = { getSetting: vi.fn(() => false) };
      const dm = new DisplayManager(mockSettings);
      expect(dm.shouldAnimateContent()).toBe(false);
    });
  });
});
