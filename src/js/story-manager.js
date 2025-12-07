import { Story } from "inkjs";
import { TagRegistry, TAGS } from "./tag-registry.js";
import { notificationManager } from "./notification-manager.js";
import { InkFunctions } from "./ink-functions.js";
import { BaseModal } from "./base-modal.js";
import { Utils } from "./utils.js";
import { errorManager, ERROR_SOURCES } from "./error-manager.js";

const log = errorManager.forSource(ERROR_SOURCES.STORY_MANAGER);

class StoryManager {
  constructor(storyContent, { display, settings, contentProcessor }) {
    try {
      this.story = new Story(storyContent);
      InkFunctions.bindAll(this.story);

      this.savePoint = "";
      this.currentPage = null;
      this.availablePages = {};
      this.pageMenuOrder = null;

      this.display = display;
      this.settings = settings;
      this.contentProcessor = contentProcessor;

      // Wired by main.js after construction
      this.pages = null;
      this.choices = null;
      this.navigation = null;
      this.saves = null;
    } catch (error) {
      log.critical("Failed to initialize story", error);
      throw error;
    }
  }

  start() {
    const required = {
      display: this.display,
      settings: this.settings,
      contentProcessor: this.contentProcessor,
      pages: this.pages,
      choices: this.choices,
      navigation: this.navigation,
      saves: this.saves,
    };

    const missing = Object.entries(required)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missing.length > 0) {
      throw new Error(
        `StoryManager.start() called before wiring dependencies: ${missing.join(", ")}`,
      );
    }

    this.detectSpecialPages();

