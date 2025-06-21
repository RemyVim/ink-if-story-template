// game-save-system.js
// Complete save/load logic

class GameSaveSystem {
  constructor(storyManager) {
    this.storyManager = storyManager;
    this.savePrefix = "ink-save-slot-";
    this.autosaveSlot = 0;
    this.maxSaveSlots = 5;

    // Initialize the modal UI
    this.modal = new SavesModalManager(this);
  }

  /**
   * Show the saves modal
   */
  showSavesModal() {
    this.modal.show();
  }

  /**
   * Hide the saves modal
   */
  hideSavesModal() {
    this.modal.hide();
  }

  /**
   * Save game to a specific slot
   * @param {number} slotNumber - Slot number to save to
   */
  saveToSlot(slotNumber) {
    try {
      const gameState = this.storyManager.story.state.ToJson();
      const displayState = this.storyManager.display.getState();

      const saveData = {
        gameState: gameState,
        displayState: displayState,
        saveName: this.generateSaveName(slotNumber),
        description: this.generateDescription(),
        timestamp: Date.now(),
        version: "1.0",
        isAutosave: slotNumber === this.autosaveSlot,
        currentPage: this.storyManager.currentPage,
      };

      this.writeSaveData(slotNumber, saveData);

      const slotName =
        slotNumber === this.autosaveSlot ? "Autosave" : `Slot ${slotNumber}`;
      this.showNotification(`Game saved to ${slotName}!`);

      // Refresh the modal display
      this.modal.populateSaveSlots();
    } catch (error) {
      console.error("Failed to save game:", error);
      this.showNotification("Failed to save game.", true);
    }
  }

  /**
   * Load game from a specific slot
   * @param {number} slotNumber - Slot number to load from
   */
  loadFromSlot(slotNumber) {
    try {
      const saveData = this.getSaveData(slotNumber);
      if (!saveData) {
        const slotName =
          slotNumber === this.autosaveSlot ? "autosave" : "this slot";
        this.showNotification(`No save data found in ${slotName}.`, true);
        return;
      }

      // Load the game state
      this.storyManager.story.state.LoadJson(saveData.gameState);

      // Reset page state
      this.storyManager.currentPage = saveData.currentPage || null;

      // Restore display state
      if (saveData.displayState) {
        this.storyManager.display.restoreState(saveData.displayState);
      } else {
        // Fallback for older saves
        this.storyManager.display.clear();
        this.regenerateDisplay();
      }

      // Show header and create choices
      this.storyManager.display.showHeader();
      this.storyManager.createChoices();

      // Update save point
      this.storyManager.savePoint = this.storyManager.story.state.ToJson();

      // Scroll to top
      this.storyManager.display.scrollToTop();

      const slotName =
        slotNumber === this.autosaveSlot ? "Autosave" : `Slot ${slotNumber}`;
      this.showNotification(`Game loaded from ${slotName}!`);
      this.hideSavesModal();
    } catch (error) {
      console.error("Failed to load game:", error);
      this.showNotification("Failed to load game.", true);
    }
  }

  /**
   * Autosave the current game state
   */
  autosave() {
    // Don't autosave if user is on a special page
    if (this.storyManager.pages.isViewingSpecialPage()) {
      return;
    }

    try {
      this.saveToSlot(this.autosaveSlot);
      // Override notification for autosave to be more subtle
      this.showNotification("Game autosaved", false, 2000);
    } catch (error) {
      console.error("Failed to autosave game:", error);
      // Don't show error notification for autosave failures
    }
  }

