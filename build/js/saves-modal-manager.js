// saves-modal-manager.js
class SavesModalManager {
  constructor(gameSaveSystem) {
    this.gameSaveSystem = gameSaveSystem;
    this.maxSaveSlots = 5;
    this.autosaveSlot = 0;

    if (!this.gameSaveSystem) {
      window.errorManager.critical(
        "SavesModalManager requires a save system",
        new Error("Invalid save system"),
        "saves-modal",
      );
      return;
    }

    this.init();
  }

  init() {
    this.createModal();
  }

  createModal() {
    this.modal = new BaseModal({
      title: "Save & Load Game",
      className: "saves-modal",
      maxWidth: "600px",
      onShow: () => this.populateSaveSlots(),
    });
  }

  show() {
    this.modal?.show();
  }

  hide() {
    this.modal?.hide();
  }

  populateSaveSlots() {
    if (!this.modal?.modalElement) return;

    const contentHTML = `
      <div class="saves-section">
        <h3>Save Slots</h3>
        <div class="save-slots-container">
          ${this.generateSaveSlotsHTML()}
        </div>
        <div class="import-export-info">
          <strong>Tip:</strong> Use "Export" to save a slot to a file. Use "Import Here" on empty slots to load save files. Press Ctrl+S to quickly open this dialog.
        </div>
      </div>
    `;

    this.modal.setContent(contentHTML);

    // Set footer with close button
    const footer = this.modal.getFooter();
    if (footer) {
      footer.innerHTML = "";
      footer.style.textAlign = "right";

      const closeBtn = this.modal.createButton("Close", {
        variant: "primary",
        onClick: () => this.hide(),
      });

      footer.appendChild(closeBtn);
    }

    this.setupSlotEventListeners();
  }

  generateSaveSlotsHTML() {
    let html = "";

    // Add autosave slot first
    html += this.createSaveSlotHTML(this.autosaveSlot, true);

    // Add regular save slots
    for (let i = 1; i <= this.maxSaveSlots; i++) {
      html += this.createSaveSlotHTML(i, false);
    }

    return html;
  }

  createSaveSlotHTML(slotNumber, isAutosave = false) {
    try {
      const saveData = this.gameSaveSystem.getSaveData(slotNumber);
      const isEmpty = !saveData;

      if (isEmpty) {
        return `<div class="save-slot ${isAutosave ? "autosave-slot" : ""}" data-slot="${slotNumber}">
          ${this.createEmptySlotHTML(slotNumber, isAutosave)}
        </div>`;
      } else {
        return `<div class="save-slot ${isAutosave ? "autosave-slot" : ""}" data-slot="${slotNumber}">
          ${this.createFilledSlotHTML(slotNumber, saveData, isAutosave)}
        </div>`;
      }
    } catch (error) {
      window.errorManager.error(
        "Failed to create save slot HTML",
        error,
        "saves-modal",
      );
      return "";
    }
  }

  createEmptySlotHTML(slotNumber, isAutosave) {
    const slotName = isAutosave ? "Autosave" : `Slot ${slotNumber}`;
    const emptyText = isAutosave ? "No autosave available" : "Empty";
    const helpText = isAutosave
      ? "Game will autosave after choices when enabled in settings"
      : "";

    return `
      <div class="save-slot-content">
        <div class="save-slot-info">
          <strong class="save-slot-name">${slotName}</strong>
          <div class="save-slot-description">${emptyText}</div>
          ${helpText ? `<div class="save-slot-detail">${helpText}</div>` : ""}
        </div>
        <div class="save-slot-actions">
          ${!isAutosave ? this.createActionButton("Save Here", "save-to-slot", "primary") : ""}
          ${!isAutosave ? this.createActionButton("Import Here", "import-to-slot", "secondary") : ""}
        </div>
      </div>
    `;
  }

