import { BaseModal } from "./base-modal.js";
import { Utils } from "./utils.js";
import { errorManager, ERROR_SOURCES } from "./error-manager.js";

const log = errorManager.forSource(ERROR_SOURCES.KEYBOARD_HELP);

/**
 * Displays a modal with keyboard shortcut documentation.
 * Automatically disabled on mobile devices where keyboard shortcuts aren't available.
 */
class KeyboardHelpModal {
  /**
   * Creates the keyboard help modal (skipped on mobile devices).
   */
  constructor() {
    this.modal = null;
    this.isMac = Utils.isMac();
    this.isMobile = Utils.isMobile();
    this.init();
  }

  /**
   * Initializes the modal if not on a mobile device.
   * @private
   */
  init() {
    if (this.isMobile) return;
    this.createModal();
  }

  /**
   * Creates the underlying BaseModal instance.
   * @private
   */
  createModal() {
    this.modal = new BaseModal({
      title: "Keyboard Shortcuts",
      className: "keyboard-help-modal",
      maxWidth: "500px",
      showFooter: true,
    });
  }

  /**
   * Displays the keyboard shortcuts help modal.
   * Does nothing on mobile devices.
   */
  show() {
    if (this.isMobile) return;

    if (!this.modal?.isReady()) {
      log.error("Cannot show keyboard help - modal not available");
      return;
    }

    this.modal.show((modal) => {
      modal.setContent(this.getHelpHTML());

      const footer = modal.getFooter();
      if (footer) {
        footer.innerHTML = "";
        footer.style.textAlign = "right";

        const closeBtn = modal.createButton("Close", {
          variant: "primary",
          onClick: () => this.hide(),
        });

        footer.appendChild(closeBtn);
      }
    });
  }

  /**
   * Hides the keyboard shortcuts help modal.
   */
  hide() {
    this.modal?.hide();
  }

  /**
   * Checks if keyboard help is available (not on mobile).
   * @returns {boolean} True if keyboard shortcuts are supported on this device
   */
  isAvailable() {
    return !this.isMobile;
  }

  /**
   * Checks if the modal is ready to be shown.
   * @returns {boolean} True if not on mobile and modal is initialized
   */
  isReady() {
    return !this.isMobile && this.modal?.isReady();
  }

  /**
   * Returns the platform-appropriate modifier key name.
   * @returns {string} "Cmd" on Mac, "Ctrl" on other platforms
   * @private
   */
  getModifierKey() {
    return this.isMac ? "Cmd" : "Ctrl";
  }

  /**
   * Generates the HTML content for the keyboard shortcuts reference.
   * @returns {string} HTML string with shortcut tables
   * @private
   */
  getHelpHTML() {
    const mod = this.getModifierKey();

    return `
      <div class="keyboard-help-section">
        <h3>Choice Selection</h3>
        <table class="keyboard-help-table">
          <tr>
            <td class="shortcut-key"><kbd>1</kbd> - <kbd>9</kbd></td>
            <td>Select choice 1-9</td>
          </tr>
          <tr>
            <td class="shortcut-key"><kbd>A</kbd> - <kbd>Z</kbd></td>
            <td>Select choice 10+ (A=10, B=11, etc.)</td>
          </tr>
        </table>
      </div>

      <div class="keyboard-help-section">
        <h3>Scrolling</h3>
        <table class="keyboard-help-table">
          <tr>
            <td class="shortcut-key"><kbd>↑</kbd> / <kbd>↓</kbd></td>
            <td>Scroll up/down (small)</td>
          </tr>
          <tr>
            <td class="shortcut-key"><kbd>PgUp</kbd> / <kbd>PgDn</kbd></td>
            <td>Scroll up/down (large)</td>
          </tr>
          <tr>
            <td class="shortcut-key"><kbd>Home</kbd> / <kbd>End</kbd></td>
            <td>Jump to top/bottom</td>
          </tr>
        </table>
      </div>

      <div class="keyboard-help-section">
        <h3>Menus</h3>
        <table class="keyboard-help-table">
          <tr>
            <td class="shortcut-key"><kbd>${mod}</kbd>+<kbd>S</kbd></td>
            <td>Open save menu</td>
          </tr>
          <tr>
            <td class="shortcut-key"><kbd>${mod}</kbd>+<kbd>,</kbd></td>
            <td>Open settings</td>
          </tr>
          <tr>
            <td class="shortcut-key"><kbd>${mod}</kbd>+<kbd>H</kbd></td>
            <td>Show this help</td>
          </tr>
          <tr>
            <td class="shortcut-key"><kbd>${mod}</kbd>+<kbd>R</kbd></td>
            <td>Restart story</td>
          </tr>
          <tr>
            <td class="shortcut-key"><kbd>Esc</kbd></td>
            <td>Close menu / Return to story</td>
          </tr>
        </table>
      </div>
    `;
  }
}

export { KeyboardHelpModal };
