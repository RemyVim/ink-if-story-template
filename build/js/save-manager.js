// save-manager.js
// Simplified save interface that wraps the GameSaveSystem

class SaveManager {
  constructor(storyManager) {
    this.storyManager = storyManager;

    // Initialize the game saves system
    this.gameSaveSystem = new GameSaveSystem(storyManager);

    this.setupEventListeners();
  }

  /**
   * Setup event listeners for save/load buttons
   */
  setupEventListeners() {
    // Saves button (combines save and load functionality)
    const savesBtn = document.getElementById("saves-btn");
    if (savesBtn) {
      savesBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.showSaveDialog();
      });
    }
  }

  /**
   * Perform an autosave if enabled in settings
   */
  autosave() {
    // Check if we should autosave
    if (!this.shouldAutosave()) {
      return;
    }

    try {
      this.gameSaveSystem.autosave();
    } catch (error) {
      console.error("Autosave failed:", error);
      // Don't show user notification for autosave failures
    }
  }

  /**
   * Show the save/load dialog
   */
  showSaveDialog() {
    this.gameSaveSystem.showSavesModal();
  }

  /**
   * Hide the save/load dialog
   */
  hideSaveDialog() {
    this.gameSaveSystem.hideSavesModal();
  }

  /**
   * Check if we should perform an autosave
   * @returns {boolean} True if autosave should be performed
   */
  shouldAutosave() {
    // Don't autosave if user is on a special page
    if (this.storyManager.pages.isViewingSpecialPage()) {
      return false;
    }

    // Check if autosave is enabled in settings
    if (this.storyManager.settings) {
      return this.storyManager.settings.getSetting("autoSave");
    }

    return false;
  }

  /**
   * Check if any saves exist
   * @returns {boolean} True if saves are available
   */
  hasSaves() {
    return this.gameSaveSystem.hasSaves();
  }

  /**
   * Save to a specific slot
   * @param {number} slotNumber - Slot number to save to
   */
  saveToSlot(slotNumber) {
    this.gameSaveSystem.saveToSlot(slotNumber);
  }

  /**
   * Load from a specific slot
   * @param {number} slotNumber - Slot number to load from
   */
  loadFromSlot(slotNumber) {
    this.gameSaveSystem.loadFromSlot(slotNumber);
  }

  /**
   * Delete a save slot
   * @param {number} slotNumber - Slot number to delete
   * @param {boolean} isAutosave - Whether this is the autosave slot
   */
  deleteSlot(slotNumber, isAutosave = false) {
    this.gameSaveSystem.deleteSlot(slotNumber, isAutosave);
  }

  /**
   * Export save from a specific slot
   * @param {number} slotNumber - Slot number to export from
   */
  exportFromSlot(slotNumber) {
    this.gameSaveSystem.exportFromSlot(slotNumber);
  }

  /**
   * Import save to a specific slot
   * @param {number} slotNumber - Slot number to import to
   */
  importToSlot(slotNumber) {
    this.gameSaveSystem.importToSlot(slotNumber);
  }

  /**
   * Get save data from a slot
   * @param {number} slotNumber - Slot number to get data from
   * @returns {Object|null} Save data or null if not found
   */
  getSaveData(slotNumber) {
    return this.gameSaveSystem.getSaveData(slotNumber);
  }

  /**
   * Get the current game state for saving
   * @returns {Object} Current game state
   */
  getCurrentState() {
    return {
      gameState: this.storyManager.story.state.ToJson(),
      displayState: this.storyManager.display.getState(),
      timestamp: Date.now(),
      currentPage: this.storyManager.currentPage,
    };
  }

  /**
   * Load a game state
   * @param {Object} state - Game state to load
   * @returns {boolean} True if loading succeeded
   */
  loadState(state) {
    try {
      // Load the game state into the story
      this.storyManager.story.state.LoadJson(state.gameState);

      // Reset special page state
      this.storyManager.currentPage = state.currentPage || null;

      // Restore display state if available
      if (state.displayState) {
        this.storyManager.display.restoreState(state.displayState);
      } else {
        // Fallback for older saves
        this.storyManager.display.clear();
        this.regenerateDisplay();
      }

      // Update save point
      this.storyManager.savePoint = this.storyManager.story.state.ToJson();

      // Regenerate choices
      this.storyManager.createChoices();

      // Scroll to top
      this.storyManager.display.scrollToTop();

      return true;
    } catch (error) {
      console.error("Failed to load state:", error);
      return false;
    }
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
   * Export current game state as downloadable file
   * @param {string} filename - Optional custom filename
   */
  exportState(filename = null) {
    const state = this.getCurrentState();

    if (!filename) {
      // Generate filename from story title and timestamp
      const titleElement = document.querySelector(".title");
      let storyTitle = "ink-story";

      if (titleElement && titleElement.textContent) {
        storyTitle = titleElement.textContent
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
      }

      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      filename = `${storyTitle}-export-${timestamp}.json`;
    }

    // Create and download file
    const dataStr = JSON.stringify(state, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Import game state from file
   * @param {File} file - File to import
   * @returns {Promise<boolean>} Promise that resolves to success status
   */
  async importState(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const importedState = JSON.parse(e.target.result);

          // Validate the imported state
          if (!importedState.gameState) {
            throw new Error("Invalid save file format");
          }

          const success = this.loadState(importedState);
          resolve(success);
        } catch (error) {
          console.error("Failed to import state:", error);
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsText(file);
    });
  }

  /**
   * Clear all saves (useful for testing or reset)
   */
  clearAllSaves() {
    this.gameSaveSystem.clearAllSaves();
  }

  /**
   * Get save statistics
   * @returns {Object} Save statistics
   */
  getSaveStats() {
    return this.gameSaveSystem.getSaveStats();
  }

  /**
   * Quick save to a default slot
   */
  quickSave() {
    try {
      this.gameSaveSystem.saveToSlot(1); // Save to slot 1
      this.showNotification("Quick saved!");
    } catch (error) {
      console.error("Quick save failed:", error);
      this.showNotification("Quick save failed!", true);
    }
  }

  /**
   * Quick load from default slot
   */
  quickLoad() {
    try {
      this.gameSaveSystem.loadFromSlot(1); // Load from slot 1
    } catch (error) {
      console.error("Quick load failed:", error);
      this.showNotification("Quick load failed!", true);
    }
  }

  /**
   * Show a notification to the user
   * @param {string} message - Message to show
   * @param {boolean} isError - Whether this is an error message
   */
  showNotification(message, isError = false) {
    if (this.gameSaveSystem && this.gameSaveSystem.showNotification) {
      this.gameSaveSystem.showNotification(message, isError);
    }
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.gameSaveSystem) {
      this.gameSaveSystem.cleanup();
    }
  }
}
