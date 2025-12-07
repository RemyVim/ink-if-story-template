import { ErrorManager } from "./error-manager.js";
import { TagRegistry } from "./tag-registry.js";

class TagProcessor {
  static errorSource = ErrorManager.SOURCES.TAG_PROCESSOR;

  constructor(storyContainer, outerScrollContainer) {
    this.storyContainer = storyContainer || document.querySelector("#story");
    this.outerScrollContainer =
      outerScrollContainer || document.querySelector(".outerContainer");
    this.audio = null;
    this.audioLoop = null;
    this.lastAudioLoopSrc = null;

    const { TAGS } = window.TagRegistry || {};

    this.tagHandlers = new Map([
      [
        TAGS.AUDIO,
        (value, ctx) => {
          ctx.specialActions?.push(() => this.playAudio(value));
        },
      ],
      [
        TAGS.AUDIOLOOP,
        (value, ctx) => {
          ctx.specialActions?.push(() => this.playAudioLoop(value));
        },
      ],
      [
        TAGS.BACKGROUND,
        (value, ctx) => {
          ctx.specialActions?.push(() => this.setBackground(value));
        },
      ],
      [
        TAGS.NOTIFICATION,
        (value, ctx) => {
          ctx.specialActions?.push(() => this.showNotification(value, "info"));
        },
      ],
      [
        TAGS.ACHIEVEMENT,
        (value, ctx) => {
          ctx.specialActions?.push(() =>
            this.showNotification(value, "success", 6000),
          );
        },
      ],
      [
        TAGS.WARNING,
        (value, ctx) => {
          ctx.specialActions?.push(() =>
            this.showNotification(value, "warning"),
          );
        },
      ],
      [
        TAGS.ERROR,
        (value, ctx) => {
          ctx.specialActions?.push(() => this.showNotification(value, "error"));
        },
      ],
      [
        TAGS.CLASS,
        (value, ctx) => {
          if (value) ctx.customClasses.push(value);
        },
      ],
    ]);

    this.simpleTagHandlers = new Map([
      [
        TAGS.CLEAR,
        (ctx) => {
          ctx.specialActions?.push(() => "CLEAR");
        },
      ],
      [
        TAGS.RESTART,
        (ctx) => {
          ctx.specialActions?.push(() => "RESTART");
        },
      ],
      [
        TAGS.UNCLICKABLE,
        (ctx) => {
          ctx.isClickable = false;
        },
      ],
    ]);
  }

  processLineTags(tags) {
    try {
      if (!Array.isArray(tags)) {
        TagProcessor._warning("Invalid tags array passed to processLineTags");
        return { customClasses: [], specialActions: [] };
      }

      const ctx = { customClasses: [], specialActions: [] };
      this._processTags(tags, ctx, "line", false);
      return ctx;
    } catch (error) {
      TagProcessor._error("Failed to process line tags", error);
      return { customClasses: [], specialActions: [] };
    }
  }

  processChoiceTags(choiceTags) {
    try {
      if (!Array.isArray(choiceTags)) {
        TagProcessor._warning(
          "Invalid choiceTags array passed to processChoiceTags",
        );
        return { customClasses: [], isClickable: true };
      }

      const ctx = { customClasses: [], isClickable: true };
      this._processTags(choiceTags, ctx, "choice", true);
      return ctx;
    } catch (error) {
      TagProcessor._error("Failed to process choice tags", error);
      return { customClasses: [], isClickable: true };
    }
  }

  /**
   * Internal tag processing logic shared by line and choice processing
   * @param {Array} tags - Tags to process
   * @param {Object} ctx - Context object to populate
   * @param {string} context - 'line' or 'choice' for warnings
   * @param {boolean} allowTones - Whether to allow tone indicators
   */
  _processTags(tags, ctx, context, allowTones) {
    for (const tag of tags) {
      const { tagDef, tagValue, invalid, error } = TagRegistry.parseTag(tag);

      if (invalid) {
        if (error) TagProcessor._warning(error);
        continue;
      }

      const handler = this.tagHandlers.get(tagDef);
      if (handler) {
        handler(tagValue, ctx);
        continue;
      }

      const simpleHandler = this.simpleTagHandlers.get(tagDef);
      if (simpleHandler) {
        simpleHandler(ctx);
        continue;
      }

      if (tagDef !== null) {
        // Known marker tag (handled elsewhere) - skip silently
        continue;
      }

      if (!tag || typeof tag !== "string") continue;

      const isPropertyTag = tag.includes(":");
      const tagName = isPropertyTag ? tag.split(":")[0].trim() : tag.trim();
      if (!tagName) continue;

      if (
        allowTones &&
        !isPropertyTag &&
        TagRegistry.isRegisteredToneTag(tagName)
      ) {
        ctx.customClasses.push(tagName.toLowerCase());
        continue;
      }

      this.warnUnknownTag(tagName, context, tag);
    }
  }

  playAudio(src) {
    try {
      if (
        window.storyManager?.settings &&
        !window.storyManager.settings.getSetting("audioEnabled")
      ) {
        return;
      }

      if (!src || typeof src !== "string") {
        TagProcessor._warning("Invalid audio source provided");
        return;
      }

      if (this.audio) {
        this.audio.pause();
        this.audio.removeAttribute("src");
        this.audio.load();
      }

      this.audio = new Audio(src);
      this.audio.play().catch((error) => {
        TagProcessor._warning(`Failed to play audio: ${src}`, error);
      });
    } catch (error) {
      TagProcessor._error("Failed to play audio", error);
    }
  }

