# Ink Story Template

So you've written an amazing interactive story in [Ink](https://www.inklestudios.com/ink/), and now you want to share it with the world? This template has you covered.

Transform your Ink stories into polished, professional web experiences without touching a single line of HTML, CSS, or JavaScript (although you definitely can if you want!). Just write your story, compile it, and you're ready to publish.

## Features

### Responsive Design

- Beautiful on desktop, tablet, and mobile
- Accessible design
- Customizable themes (light/dark/auto)

### Save System

- 5 save slots + automatic autosave
- Export/import saves as files
- Cross-device save sharing
- Keyboard shortcuts (`Ctrl+S` to save, `Ctrl+R` to restart)

### Rich Formatting

- Markdown-style text formatting (`__bold__`, `_italic_`, etc.)
- Custom inline styles with `[text](style)` syntax
- Automatic link detection
- Code blocks, lists, and blockquotes

### Media Support

- Background images and music
- Sound effects and ambient loops
- Image embedding
- All controlled via simple Ink tags

### Special Pages

- Create reference pages outside story flow
- Character sheets, maps, credits, etc.
- Automatic navigation integration
- Return-to-story functionality

### User Settings

- Theme selection (light/dark/auto)
- Font options including dyslexia-friendly fonts
- Text size and line height adjustment
- Audio and animation controls

### Notification System

- Customizable notification types
- Achievement notifications
- Error handling with user feedback

## Quick Start

1. **Download the template**

   ```bash
   git clone https://github.com/remyvim/ink-story-template
   cd ink-story-template
   ```

2. **Write your story** in Ink (you can replace the demo in `src/main.ink` or work elsewhere)

3. **Compile your story**
    Using [Inky](https://github.com/inkle/inky):

   ```bash
   File → Export to Web...
   ```

   Or using inklecate command line

   ```bash
   inklecate -o build/story.json src/main.ink
   ```

4. **Test locally**

   ```bash
   cd build
   python3 -m http.server 8000
   ```

   And visit <http://localhost:8000>

5. **Deploy** to any static hosting service (Itch.io, GitHub Pages, Netlify, etc.)

## Writing for the Template

### Basic Formatting

You can use a markdown-adjacent symbols for text formatting (the template will automatically process these symbols into HTML).

```ink
This is __bold text__ and this is _italic text_.

You can use `inline code` and create [highlighted text](highlight) or [linked text](example.com).

:: This creates a header

> This creates a bullet point
> Another bullet point

>> This creates a blockquote
```

### Media and Effects

Add media to your story directly in your `.ink` files with the following special tags:

```ink
# IMAGE: path/to/image.jpg
# AUDIO: path/to/sound.mp3
# AUDIOLOOP: path/to/music.mp3
# BACKGROUND: path/to/background.jpg
```

### Special Pages

Special pages are pages outside the main narrative flow such as about/credits/content warning page or character stats pages. These pages will auto-populate the navigation menu and have a "Return to Story" button that brings the player back where they left off.

```ink
=== character_sheet ===
# SPECIAL_PAGE
: Character Information

Your character details go here...

-> DONE
```

### Notifications

You can also trigger notifications from your .ink files:

```ink
# ACHIEVEMENT: You found the secret!
# NOTIFICATION: Something interesting happened.
# WARNING: Be careful here.
# ERROR: Something went wrong.
```

## Development Workflow (Optional)

### Prerequisites

- Linux (might work with MacOS with some modifications - PRs welcome!)
- Python 3 (for local server)
- [Ink/Inky](https://www.inklestudios.com/ink/) for story compilation

### Using Task (Optional)

Install [Task](https://taskfile.dev/) for convenient development commands:

```bash
# Setup development environment
task setup

# Start development (auto-compile + serve)
task dev

# Just compile
task compile

# Just serve
task serve
```

### File Structure

```
ink-story-template/
├── build/              # Production files (this is folder to deploy)
│   ├── assets/
│   ├── css/
│   ├── js/
│   ├── fonts/
│   ├── index.html
│   └── story.json      # Your compiled Ink story
├── src/                # Your Ink source files (optional)
│   └── main.ink
└── README.md
```

## Customization

### Themes

The template includes light and dark themes. You can customize colors/fonts/layout or anything else in `build/css/style.css`.

### Fonts

Three font options included:

- **Merriweather** (serif, default)
- **Inter** (sans-serif)  
- **OpenDyslexic** (accessibility)

Add custom fonts by updating the CSS and font files.

### Advanced Customization

All JavaScript modules are modular. Key files:

- `js/story-manager.js` - Core story logic
- `js/settings.js` - User preferences
- `js/save-system.js` - Save/load functionality

## Browser Support

- **Modern browsers** (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- **Mobile browsers** (iOS Safari, Chrome Mobile)
<!-- - **Accessibility tools** (screen readers, keyboard navigation) -->

## License

MIT License - use for any purpose, commercial or personal.

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Test thoroughly
4. Submit a pull request

Just want to report a bug or request a feature? Open an issue!

## Resources

- [Ink Documentation](https://github.com/inkle/ink)
- [Ink Tutorial](https://www.inklestudios.com/ink/web-tutorial/)
- [Interactive Fiction Community](https://intfiction.org/)

## FAQ

**Q: Do I need to know HTML/CSS/JavaScript?**  
A: No! Write in Ink, compile, and deploy. Customization is optional.

**Q: Can I sell games made with this template?**  
A: Yes! MIT license allows commercial use.

**Q: Does this work offline?**  
A: Yes, once loaded the template works entirely offline. Even the fonts are bundled to avoid querying Google fonts.

**Q: Can I customize the appearance?**  
A: Absolutely. You can edit the `build/css/style.css` file to your heart's content.

**Q: What about mobile devices?**  
A: The design is fully responsive and optimized for all screen sizes.
