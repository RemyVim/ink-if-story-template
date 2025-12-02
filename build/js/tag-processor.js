// tag-processor.js
class TagProcessor {
  constructor(storyContainer, outerScrollContainer) {
    this.storyContainer = storyContainer || document.querySelector("#story");
    this.outerScrollContainer =
      outerScrollContainer || document.querySelector(".outerContainer");
    this.audio = null;
    this.audioLoop = null;
    this.lastAudioLoopSrc = null;

    const { TAGS } = window.TagRegistry || {};

    // Handler map keyed by tag definition objects
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
        window.errorManager.warning(
          "Invalid tags array passed to processLineTags",
          null,
          "tags",
        );
        return { customClasses: [], specialActions: [] };
      }

      const ctx = { customClasses: [], specialActions: [] };
      this._processTags(tags, ctx, "line", false);
      return ctx;
    } catch (error) {
      window.errorManager.error("Failed to process line tags", error, "tags");
      return { customClasses: [], specialActions: [] };
    }
  }

  processChoiceTags(choiceTags) {
    try {
      if (!Array.isArray(choiceTags)) {
        window.errorManager.warning(
          "Invalid choiceTags array passed to processChoiceTags",
          null,
          "tags",
        );
        return { customClasses: [], isClickable: true };
      }

      const ctx = { customClasses: [], isClickable: true };
      this._processTags(choiceTags, ctx, "choice", true);
      return ctx;
    } catch (error) {
      window.errorManager.error("Failed to process choice tags", error, "tags");
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

      // Skip invalid tags (already warned in parseTag)
      if (invalid) {
        if (error) console.warn(`[Tag Registry] ${error}`);
        continue;
      }

      // Check property tag handlers
      const handler = this.tagHandlers.get(tagDef);
      if (handler) {
        handler(tagValue, ctx);
        continue;
      }

      // Check simple tag handlers
      const simpleHandler = this.simpleTagHandlers.get(tagDef);
      if (simpleHandler) {
        simpleHandler(ctx);
        continue;
      }

      // Known marker tag (handled elsewhere) - skip silently
      if (tagDef !== null) {
        continue;
      }

      // Unknown tag handling
      if (!tag || typeof tag !== "string") continue;

      const isPropertyTag = tag.includes(":");
      const tagName = isPropertyTag ? tag.split(":")[0].trim() : tag.trim();
      if (!tagName) continue;

      // Tone indicators (choices only, simple tags only)
      if (
        allowTones &&
        !isPropertyTag &&
        TagRegistry.isRegisteredToneTag(tagName)
      ) {
        ctx.customClasses.push(tagName.toLowerCase());
        continue;
      }

      // Warn and skip
      this.warnUnknownTag(tagName, context, tag);
    }
  }

  // Media and interaction methods
  playAudio(src) {
    try {
      // Check if audio is enabled in settings
      if (
        window.storyManager?.settings &&
        !window.storyManager.settings.getSetting("audioEnabled")
      ) {
        return; // Skip audio if disabled
      }

      if (!src || typeof src !== "string") {
        window.errorManager.warning(
          "Invalid audio source provided",
          null,
          "tags",
        );
        return;
      }

      // Stop existing audio
      if (this.audio) {
        this.audio.pause();
        this.audio.removeAttribute("src");
        this.audio.load();
      }

      this.audio = new Audio(src);
      this.audio.play().catch((error) => {
        window.errorManager.warning(
          `Failed to play audio: ${src}`,
          error,
          "tags",
        );
      });
    } catch (error) {
      window.errorManager.error("Failed to play audio", error, "tags");
    }
  }

  playAudioLoop(src) {
    try {
      if (!src || typeof src !== "string") {
        window.errorManager.warning(
          "Invalid audio loop source provided",
          null,
          "tags",
        );
        return;
      }

      // Handle stopping audio loop (always process this, even if audio disabled)
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

      // Store the source for potential resuming
      this.lastAudioLoopSrc = src;

      // Check if audio is enabled in settings
      if (
        window.storyManager?.settings &&
        !window.storyManager.settings.getSetting("audioEnabled")
      ) {
        return; // Audio disabled, but we've stored the source
      }

      // Stop existing audio loop
      if (this.audioLoop) {
        this.audioLoop.pause();
        this.audioLoop.removeAttribute("src");
        this.audioLoop.load();
        this.audioLoop = null;
      }

      this.audioLoop = new Audio(src);
      this.audioLoop.loop = true;
      this.audioLoop.play().catch((error) => {
        window.errorManager.warning(
          `Failed to play audio loop: ${src}`,
          error,
          "tags",
        );
      });
    } catch (error) {
      window.errorManager.error("Failed to play audio loop", error, "tags");
    }
  }

  /**
   * Stop all currently playing audio
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
      window.errorManager.warning("Failed to stop audio", error, "tags");
    }
  }

  /**
   * Resume audioloop if there was one playing
   */
  resumeAudioLoop() {
    try {
      if (
        this.lastAudioLoopSrc &&
        window.storyManager?.settings?.getSetting("audioEnabled")
      ) {
        this.playAudioLoop(this.lastAudioLoopSrc);
      }
    } catch (error) {
      window.errorManager.warning("Failed to resume audio loop", error, "tags");
    }
  }

  showNotification(message, type = "info", duration = 4000) {
    if (window.notificationManager) {
      window.notificationManager.show(message, { type, duration });
    }
  }

  setBackground(src) {
    try {
      if (!this.outerScrollContainer) {
        window.errorManager.warning(
          "Outer scroll container not available for background",
          null,
          "tags",
        );
        return;
      }

      if (!src || typeof src !== "string") {
        window.errorManager.warning(
          "Invalid background source provided",
          null,
          "tags",
        );
        return;
      }

      // Handle removing background
      if (src.toLowerCase() === "none" || src === "") {
        this.outerScrollContainer.style.backgroundImage = "none";
      } else {
        this.outerScrollContainer.style.backgroundImage = "url(" + src + ")";
      }
    } catch (error) {
      window.errorManager.error("Failed to set background", error, "tags");
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
      // We have similar tags - suggest those
      suggestion = ` Did you mean: ${similar.join(", ")}?`;
    } else {
      // No similar tags - give usage hint
      if (context === "line") {
        suggestion = " Use # CLASS: for custom CSS classes.";
      } else if (context === "choice") {
        suggestion =
          " For tone indicators, define with # TONE: tagname icon first.";
      }
    }

    console.warn(
      `[Tag Processor] Unknown tag "${tagName}" on ${context}: "# ${fullTag}".${suggestion}`,
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
        // Prefix match (3+ chars)
        if (input.length >= 3 && known.startsWith(input.slice(0, 3)))
          return true;
        if (known.length >= 3 && input.startsWith(known.slice(0, 3)))
          return true;
        // Simple edit distance check (off by 1-2 chars)
        return this.levenshteinDistance(input, known) <= 2;
      })
      .slice(0, 3);
  }

  /**
   * Calculate Levenshtein distance between two strings
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
  }

  /**
   * Check if tag processor is ready to use
   * @returns {boolean} True if ready
   */
  isReady() {
    try {
      return !!(this.storyContainer || this.outerScrollContainer);
    } catch (error) {
      window.errorManager.warning("Failed to check readiness", error, "tags");
      return false;
    }
  }

  /**
   * Get tag processor statistics
   * @returns {Object} Tag processor stats
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
      window.errorManager.warning("Failed to get stats", error, "tags");
      return {};
    }
  }

  /**
   * Clean up audio resources
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
      window.errorManager.warning("Failed to cleanup", error, "tags");
    }
  }
}

window.tagProcessor = new TagProcessor();
