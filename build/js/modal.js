// modal.js
class BaseModal {
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

    this.init();
  }

  init() {
    this.createModal();
    this.setupEventListeners();
  }

  createModal() {
    // Create modal backdrop
    const modalBackdrop = document.createElement("div");
    modalBackdrop.className = `${this.config.className}-backdrop`;
    modalBackdrop.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.5); z-index: 1000; display: none;
      opacity: 0; transition: opacity 0.3s ease;
    `;

    // Create modal content
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

    modalContent.innerHTML = this.getModalHTML();
    modalBackdrop.appendChild(modalContent);

    if (!document.body) {
      window.errorManager.error(
        "Cannot create modal - document.body not available",
        null,
        "modal",
      );
      return;
    }

    document.body.appendChild(modalBackdrop);
    this.modalElement = modalBackdrop;
  }

  getModalHTML() {
    return `
      <div class="modal-header">
        <h2 style="margin: 0 0 1.5rem 0; color: var(--color-text-strong); font-size: 1.5rem;">${this.config.title}</h2>
        ${
          this.config.showCloseButton
            ? `
          <button class="modal-close" style="
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

    // Close button
    const closeBtn = this.modalElement.querySelector(".modal-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.hide());
    }

    // Backdrop click
    if (this.config.closeOnBackdrop) {
      this.modalElement.addEventListener("click", (e) => {
        if (e.target === this.modalElement) {
          this.hide();
        }
      });
    }

    // Escape key
    if (this.config.closeOnEscape) {
      this.escapeHandler = (e) => {
        if (e.key === "Escape" && this.isVisible) {
          this.hide();
        }
      };
      document.addEventListener("keydown", this.escapeHandler);
    }
  }

  show(contentCallback = null) {
    if (!this.modalElement) {
      window.errorManager.error(
        "Cannot show modal - modal element not available",
        null,
        "modal",
      );
      return;
    }

    // Populate content if callback provided
    if (contentCallback && typeof contentCallback === "function") {
      try {
        contentCallback(this);
      } catch (error) {
        window.errorManager.error(
          "Failed to populate modal content",
          error,
          "modal",
        );
      }
    }

    this.modalElement.style.display = "block";
    this.isVisible = true;

    // Trigger animation
    requestAnimationFrame(() => {
      if (this.modalElement) {
        this.modalElement.style.opacity = "1";
        const content = this.modalElement.querySelector(
          `.${this.config.className}-content`,
        );
        if (content) {
          content.style.transform = "translate(-50%, -50%) scale(1)";
        }
      }
    });

    // Call onShow callback
    if (this.onShow && typeof this.onShow === "function") {
      try {
        this.onShow();
      } catch (error) {
        window.errorManager.warning(
          "Modal onShow callback failed",
          error,
          "modal",
        );
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
      }
    }, 300);

    // Call onHide callback
    if (this.onHide && typeof this.onHide === "function") {
      try {
        this.onHide();
      } catch (error) {
        window.errorManager.warning(
          "Modal onHide callback failed",
          error,
          "modal",
        );
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

  addBodyEventListener(selector, event, handler) {
    if (!this.modalElement) return;

    const elements = this.modalElement.querySelectorAll(selector);
    elements.forEach((element) => {
      element.addEventListener(event, handler);
    });
  }

  showNotification(message, isError = false, duration = 4000) {
    const type = isError ? "error" : "success";
    window.notificationManager.show(message, { type, duration });
  }

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
      if (this.escapeHandler) {
        document.removeEventListener("keydown", this.escapeHandler);
        this.escapeHandler = null;
      }

      if (this.modalElement && this.modalElement.parentNode) {
        this.modalElement.parentNode.removeChild(this.modalElement);
      }

      this.modalElement = null;
      this.isVisible = false;
    } catch (error) {
      window.errorManager.warning("Failed to destroy modal", error, "modal");
    }
  }
}