    try {
      // Process global tags for theme, metadata, and menu order
      this.settings.processGlobalTags(this.story.globalTags);
      this.processMenuOrderTag(this.story.globalTags);
      this.navigation.updateVisibility(this.availablePages, this.pageMenuOrder);
      // Set initial save point and start
      this.savePoint = this.story.state.ToJson();
      this.continue(true);
    } catch (error) {
      log.error("Failed to setup initial state", error);
    }
  }

  continue(isFirstTime = false) {
    try {
      // Don't continue if viewing a special page
      if (this.currentPage) return;

      if (!isFirstTime) {
        this.display?.clear?.();
        this.display?.scrollToTop?.();
      }

      const {
        content: storyContent,
        stoppedForUserInput,
        stateBeforeUserInput,
      } = this.generateContent();

      if (storyContent.length > 0) {
        this.display?.render?.(storyContent);
        document.dispatchEvent(
          new CustomEvent("story:content", {
            detail: { content: storyContent },
          }),
        );
      }

      // Fire start event on first load
      // Use setTimeout to ensure window.InkTemplate.storyManager is assigned
      if (isFirstTime) {
        setTimeout(
          () => document.dispatchEvent(new CustomEvent("story:start")),
          0,
        );
      }

      // Store state for user input restoration
      if (stoppedForUserInput && stateBeforeUserInput) {
        this.stateBeforeUserInput = stateBeforeUserInput;
      }

      // Only generate choices if we didn't stop for user input
      if (!stoppedForUserInput) {
        this.createChoices();
      }

      if (!stoppedForUserInput && this.hasEnded()) {
        document.dispatchEvent(new CustomEvent("story:end"));
      }

      // Update save point after generating new content
      this.savePoint = this.story.state.ToJson();
    } catch (error) {
      log.error("Failed to continue story", error);
    }
  }

  continueWithoutClearing() {
    try {
      // Don't continue if viewing a special page
      if (this.currentPage) return;

      const { content: storyContent } = this.generateContent();
      if (storyContent.length > 0) {
        this.display?.render?.(storyContent);
      }

      this.createChoices();

      // Update save point after generating new content
      this.savePoint = this.story.state.ToJson();
    } catch (error) {
      log.error("Failed to continue story without clearing", error);
    }
  }

  createChoices() {
    try {
      if (this.story.currentChoices?.length > 0) {
        const choices = this.choices?.generate?.(this.story.currentChoices);
        if (choices) {
          // Always include hints in HTML - CSS handles visibility via container class
          // TODO: Fix this to remove unused parameter
          this.display?.renderChoices?.(choices, true);
        }
      }
    } catch (error) {
      log.error("Failed to create choices", error, "choices");
    }
  }

  selectChoice(choiceIndex) {
    try {
      if (
        typeof choiceIndex !== "number" ||
        choiceIndex < 0 ||
        choiceIndex >= this.story.currentChoices.length
      ) {
        throw new Error(`Invalid choice index: ${choiceIndex}`);
      }

      this.display?.container
        ?.querySelectorAll?.(".choice")
        .forEach((choice) => {
          choice.remove();
        });

      this.story.ChooseChoiceIndex(choiceIndex);
      document.dispatchEvent(
        new CustomEvent("story:choice", {
          detail: { index: choiceIndex },
        }),
      );

      this.savePoint = this.story.state.ToJson();

      this.continue();
      this.saves?.autosave?.();
    } catch (error) {
      log.error("Failed to select choice", error, "navigation");
    }
  }

  restart() {
    try {
      document.dispatchEvent(new CustomEvent("story:restart"));
      this.story.ResetState();
      this.currentPage = null;
      this.display?.reset?.();
      this.pages?.reset?.();
      this.savePoint = this.story.state.ToJson();
      this.continue(true);
      this.display?.scrollToTop?.();

      notificationManager.success?.("Story restarted from the beginning");
    } catch (error) {
      log.error("Failed to restart story", error);
    }
  }

  /**
   * Show confirmation dialog before restarting
   * Called by all restart entry points (keyboard, button, title, tag)
   */
  confirmRestart() {
    BaseModal.confirm({
      title: "Restart Story",
      message:
        "Are you sure you want to restart the story from the beginning? Any unsaved progress will be lost.",
      confirmText: "Restart",
      cancelText: "Cancel",
      confirmVariant: "primary",
      onConfirm: () => this.restart(),
    });
  }

  generateContent() {
    const content = [];
    let stoppedForUserInput = false;

    // Save state once at start — used to replay after user input
    const stateAtStart = this.story.state.ToJson();

    try {
      while (this.story.canContinue) {
        const text = this.story.Continue();
        const tags = this.story.currentTags || [];

        if (text.trim().length === 0 && tags.length === 0) continue;

        const processedContent = this.contentProcessor?.process?.(text, tags);
        if (processedContent) {
          if (Array.isArray(processedContent)) {
            content.push(...processedContent);
            if (processedContent.some((item) => item.type === "user-input")) {
              stoppedForUserInput = true;
              break;
            }
          } else {
            content.push(processedContent);
            if (processedContent.type === "user-input") {
              stoppedForUserInput = true;
              break;
            }
          }
        }

        if (processedContent?.hasSpecialAction) {
          const shouldContinue = this.handleSpecialAction(
            processedContent.action,
          );
          if (!shouldContinue) {
            break;
          }
        }
      }
    } catch (error) {
      log.error("Error generating story content", error);
    }

    return {
      content,
      stoppedForUserInput,
      stateBeforeUserInput: stoppedForUserInput ? stateAtStart : null,
    };
  }

  handleSpecialAction(actionResult) {
    try {
      if (typeof actionResult === "string") {
        switch (actionResult) {
          case "CLEAR":
            this.display?.clear?.();
            this.display?.hideHeader?.();
            return true;
          case "RESTART":
            this.confirmRestart();
            return false;
          default:
            return true;
        }
      }
      return true;
    } catch (error) {
      log.error("Failed to handle special action", error);
      return true;
    }
  }

  getCurrentState() {
    try {
      return {
        gameState: this.story.state.ToJson(),
        displayState: this.display?.getState?.() || null,
        currentPage: this.currentPage,
        savePoint: this.savePoint,
        timestamp: Date.now(),
      };
    } catch (error) {
      log.error("Failed to get current state", error);
      return {};
    }
  }

  loadState(state) {
    try {
      if (!state?.gameState) {
        throw new Error("Invalid save state");
      }

      const testStory = this.createTempStory();
      testStory.state.LoadJson(state.gameState);

      this.story.state.LoadJson(state.gameState);
      this.currentPage = state.currentPage || null;
      this.savePoint = state.savePoint || this.story.state.ToJson();

      this.pages?.reset?.();

      // Restore stateBeforeUserInput if it was saved
      this.stateBeforeUserInput = state.stateBeforeUserInput || null;

      let hasUserInput = false;

      if (state.displayState) {
        this.display?.restoreState?.(state.displayState);

        // Check if the restored state has a pending user-input
        hasUserInput = state.displayState.history?.some(
          (item) => item.type === "user-input",
        );
      } else {
        this.display?.clear?.();
        this.regenerateCurrentDisplay();
      }

      // Only create choices if there's no pending user input
      if (!hasUserInput) {
        this.createChoices();
      }

      this.display?.scrollToTop?.();
    } catch (error) {
      log.error("Failed to load state", error, "save-system");
    }
  }

  regenerateCurrentDisplay() {
    try {
      const currentText = this.story.state.currentText;

      if (currentText?.trim?.().length > 0) {
        const content = [
          {
            text: currentText,
            classes: [],
          },
        ];
        this.display?.render?.(content);
      }
    } catch (error) {
      log.error("Failed to regenerate display", error, "display");
    }
  }

  detectSpecialPages() {
    this.availablePages = {};

    try {
      const namedContent = this.story.mainContentContainer.namedContent;

      for (let [knotName, knotContent] of namedContent) {
        try {
          const pageInfo = this.getSpecialPageInfo(knotName);
          if (pageInfo) {
            this.availablePages[knotName] = {
              displayName: pageInfo.displayName,
              knotName: knotName,
              isSpecialPage: true,
            };
          }
        } catch (error) {
          log.warning(`Failed to check if ${knotName} is special page`, error);
        }
      }
    } catch (error) {
      log.error("Failed to detect special pages", error);
    }
  }

  getSpecialPageInfo(knotName) {
    if (!TAGS || !TagRegistry.getTagDef) return null;

    try {
      const tempStory = this.createTempStory();
      tempStory.ChoosePathString(knotName);

      if (tempStory.canContinue) {
        tempStory.Continue();

        const tags = tempStory.currentTags || [];

        for (const tag of tags) {
          if (typeof tag !== "string") continue;

          const { tagDef, tagValue } = TagRegistry.parseTag(tag);

          if (tagDef === TAGS.SPECIAL_PAGE) {
            return {
              displayName: tagValue?.trim() || Utils.formatKnotName(knotName),
              isSpecialPage: true,
            };
          }
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  isSpecialPage(knotName) {
    return this.getSpecialPageInfo(knotName) !== null;
  }

  processMenuOrderTag(globalTags) {
    if (!Array.isArray(globalTags)) return;

    for (const tag of globalTags) {
      if (typeof tag !== "string") continue;

      const colonIndex = tag.indexOf(":");
      if (colonIndex === -1) continue;

      const property = tag.substring(0, colonIndex).trim().toUpperCase();
      const value = tag.substring(colonIndex + 1).trim();

      if (TagRegistry.getTagDef(property) === TAGS.PAGE_MENU) {
        this.pageMenuOrder = this.parseMenuOrder(value);
        break;
      }
    }
  }

  parseMenuOrder(menuString) {
    // Parse format: "page1, page2,, page3, page4"
    // Double commas (,,) separate sections, single commas separate items within sections
    const sections = menuString.split(",,").map((s) => s.trim());
    const menuOrder = [];

    sections.forEach((section, sectionIndex) => {
      const pages = section
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p);

      pages.forEach((pageName) => {
        if (this.availablePages[pageName]) {
          menuOrder.push({
            knotName: pageName,
            section: sectionIndex,
          });
        } else {
          console.warn(
            `Page '${pageName}' in PAGE_MENU not found in special pages`,
          );
        }
      });
    });

    return menuOrder.length > 0 ? menuOrder : null;
  }

  canContinue() {
    try {
      return this.story.canContinue;
    } catch (error) {
      log.warning("Failed to check canContinue", error);
      return false;
    }
  }

  hasChoices() {
    try {
      return this.story.currentChoices?.length > 0;
    } catch (error) {
      log.warning("Failed to check hasChoices", error);
      return false;
    }
  }

  hasEnded() {
    return !this.canContinue() && !this.hasChoices();
  }

  /**
   * Create a temporary story instance with external functions bound
   * @returns {Story} A new story instance with functions bound
   */
  createTempStory() {
    const tempStory = new Story(this.story.ToJson());
    InkFunctions.bindAll(tempStory);
    return tempStory;
  }

  getStats() {
    try {
      return {
        currentTurnIndex: this.story.state.currentTurnIndex,
        hasEnded: this.hasEnded(),
        canContinue: this.canContinue(),
        hasChoices: this.hasChoices(),
        currentPage: this.currentPage,
        displayLength: this.display?.getHistoryLength?.() || 0,
        specialPagesFound: Object.keys(this.availablePages).length,
      };
    } catch (error) {
      log.warning("Failed to get stats", error);
      return {};
    }
  }

  getFeatureInfo() {
    return {
      availablePages: { ...this.availablePages },
      hasGlobalTags: this.story.globalTags?.length > 0,
      hasCurrentTags: this.story.currentTags?.length > 0,
      specialPageCount: Object.keys(this.availablePages).length,
    };
  }

  cleanup() {
    try {
      this.saves?.cleanup?.();
      this.settings?.cleanup?.();
      this.pages?.reset?.();
    } catch (error) {
      log.warning("Failed to cleanup", error, "system");
    }
  }
}

export { StoryManager };
