import { notificationManager } from "./notification-manager.js";

/**
 * Centralized error handling with logging, notifications, and automatic recovery.
 * Provides source-bound loggers for consistent error reporting across modules.
 */
class ErrorManager {
  /**
   * Predefined source identifiers for error categorization.
   * Use these constants when logging errors to ensure consistent source names.
   * @type {Object.<string, string>}
   */
  static SOURCES = {
    CHOICE_MANAGER: "Choice Manager",
    CONTENT_PROCESSOR: "Content Processor",
    DISPLAY_MANAGER: "Display Manager",
    DOM_HELPERS: "DOM Helpers",
    KEYBOARD_HELP: "Keyboard Help",
    KEYBOARD_SHORTCUTS: "Keyboard Shortcuts",
    MODAL: "Modal",
    MARKDOWN: "Markdown Processor",
    NAVIGATION_MANAGER: "Navigation Manager",
    PAGE_MANAGER: "Page Manager",
    SAVES_MODAL: "Saves Modal",
    SAVE_SYSTEM: "Save System",
    SETTINGS_MANAGER: "Settings Manager",
    STORY_MANAGER: "Story Manager",
    SYSTEM: "System",
    TAG_PROCESSOR: "Tag Processor",
  };

  /**
   * Creates the ErrorManager and sets up global error handlers.
   */
  constructor() {
    this.setupGlobalHandlers();
  }

  /**
   * Registers global handlers for uncaught errors and unhandled promise rejections.
   * @private
   */
  setupGlobalHandlers() {
    window.addEventListener("error", (event) => {
      this.handleError(
        "Uncaught Error",
        event.error,
        ErrorManager.SOURCES.SYSTEM
      );
    });

    window.addEventListener("unhandledrejection", (event) => {
      this.handleError(
        "Unhandled Promise",
        event.reason,
        ErrorManager.SOURCES.SYSTEM
      );
      event.preventDefault();
    });
  }

  /**
   * Create a logger bound to a specific source
   * @param {string} source - Source identifier (use ErrorManager.SOURCES)
   * @returns {Object} Object with error, warning, critical methods
   */
  forSource(source) {
    return {
      error: (message, error = null) => this.error(message, error, source),
      warning: (message, error = null) => this.warning(message, error, source),
      critical: (message, error = null) =>
        this.critical(message, error, source),
    };
  }

  /**
   * Logs a critical error that may trigger recovery attempts.
   * @param {string} message - Error description
   * @param {Error|*} error - Error object or details
   * @param {string} source - Error source (use ErrorManager.SOURCES)
   */
  critical(message, error, source) {
    this.handleError(message, error, source, "critical");
  }

  /**
   * Logs an error and shows a notification to the user.
   * @param {string} message - Error description
   * @param {Error|*} error - Error object or details
   * @param {string} source - Error source (use ErrorManager.SOURCES)
   */
  error(message, error, source) {
    this.handleError(message, error, source, "error");
  }

  /**
   * Logs a warning without showing a notification.
   * @param {string} message - Warning description
   * @param {Error|*} error - Error object or details
   * @param {string} source - Warning source (use ErrorManager.SOURCES)
   */
  warning(message, error, source) {
    this.handleError(message, error, source, "warning");
  }

  /**
   * Execute a function safely, catching any errors
   * @param {Function} func - Function to execute
   * @param {*} [fallback=null] - Value to return if function throws
   * @returns {*} Function result or fallback
   */
  safely(func, fallback = null) {
    try {
      return func();
    } catch (error) {
      this.handleError(
        "Safe execution failed",
        error,
        ErrorManager.SOURCES.SYSTEM
      );
      return fallback;
    }
  }

  /**
   * Execute an async function safely, catching any errors
   * @param {Function} func - Async function to execute
   * @param {*} [fallback=null] - Value to return if function throws
   * @returns {Promise<*>} Function result or fallback
   */
  async safelyAsync(func, fallback = null) {
    try {
      return await func();
    } catch (error) {
      this.handleError(
        "Safe async execution failed",
        error,
        ErrorManager.SOURCES.SYSTEM
      );
      return fallback;
    }
  }

  /**
   * Core error handling with logging, notifications, and recovery
   * @param {string} message - Error message
   * @param {Error|*} error - Error object or details
   * @param {string} [source='unknown'] - Error source (use ErrorManager.SOURCES)
   * @param {string} [severity='error'] - 'warning', 'error', or 'critical'
   */
  handleError(message, error, source = "unknown", severity = "error") {
    const prefix = `[${severity.toUpperCase()}] [${source}]`;
    console.group(`${prefix} ${message}`);
    console[severity === "warning" ? "warn" : "error"]("Message:", message);
    console[severity === "warning" ? "warn" : "error"]("Source:", source);

    if (error) {
      const errorDetails = error instanceof Error ? error.message : error;
      console[severity === "warning" ? "warn" : "error"](
        "Details:",
        errorDetails
      );
      if (error.stack) {
        console[severity === "warning" ? "warn" : "error"](
          "Stack:",
          error.stack
        );
      }
    }

    console[severity === "warning" ? "warn" : "error"](
      "Time:",
      new Date().toISOString()
    );
    console.groupEnd();

    if (severity === "error" || severity === "critical") {
      this.showNotification(message, severity);
    }

    if (severity === "critical") {
      this.attemptRecovery(source);
    }
  }

  /**
   * Displays an error notification to the user.
   * @param {string} message - Message to display
   * @param {string} severity - 'error' or 'critical'
   * @private
   */
  showNotification(message, severity) {
    const type = severity === "critical" ? "critical" : "error";
    notificationManager.show(message, { type });
  }

  /**
   * Attempts automatic recovery based on the error source.
   * Recovery actions include restarting the story, clearing display, or disabling autosave.
   * @param {string} source - The error source that triggered recovery
   * @private
   */
  attemptRecovery(source) {
    console.log(`[RECOVERY] Attempting recovery for ${source} error`);
    const storyManager = window.InkTemplate?.storyManager;

    switch (source) {
      case ErrorManager.SOURCES.STORY_MANAGER:
        if (storyManager) {
          try {
            storyManager.restart();
            console.log("[RECOVERY] Story restarted successfully");
          } catch (recoveryError) {
            console.error("[RECOVERY] Failed to restart story:", recoveryError);
          }
        }
        break;

      case ErrorManager.SOURCES.DISPLAY_MANAGER:
        if (storyManager?.display) {
          try {
            storyManager.display.clear();
            console.log("[RECOVERY] Display cleared");
          } catch (recoveryError) {
            console.error("[RECOVERY] Failed to clear display:", recoveryError);
          }
        }
        break;

      case ErrorManager.SOURCES.SAVE_SYSTEM:
        if (storyManager?.settings) {
          try {
            storyManager.settings.setSetting("autoSave", false);
            console.log(
              "[RECOVERY] Autosave disabled due to save system error"
            );
          } catch (recoveryError) {
            console.error(
              "[RECOVERY] Failed to disable autosave:",
              recoveryError
            );
          }
        }
        break;
      default:
        console.error("[RECOVERY] Critical error: Failed to recover");
    }
  }
}

const errorManager = new ErrorManager();
const ERROR_SOURCES = ErrorManager.SOURCES;
export { errorManager, ERROR_SOURCES };
