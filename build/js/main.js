// main.js
// Main entry point - load story and initialize the application

fetch("story.json")
  .then((response) => response.json())
  .then((storyContent) => {
    try {
      // Initialize the story manager which handles everything
      window.storyManager = new StoryManager(storyContent);

      // Optional: expose for debugging in development
      if (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
      ) {
        window.debug = {
          story: window.storyManager.story,
          display: window.storyManager.display,
          saves: window.storyManager.saves,
          settings: window.storyManager.settings,
          errors: window.errorManager,
          getStats: () => window.storyManager.getStats(),
          getFeatureInfo: () => window.storyManager.getFeatureInfo(),
        };
        console.log("Debug tools available in window.debug");
      }
    } catch (error) {
      window.errorManager.critical(
        "Failed to initialize story manager",
        error,
        "story",
      );
      showFallbackUI(error);
    }
  })
  .catch((error) => {
    window.errorManager.critical("Failed to load story file", error, "story");
    showFallbackUI(error);
  });

/**
 * Show fallback UI when story fails to load
 * @param {Error} error - The error that occurred
 */
function showFallbackUI(error) {
  const storyContainer = document.getElementById("story");
  if (!storyContainer) return;

  storyContainer.innerHTML = `
    <div style="text-align: center; padding: 2rem; color: var(--color-important);">
      <h2>⚠️ Story Loading Error</h2>
      <p>Unable to load the story. Please check the browser console (F12) for details.</p>
      <div style="margin: 2rem 0;">
        <button onclick="window.location.reload()" style="
          background: var(--color-accent-primary);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          margin-right: 1rem;
          font-size: 1rem;
        ">Reload Page</button>
        <button onclick="showConsoleHelp()" style="
          background: var(--color-border-medium);
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
        <div style="background: var(--color-code-bg); padding: 1rem; border-radius: 4px; margin-top: 0.5rem; font-family: monospace; font-size: 0.8rem; overflow-x: auto;">
          Error: ${error.message}<br>
          Time: ${new Date().toLocaleString()}<br>
          ${error.stack ? `Stack: ${error.stack}` : ""}
        </div>
      </details>
    </div>
  `;
}

/**
 * Help users find the browser console
 */
function showConsoleHelp() {
  alert(`To check the console for error details:

• Chrome/Edge: Press F12 or Ctrl+Shift+I, then click "Console"
• Firefox: Press F12 or Ctrl+Shift+K
• Safari: Press Cmd+Option+I (Mac), then click "Console"
• Mobile: Console not easily accessible, try on desktop

Look for red error messages that show what went wrong.`);
}

// Make showConsoleHelp available globally for the fallback UI
window.showConsoleHelp = showConsoleHelp;
