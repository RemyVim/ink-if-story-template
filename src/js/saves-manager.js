import { SavesModal } from "./saves-modal.js";
import { errorManager, ERROR_SOURCES } from "./error-manager.js";
import { TEMPLATE_VERSION } from "./version.js";
import { errorModal } from "./error-modal.js";

const log = errorManager.forSource(ERROR_SOURCES.SAVE_SYSTEM);

const MAX_IMPORT_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const IMPORT_TIMEOUT_MS = 30000; // 30 seconds

/**
 * Manages save/load functionality using localStorage and ink.js state serialization.
 * Supports multiple save slots, autosave, and import/export to files.
 */
class SavesManager {
  /**
   * Creates the saves manager with a modal UI for save/load operations.
   * @param {Object} storyManager - The StoryManager instance
   */
  constructor(storyManager) {
    this.storyManager = storyManager;
    this.savePrefix = "ink-save-slot-";
    this.autosaveSlot = 0;
    this.maxSaveSlots = 5;
    this.modal = new SavesModal(this);
    this.setupEventListeners();
  }

  /**
   * Sets up the saves button click handler.
   * @private
   */
  setupEventListeners() {
    const savesBtn = document.getElementById("saves-btn");
    if (savesBtn) {
      savesBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.showSaveDialog();
      });
    }
  }

  /**
   * Opens the save/load dialog modal.
   */
  showSaveDialog() {
    this.modal?.show?.();
  }

  /**
   * Closes the save/load dialog modal.
   */
  hideSaveDialog() {
    this.modal?.hide?.();
  }

  /**
   * Save game to a specific slot using ink.js state
   * @param {number} slotNumber - Slot number to save to
   */
  saveToSlot(slotNumber) {
    try {
      this.validateSlotNumber(slotNumber);
      this.requireStorage();

      const saveData = this.buildSaveData(slotNumber);
      this.writeSaveData(slotNumber, saveData);

      this.notifySaveSuccess(slotNumber);
      this.modal?.populateSaveSlots?.();
      return true;
    } catch (error) {
      log.error("Failed to save game", error);
      if (slotNumber !== this.autosaveSlot) {
        errorModal.show({
          title: "Unable to Save",
          message: "Your progress couldn't be saved.",
          suggestions: [
            "Your browser's storage may be full",
            "Try deleting old saves to free up space",
            "Private/incognito mode may be blocking storage",
          ],
          error: error,
        });
      }
      return false;
    }
  }

  /**
   * Load game from a specific slot using ink.js state
   * @param {number} slotNumber - Slot number to load from
   */
  loadFromSlot(slotNumber) {
    try {
      const saveData = this.getSaveData(slotNumber);
      if (!saveData) {
        const slotName =
          slotNumber === this.autosaveSlot ? "autosave" : "this slot";
        throw new Error(`No save data found in ${slotName}`);
      }

      if (!saveData.gameState) {
        throw new Error("Save data is corrupted: missing game state");
      }

      this.storyManager.loadState(saveData);

      const slotName =
        slotNumber === this.autosaveSlot ? "Autosave" : `Slot ${slotNumber}`;
      this.showNotification(`Game loaded from ${slotName}!`);
      this.hideSaveDialog();
      return true;
    } catch (error) {
      log.error("Failed to load game", error);

      errorModal.show({
        title: "Unable to Load Save",
        message: "This save couldn't be loaded.",
        suggestions: [
          "The save data may be corrupted",
          "It may be from an incompatible version of the story",
          "Try loading a different save or restarting",
        ],
        error: error,
      });
      return false;
    }
  }

  /**
   * Deletes a save slot after user confirmation.
   * @param {number} slotNumber - Slot number to delete
   * @param {boolean} [isAutosave=false] - Whether this is the autosave slot
   */
  deleteSlot(slotNumber, isAutosave = false) {
    try {
      const message = isAutosave
        ? "Are you sure you want to clear the autosave?"
        : `Are you sure you want to delete the save in Slot ${slotNumber}?`;

      if (this.modal && this.modal.confirmModal) {
        this.modal.confirmModal.showConfirmation(
          message,
          () => {
            try {
              if (!this.isStorageAvailable()) {
                throw new Error("localStorage not available");
              }

              const saveKey = this.savePrefix + slotNumber;
              localStorage.removeItem(saveKey);

              const confirmMessage = isAutosave
                ? "Autosave cleared."
                : `Slot ${slotNumber} deleted.`;
              this.showNotification(confirmMessage);

              this.modal?.populateSaveSlots?.();
            } catch (error) {
              log.error("Failed to delete save slot", error);
            }
          },
          null, // No cancel callback needed
          {
            title: "Delete Save",
            confirmText: "Delete",
            cancelText: "Cancel",
          }
        );
        return true;
      } else {
        if (confirm(message)) {
          if (!this.isStorageAvailable()) {
            throw new Error("localStorage not available");
          }

          const saveKey = this.savePrefix + slotNumber;
          localStorage.removeItem(saveKey);

          const confirmMessage = isAutosave
            ? "Autosave cleared."
            : `Slot ${slotNumber} deleted.`;
          this.showNotification(confirmMessage);

          this.modal?.populateSaveSlots?.();
          return true;
        }
        return false;
      }
    } catch (error) {
      log.error("Failed to delete save slot", error);
      errorModal.show({
        title: "Unable to Delete Save",
        message: "This save couldn't be deleted.",
        suggestions: [
          "Your browser's storage may be unavailable",
          "Private/incognito mode may be blocking storage",
          "Try refreshing the page and trying again",
        ],
        error: error,
      });
      return false;
    }
  }

  /**
   * Exports a save slot to a downloadable JSON file.
   * @param {number} slotNumber - Slot number to export
   */
  exportFromSlot(slotNumber) {
    try {
      const saveData = this.getSaveData(slotNumber);
      if (!saveData) {
        throw new Error("No save data found in this slot to export");
      }

      const dataStr = JSON.stringify(saveData);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(dataBlob);

      const timestamp = new Date(saveData.timestamp)
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      const slotName =
        slotNumber === this.autosaveSlot ? "autosave" : `slot${slotNumber}`;
      const titleSlug = this.slugifyTitle(
        this.storyManager.settings?.storyTitle
      );
      link.download = `${titleSlug}-${slotName}-${timestamp}.json`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      const exportSlotName =
        slotNumber === this.autosaveSlot ? "Autosave" : `Slot ${slotNumber}`;
      this.showNotification(`Save exported from ${exportSlotName}!`);
      return true;
    } catch (error) {
      log.error("Failed to export save", error);
      errorModal.show({
        title: "Unable to Export Save",
        message: "This save couldn't be exported.",
        suggestions: [
          "The save data may be corrupted",
          "Try saving to a new slot first, then export",
        ],
        error: error,
      });
      return false;
    }
  }

  /**
   * Opens a file picker to import a save file into a slot.
   * Validates file size and format before importing.
   * @param {number} slotNumber - Slot number to import into
   */
  importToSlot(slotNumber) {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";
    fileInput.style.display = "none";

    fileInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (!file) return;

      if (file.size > MAX_IMPORT_SIZE_BYTES) {
        const maxSizeMB = MAX_IMPORT_SIZE_BYTES / (1024 * 1024);
        errorModal.show({
          title: "Unable to Import Save",
          message: "This save file couldn't be loaded.",
          suggestions: [
            `The file exceeds the ${maxSizeMB}MB size limit`,
            "Make sure you're importing a save file, not a story file",
          ],
          error: new Error(
            `File size ${file.size} exceeds limit of ${MAX_IMPORT_SIZE_BYTES}`
          ),
        });
        log.error(
          `Import file too large (>${maxSizeMB}MB)`,
          new Error("File size exceeds limit")
        );
        return;
      }

      const reader = new FileReader();
      const timeout = setTimeout(() => {
        reader.abort();
        const error = new Error("FileReader timeout");
        errorModal.show({
          title: "Unable to Import Save",
          message: "This save file couldn't be loaded.",
          suggestions: [
            "The file took too long to read",
            "Try again or use a smaller file",
          ],
          error: error,
        });
        log.error("File import timed out", error);
      }, IMPORT_TIMEOUT_MS);

      reader.onload = (e) => {
        clearTimeout(timeout);
        try {
          const importData = JSON.parse(e.target.result);

          if (!importData?.gameState || !importData?.version) {
            throw new Error("Invalid save file format");
          }

          const testStory = this.storyManager.createTempStory();
          testStory.state.LoadJson(importData.gameState);

          this.writeSaveData(slotNumber, importData);

          const slotName =
            slotNumber === this.autosaveSlot
              ? "Autosave"
              : `Slot ${slotNumber}`;
          this.showNotification(`Save imported to ${slotName}!`);

          this.modal?.populateSaveSlots?.();
        } catch (error) {
          log.error("Failed to import save file", error);

          errorModal.show({
            title: "Unable to Import Save",
            message: "This save file couldn't be loaded.",
            suggestions: [
              "The file may be corrupted or invalid",
              "It may be from a different story",
              "It may be from an incompatible version of the story",
            ],
            error: error,
          });
        }
      };

      reader.onerror = () => {
        clearTimeout(timeout);
        const error = reader.error || new Error("Unknown read error");
        log.error("Failed to read import file", error);
        errorModal.show({
          title: "Unable to Import Save",
          message: "This save file couldn't be loaded.",
          suggestions: [
            "The file couldn't be read",
            "It may be corrupted",
            "Try exporting the save again from the original source",
          ],
          error: error,
        });
      };

      reader.readAsText(file);
      event.target.value = "";
      document.body.removeChild(fileInput);
    });

    document.body.appendChild(fileInput);
    fileInput.click();
  }

  /**
   * Performs an autosave if enabled in settings and not viewing a special page.
   */
  autosave() {
    if (
      !this.shouldAutosave() ||
      this.storyManager.pages?.isViewingSpecialPage?.()
    ) {
      return;
    }

    try {
      this.saveToSlot(this.autosaveSlot);
      console.log("[AUTOSAVE] Game autosaved successfully");
    } catch (error) {
      log.error("Autosave failed", error);
    }
  }

  /**
   * Checks if any save data exists (autosave or manual slots).
   * @returns {boolean} True if at least one save exists
   */
  hasSaves() {
    if (this.getSaveData(this.autosaveSlot)) return true;

    for (let i = 1; i <= this.maxSaveSlots; i++) {
      if (this.getSaveData(i)) return true;
    }
    return false;
  }

  /**
   * Retrieves save data from a specific slot.
   * @param {number} slotNumber - Slot number to read
   * @returns {Object|null} The save data object, or null if empty/error
   */
  getSaveData(slotNumber) {
    try {
      if (!this.isStorageAvailable()) return null;

      const saveKey = this.savePrefix + slotNumber;
      const saveJson = localStorage.getItem(saveKey);
      return saveJson ? JSON.parse(saveJson) : null;
    } catch (error) {
      log.error("Failed to get save data", error);
      return null;
    }
  }

  /**
   * Returns statistics about all save slots.
   * @returns {{totalSaves: number, hasAutosave: boolean, oldestSave: Object|null, newestSave: Object|null}}
   */
  getSaveStats() {
    let totalSaves = 0;
    let oldestSave = null;
    let newestSave = null;

    for (let i = 0; i <= this.maxSaveSlots; i++) {
      const saveData = this.getSaveData(i);
      if (saveData) {
        totalSaves++;

        if (!oldestSave || saveData.timestamp < oldestSave.timestamp) {
          oldestSave = saveData;
        }

        if (!newestSave || saveData.timestamp > newestSave.timestamp) {
          newestSave = saveData;
        }
      }
    }

    return {
      totalSaves,
      hasAutosave: !!this.getSaveData(this.autosaveSlot),
      oldestSave,
      newestSave,
    };
  }

  /**
   * Checks if autosave is enabled in settings.
   * @returns {boolean} True if autosave is enabled
   * @private
   */
  shouldAutosave() {
    try {
      return this.storyManager.settings?.getSetting?.("autoSave") || false;
    } catch {
      return false;
    }
  }

  /**
   * Tests whether localStorage is available and functional.
   * @returns {boolean} True if localStorage can be used
   * @private
   */
  isStorageAvailable() {
    try {
      const test = "__storage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validates that a slot number is within the allowed range.
   * @param {number} slotNumber - Slot number to validate
   * @throws {Error} If slot number is invalid
   * @private
   */
  validateSlotNumber(slotNumber) {
    if (
      typeof slotNumber !== "number" ||
      !Number.isInteger(slotNumber) ||
      slotNumber < 0 ||
      slotNumber > this.maxSaveSlots
    ) {
      throw new Error(`Invalid slot number: ${slotNumber}`);
    }
  }

  /**
   * Throws an error if localStorage is not available.
   * @throws {Error} If localStorage is not available
   * @private
   */
  requireStorage() {
    if (!this.isStorageAvailable()) {
      throw new Error("localStorage not available");
    }
  }

  /**
   * Builds the complete save data object for a slot.
   * Handles special page state correctly by using saved state instead of current.
   * @param {number} slotNumber - Slot number being saved to
   * @returns {Object} Complete save data object
   * @private
   */
  buildSaveData(slotNumber) {
    const isOnSpecialPage = this.storyManager.pages?.isViewingSpecialPage?.();

    return {
      version: TEMPLATE_VERSION,
      gameState: this.getGameState(isOnSpecialPage),
      displayState: this.getDisplayState(isOnSpecialPage),
      turnIndex: this.storyManager.story.state.currentTurnIndex,
      description: this.generateDescription(),
      timestamp: Date.now(),
      autoClear: this.storyManager.autoClear,
      isAutosave: slotNumber === this.autosaveSlot,
      currentPage: null,
      stateBeforeUserInput: this.storyManager.stateBeforeUserInput || null,
    };
  }

  /**
   * Gets the appropriate game state JSON based on whether viewing a special page.
   * @param {boolean} isOnSpecialPage - Whether currently viewing a special page
   * @returns {string} Serialized ink story state
   * @private
   */
  getGameState(isOnSpecialPage) {
    return isOnSpecialPage
      ? this.storyManager.pages.savedStoryState
      : this.storyManager.story.state.ToJson();
  }

  /**
   * Gets the appropriate display state based on whether viewing a special page.
   * @param {boolean} isOnSpecialPage - Whether currently viewing a special page
   * @returns {Object} Display state object
   * @private
   */
  getDisplayState(isOnSpecialPage) {
    return isOnSpecialPage
      ? this.storyManager.pages.savedDisplayState
      : this.storyManager.display.getState();
  }

  /**
   * Write save data to a slot
   * @param {number} slotNumber - Slot number to write to
   * @param {Object} saveData - Save data to write
   */
  writeSaveData(slotNumber, saveData) {
    if (!this.isStorageAvailable()) {
      throw new Error("localStorage not available");
    }

    const saveKey = this.savePrefix + slotNumber;
    const dataStr = JSON.stringify(saveData);

    try {
      localStorage.setItem(saveKey, dataStr);
    } catch (e) {
      if (e.name === "QuotaExceededError") {
        this.attemptStorageCleanup();
        try {
          localStorage.setItem(saveKey, dataStr);
        } catch {
          throw new Error(
            "Storage quota exceeded - please delete some saves manually"
          );
        }
      } else {
        throw e;
      }
    }
  }

  /**
   * Converts a story title to a filename-safe slug.
   * @param {string} title - The story title
   * @returns {string} Slugified title (lowercase, dashes for spaces, no special chars)
   * @private
   */
  slugifyTitle(title) {
    if (!title || typeof title !== "string") {
      return "ink-story";
    }

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "") // remove special characters
      .replace(/\s+/g, "-") // spaces to dashes
      .replace(/-+/g, "-") // collapse multiple dashes
      .replace(/^-|-$/g, ""); // trim leading/trailing dashes

    return slug || "ink-story"; // fallback if result is empty
  }

  /**
   * Generates a description for a save based on current story location.
   * @returns {string} Generated description or empty string
   * @private
   */
  generateDescription() {
    const currentPath = this.storyManager.story.state.currentPathString;
    if (currentPath) {
      return this.pathToDisplayName(currentPath);
    }

    const displayState = this.storyManager.display?.getState?.();
    return this.descriptionFromHistory(displayState?.history);
  }

  /**
   * Converts a path string to a Title Case display name.
   * @param {string} path - Path like "chapter_one.scene_two"
   * @returns {string} Title case name like "Scene Two"
   */
  pathToDisplayName(path) {
    if (!path) return "";
    const pathParts = path.split(".");
    let name = pathParts[pathParts.length - 1];

    name = name.replace(/_/g, " ");
    name = name.replace(/([a-z])([A-Z])/g, "$1 $2");
    name = name
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return name;
  }

  /**
   * Extracts a description from the first history entry.
   * @param {Array} history - Display history array
   * @param {number} [maxLength=60] - Maximum description length
   * @returns {string} Cleaned description or empty string
   */
  descriptionFromHistory(history, maxLength = 60) {
    if (!history?.length) return "";

    for (const entry of history) {
      if (entry.type === "paragraph" && entry.text?.trim()) {
        let description = entry.text.trim();
        description = description.replace(/^:{1,3}\s+/, "");
        description = description.replace(/^>{1,2}\s+/, "");
        if (description.length > maxLength) {
          description = description.substring(0, maxLength - 3) + "...";
        }
        return description;
      }
    }

    return "";
  }

  /**
   * Shows a success notification for manual saves (not autosaves).
   * @param {number} slotNumber - Slot number that was saved
   * @private
   */
  notifySaveSuccess(slotNumber) {
    if (slotNumber !== this.autosaveSlot) {
      this.showNotification(`Game saved to Slot ${slotNumber}!`);
    }
  }

  /**
   * Shows a notification in the save modal.
   * @param {string} message - Message to display
   * @param {number} [duration=4000] - Duration in milliseconds
   * @private
   */
  showNotification(message, duration = 4000) {
    this.modal?.showNotification?.(message, false, duration);
  }

  /**
   * Attempts to free localStorage space by removing the oldest save.
   * Called when a QuotaExceededError occurs.
   * @private
   */
  attemptStorageCleanup() {
    try {
      const saves = [];

      for (let i = 1; i <= this.maxSaveSlots; i++) {
        const saveData = this.getSaveData(i);
        if (saveData?.timestamp) {
          saves.push({ slot: i, timestamp: saveData.timestamp });
        }
      }

      saves.sort((a, b) => a.timestamp - b.timestamp);

      if (saves.length > 0) {
        const oldestSlot = saves[0].slot;
        const saveKey = this.savePrefix + oldestSlot;
        localStorage.removeItem(saveKey);
        console.log(
          `[STORAGE] Automatically removed oldest save from slot ${oldestSlot}`
        );
      }
    } catch (error) {
      log.error("Storage cleanup failed", error);
    }
  }

  /**
   * Cleans up the modal when the manager is disposed.
   */
  cleanup() {
    this.modal?.modalElement?.remove?.();
  }
}

export { SavesManager };
