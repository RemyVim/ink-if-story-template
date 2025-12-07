const Utils = {
  isMobile() {
    return (
      window.matchMedia("(pointer: coarse)").matches &&
      !window.matchMedia("(pointer: fine)").matches
    );
  },

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
   * Calculate Levenshtein distance between two strings
   * (used for suggesting tags when unknown tags appear in Ink story)
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

export { Utils };