  createFilledSlotHTML(slotNumber, saveData, isAutosave) {
    const slotName = isAutosave ? "Autosave" : `Slot ${slotNumber}`;
    const timestamp = new Date(saveData.timestamp).toLocaleString();

    return `
      <div class="save-slot-content">
        <div class="save-slot-info">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
            <strong class="save-slot-name">${slotName}</strong>
            <span class="save-slot-timestamp">${timestamp}</span>
          </div>
          <div class="save-slot-description">
            ${saveData.saveName || "Saved Game"}
          </div>
          ${
            saveData.description
              ? `<div class="save-slot-detail">${saveData.description}</div>`
              : ""
          }
        </div>
        <div class="save-slot-actions">
          ${this.createActionButton("Load", "load-from-slot", "secondary")}
          ${this.createActionButton("Export", "export-from-slot", "primary")}
          ${!isAutosave ? this.createActionButton("Overwrite", "overwrite-slot", "warning") : ""}
          ${this.createActionButton(isAutosave ? "Clear" : "Delete", "delete-slot", "danger")}
        </div>
      </div>
    `;
  }

  createActionButton(text, action, variant) {
    return `<button class="${action} save-action-button save-action-${variant}">${text}</button>`;
  }

  setupSlotEventListeners() {
    if (!this.modal?.modalElement) return;

    // Add hover effects to slots
    const slots = this.modal.modalElement.querySelectorAll(".save-slot");
    slots.forEach((slot) => {
      const isAutosave = slot.classList.contains("autosave-slot");

      slot.addEventListener("mouseenter", () => {
        slot.style.background = isAutosave
          ? "var(--color-background)"
          : "var(--color-hover-bg)";
        if (isAutosave) slot.style.color = "white";
      });

      slot.addEventListener("mouseleave", () => {
        slot.style.background = isAutosave
          ? "var(--color-hover-bg)"
          : "transparent";
        slot.style.color = "";
      });
    });

    // Setup action buttons
    const actionHandlers = {
      "save-to-slot": (slotNumber) =>
        this.gameSaveSystem.saveToSlot(slotNumber),
      "load-from-slot": (slotNumber) =>
        this.gameSaveSystem.loadFromSlot(slotNumber),
      "export-from-slot": (slotNumber) =>
        this.gameSaveSystem.exportFromSlot(slotNumber),
      "import-to-slot": (slotNumber) =>
        this.gameSaveSystem.importToSlot(slotNumber),
      "overwrite-slot": (slotNumber) =>
        this.gameSaveSystem.saveToSlot(slotNumber),
      "delete-slot": (slotNumber) => {
        const slot = this.modal.modalElement.querySelector(
          `[data-slot="${slotNumber}"]`,
        );
        const isAutosave = slot?.classList.contains("autosave-slot");
        this.gameSaveSystem.deleteSlot(slotNumber, isAutosave);
      },
    };

    Object.entries(actionHandlers).forEach(([className, handler]) => {
      this.modal.addBodyEventListener(`.${className}`, "click", (e) => {
        try {
          const slot = e.target.closest("[data-slot]");
          const slotNumber = parseInt(slot?.dataset.slot);
          if (!isNaN(slotNumber)) {
            handler(slotNumber);
            // Refresh slots after action
            setTimeout(() => this.populateSaveSlots(), 100);
          }
        } catch (error) {
          window.errorManager.error(
            "Save slot action failed",
            error,
            "saves-modal",
          );
        }
      });
    });
  }

  showNotification(message, isError = false, duration = 4000) {
    this.modal?.showNotification(message, isError, duration);
  }

  isReady() {
    return !!(this.modal?.isReady() && this.gameSaveSystem);
  }

  getStats() {
    return {
      hasModal: !!this.modal,
      hasGameSaveSystem: !!this.gameSaveSystem,
      maxSaveSlots: this.maxSaveSlots,
      autosaveSlot: this.autosaveSlot,
      modalVisible: this.modal?.isVisible || false,
    };
  }
}
