# Ink Story Template

A web template for [Ink](https://www.inklestudios.com/ink/) interactive fiction. I built this because existing Ink templates weren't as feature-rich as what's available for Twine.

---

**[Live Demo](https://remy-vim.itch.io/ink-template)** | **[Documentation](https://remyvim.github.io/ink-if-story-template/)**

---

You don't even have to touch a line of HTML, CSS, or JavaScript to use it (unless you want to)!

## Features

- **Save System**: 5 slots + autosave, export/import saves, keyboard shortcuts
- **Rich Text**: Markdown-style formatting, headers, lists, inline styles, automatic links
- **User Input**: Populate Ink variables with text input fields
- **Media Support**: Images, background images, audio, looping music
- **Stat Bars**: Visual progress bars for health, skills, relationships, or any variable
- **Tone Indicators**: Mark choices with mood icons (friendly, aggressive, cautious, etc.)
- **Special Pages**: Character sheets, credits, maps, reference pages outside story flow
- **Notifications**: Achievements, warnings, and alerts
- **Settings**: Theme (light/dark/auto), font selection, text size, audio controls
- **Functions**: String manipulation, math, fairmath, and real-time date/time functions
- **Responsive**: Works beautifully on desktop, tablet, and mobile
- **Accessible**: Full screen reader support, WCAG AA contrast (4.5:1), accessible touch targets, keyboard navigation (1-9, A-Z for choices), dyslexia-friendly font option
- **Extensible**: Add custom code via `custom.js` and `custom.css` without touching core files

See [TODO.md](TODO.md) for the full roadmap. Want something bumped up the list or have a new idea? See [Bug Reports & Feature Requests](#bug-reports--feature-requests) below.

## Quick Start

1. **Download** the template from [itch.io](https://remy-vim.itch.io/ink-template) or [GitHub Releases](https://github.com/RemyVim/ink-if-story-template/releases)
2. **Export** your Ink story to JSON using [Inky](https://github.com/inkle/inky/releases) (File > Export to JSON)
3. **Replace** `story.json` in the template folder with your exported file
4. **Upload** to [itch.io](https://itch.io), [Neocities](https://neocities.org), or any static host

That's it. No programming required. (BYO Ink story though!)

For more details, see the [Quick Start guide](https://remyvim.github.io/ink-if-story-template/quickstart/) or the [Complete Beginner's Guide](https://remyvim.github.io/ink-if-story-template/guides/beginner-guide/) with screenshots.

## Documentation

The [documentation site](https://remyvim.github.io/ink-if-story-template/) covers everything:

- [Text Formatting](https://remyvim.github.io/ink-if-story-template/reference/text-formatting/) — bold, italics, headers, lists, links
- [Images](https://remyvim.github.io/ink-if-story-template/reference/images/) and [Audio](https://remyvim.github.io/ink-if-story-template/reference/audio/)
- [Special Pages](https://remyvim.github.io/ink-if-story-template/reference/special-pages/) — character sheets, maps, credits
- [Functions](https://remyvim.github.io/ink-if-story-template/reference/functions/) — string, math, fairmath, and time utilities
- [Styling](https://remyvim.github.io/ink-if-story-template/reference/styling/) — customizing colors and themes
- [Quick Reference](https://remyvim.github.io/ink-if-story-template/quick-reference/) — all tags and syntax at a glance
- ...and more

## Bug Reports & Feature Requests

Bug reports:

- [Open an issue](https://github.com/RemyVim/ink-if-story-template/issues) on GitHub
- Submit via the [Google Form](https://forms.gle/a6HKbMZ7AhXV8kGu9)

Feature requests:

- [Open an issue](https://github.com/RemyVim/ink-if-story-template/issues) on GitHub
- Submit via the [Google Form](https://forms.gle/JgiFt4tNYaDFB8R59)

---

## For Developers

This section is for contributing to the template or customizing its core code. If you just want to publish your story, skip this-the Quick Start above has everything you need.

So, you're still here. Great! Here's how to get the repo running locally.

### Prerequisites

- [Task](https://taskfile.dev/): task runner
- [Node.js](https://nodejs.org/): for bundling and automated tests
- Ruby and Bundler: only for working on the docs site

### Setup

```bash
git clone https://github.com/RemyVim/ink-if-story-template.git
cd ink-if-story-template
task setup
```

This task installs [inklecate](https://github.com/inkle/ink/releases) (Ink compiler), npm dependencies, file watcher tool, and Jekyll for the docs site.

Alternatively if you prefer to install the dependencies separately:

```
task setup:inklecate
task setup:watch
task setup:npm
task setup:jekyll
```

**Note:** The Taskfile has only been tested on Linux. MacOS should mostly work but may need minor adjustments. Windows users will likely need WSL or manual equivalents. PRs to improve cross-platform support are welcome!

### Project Structure

```
src/                  # Source files (edit these)
├── ink/              # Demo story source
├── js/               # JavaScript modules
├── css/              # Stylesheets
└── index.html

build/                # Production output (generated by task build)
├── story.json        # Compiled demo story
├── index.html
├── js/
│   ├── template.min.js
│   └── custom.js     # Author customizations
├── css/
│   ├── template.min.css
│   └── custom.css    # Author customizations
└── assets/           # Fonts, images, audio

docs/                 # Jekyll documentation site
```

The `build/` folder is what gets distributed to users and deployed. The `src/` folder contains the source code that gets bundled.

### Development Workflow

```bash
task dev
```

This watches `src/` for changes, auto-rebuilds, and serves the template locally. Visit `http://localhost:8000` in your browser to test.

### Other Commands

```bash
task setup            # Install all dependencies (inklecate, npm, Jekyll)
task build            # Production build (clean + bundle + minify + compile)
task compile          # Compile Ink story only
task serve            # Start local server without file watching
task watch            # Watch for changes without serving
task clean            # Remove generated files from build/
task help             # List all available tasks
```

### Automated Tests

```bash
task test             # Run all tests (unit + E2E)
task test:unit        # Unit tests only (Vitest)
task test:e2e         # E2E tests only (Playwright)
task lint             # Run linter
```

### Docs Site

```bash
task docs
```

Then visit `http://localhost:4000/ink-if-story-template/`

### Contributing

Contributions welcome. Fork the repo, create a feature branch, add tests whenever possible, and submit a PR.

## Browser Support

Modern browsers (2020+). Works offline once loaded.

## License

[MIT License](LICENSE): use and modify for any purpose, including commercial projects.

## Screenshots

![Demo screenshot light and dark modes large screen](/screenshots/ink-template-dark-light-themes.png)
![Demo screenshot light saves menu](/screenshots/ink-template-save-menu.png)
![Demo screenshot settings menu dark mode](/screenshots/ink-template-settings-menu.png)
![Demo screenshot light and dark modes mobile screen](/screenshots/ink-template-dark-light-themes-mobile.png)
