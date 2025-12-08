import { InkFunctions } from "../../src/js/ink-functions.js";

describe("InkFunctions", () => {
  let boundFunctions;

  beforeAll(() => {
    // Mock story object that captures bound functions
    boundFunctions = {};
    const mockStory = {
      BindExternalFunction: (name, fn) => {
        boundFunctions[name] = fn;
      },
    };
    InkFunctions.bindAll(mockStory);
  });

  describe("FAIRADD", () => {
    test("adds percentage of remaining headroom", () => {
      // At 50: 50 + (50 * 0.20) = 60
      expect(boundFunctions.FAIRADD(50, 20)).toBe(60);
    });

    test("diminishing returns near 100", () => {
      // At 80: 80 + (20 * 0.20) = 84
      expect(boundFunctions.FAIRADD(80, 20)).toBe(84);
      // At 95: 95 + (5 * 0.20) = 96
      expect(boundFunctions.FAIRADD(95, 20)).toBe(96);
    });

    test("clamps result to 100", () => {
      expect(boundFunctions.FAIRADD(99, 50)).toBeLessThanOrEqual(100);
    });

    test("handles zero stat", () => {
      // At 0: 0 + (100 * 0.50) = 50
      expect(boundFunctions.FAIRADD(0, 50)).toBe(50);
    });

    test("handles 100 percent", () => {
      // At 50: 50 + (50 * 1.0) = 100
      expect(boundFunctions.FAIRADD(50, 100)).toBe(100);
    });

    test("rounds result", () => {
      // Should be integer
      const result = boundFunctions.FAIRADD(33, 17);
      expect(Number.isInteger(result)).toBe(true);
    });

    test("stat already at 100 stays at 100", () => {
      expect(boundFunctions.FAIRADD(100, 50)).toBe(100);
    });

    test("adding 0 percent returns same value", () => {
      expect(boundFunctions.FAIRADD(75, 0)).toBe(75);
    });
  });

  describe("FAIRSUB", () => {
    test("subtracts percentage of current value", () => {
      // At 50: 50 - (50 * 0.20) = 40
      expect(boundFunctions.FAIRSUB(50, 20)).toBe(40);
    });

    test("diminishing returns near 0", () => {
      // At 20: 20 - (20 * 0.20) = 16
      expect(boundFunctions.FAIRSUB(20, 20)).toBe(16);
      // At 5: 5 - (5 * 0.20) = 4
      expect(boundFunctions.FAIRSUB(5, 20)).toBe(4);
    });

    test("clamps result to 0", () => {
      expect(boundFunctions.FAIRSUB(10, 200)).toBeGreaterThanOrEqual(0);
    });

    test("handles zero stat", () => {
      // At 0: 0 - (0 * 0.50) = 0
      expect(boundFunctions.FAIRSUB(0, 50)).toBe(0);
    });

    test("handles 100 percent", () => {
      // At 50: 50 - (50 * 1.0) = 0
      expect(boundFunctions.FAIRSUB(50, 100)).toBe(0);
    });

    test("rounds result", () => {
      const result = boundFunctions.FAIRSUB(33, 17);
      expect(Number.isInteger(result)).toBe(true);
    });

    test("subtracting 0 percent returns same value", () => {
      expect(boundFunctions.FAIRSUB(75, 0)).toBe(75);
    });
  });

  describe("TIME_SINCE", () => {
    let originalDateNow;
    const fixedNow = 1000000; // Fixed "now" in seconds

    beforeEach(() => {
      originalDateNow = Date.now;
      Date.now = () => fixedNow * 1000; // Date.now returns ms
    });

    afterEach(() => {
      Date.now = originalDateNow;
    });

    test("returns seconds for < 60 seconds", () => {
      expect(boundFunctions.TIME_SINCE(fixedNow - 45)).toBe("45 seconds");
    });

    test("returns singular second", () => {
      expect(boundFunctions.TIME_SINCE(fixedNow - 1)).toBe("1 second");
    });

    test("returns minutes for < 60 minutes", () => {
      expect(boundFunctions.TIME_SINCE(fixedNow - 300)).toBe("5 minutes");
    });

    test("returns singular minute", () => {
      expect(boundFunctions.TIME_SINCE(fixedNow - 60)).toBe("1 minute");
    });

    test("returns hours for < 24 hours", () => {
      expect(boundFunctions.TIME_SINCE(fixedNow - 7200)).toBe("2 hours");
    });

    test("returns singular hour", () => {
      expect(boundFunctions.TIME_SINCE(fixedNow - 3600)).toBe("1 hour");
    });

    test("returns days for >= 24 hours", () => {
      expect(boundFunctions.TIME_SINCE(fixedNow - 172800)).toBe("2 days");
    });

    test("returns singular day", () => {
      expect(boundFunctions.TIME_SINCE(fixedNow - 86400)).toBe("1 day");
    });

    test("returns 0 seconds for same timestamp", () => {
      expect(boundFunctions.TIME_SINCE(fixedNow)).toBe("0 seconds");
    });
  });

  describe("PERCENT", () => {
    test("calculates percentage", () => {
      expect(boundFunctions.PERCENT(25, 100)).toBe(25);
      expect(boundFunctions.PERCENT(1, 4)).toBe(25);
    });

    test("rounds result", () => {
      expect(boundFunctions.PERCENT(1, 3)).toBe(33); // 33.33... rounded
    });

    test("returns 0 for division by zero", () => {
      expect(boundFunctions.PERCENT(50, 0)).toBe(0);
    });

    test("handles zero value", () => {
      expect(boundFunctions.PERCENT(0, 100)).toBe(0);
    });
  });
});
