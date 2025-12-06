/* =============================================================================
   CUSTOM JAVASCRIPT
   =============================================================================
   
   This file is for YOUR custom JavaScript. It loads AFTER the template's
   core scripts, so all template functionality is available.
   
   The template's core JS (template.min.js) is minified and shouldn't be
   edited directly. Use this file instead!
   
   ============================================================================= */

/* =============================================================================
   LIFECYCLE HOOKS
   =============================================================================
   
   The template fires custom events you can listen for. Use these to run
   code at specific points in the story.
   
   Available events:
   - story:start   - Story first loads (fires once)
   - story:content - New content displayed (fires on each passage)
   - story:choice  - Player makes a choice
   - story:end     - Story ends (no more content or choices)
   - story:restart - Story restarts
   
   ============================================================================= */

/**
 * Called when the story first loads and is ready.
 * Use this for one-time setup.
 */
// document.addEventListener("story:start", function () {
//   console.log("Story started!");
// });

/**
 * Called every time new story content is displayed.
 * event.detail.content contains the array of content objects.
 */
// document.addEventListener("story:content", function (event) {
//   console.log("New content:", event.detail.content);
// });

/**
 * Called when the player makes a choice.
 * event.detail.index contains the choice index (0-based).
 */
// document.addEventListener("story:choice", function (event) {
//   console.log("Player chose option:", event.detail.index);
// });

/**
 * Called when the story ends (no more content or choices).
 * Use this for end screens, achievements, etc.
 */
// document.addEventListener("story:end", function () {
//   console.log("Story ended!");
// });

/**
 * Called when the story restarts.
 * Use this to reset any custom state.
 */
// document.addEventListener("story:restart", function () {
//   console.log("Story restarted!");
// });

/* =============================================================================
   HELPER FUNCTIONS
   =============================================================================
   
   Some example helper functions you might find useful. Uncomment and modify
   as needed.
   
   ============================================================================= */

/**
 * Example: Show a custom notification
 * Uses the template's built-in notification system.
 *
 * @param {string} message - The message to display
 * @param {string} type - 'success', 'error', 'warning', or 'info'
 */
// function showNotification(message, type = "info") {
//   if (window.notificationManager) {
//     window.notificationManager.show(message, type);
//   }
// }

/**
 * Example: Get a story variable value
 * Useful for conditional logic based on story state.
 *
 * @param {string} varName - The Ink variable name
 * @returns {*} The variable value, or undefined if not found
 */
// function getStoryVariable(varName) {
//   if (window.storyManager && window.storyManager.story) {
//     return window.storyManager.story.variablesState[varName];
//   }
//   return undefined;
// }

/**
 * Example: Set a story variable
 * Allows you to modify story state from JavaScript.
 *
 * @param {string} varName - The Ink variable name
 * @param {*} value - The new value
 */
// function setStoryVariable(varName, value) {
//   if (window.storyManager && window.storyManager.story) {
//     window.storyManager.story.variablesState[varName] = value;
//   }
// }

/* =============================================================================
   YOUR CUSTOM CODE
   =============================================================================
   
   Add your custom JavaScript below. Some ideas:
   
   - Custom animations
   - Sound effects tied to story events
   - Integration with external services
   - Custom UI elements
   
   ============================================================================= */
