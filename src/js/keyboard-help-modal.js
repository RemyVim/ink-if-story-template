// keyboard-help.js
// Displays a modal with keyboard shortcut reference

class KeyboardHelpModal {
  static errorSource = ErrorManager.SOURCES.KEYBOARD_HELP;
  constructor() {
    this.modal = null;
    this.isMac = window.Utils.isMac();
    this.isMobile = window.Utils.isMobile();
    this.init();
  }

  static _error(message, error = null) {
    window.errorManager.error(message, error, KeyboardHelpModal.errorSource);
  }

  static _warning(message, error = null) {
    window.errorManager.warning(message, error, KeyboardHelpModal.errorSource);
  }

  static _critical(message, error = null) {
    window.errorManager.critical(message, error, KeyboardHelpModal.errorSource);
  }

  init() {
    // Don't create modal on mobile devices
    if (this.isMobile) return;
    this.createModal();
  }

  /**
   * Check if keyboard shortcuts help should be available
   */
  isAvailable() {
    return !this.isMobile;
  }

  createModal() {
    this.modal = new BaseModal({
      title: "Keyboard Shortcuts",
      className: "keyboard-help-modal",
      maxWidth: "500px",
      showFooter: true,
    });
  }

  show() {
    if (this.isMobile) return;

    if (!this.modal?.isReady()) {
      KeyboadHelpModal._error(
        "Cannot show keyboard help - modal not available",
      );
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

  hide() {
    this.modal?.hide();
  }

  /**
   * Get the modifier key label based on platform
   */
  getModifierKey() {
    return this.isMac ? "Cmd" : "Ctrl";
  }

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

  isReady() {
    return !this.isMobile() && this.modal?.isReady();
  }
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.keyboardHelpModal = new KeyboardHelpModal();
  });
} else {
  window.keyboardHelpModal = new KeyboardHelpModal();
}
