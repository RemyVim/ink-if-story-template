// tags.js
class TagProcessor {
  constructor(storyContainer, outerScrollContainer) {
    this.storyContainer = storyContainer || document.querySelector("#story");
    this.outerScrollContainer =
      outerScrollContainer || document.querySelector(".outerContainer");
    this.audio = null;
    this.audioLoop = null;
    this.lastAudioLoopSrc = null;
  }

  // Helper for parsing out tags of the form:
  //  # PROPERTY: value
  // e.g. IMAGE: source path
  static splitPropertyTag(tag) {
    try {
      if (!tag || typeof tag !== "string") {
        return null;
      }

      const propertySplitIdx = tag.indexOf(":");
      if (propertySplitIdx !== -1) {
        const property = tag.substr(0, propertySplitIdx).trim();
        const val = tag.substr(propertySplitIdx + 1).trim();
        return {
          property: property,
          val: val,
        };
      }
      return null;
    } catch (error) {
      window.errorManager.warning(
        "Failed to split property tag",
        error,
        "tags",
      );
      return null;
    }
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

      const customClasses = [];
      const specialActions = [];

      for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];
        if (typeof tag !== "string") continue;

        const splitTag = TagProcessor.splitPropertyTag(tag);

        if (splitTag) {
          const property = splitTag.property.toUpperCase();
          const value = splitTag.val;

          switch (property) {
            case "AUDIO":
              specialActions.push(() => this.playAudio(value));
              break;
            case "AUDIOLOOP":
              specialActions.push(() => this.playAudioLoop(value));
              break;
            case "IMAGE":
              specialActions.push(() => this.showImage(value));
              break;
            case "BACKGROUND":
              specialActions.push(() => this.setBackground(value));
              break;
            case "NOTIFICATION":
              specialActions.push(() => this.showNotification(value, "info"));
              break;
            case "ACHIEVEMENT":
              specialActions.push(() =>
                this.showNotification(value, "success", 6000),
              );
              break;
            case "WARNING":
              specialActions.push(() =>
                this.showNotification(value, "warning"),
              );
              break;
            case "ERROR":
              specialActions.push(() => this.showNotification(value, "error"));
              break;
            case "CLASS":
              if (value) customClasses.push(value);
              break;
          }
        } else {
          // Handle simple tags without colons
          const simpleTag = tag.trim().toUpperCase();

          // Check for special system tags
          if (simpleTag === "CLEAR" || simpleTag === "RESTART") {
            specialActions.push(() => simpleTag);
          } else if (simpleTag === "SPECIAL_PAGE") {
            // SPECIAL_PAGE tag is just a marker - don't add any classes or actions
            // It's used by the story manager to identify special pages
            // but doesn't affect rendering
            continue;
          } else {
            // Add as class
            customClasses.push(simpleTag.toLowerCase());
          }
        }
      }

      return { customClasses, specialActions };
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

      const customClasses = [];
      let isClickable = true;

      for (let i = 0; i < choiceTags.length; i++) {
        const choiceTag = choiceTags[i];
        if (typeof choiceTag !== "string") continue;

        const splitTag = TagProcessor.splitPropertyTag(choiceTag);

        if (splitTag) {
          const property = splitTag.property.toUpperCase();

          if (property === "CLASS" && splitTag.val) {
            customClasses.push(splitTag.val);
          }
        } else {
          const simpleTag = choiceTag.trim().toUpperCase();

          if (simpleTag === "UNCLICKABLE") {
            isClickable = false;
          } else if (simpleTag === "SPECIAL_PAGE") {
            // SPECIAL_PAGE tag doesn't affect choice behavior
            continue;
          } else {
            customClasses.push(simpleTag.toLowerCase());
          }
        }
      }

      return { customClasses, isClickable };
    } catch (error) {
      window.errorManager.error("Failed to process choice tags", error, "tags");
      return { customClasses: [], isClickable: true };
    }
  }

  /**
   * Check if a tag array contains the SPECIAL_PAGE marker
   * @param {Array} tags - Array of tags to check
   * @returns {boolean} True if SPECIAL_PAGE tag is present
   */
  static hasSpecialPageTag(tags) {
    if (!Array.isArray(tags)) return false;

    return tags.some((tag) => {
      if (typeof tag !== "string") return false;
      return tag.trim().toUpperCase() === "SPECIAL_PAGE";
    });
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

  /**
   * Check if audio is currently enabled in settings
   */
  isAudioEnabled() {
    return window.storyManager?.settings?.getSetting("audioEnabled") ?? true;
  }

  showImage(src) {
    try {
      if (!this.storyContainer) {
        window.errorManager.error(
          "Story container not available for image display",
          null,
          "tags",
        );
        return;
      }

      if (!src || typeof src !== "string") {
        window.errorManager.warning(
          "Invalid image source provided",
          null,
          "tags",
        );
        return;
      }

      const imageElement = document.createElement("img");
      imageElement.src = src;
      imageElement.onerror = () => {
        window.errorManager.warning(
          `Failed to load image: ${src}`,
          null,
          "tags",
        );
      };

      this.storyContainer.appendChild(imageElement);
    } catch (error) {
      window.errorManager.error("Failed to show image", error, "tags");
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