  playAudioLoop(src) {
    try {
      if (!src || typeof src !== "string") {
        TagProcessor._warning("Invalid audio loop source provided");
        return;
      }

      if (src.toLowerCase() === "none" || src === "stop") {
        this.lastAudioLoopSrc = null;
        if (this.audioLoop) {
          this.audioLoop.pause();
          this.audioLoop.removeAttribute("src");
          this.audioLoop.load();
          this.audioLoop = null;
        }
        return;
      }

      this.lastAudioLoopSrc = src;

      if (
        window.storyManager?.settings &&
        !window.storyManager.settings.getSetting("audioEnabled")
      ) {
        return;
      }

      if (this.audioLoop) {
        this.audioLoop.pause();
        this.audioLoop.removeAttribute("src");
        this.audioLoop.load();
        this.audioLoop = null;
      }

      this.audioLoop = new Audio(src);
      this.audioLoop.loop = true;
      this.audioLoop.play().catch((error) => {
        TagProcessor._warning(`Failed to play audio loop: ${src}`, error);
      });
    } catch (error) {
      TagProcessor._error("Failed to play audio loop", error);
    }
  }

  stopAllAudio() {
    try {
      if (this.audio) {
        this.audio.pause();
        this.audio.removeAttribute("src");
        this.audio.load();
        this.audio = null;
      }

      if (this.audioLoop) {
        this.audioLoop.pause();
        this.audioLoop.removeAttribute("src");
        this.audioLoop.load();
        this.audioLoop = null;
      }
    } catch (error) {
      TagProcessor._warning("Failed to stop audio", error);
    }
  }

  resumeAudioLoop() {
    try {
      if (
        this.lastAudioLoopSrc &&
        window.storyManager?.settings?.getSetting("audioEnabled")
      ) {
        this.playAudioLoop(this.lastAudioLoopSrc);
      }
    } catch (error) {
      TagProcessor._warning("Failed to resume audio loop", error);
    }
  }

  setBackground(src) {
    try {
      if (!this.outerScrollContainer) {
        TagProcessor._warning(
          "Outer scroll container not available for background",
        );
        return;
      }

      if (!src || typeof src !== "string") {
        TagProcessor._warning("Invalid background source provided");
        return;
      }

      if (src.toLowerCase() === "none" || src === "") {
        this.outerScrollContainer.style.backgroundImage = "none";
      } else {
        this.outerScrollContainer.style.backgroundImage = "url(" + src + ")";
      }
    } catch (error) {
      TagProcessor._error("Failed to set background", error);
    }
  }

  showNotification(message, type = "info", duration = 4000) {
    if (window.notificationManager) {
      window.notificationManager.show(message, { type, duration });
    }
  }

  /**
   * Warn about unknown tags with helpful suggestions
   * @param {string} tagName - The unknown tag
   * @param {string} context - 'line' or 'choice'
   */
  warnUnknownTag(tagName, context, fullTag = "") {
    // Only warn once per tag name to avoid console spam
    this.warnedTags = this.warnedTags || new Set();
    if (this.warnedTags.has(tagName.toUpperCase())) return;
    this.warnedTags.add(tagName.toUpperCase());

    const similar = this.getSimilarTags(tagName);

    let suggestion = "";
    if (similar.length > 0) {
      suggestion = ` Did you mean: ${similar.join(", ")}?`;
    } else {
      if (context === "line") {
        suggestion = " Use # CLASS: for custom CSS classes.";
      } else if (context === "choice") {
        suggestion =
          " For tone indicators, define with # TONE: tagname icon first.";
      }
    }

    TagProcessor._warning(
      `Unknown tag "${tagName}" on ${context}: "# ${fullTag}".${suggestion}`,
    );
  }

  /**
   * Find similar known tags for typo suggestions
   * @param {string} tagName - The unknown tag
   * @returns {string[]} Up to 3 similar tag names
   */
  getSimilarTags(tagName) {
    const { TAGS } = window.TagRegistry || {};
    if (!TAGS) return [];

    const input = tagName.toUpperCase();
    const knownTags = Object.keys(TAGS);

    return knownTags
      .filter((known) => {
        if (input.length >= 3 && known.startsWith(input.slice(0, 3)))
          return true;
        if (known.length >= 3 && input.startsWith(known.slice(0, 3)))
          return true;
        return window.Utils.levenshteinDistance(input, known) <= 2;
      })
      .slice(0, 3);
  }

  isReady() {
    try {
      return !!(this.storyContainer || this.outerScrollContainer);
    } catch (error) {
      TagProcessor._warning("Failed to check readiness", error);
      return false;
    }
  }

  getStats() {
    try {
      return {
        hasStoryContainer: !!this.storyContainer,
        hasOuterScrollContainer: !!this.outerScrollContainer,
        hasActiveAudio: !!this.audio,
        hasActiveAudioLoop: !!this.audioLoop,
      };
    } catch (error) {
      TagProcessor._warning("Failed to get stats", error);
      return {};
    }
  }

  cleanup() {
    try {
      if (this.audio) {
        this.audio.pause();
        this.audio = null;
      }
      if (this.audioLoop) {
        this.audioLoop.pause();
        this.audioLoop = null;
      }
    } catch (error) {
      TagProcessor._warning("Failed to cleanup", error);
    }
  }

  static _error(message, error = null) {
    window.errorManager.error(message, error, TagProcessor.errorSource);
  }

  static _warning(message, error = null) {
    window.errorManager.warning(message, error, TagProcessor.errorSource);
  }

  static _critical(message, error = null) {
    window.errorManager.critical(message, error, TagProcessor.errorSource);
  }
}

const tagProcessor = new TagProcessor();
window.tagProcessor = tagProcessor;

export { TagProcessor, tagProcessor };
