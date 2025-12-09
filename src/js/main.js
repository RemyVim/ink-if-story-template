import { StoryManager } from "./story-manager.js";
import { errorManager, ERROR_SOURCES } from "./error-manager.js";
import { notificationManager } from "./notification-manager.js";
import { StoryFeatures } from "./tag-registry.js";
import { Utils } from "./utils.js";
import { KeyboardShortcuts } from "./keyboard-shortcuts.js";
import { KeyboardHelpModal } from "./keyboard-help-modal.js";
import { DisplayManager } from "./display-manager.js";
import { ContentProcessor } from "./content-processor.js";
import { TagProcessor } from "./tag-processor.js";
import { SettingsManager } from "./settings-manager.js";
import { SettingsModal } from "./settings-modal.js";
import { PageManager } from "./page-manager.js";
import { ChoiceManager } from "./choice-manager.js";
import { NavigationManager } from "./navigation-manager.js";
import { SavesManager } from "./saves-manager.js";

/**
 * Application entry point. Initializes all managers and starts the story.
 *
 * Initialization order:
 * 1. Fetch and parse story.json
 * 2. Create core services (settings, processors)
 * 3. Create display and story manager
 * 4. Create feature managers (pages, choices, navigation, saves)
 * 5. Wire circular dependencies
 * 6. Initialize keyboard features (desktop only)
 * 7. Start the story
 * 8. Expose public API on window.InkTemplate
 *
 * @module main
 */

/**
 * Public API namespace for debugging and external access.
 * @type {{storyManager: StoryManager|null, errorManager: ErrorManager, notificationManager: NotificationManager, keyboardShortcuts: KeyboardShortcuts|null, keyboardHelpModal: KeyboardHelpModal|null}}
 */
window.InkTemplate = {
  storyManager: null,
  errorManager,
  notificationManager,
  keyboardShortcuts: null,
  keyboardHelpModal: null,
};

fetch("story.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error(
        `story.json not found (${response.status}). ` +
          `Make sure story.json is in the root folder alongside index.html.`
      );
    }
    return response.json();
  })
  .then((storyContent) => {
    try {
      StoryFeatures.scan(storyContent);

      const settings = new SettingsManager();
      const settingsModal = new SettingsModal(settings);
      const tagProcessor = new TagProcessor(settings);
      const contentProcessor = new ContentProcessor(tagProcessor);
      const display = new DisplayManager(settings);
      const storyManager = new StoryManager(storyContent, {
        display,
        settings,
        contentProcessor,
      });
      const pages = new PageManager(storyManager);
      const choices = new ChoiceManager(storyManager);
      const navigation = new NavigationManager(storyManager);
      const saves = new SavesManager(storyManager);

      // Wire circular dependencies
      storyManager.pages = pages;
      storyManager.choices = choices;
      storyManager.navigation = navigation;
      storyManager.saves = saves;
      contentProcessor.storyManager = storyManager;
      display.storyManager = storyManager;

      // Initialize keyboard features (desktop only)
      let keyboardShortcuts = null;
      let keyboardHelpModal = null;
      if (!Utils.isMobile()) {
        keyboardHelpModal = new KeyboardHelpModal();
        keyboardShortcuts = new KeyboardShortcuts();
        keyboardShortcuts.storyManager = storyManager;
        keyboardShortcuts.keyboardHelpModal = keyboardHelpModal;
      }

      // Wire settings dependencies
      settings.storyManager = storyManager;
      settings.keyboardShortcuts = keyboardShortcuts;
      settings.settingsModal = settingsModal;
      settingsModal.keyboardHelpModal = keyboardHelpModal;

      // Start the story
      storyManager.start();

      // Set up public API
      window.InkTemplate.storyManager = storyManager;
      window.InkTemplate.keyboardShortcuts = keyboardShortcuts;
      window.InkTemplate.keyboardHelpModal = keyboardHelpModal;

      const loadingScreen = document.getElementById("loading-screen");
      if (loadingScreen) {
        loadingScreen.classList.add("hidden");
        setTimeout(() => loadingScreen.remove(), 300);
      }

      const mainContent = document.getElementById("main-content");
      if (mainContent) {
        mainContent.removeAttribute("aria-busy");
      }

      // Debug tools (localhost only)
      if (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
      ) {
        window.debug = {
          story: storyManager.story,
          display: storyManager.display,
          saves: storyManager.saves,
          settings: storyManager.settings,
          errors: errorManager,
          getStats: () => storyManager.getStats(),
          getFeatureInfo: () => storyManager.getFeatureInfo(),
        };
        console.log("Debug tools available in window.debug");
      }
    } catch (error) {
      errorManager.critical(
        "Failed to initialize story manager",
        error,
        ERROR_SOURCES.SYSTEM
      );
      showFallbackUI(error);
    }
  })
  .catch((error) => {
    errorManager.critical(
      "Failed to load story file",
      error,
      ERROR_SOURCES.SYSTEM
    );
    showFallbackUI(error);
  });

/**
 * Show fallback UI when story fails to load
 * @param {Error} error - The error that occurred
 */
function showFallbackUI(error) {
  const storyContainer = document.getElementById("story");
  if (!storyContainer) return;

  const loadingScreen = document.getElementById("loading-screen");
  if (loadingScreen) {
    loadingScreen.classList.add("hidden");
    setTimeout(() => loadingScreen.remove(), 300);
  }

  storyContainer.innerHTML = `
    <div style="text-align: center; padding: 2rem; color: var(--color-important);">
      <h2>⚠️ Story Loading Error</h2>
      <p>Unable to load the story. Please check the browser console (F12) for details.</p>
      <div style="margin: 2rem 0;">
        <button onclick="window.location.reload()" style="
          background: var(--color-accent-primary);
          color: var(--color-background);
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          margin-right: 1rem;
          font-size: 1rem;
        ">Reload Page</button>
        <button onclick="showConsoleHelp()" style="
          color: var(--color-text-primary);
          border: 1px solid var(--color-border-medium);
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
        ">How to Check Console</button>
      </div>
      <details style="margin-top: 1rem; text-align: left; max-width: 500px; margin-left: auto; margin-right: auto;">
        <summary style="cursor: pointer; font-weight: 600;">Technical Details</summary>
        <div style="background: var(--color-background); color: var(--color-text-primary); padding: 1rem; border-radius: 4px; margin-top: 0.5rem; font-family: monospace; font-size: 0.8rem; overflow-x: auto;">
          Error: ${error.message}<br>
          Time: ${new Date().toLocaleString()}<br>
          ${error.stack ? `Stack: ${error.stack}` : ""}
        </div>
      </details>
    </div>
  `;
}

function showConsoleHelp() {
  alert(`To check the console for error details:

• Chrome/Edge: Press F12 or Ctrl+Shift+I, then click "Console"
• Firefox: Press F12 or Ctrl+Shift+K
• Safari: Press Cmd+Option+I (Mac), then click "Console"
• Mobile: Console not easily accessible, try on desktop

Look for red error messages that show what went wrong.`);
}

window.showConsoleHelp = showConsoleHelp;
