// save-system.js
class SaveSystem {
  constructor(storyManager) {
    this.storyManager = storyManager;
    this.savePrefix = "ink-save-slot-";
    this.autosaveSlot = 0;
    this.maxSaveSlots = 5;

    // Initialize the modal UI
    this.modal = new SavesModalManager(this);
    console.log("SaveSystem modal created:", this.modal);
    this.setupEventListeners();
  }

  /**
   * Setup event listeners for save/load buttons
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
   * Save game to a specific slot using ink.js state
   * @param {number} slotNumber - Slot number to save to
   */
  saveToSlot(slotNumber) {
    try {
      if (typeof slotNumber !== "number" || slotNumber < 0) {
        throw new Error(`Invalid slot number: ${slotNumber}`);
      }

      if (!this.isStorageAvailable()) {
        throw new Error("localStorage not available");
      }

      // Check if we're on a special page - if so, save the underlying story state
      const isOnSpecialPage = this.storyManager.pages?.isViewingSpecialPage?.();

      // Get game state - use saved state if on special page, otherwise current state
      const gameState = isOnSpecialPage
        ? this.storyManager.pages.savedStoryState
        : this.storyManager.story.state.ToJson();

      const displayState = isOnSpecialPage
        ? this.storyManager.pages.savedDisplayState
        : this.storyManager.display.getState();

      const saveData = {
        gameState: gameState,
        saveName: this.generateSaveName(slotNumber),
        description: this.generateDescription(),
        timestamp: Date.now(),
        version: "1.0",
        isAutosave: slotNumber === this.autosaveSlot,
        currentPage: null, // Never save as being on a special page
        displayState: displayState,
        stateBeforeUserInput: this.storyManager.stateBeforeUserInput || null,
      };
      // Try to save
      this.writeSaveData(slotNumber, saveData);
      const slotName =
        slotNumber === this.autosaveSlot ? "Autosave" : `Slot ${slotNumber}`;
      if (slotNumber != 0) this.showNotification(`Game saved to ${slotName}!`);
      // Refresh modal if open
      this.modal?.populateSaveSlots?.();
      return true;
    } catch (error) {
      window.errorManager.error("Failed to save game", error, "save-system");
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

      // Validate save data
      if (!saveData.gameState) {
        throw new Error("Save data is corrupted - missing game state");
      }

      // Try to load
      this.storyManager.loadState(saveData);

      const slotName =
        slotNumber === this.autosaveSlot ? "Autosave" : `Slot ${slotNumber}`;
      this.showNotification(`Game loaded from ${slotName}!`);
      this.hideSaveDialog();
      return true;
    } catch (error) {
      window.errorManager.error("Failed to load game", error, "save-system");
      return false;
    }
  }

