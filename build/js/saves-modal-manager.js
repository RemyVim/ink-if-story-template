// saves-modal-manager.js
// Handles the save/load modal UI and interactions

class SavesModalManager {
  constructor(gameSaveSystem) {
    this.gameSaveSystem = gameSaveSystem;
    this.modalElement = null;
    this.maxSaveSlots = 5;
    this.autosaveSlot = 0;

    this.init();
  }

  init() {
    this.createModal();
    this.setupEventListeners();
  }

  createModal() {
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
          💡 <strong>Tip:</strong> Use "Export" to save a slot to a file. Use "Import Here" on empty slots to load save files. Press Ctrl+S to quickly open this dialog.
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
    const closeBtn = this.modalElement.querySelector(".saves-close");
    const closeBtnBottom = this.modalElement.querySelector(".saves-close-btn");
    const backdrop = this.modalElement;

    closeBtn.addEventListener("click", () => this.hide());
    closeBtnBottom.addEventListener("click", () => this.hide());

    // Close on backdrop click
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) {
        this.hide();
      }
    });

    // Close on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.modalElement.style.display === "block") {
        this.hide();
      }
    });
  }

  show() {
    this.populateSaveSlots();
    this.modalElement.style.display = "block";

    // Trigger animation
    requestAnimationFrame(() => {
      this.modalElement.style.opacity = "1";
      this.modalElement.querySelector(".saves-modal-content").style.transform =
        "translate(-50%, -50%) scale(1)";
    });
  }

  hide() {
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
    const saveData = this.gameSaveSystem.getSaveData(slotNumber);
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
            ${saveData.saveName || "Saved Game"}
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
      saveBtn.addEventListener("click", () =>
        this.gameSaveSystem.saveToSlot(slotNumber),
      );
    }
    if (loadBtn) {
      loadBtn.addEventListener("click", () =>
        this.gameSaveSystem.loadFromSlot(slotNumber),
      );
    }
    if (exportBtn) {
      exportBtn.addEventListener("click", () =>
        this.gameSaveSystem.exportFromSlot(slotNumber),
      );
    }
    if (importBtn) {
      importBtn.addEventListener("click", () =>
        this.gameSaveSystem.importToSlot(slotNumber),
      );
    }
    if (overwriteBtn) {
      overwriteBtn.addEventListener("click", () =>
        this.gameSaveSystem.saveToSlot(slotNumber),
      );
    }
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () =>
        this.gameSaveSystem.deleteSlot(slotNumber, isAutosave),
      );
    }
  }

  showNotification(message, isError = false, duration = 4000) {
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

    // Auto remove
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
}
