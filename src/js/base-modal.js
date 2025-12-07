import { errorManager, ERROR_SOURCES } from "./error-manager.js";
import { notificationManager } from "./notification-manager.js";

const log = errorManager.forSource(ERROR_SOURCES.MODAL);

class BaseModal {
  static instances = new Set();

  /**
   * @param {Object} options
   * @param {string} [options.title='Modal'] - Modal title
   * @param {string} [options.className='base-modal'] - CSS class prefix
   * @param {string} [options.maxWidth='500px'] - Maximum width
   * @param {string} [options.width='90%'] - Width
   * @param {string} [options.maxHeight='80vh'] - Maximum height
   * @param {boolean} [options.closeOnBackdrop=true] - Close when clicking backdrop
   * @param {boolean} [options.closeOnEscape=true] - Close on Escape key
   * @param {boolean} [options.showCloseButton=true] - Show X button
   * @param {boolean} [options.showFooter=true] - Show footer section
   * @param {Function} [options.onShow] - Callback when modal shows
   * @param {Function} [options.onHide] - Callback when modal hides
   */
  constructor(options = {}) {
    this.config = {
      maxWidth: "500px",
      width: "90%",
      maxHeight: "80vh",
      className: "base-modal",
      title: "Modal",
      closeOnBackdrop: true,
      closeOnEscape: true,
      showCloseButton: true,
      showFooter: true,
      size: "normal", // 'small', 'normal', 'large', 'wide'
      ...options,
    };

    this.modalElement = null;
    this.isVisible = false;
    this.onShow = options.onShow || null;
    this.onHide = options.onHide || null;
    this.previouslyFocusedElement = null;

    this.init();
  }

  init() {
    this.createModal();
    this.setupEventListeners();
    BaseModal.instances.add(this);
  }

  createModal() {
    const modalBackdrop = document.createElement("div");
    modalBackdrop.className = `${this.config.className}-backdrop`;
    modalBackdrop.setAttribute("role", "presentation");
    modalBackdrop.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.5); z-index: 1000; display: none;
      opacity: 0; transition: opacity 0.3s ease;
    `;

    const modalContent = document.createElement("div");
    modalContent.className = `${this.config.className}-content`;
    modalContent.style.cssText = `
      position: fixed; top: 50%; left: 50%;
      transform: translate(-50%, -50%) scale(0.9);
      background: var(--color-background);
      border: 1px solid var(--color-border-medium);
      border-radius: var(--border-radius-lg);
      padding: 2rem; max-width: ${this.config.maxWidth}; width: ${this.config.width}; 
      max-height: ${this.config.maxHeight};
      overflow-y: auto; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      transition: transform 0.3s ease; z-index: 1001;
    `;
    modalContent.setAttribute("role", "dialog");
    modalContent.setAttribute("aria-modal", "true");
    modalContent.setAttribute(
      "aria-labelledby",
      `${this.config.className}-title`,
    );
    modalContent.setAttribute("tabindex", "-1");

    modalContent.innerHTML = this.getModalHTML();
    modalBackdrop.appendChild(modalContent);

    if (!document.body) {
      log.error("Cannot create modal - document.body not available");
      return;
    }

    document.body.appendChild(modalBackdrop);
    this.modalElement = modalBackdrop;
  }

  getModalHTML() {
    return `
      <div class="modal-header">
        <h2 id="${this.config.className}-title" style="margin: 0 0 1.5rem 0; color: var(--color-text-strong); font-size: 1.5rem;">${this.config.title}</h2>
        ${
          this.config.showCloseButton
            ? `
          <button class="modal-close" aria-label="Close" style="
            position: absolute; top: 1rem; right: 1rem; background: none; border: none;
            font-size: 1.5rem; color: var(--color-text-secondary); cursor: pointer;
            padding: 0.5rem; border-radius: var(--border-radius);
          ">&times;</button>
        `
            : ""
        }
      </div>

      <div class="modal-body">
        <!-- Content will be injected here -->
      </div>

