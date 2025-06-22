// Tag processing utilities
class TagProcessor {
  constructor(storyContainer, outerScrollContainer) {
    this.storyContainer = storyContainer;
    this.outerScrollContainer = outerScrollContainer;
    this.audio = null;
    this.audioLoop = null;
  }

  // Helper for parsing out tags of the form:
  //  # PROPERTY: value
  // e.g. IMAGE: source path
  static splitPropertyTag(tag) {
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
  }

  processLineTags(tags) {
    const customClasses = [];
    const specialActions = [];

    for (let i = 0; i < tags.length; i++) {
      const tag = tags[i];
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
          case "LINK":
            specialActions.push(() => this.navigateToLink(value));
            break;
          case "LINKOPEN":
            specialActions.push(() => this.openLink(value));
            break;
          case "BACKGROUND":
            specialActions.push(() => this.setBackground(value));
            break;
          case "CLASS":
            customClasses.push(value);
            break;
        }
      } else {
        // Handle simple tags without colons
        const simpleTag = tag.trim().toUpperCase();

        // Check for special system tags
        if (simpleTag === "CLEAR" || simpleTag === "RESTART") {
          specialActions.push(() => simpleTag);
        } else {
          // Add as class
          customClasses.push(simpleTag.toLowerCase());
        }
      }
    }

    return { customClasses, specialActions };
  }

  processChoiceTags(choiceTags) {
    const customClasses = [];
    let isClickable = true;

    for (let i = 0; i < choiceTags.length; i++) {
      const choiceTag = choiceTags[i];
      const splitTag = TagProcessor.splitPropertyTag(choiceTag);

      if (splitTag) {
        const property = splitTag.property.toUpperCase();

        if (property === "CLASS") {
          customClasses.push(splitTag.val);
        }
      } else {
        const simpleTag = choiceTag.trim().toUpperCase();

        if (simpleTag === "UNCLICKABLE") {
          isClickable = false;
        } else {
          customClasses.push(simpleTag.toLowerCase());
        }
      }
    }

    return { customClasses, isClickable };
  }

  // Media and interaction methods
  playAudio(src) {
    // Check if audio is enabled in settings via the story manager
    if (
      window.storyManager &&
      window.storyManager.settings &&
      !window.storyManager.settings.getSetting("audioEnabled")
    ) {
      return; // Skip audio if disabled
    }

    if (this.audio) {
      this.audio.pause();
      this.audio.removeAttribute("src");
      this.audio.load();
    }
    this.audio = new Audio(src);
    this.audio.play();
  }

  playAudioLoop(src) {
    // Check if audio is enabled in settings via the story manager
    if (
      window.storyManager &&
      window.storyManager.settings &&
      !window.storyManager.settings.getSetting("audioEnabled")
    ) {
      return; // Skip audio if disabled
    }

    if (this.audioLoop) {
      this.audioLoop.pause();
      this.audioLoop.removeAttribute("src");
      this.audioLoop.load();
    }
    this.audioLoop = new Audio(src);
    this.audioLoop.play();
    this.audioLoop.loop = true;
  }

  showImage(src) {
    const imageElement = document.createElement("img");
    imageElement.src = src;
    this.storyContainer.appendChild(imageElement);
  }

  navigateToLink(url) {
    window.location.href = url;
  }

  openLink(url) {
    window.open(url);
  }

  setBackground(src) {
    this.outerScrollContainer.style.backgroundImage = "url(" + src + ")";
  }
}
