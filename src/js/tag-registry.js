/**
 * Phases when tags are processed.
 * @enum {string}
 */
const TAG_PHASE = {
  GLOBAL: "global", // Processed once at story init (settings.js)
  DISCOVERY: "discovery", // Processed during page/knot scanning (story-manager.js)
  CONTENT: "content", // Determines content type per-line (content-processor.js)
  EFFECT: "effect", // Side effects per-line (tags.js)
};

/**
 * Whether a tag requires, optionally accepts, or rejects a value.
 * @enum {string}
 */
const TAG_VALUE = {
  REQUIRED: "required", // Must have value: `TAG: value`
  OPTIONAL: "optional", // Can be `TAG` or `TAG: value`
  NONE: "none", // Never has value: just `TAG`
};

/**
 * Registry of all known ink tags with their aliases, phases, value requirements, and descriptions.
 * Each tag definition has: names (array of aliases), phase, value requirement, and description.
 * @type {Object.<string, {names: string[], phase: string, value: string, description: string}>}
 */
const TAGS = {
  // ============================================
  // GLOBAL TAGS (settings.js) - processed at init
  // ============================================
  THEME: {
    names: ["THEME"],
    phase: TAG_PHASE.GLOBAL,
    value: TAG_VALUE.REQUIRED,
    description: "Set default theme (light/dark)",
  },
  AUTHOR: {
    names: ["AUTHOR"],
    phase: TAG_PHASE.GLOBAL,
    value: TAG_VALUE.REQUIRED,
    description: "Story author name",
  },
  TITLE: {
    names: ["TITLE"],
    phase: TAG_PHASE.GLOBAL,
    value: TAG_VALUE.REQUIRED,
    description: "Story title",
  },
  MAX_HISTORY: {
    names: ["MAX_HISTORY", "HISTORY_LIMIT"],
    phase: TAG_PHASE.GLOBAL,
    value: TAG_VALUE.REQUIRED,
    description: "Maximum display history items to keep in saves",
  },
  TONE: {
    names: ["TONE"],
    phase: TAG_PHASE.GLOBAL,
    value: TAG_VALUE.REQUIRED,
    description: "Define tone indicator (e.g., TONE: flirty 🔥)",
  },
  TONE_INDICATORS: {
    names: ["TONE_INDICATORS", "SHOW_TONES"],
    phase: TAG_PHASE.GLOBAL,
    value: TAG_VALUE.REQUIRED,
    description: "Enable tone indicators (on/off)",
  },
  TONE_TRAILING: {
    names: ["TONE_TRAILING", "TRAILING_TONES"],
    phase: TAG_PHASE.GLOBAL,
    value: TAG_VALUE.NONE,
    description: "Show all tone icons after choice text",
  },
  CHOICE_NUMBERS: {
    names: ["CHOICE_NUMBERS", "CHOICE_NUMBERING", "KEYBOARD_HINTS"],
    phase: TAG_PHASE.GLOBAL,
    value: TAG_VALUE.REQUIRED,
    description: "Choice numbering mode (auto/on/off)",
  },
  PAGE_MENU: {
    names: [
      "PAGE_MENU",
      "MENU",
      "MENU_ORDER",
      "PAGE_ORDER",
      "SPECIAL_PAGE_ORDER",
    ],
    phase: TAG_PHASE.GLOBAL,
    value: TAG_VALUE.REQUIRED,
    description: "Define page menu order",
  },

  // ============================================
  // DISCOVERY TAGS (story-manager.js) - page scanning
  // ============================================
  SPECIAL_PAGE: {
    names: ["SPECIAL_PAGE", "PAGE"],
    phase: TAG_PHASE.DISCOVERY,
    value: TAG_VALUE.OPTIONAL,
    description: "Mark knot as special page, optionally with display name",
  },

  // ============================================
  // CONTENT TAGS (content-processor.js) - determine content type
  // ============================================
  IMAGE: {
    names: ["IMAGE", "IMG", "PICTURE", "PIC"],
    phase: TAG_PHASE.CONTENT,
    value: TAG_VALUE.REQUIRED,
    description: "Display image (src, alignment, width, alt)",
  },
  STATBAR: {
    names: ["STATBAR", "STAT_BAR", "PROGRESSBAR", "PROGRESS_BAR"],
    phase: TAG_PHASE.CONTENT,
    value: TAG_VALUE.REQUIRED,
    description: "Display stat bar (variable, min, max, labels)",
  },
  USER_INPUT: {
    names: ["USER_INPUT", "INPUT", "PROMPT", "TEXT_INPUT"],
    phase: TAG_PHASE.CONTENT,
    value: TAG_VALUE.REQUIRED,
    description: "Text input field (variable, placeholder)",
  },

  // ============================================
  // EFFECT TAGS (tags.js) - side effects and styling
  // ============================================
  AUDIO: {
    names: ["AUDIO", "SOUND", "SFX", "SOUND_EFFECT"],
    phase: TAG_PHASE.EFFECT,
    value: TAG_VALUE.REQUIRED,
    description: "Play one-shot audio file",
  },
  AUDIOLOOP: {
    names: ["AUDIOLOOP", "AUDIO_LOOP", "MUSIC", "BACKGROUND_MUSIC", "BGM"],
    phase: TAG_PHASE.EFFECT,
    value: TAG_VALUE.REQUIRED,
    description: "Play looping audio (or 'none' to stop)",
  },
  BACKGROUND: {
    names: ["BACKGROUND", "BG", "BACKGROUND_IMAGE"],
    phase: TAG_PHASE.EFFECT,
    value: TAG_VALUE.REQUIRED,
    description: "Set background image (or 'none' to remove)",
  },
  NOTIFICATION: {
    names: ["NOTIFICATION", "NOTIFY", "MESSAGE", "INFO"],
    phase: TAG_PHASE.EFFECT,
    value: TAG_VALUE.REQUIRED,
    description: "Show info notification",
  },
  ACHIEVEMENT: {
    names: ["ACHIEVEMENT", "SUCCESS"],
    phase: TAG_PHASE.EFFECT,
    value: TAG_VALUE.REQUIRED,
    description: "Show success notification (6s duration)",
  },
  WARNING: {
    names: ["WARNING", "WARN"],
    phase: TAG_PHASE.EFFECT,
    value: TAG_VALUE.REQUIRED,
    description: "Show warning notification",
  },
  ERROR: {
    names: ["ERROR", "ERR"],
    phase: TAG_PHASE.EFFECT,
    value: TAG_VALUE.REQUIRED,
    description: "Show error notification",
  },
  CLASS: {
    names: ["CLASS", "CSS", "CSS_CLASS", "STYLE"],
    phase: TAG_PHASE.EFFECT,
    value: TAG_VALUE.REQUIRED,
    description: "Add CSS class to element",
  },
  AUTOCLEAR: {
    names: ["AUTOCLEAR", "AUTO_CLEAR"],
    phase: TAG_PHASE.EFFECT,
    value: TAG_VALUE.REQUIRED,
    description: "Toggle auto-clear on choice selection (on/off)",
  },
  CLEAR: {
    names: ["CLEAR"],
    phase: TAG_PHASE.EFFECT,
    value: TAG_VALUE.NONE,
    description: "Clear story content",
  },
  RESTART: {
    names: ["RESTART", "RESET", "NEW_GAME"],
    phase: TAG_PHASE.EFFECT,
    value: TAG_VALUE.NONE,
    description: "Restart story from beginning",
  },
  UNCLICKABLE: {
    names: ["UNCLICKABLE", "DISABLED", "DISABLE"],
    phase: TAG_PHASE.EFFECT,
    value: TAG_VALUE.NONE,
    description: "Make choice visible but not clickable",
  },
};

