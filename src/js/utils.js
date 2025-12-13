/**
 * Static utility functions for platform detection, string formatting, and algorithms.
 */
const Utils = {
  /**
   * Detects if the device is mobile based on pointer capabilities.
   * Returns true for touch-only devices, false for devices with fine pointers (mouse).
   * @returns {boolean} True if device appears to be mobile
   */
  isMobile() {
    return (
      window.matchMedia("(pointer: coarse)").matches &&
      !window.matchMedia("(pointer: fine)").matches
    );
  },

  /**
   * Detects if the operating system is macOS.
   * Used to show correct modifier key labels (Cmd vs Ctrl).
   * @returns {boolean} True if running on macOS
   */
  isMac() {
    return (
      navigator.userAgentData?.platform === "macOS" ||
      navigator.platform.toUpperCase().includes("MAC")
    );
  },

  /**
   * Format Ink knot names for display (fallback when no display name is specified)
   * @param {string} knotName - Raw knot name
   * @returns {string} Formatted display name
   */
  formatKnotName(knotName) {
    return knotName
      .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase to words
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2") // multiple caps NPCDialogue -> NPC Dialogue
      .replace(/_/g, " ") // snake_case to words
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  },

  /**
   * Calculates the Levenshtein (edit) distance between two strings.
   * Used for suggesting similar tag names when unknown tags are encountered.
   * @param {string} a - First string
   * @param {string} b - Second string
   * @returns {number} The minimum number of single-character edits needed
   */
  levenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        const cost = a[j - 1] === b[i - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    return matrix[b.length][a.length];
  },
};

export { Utils };
