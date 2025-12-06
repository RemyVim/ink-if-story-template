// utils.js
const Utils = {
  /**
   * Check if device is mobile/touch-only
   * @returns {boolean}
   */
  isMobile() {
    return (
      window.matchMedia("(pointer: coarse)").matches &&
      !window.matchMedia("(pointer: fine)").matches
    );
  },

  /**
   * Check if platform is macOS
   * @returns {boolean}
   */
  isMac() {
    return (
      navigator.userAgentData?.platform === "macOS" ||
      navigator.platform.toUpperCase().includes("MAC")
    );
  },

  /**
   * Calculate Levenshtein distance between two strings
   * (used for suggesting tags when unknown tags apprear in Ink story)
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
          matrix[i - 1][j - 1] + cost,
        );
      }
    }
    return matrix[b.length][a.length];
  },
};

window.Utils = Utils;
export { Utils };