// Ensure each tag has a "names" array.
// If absent, default to [tagKey].
for (const key in TAGS) {
  if (!TAGS[key].names) {
    TAGS[key].names = [key];
  }
}

/**
 * Reverse lookup map from tag name/alias (uppercase) to canonical TAGS key.
 * Built automatically from TAGS definitions.
 * @type {Object.<string, string>}
 */
const TAG_LOOKUP = {};

for (const key in TAGS) {
  for (const name of TAGS[key].names) {
    const upper = name.toUpperCase();

    if (TAG_LOOKUP[upper]) {
      console.warn(
        `Duplicate tag alias "${upper}" used by both "${TAG_LOOKUP[upper]}" and "${key}"`
      );
    }

    TAG_LOOKUP[upper] = key;
  }
}

/**
 * Gets all tags for a specific phase
 * @param {string} phase - TAG_PHASE value
 * @returns {string[]} Array of tag names
 */
function getTagsByPhase(phase) {
  return Object.keys(TAGS).filter((tag) => TAGS[tag].phase === phase);
}

/**
 * Checks if a tag name is a known registered tag.
 * @param {string} tagName - Tag name to check (case-insensitive)
 * @returns {boolean} True if tag is known
 */
function isKnownTag(tagName) {
  if (!tagName || typeof tagName !== "string") return false;
  return TAG_LOOKUP[tagName.toUpperCase()] !== undefined;
}

/**
 * Gets a tag definition
 * @param {string} tagName - Tag name (case-insensitive)
 * @returns {Object|null} Tag definition or null
 */
function getTagDef(tagName) {
  if (!tagName || typeof tagName !== "string") return null;
  const key = TAG_LOOKUP[tagName.toUpperCase()];
  return key ? TAGS[key] : null;
}

/**
 * Validate tag value against its requirements
 * @param {Object} tagDef - Tag definition from TAGS
 * @param {string} tagValue - The parsed value
 * @returns {{valid: boolean, error: string|null}}
 */
