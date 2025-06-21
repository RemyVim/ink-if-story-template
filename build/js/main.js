// Main entry point
fetch("story.json")
  .then((response) => response.json())
  .then((storyContent) => {
    // Initialize the story controller which handles everything
    window.storyController = new StoryController(storyContent);
  })
  .catch((error) => {
    console.error("Error loading story:", error);
    document.getElementById("story").innerHTML =
      "<p>Error loading story. Make sure story.json exists.</p>";
  });
