import { BaseModal } from "./base-modal.js";
import { errorManager, ERROR_SOURCES } from "./error-manager.js";

const log = errorManager.forSource(ERROR_SOURCES.SAVES_MODAL);

const REFRESH_DELAY_MS = 100;

/**
 * Modal UI for save/load game functionality.
 * Displays save slots with options to save, load, export, import, and delete.
 */
class SavesModal {
  /**
   * Creates the saves modal UI.
   * @param {Object} gameSaveSystem - The SavesManager instance that handles save operations
   */
  constructor(gameSaveSystem) {
    this.gameSaveSystem = gameSaveSystem;
    this.maxSaveSlots = gameSaveSystem.maxSaveSlots;
    this.autosaveSlot = gameSaveSystem.autosaveSlot;
    this.confirmModal = null;

    if (!this.gameSaveSystem) {
      log.critical(
        "SavesModal requires a save system",
        new Error("Invalid save system")
      );
      return;
    }

    this.init();
  }

  /**
   * Initializes the modal and confirmation dialog.
   * @private
   */
  init() {
    this.createModal();
    this.createConfirmModal();
  }

  /**
   * Creates the main save/load modal using BaseModal.
   * @private
   */
  createModal() {
    this.modal = new BaseModal({
      title: "Save & Load Game",
      className: "saves-modal",
      maxWidth: "600px",
      onShow: () => this.populateSaveSlots(),
    });
  }

  /**
   * Creates a secondary modal for delete confirmations.
   * @private
   */
  createConfirmModal() {
    this.confirmModal = new BaseModal({
      title: "Confirm",
      className: "confirm-modal",
      maxWidth: "400px",
      showFooter: true,
    });
  }

  /**
   * Opens the save/load modal.
   */
  show() {
    this.modal?.show();
  }

  /**
   * Closes the save/load modal.
   */
  hide() {
    this.modal?.hide();
  }

  /**
   * Populates the modal content with current save slot states.
   * Called automatically when the modal is shown.
   */
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
      footer.className = "modal-footer modal-footer-right";

      const closeBtn = this.modal.createButton("Close", {
        variant: "primary",
        onClick: () => this.hide(),
      });

      footer.appendChild(closeBtn);
    }

    this.setupSlotEventListeners();
  }

  /**
   * Shows a notification within the modal.
   * @param {string} message - Message to display
   * @param {boolean} [isError=false] - Whether this is an error notification
   * @param {number} [duration=4000] - Duration in milliseconds
   */
  showNotification(message, isError = false, duration = 4000) {
    this.modal?.showNotification(message, isError, duration);
  }

  /**
   * Generates HTML for all save slots (autosave + manual slots).
   * @returns {string} HTML string for all slots
   * @private
   */
  generateSaveSlotsHTML() {
    let html = "";

    html += this.createSaveSlotHTML(this.autosaveSlot, true);

    for (let i = 1; i <= this.maxSaveSlots; i++) {
      html += this.createSaveSlotHTML(i, false);
    }

    return html;
  }

  /**
   * Creates HTML for a single save slot (empty or filled).
   * @param {number} slotNumber - Slot number (0 = autosave)
   * @param {boolean} [isAutosave=false] - Whether this is the autosave slot
   * @returns {string} HTML string for the slot
   * @private
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
      log.error("Failed to create save slot HTML", error);
      return "";
    }
  }

  /**
   * Creates HTML for an empty save slot.
   * @param {number} slotNumber - The slot number
   * @param {boolean} isAutosave - Whether this is the autosave slot
   * @returns {string} HTML string for the empty slot
   * @private
   */
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
        ${!isAutosave ? this.createActionButton("Save", "save-to-slot", "primary", slotName) : ""}
        ${!isAutosave ? this.createActionButton("Import", "import-to-slot", "secondary", slotName) : ""}
      </div>
    </div>
    `;
  }

  /**
   * Creates HTML for a filled save slot with save data.
   * @param {number} slotNumber - The slot number
   * @param {Object} saveData - The save data object
   * @param {boolean} isAutosave - Whether this is the autosave slot
   * @returns {string} HTML string for the filled slot
   * @private
   */
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
          ${this.createActionButton("Load", "load-from-slot", "secondary", slotName)}
          ${this.createActionButton("Export", "export-from-slot", "primary", slotName)}
          ${!isAutosave ? this.createActionButton("Overwrite", "overwrite-slot", "warning", slotName) : ""}
          ${this.createActionButton(isAutosave ? "Clear" : "Delete", "delete-slot", "danger", slotName)}
        </div>
      </div>
    `;
  }

  /**
   * Creates an action button HTML string.
   * @param {string} text - Button label
   * @param {string} action - CSS class for the action (e.g., 'load-from-slot')
   * @param {string} variant - Button style variant (primary, secondary, warning, danger)
   * @returns {string} HTML string for the button
   * @private
   */
  createActionButton(text, action, variant, slotName) {
    const ariaLabel = `${text} ${slotName}`;
    return `<button class="${action} save-action-button save-action-${variant}" aria-label="${ariaLabel}">${text}</button>`;
  }

  /**
   * Sets up event listeners for save slot actions.
   * @private
   */
  setupSlotEventListeners() {
    if (!this.modal?.modalElement) return;

    this.setupSlotActionHandlers();
  }

  /**
   * Binds action handlers for all slot button types.
   * @private
   */
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

  /**
   * Handles delete button click, determining if it's autosave or manual slot.
   * @param {number} slotNumber - The slot number to delete
   * @private
   */
  handleDeleteSlot(slotNumber) {
    const slot = this.modal.modalElement.querySelector(
      `[data-slot="${slotNumber}"]`
    );
    const isAutosave = slot?.classList.contains("autosave-slot");
    this.gameSaveSystem.deleteSlot(slotNumber, isAutosave);
  }

  /**
   * Binds a click handler for a specific action class using event delegation.
   * @param {string} className - The CSS class to bind to
   * @param {Function} handler - Handler function that receives the slot number
   * @private
   */
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
        log.error("Save slot action failed", error);
      }
    });
  }

  /**
   * Checks whether the modal is ready for use.
   * @returns {boolean} True if modal and save system are available
   */
  isReady() {
    return !!(this.modal?.isReady() && this.gameSaveSystem);
  }

  /**
   * Returns diagnostic information about the modal state.
   * @returns {{hasModal: boolean, hasGameSaveSystem: boolean, maxSaveSlots: number, autosaveSlot: number, modalVisible: boolean}}
   */
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

export { SavesModal };
