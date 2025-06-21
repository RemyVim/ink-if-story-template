// Advanced save system with multiple slots and import/export
class SavesManager {
  constructor(storyController, storyState) {
    this.storyController = storyController;
    this.storyState = storyState;
    this.modalElement = null;
    this.maxSaveSlots = 5;
    this.savePrefix = "ink-save-slot-";
    this.autosaveSlot = 0; // Special slot for autosaves

    this.init();
  }

  init() {
    this.createSavesModal();
    this.setupEventListeners();
  }

  createSavesModal() {
    // Create modal backdrop
    const modalBackdrop = document.createElement("div");
    modalBackdrop.className = "saves-modal-backdrop";
    modalBackdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      display: none;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    // Create modal content
    const modalContent = document.createElement("div");
    modalContent.className = "saves-modal-content";
    modalContent.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.9);
      background: var(--color-background);
      border: 1px solid var(--color-border-medium);
      border-radius: var(--border-radius-lg);
      padding: 2rem;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      transition: transform 0.3s ease;
      z-index: 1001;
    `;

    modalContent.innerHTML = `
      <div class="saves-header">
        <h2 style="margin: 0 0 1.5rem 0; color: var(--color-text-strong); font-size: 1.5rem;">Save & Load Game</h2>
        <button class="saves-close" style="
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          font-size: 1.5rem;
          color: var(--color-text-secondary);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: var(--border-radius);
        ">&times;</button>
      </div>

      <div class="saves-section">
        <h3 style="margin: 0 0 1rem 0; color: var(--color-text-strong); font-size: 1.1rem;">Save Slots</h3>
        <div class="save-slots-container" style="margin-bottom: 2rem;">
          <!-- Save slots will be populated here -->
        </div>
        <div class="import-export-info" style="
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          line-height: 1.4;
          padding: 1rem;
          background: var(--color-hover-bg);
          border-radius: var(--border-radius);
        ">
          💡 <strong>Tip:</strong> Use "Export" to save a slot to a file. Use "Import Here" on empty slots to load save files. If all slots are full, delete a save first to make room for importing.
        </div>
      </div>

