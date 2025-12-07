import { ErrorManager } from "./error-manager.js";
import { BaseModal } from "./base-modal.js";

const REFRESH_DELAY_MS = 100;

class SavesModalManager {
  static errorSource = ErrorManager.SOURCES.SAVES_MODAL;

  constructor(gameSaveSystem) {
    this.gameSaveSystem = gameSaveSystem;
    this.maxSaveSlots = gameSaveSystem.maxSaveSlots;
    this.autosaveSlot = gameSaveSystem.autosaveSlot;
    this.confirmModal = null;

    if (!this.gameSaveSystem) {
      SavesModalManager._critical(
        "SavesModalManager requires a save system",
        new Error("Invalid save system"),
      );
      return;
    }

    this.init();
  }

  init() {
    this.createModal();
    this.createConfirmModal();
  }

  createModal() {
    this.modal = new BaseModal({
      title: "Save & Load Game",
      className: "saves-modal",
      maxWidth: "600px",
      onShow: () => this.populateSaveSlots(),
    });
  }

  createConfirmModal() {
    this.confirmModal = new BaseModal({
      title: "Confirm",
      className: "confirm-modal",
      maxWidth: "400px",
      showFooter: true,
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

  showNotification(message, isError = false, duration = 4000) {
    this.modal?.showNotification(message, isError, duration);
  }

  generateSaveSlotsHTML() {
    let html = "";

    html += this.createSaveSlotHTML(this.autosaveSlot, true);

    for (let i = 1; i <= this.maxSaveSlots; i++) {
      html += this.createSaveSlotHTML(i, false);
    }

    return html;
  }

  /**
   * @param {number} slotNumber - Slot number (0 = autosave)
   * @param {boolean} isAutosave - Whether this is the autosave slot
   */
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
      SavesModalManager._error("Failed to create save slot HTML", error);
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

    this.setupSlotActionHandlers();
  }

  setupSlotActionHandlers() {
    const actions = {
      "save-to-slot": (n) => this.gameSaveSystem.saveToSlot(n),
      "load-from-slot": (n) => this.gameSaveSystem.loadFromSlot(n),
      "export-from-slot": (n) => this.gameSaveSystem.exportFromSlot(n),
      "import-to-slot": (n) => this.gameSaveSystem.importToSlot(n),
      "overwrite-slot": (n) => this.gameSaveSystem.saveToSlot(n),
      "delete-slot": (n) => this.handleDeleteSlot(n),
    };

    Object.entries(actions).forEach(([className, handler]) => {
      this.bindSlotAction(className, handler);
    });
  }

  handleDeleteSlot(slotNumber) {
    const slot = this.modal.modalElement.querySelector(
      `[data-slot="${slotNumber}"]`,
    );
    const isAutosave = slot?.classList.contains("autosave-slot");
    this.gameSaveSystem.deleteSlot(slotNumber, isAutosave);
  }

  bindSlotAction(className, handler) {
    this.modal.addBodyEventListener(`.${className}`, "click", (e) => {
      try {
        const slot = e.target.closest("[data-slot]");
        const slotNumber = parseInt(slot?.dataset.slot);
        if (!isNaN(slotNumber)) {
          handler(slotNumber);
          setTimeout(() => this.populateSaveSlots(), REFRESH_DELAY_MS);
        }
      } catch (error) {
        SavesModalManager._error("Save slot action failed", error);
      }
    });
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

  static _error(message, error = null) {
    window.errorManager.error(message, error, SavesModalManager.errorSource);
  }

  static _warning(message, error = null) {
    window.errorManager.warning(message, error, SavesModalManager.errorSource);
  }

  static _critical(message, error = null) {
    window.errorManager.critical(message, error, SavesModalManager.errorSource);
  }
}
export { SavesModalManager };
