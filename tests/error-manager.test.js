vi.unmock("../src/js/error-manager.js");
import { errorManager, ERROR_SOURCES } from "../src/js/error-manager.js";

describe("ErrorManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("SOURCES", () => {
    test("contains expected error sources", () => {
      expect(ERROR_SOURCES.STORY_MANAGER).toBe("Story Manager");
      expect(ERROR_SOURCES.DISPLAY_MANAGER).toBe("Display Manager");
      expect(ERROR_SOURCES.SAVE_SYSTEM).toBe("Save System");
      expect(ERROR_SOURCES.SYSTEM).toBe("System");
    });
  });

  describe("forSource", () => {
    test("returns object with error, warning, critical methods", () => {
      const log = errorManager.forSource(ERROR_SOURCES.STORY_MANAGER);
      expect(typeof log.error).toBe("function");
      expect(typeof log.warning).toBe("function");
      expect(typeof log.critical).toBe("function");
    });

    test("bound methods call underlying methods with correct source", () => {
      const spy = vi.spyOn(errorManager, "error");
      const log = errorManager.forSource(ERROR_SOURCES.DISPLAY_MANAGER);

      log.error("test message", new Error("test"));

      expect(spy).toHaveBeenCalledWith(
        "test message",
        expect.any(Error),
        ERROR_SOURCES.DISPLAY_MANAGER,
      );
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
