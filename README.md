# Ink Story Template

A web template for [Ink](https://www.inklestudios.com/ink/) interactive stories. I built this because existing Ink templates weren't as polished as what's available for Twine.

---

**[→ Try the live demo on itch.io](https://remy-vim.itch.io/ink-template)**

---

You don't even have to touch a line of HTML, CSS, or JavaScript to use it (unless you want to)!

## Features

- **Save System**: 5 slots + autosave, export/import saves, keyboard shortcuts
- **Rich Formatting**: Markdown-style text, custom styles, automatic links
- **User Input**: Populate an Ink story variable with user input
- **Media Support**: Images, audio, background music via simple Ink tags
- **Special Pages**: Character sheets, credits, maps outside story flow
- **Responsive Design**: Beautiful on all devices with light/dark themes
- **Accessibility**: Dyslexia-friendly fonts, font sizing options in settings
- **Settings**: Theme, font, text size, audio controls

See [TODO.md](TODO.md) for the full list of completed and missing features.

## Quick Start

1. **Get the template**

   ```bash
   git clone https://github.com/RemyVim/ink-if-story-template.git
   cd ink-if-story-template
   ```

2. **Compile your Ink story** to JSON and replace `build/story.json`

3. **Test locally**

   ```bash
   cd build && python3 -m http.server 8000
   ```

4. **Deploy** the `build` folder to any static host (GitHub Pages, Netlify, itch.io)

See [doc/quickstart.md](doc/quickstart.md) for more info.

## Writing for the Template

### Text Formatting

```ink
This is __bold__ and _italic_ text.
Use `code` and [highlighted text](highlight).
Link to [external sites](example.com).

:: This is a header
> Bullet points
>> Block quotes
```

See [doc/text-formatting.md](doc/text-formatting.md) for more info.

### Media & Effects

```ink
# IMAGE: path/to/image.jpg
# AUDIO: sound.mp3
# AUDIOLOOP: music.mp3
# BACKGROUND: background.jpg
# ACHIEVEMENT: You found a secret!
```

See [doc/special-tags.md](doc/special-tags.md) for more info.

### Special Pages

Create reference pages outside your main story:

```ink
=== character_sheet ===
# SPECIAL_PAGE: Character Info
Your character details here...
-> DONE
```

See [doc/special-tags.md](doc/special-tags.md) for more info.

## File Structure

```
build/                # Deploy this folder
├── story.json        # Your compiled Ink story
├── index.html
├── css/style.css     # Customize appearance here
└── js/               # Template functionality

src/                  # Your Ink source (optional)
└── main.ink
```

## Customization

- **Colors/Themes**: Edit `build/css/style.css`
- **Fonts**: Three included (serif, sans-serif, dyslexic-friendly)
- **Advanced**: Modular JavaScript in `build/js/`

## Development (Optional)

Install [Task](https://taskfile.dev/) for convenience commands:

```bash
task setup    # Install dependencies
task dev      # Auto-compile on change in src files + serve
task compile  # Just compile
```

## Browser Support

Modern browsers (Chrome 80+, Firefox 75+, Safari 13+). Works offline (fonts and images bundled).

## License & Contributing

MIT License—use for any purpose, including commercial projects.

Contributions welcome! Fork, create feature branch, test, and submit PR.

Bug reports and feature requests also welcome! Open an issue.

## Resources

- [Ink Documentation](https://github.com/inkle/ink)
- [Ink Web Tutorial](https://www.inklestudios.com/ink/web-tutorial/)
- [Interactive Fiction Community](https://intfiction.org/)

## Screenshots

![Demo screenshot light and dark modes large screen](/screenshots/ink-template-dark-light-themes.png)
![Demo screenshot light saves menu](/screenshots/ink-template-save-menu.png)
![Demo screenshot settings menu dark mode](/screenshots/ink-template-settings-menu.png)
![Demo screenshot light and dark modes mobile screen](/screenshots/ink-template-dark-light-themes-mobile.png)