function validateTagValue(tagDef, tagValue) {
  if (!tagDef) return { valid: true, error: null };

  const hasValue = tagValue && tagValue.trim() !== "";
  const tagName = tagDef.names[0];

  if (tagDef.value === TAG_VALUE.REQUIRED && !hasValue) {
    return {
      valid: false,
      error: `Tag "${tagName}" requires a value (use # ${tagName}: value)`,
    };
  }
  if (tagDef.value === TAG_VALUE.NONE && hasValue) {
    return {
      valid: false,
      error: `Tag "${tagName}" should not have a value (use # ${tagName} alone)`,
    };
  }
  return { valid: true, error: null };
}

/**
 * Central registry for ink tag definitions and utilities.
 * Provides tag parsing, validation, tone indicator management, and lookup functions.
 */
const TagRegistry = {
  TAG_PHASE,
  TAG_VALUE,
  TAGS,
  TAG_LOOKUP,
  getTagsByPhase,
  isKnownTag,
  getTagDef,
  validateTagValue,

  /**
   * Parses a tag string into its definition and value.
   * Validates that required tags have values and none-value tags don't.
   * @param {string} tag - The raw tag string (e.g., "IMAGE: hero.png" or "CLEAR")
   * @returns {{tagDef: Object|null, tagValue: string, invalid: boolean, error: string|null}}
   */
  parseTag(tag) {
    if (!tag || typeof tag !== "string") {
      return { tagDef: null, tagValue: "", invalid: false, error: null };
    }

    const splitTag = this.splitPropertyTag(tag);
    const tagName = splitTag ? splitTag.property : tag.trim();
    const tagValue = splitTag?.val || "";
    const tagDef = this.getTagDef(tagName);

    if (tagDef) {
      const validation = this.validateTagValue(tagDef, tagValue);
      if (!validation.valid) {
        return { tagDef, tagValue, invalid: true, error: validation.error };
      }
    }

    return { tagDef, tagValue, invalid: false, error: null };
  },

  /**
   * Splits a property-style tag into property name and value.
   * @param {string} tag - Tag string to split
   * @returns {{property: string, val: string}|null} Split result, or null if no colon
   */
  splitPropertyTag(tag) {
    if (!tag || typeof tag !== "string") return null;

    const colonIdx = tag.indexOf(":");
    if (colonIdx === -1) return null;

    return {
      property: tag.slice(0, colonIdx).trim(),
      val: tag.slice(colonIdx + 1).trim(),
    };
  },

  /**
   * Checks if an array of tags contains the SPECIAL_PAGE tag.
   * @param {string[]} tags - Array of tag strings
   * @returns {boolean} True if SPECIAL_PAGE tag is present
   */
  hasSpecialPageTag(tags) {
    if (!Array.isArray(tags)) return false;

    return tags.some((tag) => {
      if (typeof tag !== "string") return false;
      const { tagDef } = this.parseTag(tag);
      return tagDef === TAGS.SPECIAL_PAGE;
    });
  },

  // Tone indicator registry (populated from # TONE: tags)
  toneMap: {},

  /**
   * Registers a tone indicator with its icon.
   * Called when processing global # TONE: tags.
   * @param {string} label - The tone label (e.g., "flirty")
   * @param {string} icon - The icon (emoji or material icon name)
   */
  registerTone(label, icon) {
    if (!label || typeof label !== "string") return;
    this.toneMap[label.toLowerCase()] = icon;
  },

  /**
   * Gets the icon for a registered tone.
   * @param {string} label - The tone label (case-insensitive)
   * @returns {string|null} The icon, or null if not registered
   */
  getToneIcon(label) {
    if (!label || typeof label !== "string") return null;
    return this.toneMap[label.toLowerCase()] || null;
  },

  /**
   * Checks if a tag name is a registered tone indicator.
   * @param {string} tagName - The tag name to check (case-insensitive)
   * @returns {boolean} True if this is a registered tone
   */
  isRegisteredToneTag(tagName) {
    if (!tagName || typeof tagName !== "string") return false;
    return tagName.toLowerCase() in this.toneMap;
  },

  /**
   * Clears all registered tone indicators.
   * Used primarily for testing.
   */
  clearTones() {
    this.toneMap = {};
  },
};

/**
 * Detects which optional features a story uses by scanning the compiled JSON.
 * Used to conditionally show UI elements (e.g., audio settings tab).
 */
const StoryFeatures = {
  hasAudio: false,

  /**
   * Scans compiled story JSON to detect feature usage.
   * Sets feature flags like hasAudio based on tag presence.
   * @param {Object} storyContent - The compiled ink story JSON
   * @returns {StoryFeatures} Returns this for chaining
   */
  scan(storyContent) {
    const content = JSON.stringify(storyContent);

    const usesAnyTag = (...tagDefs) => {
      const names = tagDefs.flatMap((def) => def?.names || []);
      if (!names.length) return false;
      return new RegExp(`"\\^(${names.join("|")})\\s*:`, "i").test(content);
    };

    this.hasAudio = usesAnyTag(TAGS.AUDIO, TAGS.AUDIOLOOP);

    return this;
  },
};

export { TAG_PHASE, TAG_VALUE, TAGS, TAG_LOOKUP, TagRegistry, StoryFeatures };
