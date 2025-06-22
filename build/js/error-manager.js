// error-manager.js
class ErrorManager {
  constructor() {
    this.setupGlobalHandlers();
  }

  setupGlobalHandlers() {
    window.addEventListener("error", (event) => {
      this.handleError("Uncaught Error", event.error, "system");
    });

    window.addEventListener("unhandledrejection", (event) => {
      this.handleError("Unhandled Promise", event.reason, "system");
      event.preventDefault();
    });
  }

  handleError(message, error, source = "unknown", severity = "error") {
    // Console logging
    const prefix = `[${severity.toUpperCase()}] [${source}]`;
    console.group(`${prefix} ${message}`);
    console[severity === "warning" ? "warn" : "error"]("Message:", message);
    console[severity === "warning" ? "warn" : "error"]("Source:", source);

    if (error) {
      console[severity === "warning" ? "warn" : "error"]("Error:", error);
      if (error.stack) {
        console[severity === "warning" ? "warn" : "error"](
          "Stack:",
          error.stack,
        );
      }
    }

    console[severity === "warning" ? "warn" : "error"](
      "Time:",
      new Date().toISOString(),
    );
    console.groupEnd();

    // Show user notification for errors and critical issues
    if (severity === "error" || severity === "critical") {
      this.showNotification(message, severity);
    }

    // For critical errors, attempt basic recovery
    if (severity === "critical") {
      this.attemptRecovery(source);
    }
  }

  showNotification(message, severity) {
    const type = severity === "critical" ? "critical" : "error";
    window.notificationManager.show(message, { type });
  }

  attemptRecovery(source) {
    console.log(`[RECOVERY] Attempting recovery for ${source} error`);

    switch (source) {
      case "story":
        if (window.storyManager) {
          try {
            window.storyManager.restart();
            console.log("[RECOVERY] Story restarted successfully");
          } catch (recoveryError) {
            console.error("[RECOVERY] Failed to restart story:", recoveryError);
          }
        }
        break;

      case "display":
        if (window.storyManager?.display) {
          try {
            window.storyManager.display.clear();
            console.log("[RECOVERY] Display cleared");
          } catch (recoveryError) {
            console.error("[RECOVERY] Failed to clear display:", recoveryError);
          }
        }
        break;

      case "save-system":
        if (window.storyManager?.settings) {
          try {
            window.storyManager.settings.setSetting("autoSave", false);
            console.log(
              "[RECOVERY] Autosave disabled due to save system error",
            );
          } catch (recoveryError) {
            console.error(
              "[RECOVERY] Failed to disable autosave:",
              recoveryError,
            );
          }
        }
        break;
    }
  }

  // Convenience methods
  critical(message, error, source) {
    this.handleError(message, error, source, "critical");
  }

  error(message, error, source) {
    this.handleError(message, error, source, "error");
  }

  warning(message, error, source) {
    this.handleError(message, error, source, "warning");
  }

  // Simplified safe wrapper - only use when absolutely necessary
  safely(func, fallback = null) {
    try {
      return func();
    } catch (error) {
      this.handleError("Safe execution failed", error, "system");
      return fallback;
    }
  }

  // Async safe wrapper
  async safelyAsync(func, fallback = null) {
    try {
      return await func();
    } catch (error) {
      this.handleError("Safe async execution failed", error, "system");
      return fallback;
    }
  }
}

// Create global instance
window.errorManager = new ErrorManager();