  /**
   * Autosave the current game state
   */
  autosave() {
    // Only attempt autosave if enabled and not on special page
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
      window.errorManager.error("Autosave failed", error, "save-system");
    }
  }

  /**
   * Delete a save slot
   * @param {number} slotNumber - Slot number to delete
   * @param {boolean} isAutosave - Whether this is the autosave slot
   */
  deleteSlot(slotNumber, isAutosave = false) {
    console.log("Modal check:", this.modal, this.modal?.confirmModal);
    try {
      const slotName = isAutosave ? "autosave" : `Slot ${slotNumber}`;
      const message = isAutosave
        ? "Are you sure you want to clear the autosave?"
        : `Are you sure you want to delete the save in Slot ${slotNumber}?`;

      if (this.modal && this.modal.confirmModal) {
        this.modal.confirmModal.showConfirmation(
          message,
          () => {
            // On confirm
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
              window.errorManager.error(
                "Failed to delete save slot",
                error,
                "save-system",
              );
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
        // Fallback to browser confirm if modal not available
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
      window.errorManager.error(
        "Failed to delete save slot",
        error,
        "save-system",
      );
      return false;
    }
  }

  /**
   * Export save from a specific slot
   * @param {number} slotNumber - Slot number to export from
   */
  exportFromSlot(slotNumber) {
    try {
      const saveData = this.getSaveData(slotNumber);
      if (!saveData) {
        throw new Error("No save data found in this slot to export");
      }

      // Create and download file
      const dataStr = JSON.stringify(saveData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(dataBlob);

      // Generate filename
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
      window.errorManager.error("Failed to export save", error, "save-system");
      return false;
    }
  }

  /**
   * Import save to a specific slot
   * @param {number} slotNumber - Slot number to import to
   */
  importToSlot(slotNumber) {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";
    fileInput.style.display = "none";

    fileInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (!file) return;

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        window.errorManager.error(
          "Import file too large (>10MB)",
          new Error("File size exceeds limit"),
          "save-system",
        );
        return;
      }

      const reader = new FileReader();
      const timeout = setTimeout(() => {
        reader.abort();
        window.errorManager.error(
          "File import timed out",
          new Error("FileReader timeout"),
          "save-system",
        );
      }, 30000);

      reader.onload = (e) => {
        clearTimeout(timeout);
        try {
          const importData = JSON.parse(e.target.result);

          if (!importData?.gameState || !importData?.version) {
            throw new Error("Invalid save file format");
          }

          // Test if the game state can be loaded
          const testStory = this.storyManager.createTempStory();
          testStory.state.LoadJson(importData.gameState);

          // If we get here, the save is valid - store it
          this.writeSaveData(slotNumber, importData);

          const slotName =
            slotNumber === this.autosaveSlot
              ? "Autosave"
              : `Slot ${slotNumber}`;
          this.showNotification(`Save imported to ${slotName}!`);

          this.modal?.populateSaveSlots?.();
        } catch (error) {
          window.errorManager.error(
            "Failed to import save file",
            error,
            "save-system",
          );
        }
      };

      reader.onerror = () => {
        clearTimeout(timeout);
        window.errorManager.error(
          "Failed to read import file",
          reader.error,
          "save-system",
        );
      };

      reader.readAsText(file);
      event.target.value = "";
      document.body.removeChild(fileInput);
    });

    document.body.appendChild(fileInput);
    fileInput.click();
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

  /**
   * Show the save/load dialog
   */
  showSaveDialog() {
    this.modal?.show?.();
  }

  /**
   * Hide the save/load dialog
   */
  hideSaveDialog() {
    this.modal?.hide?.();
  }

  /**
   * Check if any saves exist
   * @returns {boolean} True if saves are available
   */
  hasSaves() {
    // Check autosave slot
    if (this.getSaveData(this.autosaveSlot)) return true;

    // Check regular save slots
    for (let i = 1; i <= this.maxSaveSlots; i++) {
      if (this.getSaveData(i)) return true;
    }
    return false;
  }

  /**
   * Get save data from a slot
   * @param {number} slotNumber - Slot number to get data from
   * @returns {Object|null} Save data or null if not found
   */
  getSaveData(slotNumber) {
    try {
      if (!this.isStorageAvailable()) return null;

      const saveKey = this.savePrefix + slotNumber;
      const saveJson = localStorage.getItem(saveKey);
      return saveJson ? JSON.parse(saveJson) : null;
    } catch (error) {
      window.errorManager.error(
        "Failed to get save data",
        error,
        "save-system",
      );
      return null;
    }
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
        // Try to free space by removing oldest saves
        this.attemptStorageCleanup();
        // Retry once
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

  /**
   * Generate a save name based on current game state
   * @param {number} slotNumber - Slot number being saved to
   * @returns {string} Generated save name
   */
  generateSaveName(slotNumber) {
    let baseName;

    // Try to get current location for save name
    const currentPath = this.storyManager.story.state.currentPathString;

    if (currentPath) {
      // Extract the last meaningful part of the path
      const pathParts = currentPath.split(".");
      baseName = pathParts[pathParts.length - 1];

      // Clean up the name
      baseName = baseName.replace(/_/g, " ");
      baseName = baseName.replace(/([a-z])([A-Z])/g, "$1 $2");
      baseName = baseName
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    } else {
      // Fallback to turn-based name
      const turnIndex = this.storyManager.story.state.currentTurnIndex;
      baseName = `Turn ${turnIndex + 1}`;
    }

    // Add autosave suffix if needed
    if (slotNumber === this.autosaveSlot) {
      baseName += " (Auto)";
    }

    return baseName;
  }

  /**
   * Generate a description based on current game state
   * @returns {string} Generated description
   */
  generateDescription() {
    const currentText = this.storyManager.story.state.currentText;
    if (currentText?.length > 0) {
      // Get first sentence or first 100 characters
      let description = currentText.split(".")[0];
      if (description.length > 100) {
        description = description.substring(0, 97) + "...";
      }
      return description + ".";
    }
    return "";
  }

  /**
   * Check if we should perform an autosave
   * @returns {boolean} True if autosave should be performed
   */
  shouldAutosave() {
    try {
      return this.storyManager.settings?.getSetting?.("autoSave") || false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Show a notification to the user
   * @param {string} message - Message to show
   * @param {number} duration - How long to show the notification (ms)
   */
  showNotification(message, duration = 4000) {
    this.modal?.showNotification?.(message, false, duration);
  }

  /**
   * Attempt to free storage space by removing oldest saves
   */
  attemptStorageCleanup() {
    try {
      const saves = [];

      // Collect all saves with timestamps
      for (let i = 1; i <= this.maxSaveSlots; i++) {
        const saveData = this.getSaveData(i);
        if (saveData?.timestamp) {
          saves.push({ slot: i, timestamp: saveData.timestamp });
        }
      }

      // Sort by timestamp (oldest first) and remove oldest
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
      window.errorManager.error("Storage cleanup failed", error, "save-system");
    }
  }

  /**
   * Get save statistics
   * @returns {Object} Save statistics
   */
  getSaveStats() {
    let totalSaves = 0;
    let oldestSave = null;
    let newestSave = null;

    // Check all slots including autosave
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
   * Cleanup resources
   */
  cleanup() {
    this.modal?.modalElement?.remove?.();
  }
}
