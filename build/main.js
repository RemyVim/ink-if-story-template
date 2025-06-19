// Load story from story.json file
fetch("story.json")
  .then((response) => response.json())
  .then((storyContent) => {
    // Create ink story from the content using inkjs
    var story = new inkjs.Story(storyContent);

    var savePoint = "";

    let savedTheme;
    let globalTagTheme;

    // Global tags - those at the top of the ink file
    // We support:
    //  # theme: dark
    //  # author: Your Name
    var globalTags = story.globalTags;
    if (globalTags) {
      for (var i = 0; i < story.globalTags.length; i++) {
        var globalTag = story.globalTags[i];
        var splitTag = splitPropertyTag(globalTag);

        // THEME: dark
        if (splitTag && splitTag.property == "theme") {
          globalTagTheme = splitTag.val;
        }
        // title: IF Title
        else if (splitTag && splitTag.property == "title") {
          var titleElements = document.querySelectorAll(".title");
          for (var i = 0; i < titleElements.length; i++) {
            titleElements[i].innerHTML = splitTag.val;
          }
        }
        // author: Your Name
        else if (splitTag && splitTag.property == "author") {
          var byline = document.querySelector(".byline");
          if (byline) {
            byline.innerHTML = "by " + splitTag.val;
          }
        }
      }
    }

    var storyContainer = document.querySelector("#story");
    var outerScrollContainer = document.querySelector(".outerContainer");

    // page features setup
    setupTheme(globalTagTheme);
    var hasSave = loadSavePoint();
    setupButtons(hasSave);

    // Set initial save point
    savePoint = story.state.toJson();

    // Kick off the start of the story!
    continueStory(true);

    // Main story processing function. Each time this is called it generates
    // all the next content up as far as the next set of choices.
    function continueStory(firstTime) {
      // Clear everything when starting a new section (except on very first load)
      if (!firstTime) {
        // Clear all existing content
        removeAll("p");
        removeAll("img");

        // Scroll to top
        outerScrollContainer.scrollTo(0, 0);

        // Reset container height
        storyContainer.style.height = "";
      }

      // Generate story text - loop through available content
      while (story.canContinue) {
        // Get ink to generate the next paragraph
        var paragraphText = story.Continue();
        var tags = story.currentTags;

        // Any special tags included with this line
        var customClasses = [];

        // Process all tags
        for (var i = 0; i < tags.length; i++) {
          var tag = tags[i];

          // Detect tags of the form "X: Y". Currently used for IMAGE and CLASS but could be
          // customised to be used for other things too.
          var splitTag = splitPropertyTag(tag);

          if (splitTag) {
            splitTag.property = splitTag.property.toUpperCase();

            // AUDIO: src
            if (splitTag.property == "AUDIO") {
              if ("audio" in this) {
                this.audio.pause();
                this.audio.removeAttribute("src");
                this.audio.load();
              }
              this.audio = new Audio(splitTag.val);
              this.audio.play();
            }

            // AUDIOLOOP: src
            else if (splitTag.property == "AUDIOLOOP") {
              if ("audioLoop" in this) {
                this.audioLoop.pause();
                this.audioLoop.removeAttribute("src");
                this.audioLoop.load();
              }
              this.audioLoop = new Audio(splitTag.val);
              this.audioLoop.play();
              this.audioLoop.loop = true;
            }

            // IMAGE: src
            else if (splitTag.property == "IMAGE") {
              var imageElement = document.createElement("img");
              imageElement.src = splitTag.val;
              storyContainer.appendChild(imageElement);
            }

            // LINK: url
            else if (splitTag.property == "LINK") {
              window.location.href = splitTag.val;
            }

            // LINKOPEN: url
            else if (splitTag.property == "LINKOPEN") {
              window.open(splitTag.val);
            }

            // BACKGROUND: src
            else if (splitTag.property == "BACKGROUND") {
              outerScrollContainer.style.backgroundImage =
                "url(" + splitTag.val + ")";
            }

            // CLASS: className
            else if (splitTag.property == "CLASS") {
              customClasses.push(splitTag.val);
            }
          } else {
            // Handle simple tags without colons
            var simpleTag = tag.trim().toUpperCase();

            // Skip system tags and add as class
            if (simpleTag !== "CLEAR" && simpleTag !== "RESTART") {
              customClasses.push(simpleTag);
            }
          }
        }

        // Handle special tags (separate loop to avoid conflicts)
        for (var i = 0; i < tags.length; i++) {
          var tag = tags[i];
          if (tag == "CLEAR" || tag == "RESTART") {
            removeAll("p");
            removeAll("img");
            setVisible(".header", false);

            if (tag == "RESTART") {
              restart();
              return;
            }
          }
        }

        // Check if paragraphText is empty
        if (paragraphText.trim().length == 0) {
          continue; // Skip empty paragraphs
        }

        // Create paragraph element
        var paragraphElement = document.createElement("p");
        paragraphElement.innerHTML = processMarkdown(paragraphText);
        // paragraphElement.innerHTML = paragraphText;
        storyContainer.appendChild(paragraphElement);

        // Add any custom classes derived from ink tags
        for (var i = 0; i < customClasses.length; i++) {
          paragraphElement.classList.add(customClasses[i]);
        }
      }

      // Create HTML choices from ink choices
      story.currentChoices.forEach(function (choice) {
        // Create paragraph with anchor element
        var choiceTags = choice.tags;
        var customClasses = [];
        var isClickable = true;

        for (var i = 0; i < choiceTags.length; i++) {
          var choiceTag = choiceTags[i];
          var splitTag = splitPropertyTag(choiceTag);

          if (splitTag) {
            splitTag.property = splitTag.property.toUpperCase();

            if (splitTag.property == "CLASS") {
              customClasses.push(splitTag.val);
            }
          } else {
            // Handle simple tags for choices too
            var simpleTag = choiceTag.trim().toUpperCase();
            if (simpleTag !== "UNCLICKABLE") {
              customClasses.push(simpleTag);
            }
          }

          if (choiceTag.toUpperCase() == "UNCLICKABLE") {
            isClickable = false;
          }
        }

        var choiceParagraphElement = document.createElement("p");
        choiceParagraphElement.classList.add("choice");

        for (var i = 0; i < customClasses.length; i++)
          choiceParagraphElement.classList.add(customClasses[i]);

        if (isClickable) {
          choiceParagraphElement.innerHTML = `<a href='#'>${choice.text}</a>`;
        } else {
          choiceParagraphElement.innerHTML = `<span class='unclickable'>${choice.text}</span>`;
        }
        storyContainer.appendChild(choiceParagraphElement);

        // Click on choice
        if (isClickable) {
          var choiceAnchorEl = choiceParagraphElement.querySelectorAll("a")[0];
          choiceAnchorEl.addEventListener("click", function (event) {
            // Don't follow <a> link
            event.preventDefault();

            // Remove all existing choices
            removeAll(".choice");

            // Tell the story where to go next
            story.ChooseChoiceIndex(choice.index);

            // This is where the save button will save from
            savePoint = story.state.toJson();

            // Continue the story (this will clear the screen)
            continueStory();
          });
        }
      });
    }

    function restart() {
      story.ResetState();

      setVisible(".header", true);

      // set save point to here
      savePoint = story.state.toJson();

      continueStory(true);

      outerScrollContainer.scrollTo(0, 0);
    }

    // -----------------------------------
    // Various Helper functions
    // -----------------------------------

    // Detects whether the user accepts animations
    function isAnimationEnabled() {
      return window.matchMedia("(prefers-reduced-motion: no-preference)")
        .matches;
    }

    // Remove all elements that match the given selector. Used for removing choices after
    // you've picked one, as well as for the CLEAR and RESTART tags.
    function removeAll(selector) {
      var allElements = storyContainer.querySelectorAll(selector);
      for (var i = 0; i < allElements.length; i++) {
        var el = allElements[i];
        el.parentNode.removeChild(el);
      }
    }

    // Used for hiding and showing the header when you CLEAR or RESTART the story respectively.
    function setVisible(selector, visible) {
      var allElements = storyContainer.querySelectorAll(selector);
      for (var i = 0; i < allElements.length; i++) {
        var el = allElements[i];
        if (!visible) el.classList.add("invisible");
        else el.classList.remove("invisible");
      }
    }

    // Helper for parsing out tags of the form:
    //  # PROPERTY: value
    // e.g. IMAGE: source path
    function splitPropertyTag(tag) {
      var propertySplitIdx = tag.indexOf(":");
      if (propertySplitIdx != -1) {
        var property = tag.substr(0, propertySplitIdx).trim();
        var val = tag.substr(propertySplitIdx + 1).trim();
        return {
          property: property,
          val: val,
        };
      }

      return null;
    }

    // Loads save state if exists in the browser memory
    function loadSavePoint() {
      try {
        let savedState = window.localStorage.getItem("save-state");
        if (savedState) {
          story.state.LoadJson(savedState);
          return true;
        }
      } catch (e) {
        console.debug("Couldn't load save state");
      }
      return false;
    }

    function processMarkdown(text) {
      // If line starts with backslash, remove it and skip all markdown processing
      if (text.trim().startsWith("\\")) {
        return text.trim().substring(1);
      }

      return (
        text
          // Bold: **text** or __text__ (but not if preceded by \)
          .replace(/(?<!\\)\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/(?<!\\)__(.*?)__/g, "<strong>$1</strong>")
          // Italic: *text* or _text_ (but not if preceded by \)
          .replace(/(?<!\\)\*(.*?)\*/g, "<em>$1</em>")
          .replace(/(?<!\\)_(.*?)_/g, "<em>$1</em>")
          // Headers: :: Text (but not if preceded by \)
          .replace(/^(?<!\\)::: (.*$)/gm, "<h3>$1</h3>")
          .replace(/^(?<!\\):: (.*$)/gm, "<h2>$1</h2>")
          .replace(/^(?<!\\): (.*$)/gm, "<h1>$1</h1>")
          // Inline code: `code` (but not if preceded by \)
          .replace(/(?<!\\)`(.*?)`/g, "<code>$1</code>")
          // Custom inline styles: [text](style) (but not if preceded by \)
          .replace(
            /(?<!\\)\[(.*?)\]\((\w+)\)/g,
            '<span class="inline-$2">$1</span>',
          )
          // Line breaks: Double spaces at end of line
          .replace(/  $/gm, "<br>")
          // Clean up the escape backslashes (remove \ before markdown symbols)
          .replace(/\\(\*\*|\*|__|_|`|:::|::|:|\[)/g, "$1")
      );
    }

    // Detects which theme (light or dark) to use
    function setupTheme(globalTagTheme) {
      // load theme from browser memory
      var savedTheme;
      try {
        savedTheme = window.localStorage.getItem("theme");
      } catch (e) {
        console.debug("Couldn't load saved theme");
      }

      // Check whether the OS/browser is configured for dark mode
      var browserDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;

      if (
        savedTheme === "dark" ||
        (savedTheme == undefined && globalTagTheme === "dark") ||
        (savedTheme == undefined && globalTagTheme == undefined && browserDark)
      )
        document.body.classList.add("dark");
    }

    // Used to hook up the functionality for global functionality buttons
    function setupButtons(hasSave) {
      let rewindEl = document.getElementById("rewind");
      if (rewindEl)
        rewindEl.addEventListener("click", function (event) {
          removeAll("p");
          removeAll("img");
          setVisible(".header", false);
          restart();
        });

      let saveEl = document.getElementById("save");
      if (saveEl)
        saveEl.addEventListener("click", function (event) {
          try {
            window.localStorage.setItem("save-state", savePoint);
            document.getElementById("reload").removeAttribute("disabled");
            window.localStorage.setItem(
              "theme",
              document.body.classList.contains("dark") ? "dark" : "",
            );
          } catch (e) {
            console.warn("Couldn't save state");
          }
        });

      let reloadEl = document.getElementById("reload");
      if (!hasSave) {
        reloadEl.setAttribute("disabled", "disabled");
      }
      reloadEl.addEventListener("click", function (event) {
        if (reloadEl.getAttribute("disabled")) return;

        removeAll("p");
        removeAll("img");
        try {
          let savedState = window.localStorage.getItem("save-state");
          if (savedState) story.state.LoadJson(savedState);
        } catch (e) {
          console.debug("Couldn't load save state");
        }
        continueStory(true);
      });

      let themeSwitchEl = document.getElementById("theme-switch");
      if (themeSwitchEl)
        themeSwitchEl.addEventListener("click", function (event) {
          document.body.classList.add("switched");
          document.body.classList.toggle("dark");
        });
    }
  })
  .catch((error) => {
    console.error("Error loading story:", error);
    document.getElementById("story").innerHTML =
      "<p>Error loading story. Make sure story.json exists.</p>";
  });

// Note: Modal handling is now done in the HTML file with the ModalSystem class
