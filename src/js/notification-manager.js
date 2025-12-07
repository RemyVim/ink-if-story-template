class NotificationManager {
  // Uses console.warn directly to avoid circular dependency with ErrorManager

  constructor(options = {}) {
    this.config = {
      position: "bottom-right", // top-left, top-right, bottom-left, bottom-right, top-center, bottom-center
      maxNotifications: 5,
      defaultDuration: 4000,
      spacing: 10,
      zIndex: 2000,
      ...options,
    };

    this.notifications = [];
    this.container = null;
    this.init();
  }

  init() {
    this.createContainer();
    this.addStyles();
  }

  createContainer() {
    this.container = document.createElement("div");
    this.container.className = "notification-container";
    this.container.setAttribute("data-position", this.config.position);
    this.container.setAttribute("aria-live", "polite");
    this.container.setAttribute("role", "status");

    // Position the container
    this.setContainerPosition();

    document.body.appendChild(this.container);
  }

  setContainerPosition() {
    const positions = {
      "top-left": { top: "20px", left: "20px" },
      "top-right": { top: "20px", right: "20px" },
      "top-center": { top: "20px", left: "50%", transform: "translateX(-50%)" },
      "bottom-left": { bottom: "20px", left: "20px" },
      "bottom-right": { bottom: "20px", right: "20px" },
      "bottom-center": {
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
      },
    };

    const pos = positions[this.config.position] || positions["bottom-right"];
    Object.assign(this.container.style, {
      position: "fixed",
      zIndex: this.config.zIndex,
      pointerEvents: "none",
      ...pos,
    });
  }

  addStyles() {
    const root = document.documentElement;
    root.style.setProperty(
      "--notification-spacing",
      `${this.config.spacing}px`,
    );
  }

  /**
   * Show a notification
   * @param {string} message - The message to display
   * @param {Object} options - Notification options
   * @returns {Object} Notification object with remove method
   */
  show(message, options = {}) {
    const config = {
      type: "info", // success, error, warning, info, critical
      duration: this.config.defaultDuration,
      closable: true,
      icon: null, // Auto-determined if null
      showProgress: false,
      onClick: null,
      onClose: null,
      ...options,
    };

    if (!config.icon) {
      const icons = {
        success: "✓",
        error: "✕",
        warning: "⚠",
        info: "ⓘ",
        critical: "🚨",
      };
      config.icon = icons[config.type] || "ⓘ";
    }

    const notification = this.createNotificationElement(message, config);
    this.enforceMaxNotifications();

    this.container.appendChild(notification);
    const notificationObj = { element: notification, config };
    this.notifications.push(notificationObj);

    requestAnimationFrame(() => {
      notification.classList.add("notification-visible");
    });

    if (config.duration > 0 && config.type !== "critical") {
      setTimeout(() => {
        this.remove(notificationObj);
      }, config.duration);
    }

    return {
      remove: () => this.remove(notificationObj),
      element: notification,
    };
  }

  success(message, options = {}) {
    return this.show(message, { ...options, type: "success" });
  }

  error(message, options = {}) {
    return this.show(message, { ...options, type: "error" });
  }

  warning(message, options = {}) {
    return this.show(message, { ...options, type: "warning" });
  }

  info(message, options = {}) {
    return this.show(message, { ...options, type: "info" });
  }

  critical(message, options = {}) {
    return this.show(message, {
      ...options,
      type: "critical",
      duration: 0, // Critical notifications don't auto-dismiss
      closable: true,
    });
  }

  remove(notificationObj) {
    if (!notificationObj || !notificationObj.element) return;

    const { element, config } = notificationObj;

    if (config.onClose) {
      try {
        config.onClose();
      } catch (error) {
        console.warn("Notification onClose callback failed:", error);
      }
    }

    const index = this.notifications.indexOf(notificationObj);
    if (index > -1) {
      this.notifications.splice(index, 1);
    }

    element.style.transform = this.getExitTransform();
    element.style.opacity = "0";

    setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    }, 300);
  }

  clearAll() {
    const notificationsToRemove = [...this.notifications];
    notificationsToRemove.forEach((notification) => {
      this.remove(notification);
    });
  }

  createNotificationElement(message, config) {
    const notification = document.createElement("div");
    notification.className = `notification-item notification-${config.type}`;

    if (config.type === "error" || config.type === "critical") {
      notification.setAttribute("role", "alert");
    }

    const content = document.createElement("div");
    content.className = "notification-content";

    const iconSpan = document.createElement("span");
    iconSpan.className = "notification-icon";
    iconSpan.textContent = config.icon;
    iconSpan.setAttribute("aria-hidden", "true");

    content.appendChild(iconSpan);

    const messageSpan = document.createElement("span");
    messageSpan.textContent = message;
    content.appendChild(messageSpan);

    notification.appendChild(content);

    if (config.closable) {
      const closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "notification-close";
      closeBtn.innerHTML = "×";
      closeBtn.setAttribute("aria-label", "Dismiss notification");
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.remove({ element: notification, config });
      });
      notification.appendChild(closeBtn);
    }

    if (config.showProgress && config.duration > 0) {
      const progress = document.createElement("div");
      progress.className = "notification-progress";
      progress.style.width = "100%";
      notification.appendChild(progress);

      requestAnimationFrame(() => {
        progress.style.width = "0%";
        progress.style.transitionDuration = `${config.duration}ms`;
      });
    }

    if (config.onClick) {
      notification.style.cursor = "pointer";
      notification.addEventListener("click", config.onClick);
    }

    return notification;
  }

  getExitTransform() {
    const isRight = this.config.position.includes("right");
    const isLeft = this.config.position.includes("left");

    if (isRight) return "translateX(100%)";
    if (isLeft) return "translateX(-100%)";
    return "translateY(-100%)"; // center positions
  }

  enforceMaxNotifications() {
    while (this.notifications.length >= this.config.maxNotifications) {
      const oldest = this.notifications[0];
      this.remove(oldest);
    }
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };

    if (newConfig.position) {
      this.setContainerPosition();
      this.container.setAttribute("data-position", this.config.position);
    }
  }

  getStats() {
    return {
      activeNotifications: this.notifications.length,
      maxNotifications: this.config.maxNotifications,
      position: this.config.position,
      hasContainer: !!this.container,
    };
  }

  destroy() {
    this.clearAll();

    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    const styles = document.getElementById("notification-styles");
    if (styles) {
      styles.remove();
    }

    this.container = null;
    this.notifications = [];
  }
}

const notificationManager = new NotificationManager();
export { notificationManager };
