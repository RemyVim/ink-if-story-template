import { ErrorManager } from "./error-manager.js";
import { SavesModalManager } from "./saves-modal-manager.js";

const MAX_IMPORT_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const IMPORT_TIMEOUT_MS = 30000; // 30 seconds

class SavesManager {
  static errorSource = ErrorManager.SOURCES.SAVE_SYSTEM;

  constructor(storyManager) {
    this.storyManager = storyManager;
    this.savePrefix = "ink-save-slot-";
    this.autosaveSlot = 0;
    this.maxSaveSlots = 5;
    this.modal = new SavesModalManager(this);
    this.setupEventListeners();
  }

  setupEventListeners() {
    const savesBtn = document.getElementById("saves-btn");
    if (savesBtn) {
      savesBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.showSaveDialog();
      });
    }
  }

  showSaveDialog() {
    this.modal?.show?.();
  }

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
      SavesManager._error("Failed to save game", error);
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
        throw new Error("Save data is corrupted - missing game state");
      }

      this.storyManager.loadState(saveData);

      const slotName =
        slotNumber === this.autosaveSlot ? "Autosave" : `Slot ${slotNumber}`;
      this.showNotification(`Game loaded from ${slotName}!`);
      this.hideSaveDialog();
      return true;
    } catch (error) {
      SavesManager._error("Failed to load game", error);
      return false;
    }
  }

  deleteSlot(slotNumber, isAutosave = false) {
    try {
      const slotName = isAutosave ? "autosave" : `Slot ${slotNumber}`;
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
              SavesManager._error("Failed to delete save slot", error);
            }
          },
          null, // No cancel callback needed
          {
            title: "Delete Save",
            confirmText: "Delete",
            cancelText: "Cancel",
          },
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
      SavesManager._error("Failed to delete save slot", error);
      return false;
    }
  }

  /**
   * Import save to a specific slot
   * @param {number} slotNumber - Slot number to import to
   */
  exportFromSlot(slotNumber) {
    try {
      const saveData = this.getSaveData(slotNumber);
      if (!saveData) {
        throw new Error("No save data found in this slot to export");
      }

      const dataStr = JSON.stringify(saveData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(dataBlob);

      const timestamp = new Date(saveData.timestamp)
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      const slotName =
        slotNumber === this.autosaveSlot ? "autosave" : `slot${slotNumber}`;
      link.download = `ink-story-${slotName}-${timestamp}.json`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      const exportSlotName =
        slotNumber === this.autosaveSlot ? "Autosave" : `Slot ${slotNumber}`;
      this.showNotification(`Save exported from ${exportSlotName}!`);
      return true;
    } catch (error) {
      SavesManager._error("Failed to export save", error);
      return false;
    }
  }

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
        SavesManager._error(
          `Import file too large (>${maxSizeMB}MB)`,
          new Error("File size exceeds limit"),
        );
        return;
      }

      const reader = new FileReader();
      const timeout = setTimeout(() => {
        reader.abort();
        SavesManager._error(
          "File import timed out",
          new Error("FileReader timeout"),
        );
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
          SavesManager._error("Failed to import save file", error);
        }
      };

      reader.onerror = () => {
        clearTimeout(timeout);
        SavesManager._error("Failed to read import file", reader.error);
      };

      reader.readAsText(file);
      event.target.value = "";
      document.body.removeChild(fileInput);
    });

    document.body.appendChild(fileInput);
    fileInput.click();
  }

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
      SavesManager._error("Autosave failed", error);
    }
  }

  hasSaves() {
    if (this.getSaveData(this.autosaveSlot)) return true;

    for (let i = 1; i <= this.maxSaveSlots; i++) {
      if (this.getSaveData(i)) return true;
    }
    return false;
  }

  getSaveData(slotNumber) {
    try {
      if (!this.isStorageAvailable()) return null;

      const saveKey = this.savePrefix + slotNumber;
      const saveJson = localStorage.getItem(saveKey);
      return saveJson ? JSON.parse(saveJson) : null;
    } catch (error) {
      SavesManager._error("Failed to get save data", error);
      return null;
    }
  }

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

  shouldAutosave() {
    try {
      return this.storyManager.settings?.getSetting?.("autoSave") || false;
    } catch (error) {
      return false;
    }
  }

  isStorageAvailable() {
    try {
      const test = "__storage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

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

  requireStorage() {
    if (!this.isStorageAvailable()) {
      throw new Error("localStorage not available");
    }
  }

  buildSaveData(slotNumber) {
    const isOnSpecialPage = this.storyManager.pages?.isViewingSpecialPage?.();

    return {
      gameState: this.getGameState(isOnSpecialPage),
      displayState: this.getDisplayState(isOnSpecialPage),
      saveName: this.generateSaveName(slotNumber),
      description: this.generateDescription(),
      timestamp: Date.now(),
      version: "1.0",
      isAutosave: slotNumber === this.autosaveSlot,
      currentPage: null,
      stateBeforeUserInput: this.storyManager.stateBeforeUserInput || null,
    };
  }

  getGameState(isOnSpecialPage) {
    return isOnSpecialPage
      ? this.storyManager.pages.savedStoryState
      : this.storyManager.story.state.ToJson();
  }

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
        } catch (retryError) {
          throw new Error(
            "Storage quota exceeded - please delete some saves manually",
          );
        }
      } else {
        throw e;
      }
    }
  }

  generateSaveName(slotNumber) {
    let baseName;

    const currentPath = this.storyManager.story.state.currentPathString;

    if (currentPath) {
      const pathParts = currentPath.split(".");
      baseName = pathParts[pathParts.length - 1];

      baseName = baseName.replace(/_/g, " ");
      baseName = baseName.replace(/([a-z])([A-Z])/g, "$1 $2");
      baseName = baseName
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    } else {
      const turnIndex = this.storyManager.story.state.currentTurnIndex;
      baseName = `Turn ${turnIndex + 1}`;
    }

    if (slotNumber === this.autosaveSlot) {
      baseName += " (Auto)";
    }

    return baseName;
  }

  generateDescription() {
    const currentText = this.storyManager.story.state.currentText;
    if (currentText?.length > 0) {
      let description = currentText.split(".")[0];
      if (description.length > 100) {
        description = description.substring(0, 97) + "...";
      }
      return description + ".";
    }
    return "";
  }

  notifySaveSuccess(slotNumber) {
    if (slotNumber !== this.autosaveSlot) {
      this.showNotification(`Game saved to Slot ${slotNumber}!`);
    }
  }

  showNotification(message, duration = 4000) {
    this.modal?.showNotification?.(message, false, duration);
  }

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
          `[STORAGE] Automatically removed oldest save from slot ${oldestSlot}`,
        );
      }
    } catch (error) {
      SavesManager._error("Storage cleanup failed", error);
    }
  }

  cleanup() {
    this.modal?.modalElement?.remove?.();
  }

  static _error(message, error = null) {
    window.errorManager.error(message, error, SavesManager.errorSource);
  }

  static _warning(message, error = null) {
    window.errorManager.warning(message, error, SavesManager.errorSource);
  }

  static _critical(message, error = null) {
    window.errorManager.critical(message, error, SavesManager.errorSource);
  }
}
export { SavesManager };
