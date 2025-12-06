import { SaveSystem } from "../src/js/save-system.js";
import { localStorageMock } from "./setup.js";

describe("SaveSystem", () => {
  let saveSystem;

  const mockStoryManager = {
    story: { state: {} },
    display: { getState: () => ({}) },
    pages: { isViewingSpecialPage: () => false },
    settings: { getSetting: () => false },
  };

  beforeAll(() => {
    window.errorManager = {
      error: vi.fn(),
      warning: vi.fn(),
      critical: vi.fn(),
    };
  });

  afterAll(() => {
    delete window.errorManager;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.store = {};

    localStorageMock.getItem.mockImplementation(
      (key) => localStorageMock.store[key] ?? null,
    );
    localStorageMock.setItem.mockImplementation((key, value) => {
      localStorageMock.store[key] = String(value);
    });
    localStorageMock.removeItem.mockImplementation((key) => {
      delete localStorageMock.store[key];
    });
    localStorageMock.clear.mockImplementation(() => {
      localStorageMock.store = {};
    });

    saveSystem = new SaveSystem(mockStoryManager);
  });

  describe("validateSlotNumber", () => {
    test("accepts valid slot numbers", () => {
      expect(() => saveSystem.validateSlotNumber(0)).not.toThrow();
      expect(() => saveSystem.validateSlotNumber(1)).not.toThrow();
      expect(() => saveSystem.validateSlotNumber(5)).not.toThrow();
    });

    test("throws for slot number exceeding max", () => {
      expect(() => saveSystem.validateSlotNumber(6)).toThrow(
        "Invalid slot number",
      );
      expect(() => saveSystem.validateSlotNumber(100)).toThrow(
        "Invalid slot number",
      );
    });

    test("throws for negative numbers", () => {
      expect(() => saveSystem.validateSlotNumber(-1)).toThrow(
        "Invalid slot number",
      );
    });

    test("throws for non-integers", () => {
      expect(() => saveSystem.validateSlotNumber("1")).toThrow(
        "Invalid slot number",
      );
      expect(() => saveSystem.validateSlotNumber(1.5)).toThrow(
        "Invalid slot number",
      );
      expect(() => saveSystem.validateSlotNumber(null)).toThrow(
        "Invalid slot number",
      );
      expect(() => saveSystem.validateSlotNumber(undefined)).toThrow(
        "Invalid slot number",
      );
    });

    test("throws for special number values", () => {
      expect(() => saveSystem.validateSlotNumber(NaN)).toThrow(
        "Invalid slot number",
      );
      expect(() => saveSystem.validateSlotNumber(Infinity)).toThrow(
        "Invalid slot number",
      );
    });
  });

  describe("isStorageAvailable", () => {
    test("returns true when localStorage works", () => {
      expect(saveSystem.isStorageAvailable()).toBe(true);
    });

    test("returns false when setItem throws", () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error("QuotaExceeded");
      });
      expect(saveSystem.isStorageAvailable()).toBe(false);
    });

    test("returns false when removeItem throws", () => {
      localStorageMock.removeItem.mockImplementationOnce(() => {
        throw new Error("SecurityError");
      });
      expect(saveSystem.isStorageAvailable()).toBe(false);
    });
  });

  describe("getSaveData", () => {
    test("returns null for empty slot", () => {
      expect(saveSystem.getSaveData(1)).toBeNull();
    });

    test("returns null for invalid slot numbers", () => {
      expect(saveSystem.getSaveData(-1)).toBeNull();
      expect(saveSystem.getSaveData(1.5)).toBeNull();
      expect(saveSystem.getSaveData(100)).toBeNull();
    });

    test("returns parsed data for valid save", () => {
      const saveData = { gameState: "test", timestamp: 12345 };
      localStorageMock.store["ink-save-slot-1"] = JSON.stringify(saveData);

      const result = saveSystem.getSaveData(1);
      expect(result).toEqual(saveData);
    });

    test("returns null for invalid JSON", () => {
      localStorageMock.store["ink-save-slot-1"] = "not valid json{";

      const result = saveSystem.getSaveData(1);
      expect(result).toBeNull();
      expect(window.errorManager.error).toHaveBeenCalled();
    });

    test("returns null when storage unavailable", () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error("Disabled");
      });

      expect(saveSystem.getSaveData(1)).toBeNull();
    });
  });

  describe("writeSaveData", () => {
    test("writes JSON to correct key", () => {
      const saveData = { gameState: "test", timestamp: Date.now() };

      saveSystem.writeSaveData(3, saveData);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "ink-save-slot-3",
        JSON.stringify(saveData),
      );
    });

    test("throws when storage unavailable", () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error("Disabled");
      });

      expect(() => saveSystem.writeSaveData(1, {})).toThrow();
    });

    test("attempts cleanup on QuotaExceededError", () => {
      // Add an old save to be cleaned up
      localStorageMock.store["ink-save-slot-1"] = JSON.stringify({
        timestamp: 1000,
      });

      // Only throw on actual save key, not the storage test key
      let saveAttempts = 0;
      localStorageMock.setItem.mockImplementation((key, value) => {
        if (key === "ink-save-slot-2") {
          saveAttempts++;
          if (saveAttempts === 1) {
            const error = new Error("Quota exceeded");
            error.name = "QuotaExceededError";
            throw error;
          }
        }
        localStorageMock.store[key] = String(value);
      });

      saveSystem.writeSaveData(2, { timestamp: 2000 });

      // Should have removed the old save
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "ink-save-slot-1",
      );
    });

    test("throws user-friendly message when quota exceeded even after cleanup", () => {
      localStorageMock.store["ink-save-slot-1"] = JSON.stringify({
        timestamp: 1000,
      });

      // Always throw quota error on save slot, even after cleanup
      localStorageMock.setItem.mockImplementation((key, value) => {
        if (key.startsWith("ink-save-slot-")) {
          const error = new Error("Quota exceeded");
          error.name = "QuotaExceededError";
          throw error;
        }
        localStorageMock.store[key] = String(value);
      });

      expect(() => saveSystem.writeSaveData(2, { timestamp: 2000 })).toThrow(
        "Storage quota exceeded - please delete some saves manually",
      );
    });
  });

  describe("hasSaves", () => {
    test("returns false when no saves exist", () => {
      expect(saveSystem.hasSaves()).toBe(false);
    });

    test("returns true when autosave exists", () => {
      localStorageMock.store["ink-save-slot-0"] = JSON.stringify({
        gameState: "x",
      });
      expect(saveSystem.hasSaves()).toBe(true);
    });

    test("returns true when regular save exists", () => {
      localStorageMock.store["ink-save-slot-3"] = JSON.stringify({
        gameState: "x",
      });
      expect(saveSystem.hasSaves()).toBe(true);
    });

    test("returns true when only last slot has save", () => {
      localStorageMock.store["ink-save-slot-5"] = JSON.stringify({
        gameState: "x",
      });
      expect(saveSystem.hasSaves()).toBe(true);
    });
  });

  describe("getSaveStats", () => {
    test("returns zeros when no saves", () => {
      const stats = saveSystem.getSaveStats();
      expect(stats.totalSaves).toBe(0);
      expect(stats.hasAutosave).toBe(false);
      expect(stats.oldestSave).toBeNull();
      expect(stats.newestSave).toBeNull();
    });

    test("counts saves correctly", () => {
      localStorageMock.store["ink-save-slot-0"] = JSON.stringify({
        timestamp: 1000,
      });
      localStorageMock.store["ink-save-slot-1"] = JSON.stringify({
        timestamp: 2000,
      });
      localStorageMock.store["ink-save-slot-3"] = JSON.stringify({
        timestamp: 3000,
      });

      const stats = saveSystem.getSaveStats();
      expect(stats.totalSaves).toBe(3);
      expect(stats.hasAutosave).toBe(true);
    });

    test("identifies oldest and newest saves", () => {
      localStorageMock.store["ink-save-slot-1"] = JSON.stringify({
        timestamp: 5000,
      });
      localStorageMock.store["ink-save-slot-2"] = JSON.stringify({
        timestamp: 1000,
      });
      localStorageMock.store["ink-save-slot-3"] = JSON.stringify({
        timestamp: 9000,
      });

      const stats = saveSystem.getSaveStats();
      expect(stats.oldestSave.timestamp).toBe(1000);
      expect(stats.newestSave.timestamp).toBe(9000);
    });

    test("single save is both oldest and newest", () => {
      localStorageMock.store["ink-save-slot-2"] = JSON.stringify({
        timestamp: 5000,
      });
      const stats = saveSystem.getSaveStats();
      expect(stats.totalSaves).toBe(1);
      expect(stats.oldestSave.timestamp).toBe(5000);
      expect(stats.newestSave.timestamp).toBe(5000);
    });

    test("hasAutosave is false when only regular saves exist", () => {
      localStorageMock.store["ink-save-slot-1"] = JSON.stringify({
        timestamp: 1000,
      });
      const stats = saveSystem.getSaveStats();
      expect(stats.hasAutosave).toBe(false);
      expect(stats.totalSaves).toBe(1);
    });
  });

  describe("attemptStorageCleanup", () => {
    test("removes oldest save", () => {
      localStorageMock.store["ink-save-slot-1"] = JSON.stringify({
        timestamp: 5000,
      });
      localStorageMock.store["ink-save-slot-2"] = JSON.stringify({
        timestamp: 1000,
      }); // oldest
      localStorageMock.store["ink-save-slot-3"] = JSON.stringify({
        timestamp: 9000,
      });

      saveSystem.attemptStorageCleanup();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "ink-save-slot-2",
      );
    });

    test("does nothing when no saves exist", () => {
      saveSystem.attemptStorageCleanup();

      // Filter out storage test key removals from isStorageAvailable() checks
      const saveSlotRemovals = localStorageMock.removeItem.mock.calls.filter(
        ([key]) => key.startsWith("ink-save-slot-"),
      );
      expect(saveSlotRemovals).toHaveLength(0);
    });

    test("does not remove autosave even if oldest", () => {
      localStorageMock.store["ink-save-slot-0"] = JSON.stringify({
        timestamp: 100, // oldest
      });
      localStorageMock.store["ink-save-slot-1"] = JSON.stringify({
        timestamp: 5000,
      });
      localStorageMock.store["ink-save-slot-2"] = JSON.stringify({
        timestamp: 9000,
      });

      saveSystem.attemptStorageCleanup();

      // Should remove slot 1 (oldest non-autosave), not slot 0
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "ink-save-slot-1",
      );
      expect(localStorageMock.store["ink-save-slot-0"]).toBeDefined();
    });

    test("does nothing when only autosave exists", () => {
      localStorageMock.store["ink-save-slot-0"] = JSON.stringify({
        timestamp: 1000,
      });

      saveSystem.attemptStorageCleanup();

      const saveSlotRemovals = localStorageMock.removeItem.mock.calls.filter(
        ([key]) => key.startsWith("ink-save-slot-"),
      );
      expect(saveSlotRemovals).toHaveLength(0);
    });
  });
});