      <div class="saves-actions" style="margin-top: 2rem; text-align: right; border-top: 1px solid var(--color-border-light); padding-top: 1rem;">
        <button class="saves-close-btn" style="
          padding: 0.5rem 1.5rem;
          background: var(--color-accent-primary);
          color: white;
          border: none;
          border-radius: var(--border-radius);
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        ">Close</button>
      </div>
    `;

    modalBackdrop.appendChild(modalContent);
    document.body.appendChild(modalBackdrop);
    this.modalElement = modalBackdrop;

    this.setupModalHoverEffects();
  }

  setupModalHoverEffects() {
    const closeBtn = this.modalElement.querySelector(".saves-close-btn");
    const modalCloseBtn = this.modalElement.querySelector(".saves-close");

    closeBtn.addEventListener("mouseenter", () => {
      closeBtn.style.background = "var(--color-accent-dark)";
    });
    closeBtn.addEventListener("mouseleave", () => {
      closeBtn.style.background = "var(--color-accent-primary)";
    });

    modalCloseBtn.addEventListener("mouseenter", () => {
      modalCloseBtn.style.background = "var(--color-hover-bg)";
    });
    modalCloseBtn.addEventListener("mouseleave", () => {
      modalCloseBtn.style.background = "none";
    });
  }

  setupEventListeners() {
    // Saves button in nav
    const savesBtn = document.getElementById("saves-btn");
    if (savesBtn) {
      savesBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.showSavesModal();
      });
    }

    // Modal event listeners
    const closeBtn = this.modalElement.querySelector(".saves-close");
    const closeBtnBottom = this.modalElement.querySelector(".saves-close-btn");
    const backdrop = this.modalElement;

    closeBtn.addEventListener("click", () => this.hideSavesModal());
    closeBtnBottom.addEventListener("click", () => this.hideSavesModal());

    // Close on backdrop click
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) {
        this.hideSavesModal();
      }
    });

    // Close on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.modalElement.style.display === "block") {
        this.hideSavesModal();
      }
    });
  }

  showSavesModal() {
    this.populateSaveSlots();
    this.modalElement.style.display = "block";

    // Trigger animation
    requestAnimationFrame(() => {
      this.modalElement.style.opacity = "1";
      this.modalElement.querySelector(".saves-modal-content").style.transform =
        "translate(-50%, -50%) scale(1)";
    });
  }

  hideSavesModal() {
    this.modalElement.style.opacity = "0";
    this.modalElement.querySelector(".saves-modal-content").style.transform =
      "translate(-50%, -50%) scale(0.9)";

    setTimeout(() => {
      this.modalElement.style.display = "none";
    }, 300);
  }

  populateSaveSlots() {
    const container = this.modalElement.querySelector(".save-slots-container");
    container.innerHTML = "";

    // Add autosave slot (slot 0) first
    const autosaveElement = this.createSaveSlotElement(this.autosaveSlot, true);
    container.appendChild(autosaveElement);

    // Add regular save slots (1-5)
    for (let i = 1; i <= this.maxSaveSlots; i++) {
      const slotElement = this.createSaveSlotElement(i, false);
      container.appendChild(slotElement);
    }
  }

  createSaveSlotElement(slotNumber, isAutosave = false) {
    const saveData = this.getSaveData(slotNumber);
    const isEmpty = !saveData;

    const slotDiv = document.createElement("div");
    slotDiv.className = isAutosave ? "save-slot autosave-slot" : "save-slot";

    // Style the slot
    const borderColor = isAutosave
      ? "var(--color-accent-primary)"
      : "var(--color-border-medium)";
    const backgroundColor = isAutosave
      ? "var(--color-hover-bg)"
      : "transparent";

    slotDiv.style.cssText = `
      border: ${isAutosave ? "2px" : "1px"} solid ${borderColor};
      border-radius: var(--border-radius);
      padding: 1rem;
      margin-bottom: ${isAutosave ? "1rem" : "0.5rem"};
      transition: all 0.2s ease;
      background: ${backgroundColor};
    `;

    if (isEmpty) {
      slotDiv.innerHTML = this.createEmptySlotHTML(slotNumber, isAutosave);
    } else {
      slotDiv.innerHTML = this.createFilledSlotHTML(
        slotNumber,
        saveData,
        isAutosave,
      );
    }

    // Add hover effects and event listeners
    this.setupSlotInteractions(slotDiv, slotNumber, isEmpty, isAutosave);

    return slotDiv;
  }

  createEmptySlotHTML(slotNumber, isAutosave) {
    const slotName = isAutosave ? "🔄 Autosave" : `Slot ${slotNumber}`;
    const emptyText = isAutosave ? "No autosave available" : "Empty";
    const helpText = isAutosave
      ? "Game will autosave after choices when enabled in settings"
      : "";

    return `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <strong style="color: var(--color-text-strong);">${slotName}</strong>
        <div style="color: var(--color-text-secondary); font-size: 0.9rem;">${emptyText}</div>
        ${helpText ? `<div style="color: var(--color-text-tertiary); font-size: 0.8rem; font-style: italic;">${helpText}</div>` : ""}
      </div>
      <div style="display: flex; gap: 0.5rem; margin-left: 1rem;">
        ${!isAutosave ? this.createSaveButton(slotNumber) : ""}
        ${!isAutosave ? this.createImportButton(slotNumber) : ""}
      </div>
    </div>
  `;
  }

  createFilledSlotHTML(slotNumber, saveData, isAutosave) {
    const slotName = isAutosave ? "🔄 Autosave" : `Slot ${slotNumber}`;
    const timestamp = new Date(saveData.timestamp).toLocaleString();

    return `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="flex: 1;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
            <strong style="color: var(--color-text-strong);">${slotName}</strong>
            <span style="color: var(--color-text-secondary); font-size: 0.8rem;">${timestamp}</span>
          </div>
          <div style="color: var(--color-text-primary); font-size: 0.9rem; margin-bottom: 0.3rem;">
            ${saveData.saveName}
          </div>
          ${
            saveData.description
              ? `
            <div style="color: var(--color-text-secondary); font-size: 0.8rem; font-style: italic;">
              ${saveData.description}
            </div>
          `
              : ""
          }
        </div>
        <div style="display: flex; gap: 0.5rem; margin-left: 1rem;">
          ${this.createLoadButton(slotNumber)}
          ${this.createExportButton(slotNumber)}
          ${!isAutosave ? this.createOverwriteButton(slotNumber) : ""}
          ${this.createDeleteButton(slotNumber, isAutosave)}
        </div>
      </div>
    `;
  }

  createSaveButton(slotNumber) {
    return `
      <button class="save-to-slot" data-slot="${slotNumber}" style="
        padding: 0.4rem 0.8rem;
        background: var(--color-accent-primary);
        color: white;
        border: none;
        border-radius: var(--border-radius);
        cursor: pointer;
        font-size: 0.8rem;
      ">Save Here</button>
    `;
  }

  createLoadButton(slotNumber) {
    return `
      <button class="load-from-slot" data-slot="${slotNumber}" style="
        padding: 0.4rem 0.8rem;
        background: none;
        border: 1px solid var(--color-accent-primary);
        color: var(--color-accent-primary);
        border-radius: var(--border-radius);
        cursor: pointer;
        font-size: 0.8rem;
      ">Load</button>
    `;
  }

  createExportButton(slotNumber) {
    return `
      <button class="export-from-slot" data-slot="${slotNumber}" style="
        padding: 0.4rem 0.8rem;
        background: var(--color-accent-primary);
        color: white;
        border: none;
        border-radius: var(--border-radius);
        cursor: pointer;
        font-size: 0.8rem;
      ">Export</button>
    `;
  }

  createImportButton(slotNumber) {
    return `
      <button class="import-to-slot" data-slot="${slotNumber}" style="
        padding: 0.4rem 0.8rem;
        background: none;
        border: 1px solid var(--color-border-medium);
        color: var(--color-text-primary);
        border-radius: var(--border-radius);
        cursor: pointer;
        font-size: 0.8rem;
      ">Import Here</button>
    `;
  }

  createOverwriteButton(slotNumber) {
    return `
      <button class="overwrite-slot" data-slot="${slotNumber}" style="
        padding: 0.4rem 0.8rem;
        background: var(--color-accent-warning);
        color: white;
        border: none;
        border-radius: var(--border-radius);
        cursor: pointer;
        font-size: 0.8rem;
      ">Overwrite</button>
    `;
  }

  createDeleteButton(slotNumber, isAutosave) {
    const buttonText = isAutosave ? "Clear" : "Delete";
    return `
      <button class="delete-slot" data-slot="${slotNumber}" style="
        padding: 0.4rem 0.8rem;
        background: var(--color-important);
        color: white;
        border: none;
        border-radius: var(--border-radius);
        cursor: pointer;
        font-size: 0.8rem;
      ">${buttonText}</button>
    `;
  }

  setupSlotInteractions(slotDiv, slotNumber, isEmpty, isAutosave) {
    // Add hover effects
    slotDiv.addEventListener("mouseenter", () => {
      slotDiv.style.background = isAutosave
        ? "var(--color-accent-primary)"
        : "var(--color-hover-bg)";
      if (isAutosave) slotDiv.style.color = "white";
    });

    slotDiv.addEventListener("mouseleave", () => {
      slotDiv.style.background = isAutosave
        ? "var(--color-hover-bg)"
        : "transparent";
      slotDiv.style.color = "";
    });

    // Add event listeners for buttons
    const saveBtn = slotDiv.querySelector(".save-to-slot");
    const loadBtn = slotDiv.querySelector(".load-from-slot");
    const exportBtn = slotDiv.querySelector(".export-from-slot");
    const importBtn = slotDiv.querySelector(".import-to-slot");
    const overwriteBtn = slotDiv.querySelector(".overwrite-slot");
    const deleteBtn = slotDiv.querySelector(".delete-slot");

    if (saveBtn) {
      saveBtn.addEventListener("click", () => this.saveToSlot(slotNumber));
    }
    if (loadBtn) {
      loadBtn.addEventListener("click", () => this.loadFromSlot(slotNumber));
    }
    if (exportBtn) {
      exportBtn.addEventListener("click", () =>
        this.exportFromSlot(slotNumber),
      );
    }
    if (importBtn) {
      importBtn.addEventListener("click", () => this.importToSlot(slotNumber));
    }
    if (overwriteBtn) {
      overwriteBtn.addEventListener("click", () => this.saveToSlot(slotNumber));
    }
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () =>
        this.deleteSlot(slotNumber, isAutosave),
      );
    }
  }

  saveToSlot(slotNumber) {
    try {
      const gameState = this.storyController.story.state.ToJson();
      const displayState = this.storyController.getCurrentDisplayState();

      const saveData = {
        gameState: gameState,
        displayState: displayState,
        saveName: this.generateSaveName(slotNumber),
        description: this.generateDescription(),
        timestamp: Date.now(),
        version: "1.0",
        isAutosave: slotNumber === this.autosaveSlot,
      };

      this.writeSaveData(slotNumber, saveData);

      const slotName =
        slotNumber === this.autosaveSlot ? "Autosave" : `Slot ${slotNumber}`;
      this.showNotification(`Game saved to ${slotName}!`);
      this.populateSaveSlots(); // Refresh the display
    } catch (error) {
      console.error("Failed to save game:", error);
      this.showNotification("Failed to save game.", true);
    }
  }

  loadFromSlot(slotNumber) {
    try {
      const saveData = this.getSaveData(slotNumber);
      if (!saveData) {
        const slotName =
          slotNumber === this.autosaveSlot ? "autosave" : "this slot";
        this.showNotification(`No save data found in ${slotName}.`, true);
        return;
      }

      // Load the game state into the story
      this.storyController.story.state.LoadJson(saveData.gameState);

      // Reset any special page state
      this.storyController.currentPage = null;

      // Restore the display state if available
      if (saveData.displayState) {
        this.storyController.restoreDisplayState(saveData.displayState);
      } else {
        // Fallback for older saves without display state
        this.storyController.domHelpers.clearStoryContent();
        this.displayCurrentState();
      }

      // Make sure header is visible
      this.storyController.domHelpers.setVisible(".header", true);

      // Always create choices after loading
      this.storyController.createChoices();

      // Update the save point to the loaded state
      this.storyController.savePoint =
        this.storyController.story.state.ToJson();

      // Scroll to top
      this.storyController.domHelpers.scrollToTop(
        this.storyController.outerScrollContainer,
      );

      const slotName =
        slotNumber === this.autosaveSlot ? "Autosave" : `Slot ${slotNumber}`;
      this.showNotification(`Game loaded from ${slotName}!`);
      this.hideSavesModal();
    } catch (error) {
      console.error("Failed to load game:", error);
      this.showNotification("Failed to load game.", true);
    }
  }

  // Autosave method
  autosave() {
    // Don't autosave if user is on a special page
    if (this.storyController.currentPage) {
      return;
    }

    try {
      // Use the unified save method for autosave
      this.saveToSlot(this.autosaveSlot);

      // Override the notification for autosave to be more subtle
      this.showNotification("Game autosaved", false, 2000);
    } catch (error) {
      console.error("Failed to autosave game:", error);
      // Don't show error notification for autosave failures to avoid interrupting gameplay
    }
  }

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
      this.populateSaveSlots(); // Refresh the display
    }
  }

  // UTILITY METHODS

  generateSaveName(slotNumber) {
    let baseName;

    // Try to get current location for save name
    const currentPath = this.storyController.story.state.currentPathString;

    if (currentPath) {
      // Extract the last meaningful part of the path
      const pathParts = currentPath.split(".");
      baseName = pathParts[pathParts.length - 1];

      // Clean up the name
      baseName = baseName.replace(/_/g, " ");
      baseName = baseName.replace(/([a-z])([A-Z])/g, "$1 $2"); // camelCase to spaces
      baseName = baseName
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    } else {
      // Fallback to turn-based name
      const turnIndex = this.storyController.story.state.currentTurnIndex;
      baseName = `Turn ${turnIndex + 1}`;
    }

    // Add autosave suffix if needed
    if (slotNumber === this.autosaveSlot) {
      baseName += " (Auto)";
    }

    return baseName;
  }

  generateDescription() {
    // Try to get some context about where the player is
    const currentText = this.storyController.story.state.currentText;
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

  displayCurrentState() {
    // Fallback method for saves without display history
    const currentText = this.storyController.story.currentText;

    if (currentText && currentText.trim().length > 0) {
      const processedText = MarkdownProcessor.process(currentText);
      this.storyController.domHelpers.createParagraph(processedText);
    }
  }

  writeSaveData(slotNumber, saveData) {
    const saveKey = this.savePrefix + slotNumber;
    localStorage.setItem(saveKey, JSON.stringify(saveData));
  }

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

  // Export save from a specific slot
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

      // Get the story title from the page
      const titleElement = document.querySelector(".title");
      let storyTitle = "ink-story";

      if (titleElement && titleElement.textContent) {
        storyTitle = titleElement.textContent
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with dashes
          .replace(/^-+|-+$/g, ""); // Remove leading/trailing dashes
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

  // Import save to a specific slot
  importToSlot(slotNumber) {
    // Create a temporary file input
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
          this.populateSaveSlots(); // Refresh the display
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

  showNotification(message, isError = false, duration = 4000) {
    // Create a simple notification
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: ${isError ? "var(--color-important)" : "var(--color-accent-primary)"};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: var(--border-radius-lg);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 2000;
      font-weight: 600;
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Animate in
    requestAnimationFrame(() => {
      notification.style.transform = "translateY(0)";
      notification.style.opacity = "1";
    });

    // Auto remove after specified duration
    setTimeout(() => {
      notification.style.transform = "translateY(100px)";
      notification.style.opacity = "0";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, duration);
  }

  // Method to check if any saves exist (for enabling/disabling load button)
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
}