      ${
        this.config.showFooter
          ? `
        <div class="modal-footer" style="margin-top: 2rem; text-align: right; border-top: 1px solid var(--color-border-light); padding-top: 1rem;">
          <!-- Footer content will be injected here -->
        </div>
      `
          : ""
      }
    `;
  }

  setupEventListeners() {
    if (!this.modalElement) return;

    this.focusTrapHandler = (e) => {
      if (e.key !== "Tab" || !this.isVisible) return;

      const content = this.modalElement.querySelector(
        `.${this.config.className}-content`,
      );
      const focusable = content?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", this.focusTrapHandler);

    const closeBtn = this.modalElement.querySelector(".modal-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.hide());
    }

    if (this.config.closeOnBackdrop) {
      this.modalElement.addEventListener("click", (e) => {
        if (e.target === this.modalElement) {
          this.hide();
        }
      });
    }

    if (this.config.closeOnEscape) {
      this.escapeHandler = (e) => {
        if (e.key === "Escape" && this.isVisible) {
          this.hide();
        }
      };
      document.addEventListener("keydown", this.escapeHandler);
    }
  }

  /**
   * @param {Function} [contentCallback] - Called with modal instance to populate content before showing
   */
  show(contentCallback = null) {
    BaseModal.closeAll(this);
    if (!this.modalElement) {
      log.error("Cannot show modal - modal element not available");
      return;
    }

    this.previouslyFocusedElement = document.activeElement;

    if (contentCallback && typeof contentCallback === "function") {
      try {
        contentCallback(this);
      } catch (error) {
        log.error("Failed to populate modal content", error);
      }
    }

    this.modalElement.style.display = "block";
    this.isVisible = true;

    requestAnimationFrame(() => {
      if (this.modalElement) {
        this.modalElement.style.opacity = "1";
        const content = this.modalElement.querySelector(
          `.${this.config.className}-content`,
        );
        if (content) {
          content.style.transform = "translate(-50%, -50%) scale(1)";
        }
        const focusable = content?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable?.length) {
          focusable[0].focus();
        } else {
          content?.focus();
        }
      }
    });

    if (this.onShow && typeof this.onShow === "function") {
      try {
        this.onShow();
      } catch (error) {
        log.warning("Modal onShow callback failed", error);
      }
    }
  }

  hide() {
    if (!this.modalElement) return;

    this.modalElement.style.opacity = "0";
    const content = this.modalElement.querySelector(
      `.${this.config.className}-content`,
    );

    if (content) {
      content.style.transform = "translate(-50%, -50%) scale(0.9)";
    }

    setTimeout(() => {
      if (this.modalElement) {
        this.modalElement.style.display = "none";
        this.isVisible = false;
        this.previouslyFocusedElement?.focus();
      }
    }, 300);

    if (this.onHide && typeof this.onHide === "function") {
      try {
        this.onHide();
      } catch (error) {
        log.warning("Modal onHide callback failed", error);
      }
    }
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Display a confirmation dialog with customizable buttons
   * @param {string} message - Confirmation message
   * @param {Function} onConfirm - Called when confirmed
   * @param {Function} [onCancel] - Called when cancelled
   * @param {Object} [options]
   * @param {string} [options.title] - Override modal title
   * @param {string} [options.confirmText='Confirm'] - Confirm button text
   * @param {string} [options.cancelText='Cancel'] - Cancel button text
   * @param {string} [options.confirmVariant='danger'] - Confirm button style variant
   */
  showConfirmation(message, onConfirm, onCancel, options = {}) {
    const defaults = {
      title: "Confirm",
      confirmText: "Yes",
      cancelText: "Cancel",
      confirmVariant: "danger",
    };

    const settings = { ...defaults, ...options };

    // Temporarily store original config
    const originalConfig = { ...this.config };

    // Update config for confirmation dialog
    this.config.title = settings.title;
    this.config.closeOnBackdrop = false;
    this.config.closeOnEscape = true;

    this.show((modal) => {
      // Set content
      modal.setContent(
        `<p style="margin: 0; color: var(--color-text-primary);">${message}</p>`,
      );

      // Set footer with buttons
      const footer = modal.getFooter();
      if (footer) {
        footer.innerHTML = "";
        footer.style.display = "flex";
        footer.style.justifyContent = "flex-end";
        footer.style.gap = "0.5rem";

        const cancelBtn = modal.createButton(settings.cancelText, {
          variant: "secondary",
          onClick: () => {
            modal.hide();
            if (onCancel) onCancel();
            // Restore original config
            Object.assign(this.config, originalConfig);
          },
        });

        const confirmBtn = modal.createButton(settings.confirmText, {
          variant: settings.confirmVariant,
          onClick: () => {
            modal.hide();
            if (onConfirm) onConfirm();
            // Restore original config
            Object.assign(this.config, originalConfig);
          },
        });

        footer.appendChild(cancelBtn);
        footer.appendChild(confirmBtn);
      }
    });

    // Override escape handler for this dialog
    if (this.escapeHandler) {
      document.removeEventListener("keydown", this.escapeHandler);
    }
    this.escapeHandler = (e) => {
      if (e.key === "Escape" && this.isVisible) {
        this.hide();
        if (onCancel) onCancel();
        Object.assign(this.config, originalConfig);
      }
    };
    document.addEventListener("keydown", this.escapeHandler);
  }

  setContent(html) {
    const body = this.modalElement?.querySelector(".modal-body");
    if (body) {
      body.innerHTML = html;
    }
  }

  setFooter(html) {
    const footer = this.modalElement?.querySelector(".modal-footer");
    if (footer) {
      footer.innerHTML = html;
    }
  }

  getBody() {
    return this.modalElement?.querySelector(".modal-body");
  }

  getFooter() {
    return this.modalElement?.querySelector(".modal-footer");
  }

  /**
   * Attach event listeners to elements within the modal body
   * @param {string} selector - CSS selector for target elements
   * @param {string} event - Event type (e.g., 'click')
   * @param {Function} handler - Event handler
   */
  addBodyEventListener(selector, event, handler) {
    if (!this.modalElement) return;

    const elements = this.modalElement.querySelectorAll(selector);
    elements.forEach((element) => {
      element.addEventListener(event, handler);
    });
  }

  /**
   * @param {string} text - Button label
   * @param {Object} [options]
   * @param {string} [options.variant='primary'] - Style variant: 'primary', 'secondary', 'danger'
   * @param {Function} [options.onClick] - Click handler
   * @param {Object} [options.styles] - Additional inline styles
   * @returns {HTMLButtonElement}
   */
  createButton(text, options = {}) {
    const button = document.createElement("button");
    button.textContent = text;

    // Apply CSS classes instead of inline styles
    button.className = `modal-button modal-button-${options.variant || "primary"}`;

    if (options.onClick && typeof options.onClick === "function") {
      button.addEventListener("click", options.onClick);
    }

    // Add custom styles if provided
    if (options.styles) {
      Object.entries(options.styles).forEach(([property, value]) => {
        button.style[property] = value;
      });
    }

    return button;
  }

  showNotification(message, isError = false, duration = 4000) {
    const type = isError ? "error" : "success";
    notificationManager.show(message, { type, duration });
  }

  isReady() {
    return !!(this.modalElement && document.body);
  }

  getStats() {
    return {
      hasModalElement: !!this.modalElement,
      isVisible: this.isVisible,
      className: this.config.className,
      hasEscapeHandler: !!this.escapeHandler,
      size: this.config.size,
    };
  }

  destroy() {
    try {
      BaseModal.instances.delete(this);
      if (this.escapeHandler) {
        document.removeEventListener("keydown", this.escapeHandler);
        this.escapeHandler = null;
      }
      if (this.focusTrapHandler) {
        document.removeEventListener("keydown", this.focusTrapHandler);
        this.focusTrapHandler = null;
      }

      if (this.modalElement && this.modalElement.parentNode) {
        this.modalElement.parentNode.removeChild(this.modalElement);
      }

      this.modalElement = null;
      this.isVisible = false;
    } catch (error) {
      log.warning("Failed to destroy modal", error);
    }
  }

  /**
   * Close all currently visible modals
   * @param {BaseModal} except - Optional modal to skip (don't close this one)
   */
  static closeAll(except = null) {
    for (const modal of BaseModal.instances) {
      if (modal !== except && modal.isVisible) {
        modal.hide();
      }
    }
  }

  static hasVisibleModal() {
    for (const modal of BaseModal.instances) {
      if (modal.isVisible) return true;
    }
    return false;
  }

  /**
   * Static helper for one-off confirmation dialogs. Creates a temporary modal and cleans up after.
   * @param {Object} options
   * @param {string} options.title - Dialog title
   * @param {string} options.message - Confirmation message
   * @param {string} [options.confirmText='Yes'] - Confirm button text
   * @param {string} [options.cancelText='Cancel'] - Cancel button text
   * @param {string} [options.confirmVariant='danger'] - Confirm button style
   * @param {Function} [options.onConfirm] - Called when confirmed
   * @param {Function} [options.onCancel] - Called when cancelled
   */
  static confirm({
    title,
    message,
    confirmText = "Yes",
    cancelText = "Cancel",
    confirmVariant = "danger",
    onConfirm,
    onCancel,
  }) {
    const modal = new BaseModal({
      title: title || "Confirm",
      className: "confirm-modal",
      maxWidth: "400px",
      showFooter: true,
    });

    modal.showConfirmation(
      message,
      () => {
        onConfirm?.();
        modal.destroy();
      },
      () => {
        onCancel?.();
        modal.destroy();
      },
      { title, confirmText, cancelText, confirmVariant },
    );
  }
}

export { BaseModal };
