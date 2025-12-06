import { ErrorManager } from "../src/js/error-manager.js";

describe("ErrorManager", () => {
  let errorManager;

  beforeAll(() => {
    window.notificationManager = { show: vi.fn() };
  });

  afterAll(() => {
    delete window.notificationManager;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    errorManager = new ErrorManager();
  });

  describe("SOURCES", () => {
    test("contains expected error sources", () => {
      expect(ErrorManager.SOURCES.STORY_MANAGER).toBe("Story Manager");
      expect(ErrorManager.SOURCES.DISPLAY_MANAGER).toBe("Display Manager");
      expect(ErrorManager.SOURCES.SAVE_SYSTEM).toBe("Save System");
      expect(ErrorManager.SOURCES.SYSTEM).toBe("System");
    });
  });

  describe("safely", () => {
    test("returns function result on success", () => {
      const result = errorManager.safely(() => 42);
      expect(result).toBe(42);
    });

    test("returns fallback on error", () => {
      const result = errorManager.safely(() => {
        throw new Error("fail");
      }, "default");
      expect(result).toBe("default");
    });

    test("returns null as default fallback", () => {
      const result = errorManager.safely(() => {
        throw new Error("fail");
      });
      expect(result).toBeNull();
    });

    test("handles non-Error throws", () => {
      const result = errorManager.safely(() => {
        throw "string error";
      }, "fallback");
      expect(result).toBe("fallback");
    });

    test("returns complex objects", () => {
      const obj = { a: 1, b: [2, 3] };
      const result = errorManager.safely(() => obj);
      expect(result).toEqual(obj);
    });
  });

  describe("safelyAsync", () => {
    test("returns async function result on success", async () => {
      const result = await errorManager.safelyAsync(async () => 42);
      expect(result).toBe(42);
    });

    test("returns fallback on async error", async () => {
      const result = await errorManager.safelyAsync(async () => {
        throw new Error("fail");
      }, "default");
      expect(result).toBe("default");
    });

    test("returns null as default fallback", async () => {
      const result = await errorManager.safelyAsync(async () => {
        throw new Error("fail");
      });
      expect(result).toBeNull();
    });

    test("handles rejected promises", async () => {
      const result = await errorManager.safelyAsync(
        () => Promise.reject(new Error("rejected")),
        "caught",
      );
      expect(result).toBe("caught");
    });

    test("handles non-async functions", async () => {
      const result = await errorManager.safelyAsync(() => "sync result");
      expect(result).toBe("sync result");
    });
  });
});
