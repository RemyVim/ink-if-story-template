import { BaseModal } from "./base-modal.js";
import { Utils } from "./utils.js";

/**
 * Reusable error modal for displaying user-friendly error messages
 * with optional technical details. Use for recoverable errors that
 * need user acknowledgment.
 */
class ErrorModal {
  constructor() {
    this.modal = null;
    this.init();
  }

  /**
   * Initialize the modal instance.
   * @private
   */
  init() {
    this.modal = new BaseModal({
      title: "Error",
      className: "error-modal",
      maxWidth: "500px",
      showFooter: true,
    });
  }

  /**
   * Display an error modal with details.
   * @param {Object} options - Error display options
   * @param {string} [options.title="Something went wrong"] - Modal title
   * @param {string} [options.message="An unexpected error occurred."] - User-friendly message
   * @param {string[]} [options.suggestions=[]] - List of possible causes/solutions
   * @param {Error|string|null} [options.error=null] - Error object for technical details
   */
  show({
    title = "Something went wrong",
    message = "An unexpected error occurred.",
    suggestions = [],
    error = null,
  } = {}) {
    if (!this.modal?.isReady()) {
      console.error("[ErrorModal] Modal not initialized");
      return;
    }

    this.modal.show((modal) => {
      const titleEl = modal.modalElement?.querySelector(".modal-header h2");
      if (titleEl) {
        titleEl.innerHTML = `<span class="material-icons error-modal-icon" aria-hidden="true">warning</span><span class="sr-only">Error: </span>${this.escapeHtml(title)}`;
      }
      modal.setContent(this.buildContent(message, suggestions, error));
      this.setupFooter(modal);
    });
  }

  /**
   * Build the modal content HTML.
   * @param {string} message - Main message
   * @param {string[]} suggestions - List of suggestions
   * @param {Error|string|null} error - Error for technical details
   * @returns {string} HTML content
   * @private
   */
  buildContent(message, suggestions, error) {
    let html = `<p class="error-modal-message">${message}</p>`;

    if (suggestions.length > 0) {
      html += `
        <div class="error-modal-suggestions">
          <p><strong>This might be because:</strong></p>
          <ul>
            ${suggestions.map((s) => `<li>${s}</li>`).join("")}
          </ul>
        </div>
      `;
    }

    if (error) {
      const errorText =
        error instanceof Error
          ? `${error.message}${error.stack ? `\n\n${error.stack}` : ""}`
          : String(error);

      const consoleHint = Utils.isMobile()
        ? ""
        : `<p class="error-modal-console-hint">
        For more details, open browser console: <kbd>F12</kbd> → Console tab
      </p>`;

      html += `
    <details class="error-modal-details">
      <summary>Technical Details</summary>
      <pre>${this.escapeHtml(errorText)}</pre>
      ${consoleHint}
    </details>
  `;
    }

    return html;
  }

  /**
   * Set up the modal footer with close button.
   * @param {BaseModal} modal - The modal instance
   * @private
   */
  setupFooter(modal) {
    const footer = modal.getFooter();
    if (!footer) return;

    footer.innerHTML = "";
    footer.className = "modal-footer modal-footer-right";

    const closeBtn = modal.createButton("Close", {
      variant: "primary",
      onClick: () => modal.hide(),
    });

    footer.appendChild(closeBtn);
  }

  /**
   * Escape HTML entities for safe display.
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   * @private
   */
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Hide the modal.
   */
  hide() {
    this.modal?.hide();
  }
}

/** Singleton instance for global use */
const errorModal = new ErrorModal();

export { ErrorModal, errorModal };
