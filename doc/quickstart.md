# Quick Start Guide

Get your Ink story online in minutes. This guide covers everything from compilation to deployment.

## Step 1: Get the Template

Download or clone the template:

```bash
git clone https://github.com/remyvim/ink-if-story-template.git
cd ink-if-story-template
```

## Step 2: Prepare Your Story

### Basic Story Tags

Add these tags at the top of your main `.ink` file:

```ink
# title: Your Amazing Story
# author: Your Name
```

### Compile to JSON

**Using Inky (Recommended)**

1. Open your story in Inky
2. Go to `File → Export to Web...`
3. Save as `story.json`

**Using Command Line**

```bash
inklecate -o story.json -j your-story.ink
```

## Step 3: Replace the Demo

Copy your `story.json` file to the template's `build/` folder, replacing the existing one.

## Step 4: Test Locally

Start a local server to test your story:

```bash
cd build
python3 -m http.server 8000
```

Visit `http://localhost:8000` in your browser.

**Alternative servers:**

- Node.js: `npx serve .`
- PHP: `php -S localhost:8000`
- Any static file server

## Step 5: Deploy

Upload the entire `build/` folder to any static hosting service, for example:

- **GitHub Pages**: Push `build/` contents to `gh-pages` branch
- **Netlify**: Drag and drop `build/` folder to netlify.com
- **itch.io**: Zip `build/` folder and upload as HTML game

## Development Workflow (Optional)

For active development on Linux, install [Task](https://taskfile.dev/):

```bash
# Setup development environment
task setup

# Auto-compile and serve (watches src/ for changes)
task dev

# Manual compile only
task compile
```

This watches your `src/` folder and automatically recompiles when you save changes.

**Note**: The Taskfile currently requires Linux. MacOS/Windows users will need to modify `Taskfile.yml` or use manual compilation. PRs welcome!

## Troubleshooting

**Story won't load?**

- Check browser console (F12) for errors
- Verify `story.json` is valid JSON
- Ensure all file paths are correct

**Formatting not working?**

- Make sure you're using the correct syntax (see [text-formatting.md](text-formatting.md))
- Check that special characters aren't being escaped by Ink

**Can't hear audio?**

- Verify audio files are in `build/assets/` folder
- Check if audio is enabled in the story settings
- Ensure browser allows audio playback

**Special pages not appearing?**

- Confirm you're using `# SPECIAL_PAGE` or `# SPECIAL_PAGE: Name` tags
- Check that the knot is accessible from your story structure

---

Need help with something else? Check out the rest of the docs:

- Quick start: [doc/quickstart.md](quickstart.md)
- Text formatting: [doc/text-formatting.md](text-formatting.md)
- Special tags: [doc/special-tags.md](special-tags.md)
- Ink functions: [doc/functions.md](functions.md)

**Still need help?** Check the community resources in the main [README.md](../README.md) or open an issue on the GitHub repository.
