import { TagRegistry, TAGS } from "./tag-registry.js";
import { Utils } from "./utils.js";
import { notificationManager } from "./notification-manager.js";
import { errorManager, ERROR_SOURCES } from "./error-manager.js";

const log = errorManager.forSource(ERROR_SOURCES.TAG_PROCESSOR);

/**
 * Processes ink tags into actions, CSS classes, and side effects.
 * Handles audio playback, background images, notifications, and custom styling.
 * Uses a handler map pattern for extensible tag processing.
 */
class TagProcessor {
  /**
   * Creates the tag processor with optional settings for audio control.
   * @param {Object} [settings=null] - SettingsManager instance for audio enabled state
   */
  constructor(settings = null) {
    this.settings = settings;
    this.storyContainer = document.querySelector("#story");
    this.outerScrollContainer = document.querySelector(".outerContainer");
    this.audio = null;
    this.audioLoop = null;
    this.lastAudioLoopSrc = null;

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
            this.showNotification(value, "success", 6000)
          );
        },
      ],
      [
        TAGS.WARNING,
        (value, ctx) => {
          ctx.specialActions?.push(() =>
            this.showNotification(value, "warning")
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
      [
        TAGS.AUTOCLEAR,
        (value, ctx) => {
          const v = value.toLowerCase();
          if (v === "on") {
            ctx.specialActions?.push(() => "AUTOCLEAR_ON");
          } else if (v === "off") {
            ctx.specialActions?.push(() => "AUTOCLEAR_OFF");
          } else {
            log.warning(
              `Invalid AUTOCLEAR value: "${value}". Use "on" or "off".`
            );
          }
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

  /**
   * Processes tags attached to a story line (paragraph).
   * Extracts CSS classes and queues special actions (audio, notifications, etc.).
   * @param {string[]} tags - Array of tag strings from the story
   * @returns {{customClasses: string[], specialActions: Array}} Processed tag results
   */
  processLineTags(tags) {
    try {
      if (!Array.isArray(tags)) {
        log.warning("Invalid tags array passed to processLineTags");
        return { customClasses: [], specialActions: [] };
      }

      const ctx = { customClasses: [], specialActions: [] };
      this._processTags(tags, ctx, "line", false);
      return ctx;
    } catch (error) {
      log.error("Failed to process line tags", error);
      return { customClasses: [], specialActions: [] };
    }
  }

  /**
   * Processes tags attached to a choice.
   * Extracts CSS classes and determines if choice is clickable.
   * @param {string[]} choiceTags - Array of tag strings from the choice
   * @returns {{customClasses: string[], isClickable: boolean}} Processed tag results
   */
  processChoiceTags(choiceTags) {
    try {
      if (!Array.isArray(choiceTags)) {
        log.warning("Invalid choiceTags array passed to processChoiceTags");
        return { customClasses: [], isClickable: true };
      }

      const ctx = { customClasses: [], isClickable: true };
      this._processTags(choiceTags, ctx, "choice", true);
      return ctx;
    } catch (error) {
      log.error("Failed to process choice tags", error);
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
        if (error) log.warning(error);
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

  /**
   * Plays a one-shot audio file.
   * Respects the audioEnabled setting. Stops any currently playing one-shot audio.
   * @param {string} src - Path to the audio file
   */
  playAudio(src) {
    try {
      if (this.settings && !this.settings.getSetting("audioEnabled")) {
        return;
      }

      if (!src || typeof src !== "string") {
        log.warning("Invalid audio source provided");
        return;
      }

      if (this.audio) {
        this.audio.pause();
        this.audio.removeAttribute("src");
        this.audio.load();
      }

      this.audio = new Audio(src);
      this.audio.play().catch((error) => {
        log.warning(`Failed to play audio: ${src}`, error);
      });
    } catch (error) {
      log.error("Failed to play audio", error);
    }
  }

  /**
   * Plays a looping audio file (background music).
   * Pass "none" or "stop" to stop the loop. Remembers last source for resume.
   * @param {string} src - Path to the audio file, or "none"/"stop" to stop
   */
  playAudioLoop(src) {
    try {
      if (!src || typeof src !== "string") {
        log.warning("Invalid audio loop source provided");
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

      if (this.settings && !this.settings.getSetting("audioEnabled")) {
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
        log.warning(`Failed to play audio loop: ${src}`, error);
      });
    } catch (error) {
      log.error("Failed to play audio loop", error);
    }
  }

  /**
   * Stops all currently playing audio (both one-shot and looping).
   */
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
      log.warning("Failed to stop audio", error);
    }
  }

  /**
   * Resumes the last audio loop if audio is enabled.
   * Called when audio setting is re-enabled.
   */
  resumeAudioLoop() {
    try {
      if (this.lastAudioLoopSrc && this.settings?.getSetting("audioEnabled")) {
        this.playAudioLoop(this.lastAudioLoopSrc);
      }
    } catch (error) {
      log.warning("Failed to resume audio loop", error);
    }
  }

  /**
   * Sets the background image on the outer scroll container.
   * Pass "none" or empty string to remove the background.
   * @param {string} src - Path to the image file, or "none" to remove
   */
  setBackground(src) {
    try {
      if (!this.outerScrollContainer) {
        log.warning("Outer scroll container not available for background");
        return;
      }

      if (!src || typeof src !== "string") {
        log.warning("Invalid background source provided");
        return;
      }

      if (src.toLowerCase() === "none" || src === "") {
        this.outerScrollContainer.style.backgroundImage = "none";
      } else {
        this.outerScrollContainer.style.backgroundImage = "url(" + src + ")";
      }
    } catch (error) {
      log.error("Failed to set background", error);
    }
  }

  /**
   * Shows a notification via the notification manager.
   * @param {string} message - The notification message
   * @param {string} [type='info'] - Notification type (info, success, warning, error)
   * @param {number} [duration=4000] - Duration in milliseconds
   */
  showNotification(message, type = "info", duration = 4000) {
    if (notificationManager) {
      notificationManager.show(message, { type, duration });
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

    log.warning(
      `Unknown tag "${tagName}" on ${context}: "# ${fullTag}".${suggestion}`
    );
  }

  /**
   * Finds similar known tags for typo suggestions using prefix matching and Levenshtein distance.
   * @param {string} tagName - The unknown tag name
   * @returns {string[]} Up to 3 similar tag names
   * @private
   */
  getSimilarTags(tagName) {
    if (!TAGS) return [];

    const input = tagName.toUpperCase();
    const knownTags = Object.keys(TAGS);

    return knownTags
      .filter((known) => {
        if (input.length >= 3 && known.startsWith(input.slice(0, 3)))
          return true;
        if (known.length >= 3 && input.startsWith(known.slice(0, 3)))
          return true;
        return Utils.levenshteinDistance(input, known) <= 2;
      })
      .slice(0, 3);
  }

  /**
   * Checks whether the tag processor is ready for use.
   * @returns {boolean} True if story container or outer container is available
   */
  isReady() {
    try {
      return !!(this.storyContainer || this.outerScrollContainer);
    } catch (error) {
      log.warning("Failed to check readiness", error);
      return false;
    }
  }

  /**
   * Returns diagnostic information about the tag processor state.
   * @returns {{hasStoryContainer: boolean, hasOuterScrollContainer: boolean, hasActiveAudio: boolean, hasActiveAudioLoop: boolean}}
   */
  getStats() {
    try {
      return {
        hasStoryContainer: !!this.storyContainer,
        hasOuterScrollContainer: !!this.outerScrollContainer,
        hasActiveAudio: !!this.audio,
        hasActiveAudioLoop: !!this.audioLoop,
      };
    } catch (error) {
      log.warning("Failed to get stats", error);
      return {};
    }
  }

  /**
   * Cleans up audio resources when the processor is distroyed.
   */
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
      log.warning("Failed to cleanup", error);
    }
  }
}

export { TagProcessor };
