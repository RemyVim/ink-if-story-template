// tag-registry.js
// Central registry of all Ink tags supported by this template.
// This is the single source of truth for tag names and metadata.

/**
 * Tag processing phases - determines WHEN a tag is processed
 */
const TAG_PHASE = {
  GLOBAL: "global", // Processed once at story init (settings.js)
  DISCOVERY: "discovery", // Processed during page/knot scanning (story-manager.js)
  CONTENT: "content", // Determines content type per-line (content-processor.js)
  EFFECT: "effect", // Side effects per-line (tags.js)
};

/**
 * Tag value requirements
 */
const TAG_VALUE = {
  REQUIRED: "required", // Must have value: `TAG: value`
  OPTIONAL: "optional", // Can be `TAG` or `TAG: value`
  NONE: "none", // Never has value: just `TAG`
};

/**
 * Complete tag definitions
 *
 * Each tag has:
 * - phase: When it's processed
 * - value: Whether it requires/accepts a value
 * - description: What the tag does (for documentation)
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
    names: ["ACHIEVEMENT", "SUCCESS", "UNLOCK"],
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
    names: ["CLASS", "CSS_CLASS", "STYLE"],
    phase: TAG_PHASE.EFFECT,
    value: TAG_VALUE.REQUIRED,
    description: "Add CSS class to element",
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
    names: ["UNCLICKABLE", "DISABLED", "DISABLE", "LOCKED", "LOCK"],
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

// Build reverse lookup with duplicate detection.
const TAG_LOOKUP = {};

for (const key in TAGS) {
  for (const name of TAGS[key].names) {
    const upper = name.toUpperCase();

    if (TAG_LOOKUP[upper]) {
      console.warn(
        `Duplicate tag alias "${upper}" used by both "${TAG_LOOKUP[upper]}" and "${key}"`,
      );
    }

    TAG_LOOKUP[upper] = key;
  }
}

/**
 * Helper: Get all tags for a specific phase
 * @param {string} phase - TAG_PHASE value
 * @returns {string[]} Array of tag names
 */
function getTagsByPhase(phase) {
  return Object.keys(TAGS).filter((tag) => TAGS[tag].phase === phase);
}

/**
 * Helper: Check if a tag exists in the registry
 * @param {string} tagName - Tag name (case-insensitive)
 * @returns {boolean}
 */
function isKnownTag(tagName) {
  if (!tagName || typeof tagName !== "string") return false;
  return TAG_LOOKUP[tagName.toUpperCase()] !== undefined;
}

/**
 * Helper: Get tag definition
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

// Make available globally
window.TagRegistry = {
  TAG_PHASE,
  TAG_VALUE,
  TAGS,
  TAG_LOOKUP,
  getTagsByPhase,
  isKnownTag,
  getTagDef,
  validateTagValue,

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

  splitPropertyTag(tag) {
    if (!tag || typeof tag !== "string") return null;

    const colonIdx = tag.indexOf(":");
    if (colonIdx === -1) return null;

    return {
      property: tag.slice(0, colonIdx).trim(),
      val: tag.slice(colonIdx + 1).trim(),
    };
  },

  hasSpecialPageTag(tags) {
    if (!Array.isArray(tags)) return false;

    return tags.some((tag) => {
      if (typeof tag !== "string") return false;
      const { tagDef } = this.parseTag(tag);
      return tagDef === TAGS.SPECIAL_PAGE;
    });
  },

  isRegisteredToneTag(tagName) {
    // Check against registered tone indicators
    const toneMap = window.storyManager?.settings?.toneMap || {};
    return Object.keys(toneMap).some(
      (key) => key.toLowerCase() === tagName.toLowerCase(),
    );
  },
};

window.StoryFeatures = {
  hasAudio: false,

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
