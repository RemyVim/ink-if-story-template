// main.js

// Main entry point - load story and initialize the application
fetch("story.json")
  .then((response) => response.json())
  .then((storyContent) => {
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
        getStats: () => window.storyManager.getStats(),
        getFeatureInfo: () => window.storyManager.getFeatureInfo(),
      };
      console.log("Debug tools available in window.debug");
    }
  })
  .catch((error) => {
    console.error("Error loading story:", error);

    // Show user-friendly error message
    const storyContainer = document.getElementById("story");
    if (storyContainer) {
      storyContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--color-important);">
          <h2>Story Loading Error</h2>
          <p>Unable to load the story file. Please check that story.json exists and try refreshing the page.</p>
          <details style="margin-top: 1rem; text-align: left;">
            <summary>Technical Details</summary>
            <pre style="background: var(--color-code-bg); padding: 1rem; border-radius: var(--border-radius); margin-top: 0.5rem; overflow-x: auto;">${error.message}</pre>
          </details>
        </div>
      `;
    }
  });

// Global error handler for uncaught errors
window.addEventListener("error", (event) => {
  console.error("Uncaught error:", event.error);

  // Show user-friendly error message if story manager exists
  if (window.storyManager && window.storyManager.display) {
    const errorContent = [
      {
        text: `An unexpected error occurred: ${event.error.message}. Please try refreshing the page.`,
        classes: ["error-message"],
      },
    ];

    window.storyManager.display.render(errorContent);
  }
});

// Handle unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
  event.preventDefault(); // Prevent default console error
});

// Optional: Add keyboard shortcuts for power users
document.addEventListener("keydown", (event) => {
  // Only handle shortcuts if story manager is initialized
  if (!window.storyManager) return;

  // Don't interfere with normal typing in inputs
  if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") {
    return;
  }

  // Ctrl/Cmd + shortcuts
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case "s":
        event.preventDefault();
        window.storyManager.saves.showSaveDialog();
        break;

      case "r":
        event.preventDefault();
        if (confirm("Restart the story from the beginning?")) {
          window.storyManager.restart();
        }
        break;

      case ",":
        event.preventDefault();
        if (window.storyManager.settings) {
          window.storyManager.settings.showSettings();
        }
        break;
    }
  }

  // Escape key - return from special pages
  if (
    event.key === "Escape" &&
    window.storyManager.pages.isViewingSpecialPage()
  ) {
    window.storyManager.pages.returnToStory();
  }
});

// Add CSS for error styling if not already present
if (!document.querySelector("#error-styles")) {
  const errorStyles = document.createElement("style");
  errorStyles.id = "error-styles";
  errorStyles.textContent = `
    .error-message {
      color: var(--color-important);
      background: var(--color-code-bg);
      padding: 1rem;
      border-radius: var(--border-radius);
      border-left: 4px solid var(--color-important);
      margin: 1rem 0;
    }
  `;
  document.head.appendChild(errorStyles);
}