  /**
   * Delete a save slot
   * @param {number} slotNumber - Slot number to delete
   * @param {boolean} isAutosave - Whether this is the autosave slot
   */
  deleteSlot(slotNumber, isAutosave = false) {
    const slotName = isAutosave ? "autosave" : `Slot ${slotNumber}`;
    const message = isAutosave
      ? "Are you sure you want to clear the autosave? This will remove your automatic backup."
      : `Are you sure you want to delete the save in Slot ${slotNumber}?`;

    if (confirm(message)) {
      const saveKey = this.savePrefix + slotNumber;
      localStorage.removeItem(saveKey);

      const confirmMessage = isAutosave
        ? "Autosave cleared."
        : `Slot ${slotNumber} deleted.`;
      this.showNotification(confirmMessage);
      this.modal.populateSaveSlots();
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
        this.showNotification(
          "No save data found in this slot to export.",
          true,
        );
        return;
      }

      const dataStr = JSON.stringify(saveData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(dataBlob);

      // Generate filename
      const titleElement = document.querySelector(".title");
      let storyTitle = "ink-story";

      if (titleElement && titleElement.textContent) {
        storyTitle = titleElement.textContent
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
      }

      const timestamp = new Date(saveData.timestamp)
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");

      const slotName =
        slotNumber === this.autosaveSlot ? "autosave" : `slot${slotNumber}`;
      link.download = `${storyTitle}-${slotName}-${timestamp}.json`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      const exportSlotName =
        slotNumber === this.autosaveSlot ? "Autosave" : `Slot ${slotNumber}`;
      this.showNotification(`Save exported from ${exportSlotName}!`);
    } catch (error) {
      console.error("Failed to export save:", error);
      this.showNotification("Failed to export save file.", true);
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

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target.result);

          // Validate the imported data
          if (!importData.gameState || !importData.version) {
            throw new Error("Invalid save file format");
          }

          // Save the imported data to the specified slot
          this.writeSaveData(slotNumber, importData);

          const slotName =
            slotNumber === this.autosaveSlot
              ? "Autosave"
              : `Slot ${slotNumber}`;
          this.showNotification(`Save imported to ${slotName}!`);
          this.modal.populateSaveSlots();
        } catch (error) {
          console.error("Failed to import save:", error);
          this.showNotification(
            "Failed to import save file. Please check the file format.",
            true,
          );
        }
      };

      reader.readAsText(file);
      event.target.value = "";
      document.body.removeChild(fileInput);
    });

    document.body.appendChild(fileInput);
    fileInput.click();
  }

  /**
   * Get save data from a slot
   * @param {number} slotNumber - Slot number to get data from
   * @returns {Object|null} Save data or null if not found
   */
  getSaveData(slotNumber) {
    try {
      const saveKey = this.savePrefix + slotNumber;
      const saveJson = localStorage.getItem(saveKey);
      return saveJson ? JSON.parse(saveJson) : null;
    } catch (error) {
      console.error("Failed to get save data:", error);
      return null;
    }
  }

  /**
   * Write save data to a slot
   * @param {number} slotNumber - Slot number to write to
   * @param {Object} saveData - Save data to write
   */
  writeSaveData(slotNumber, saveData) {
    const saveKey = this.savePrefix + slotNumber;
    localStorage.setItem(saveKey, JSON.stringify(saveData));
  }

  /**
   * Check if any saves exist
   * @returns {boolean} True if saves are available
   */
  hasSaves() {
    // Check autosave slot
    if (this.getSaveData(this.autosaveSlot)) {
      return true;
    }

    // Check regular save slots
    for (let i = 1; i <= this.maxSaveSlots; i++) {
      if (this.getSaveData(i)) {
        return true;
      }
    }
    return false;
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
    if (currentText && currentText.length > 0) {
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
   * Regenerate display from current story state (fallback for old saves)
   */
  regenerateDisplay() {
    const currentText = this.storyManager.story.state.currentText;

    if (currentText && currentText.trim().length > 0) {
      const processedText = MarkdownProcessor.process(currentText);
      this.storyManager.display.render([
        {
          text: processedText,
          classes: [],
        },
      ]);
    }
  }

  /**
   * Show a notification to the user
   * @param {string} message - Message to show
   * @param {boolean} isError - Whether this is an error message
   * @param {number} duration - How long to show the notification (ms)
   */
  showNotification(message, isError = false, duration = 4000) {
    this.modal.showNotification(message, isError, duration);
  }

  /**
   * Get statistics about saves
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
   * Clear all saves (useful for testing or reset)
   */
  clearAllSaves() {
    if (
      confirm(
        "Are you sure you want to delete ALL saves? This action cannot be undone.",
      )
    ) {
      for (let i = 0; i <= this.maxSaveSlots; i++) {
        const saveKey = this.savePrefix + i;
        localStorage.removeItem(saveKey);
      }

      this.showNotification("All saves cleared.");
      this.modal.populateSaveSlots();
    }
  }

  /**
   * Get the total number of saves
   * @returns {number} Total number of saves
   */
  getTotalSaves() {
    return this.getSaveStats().totalSaves;
  }

  /**
   * Check if autosave exists
   * @returns {boolean} True if autosave exists
   */
  hasAutosave() {
    return !!this.getSaveData(this.autosaveSlot);
  }

  /**
   * Get the oldest save
   * @returns {Object|null} Oldest save data or null
   */
  getOldestSave() {
    return this.getSaveStats().oldestSave;
  }

  /**
   * Get the newest save
   * @returns {Object|null} Newest save data or null
   */
  getNewestSave() {
    return this.getSaveStats().newestSave;
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    // Clean up any event listeners or resources if needed
    if (this.modal && this.modal.modalElement) {
      this.modal.modalElement.remove();
    }
  }
}
