# ink-if-html-template
A simple HTML/CSS/JS for ink/inkjs stories.  In the spirit of Twine games.

## What This Is

A modern, responsive HTML template for publishing Ink interactive fiction stories to the web. Features:

- **Save/Load system** with multiple save slots
- **Responsive design** that works on mobile and desktop  
- **Modern UI** with dark/light theme switching
- **Development tools** for live editing and compilation
- **Modal system** for credits, warnings, etc.

Perfect for authors who want to publish polished IF games without diving deep into web development.

## Two Ways to Use This Template

### Option A: With Inky (Simple)
1. Write your story in [Inky editor](https://github.com/inkle/inky/releases)
2. Export as HTML from Inky
3. Replace the `build/` folder in your export with the `build/` folder from this template
4. Done! You now have a story with save/load, themes, etc.

### Option B: Development Setup (Fancy)
Want auto-compilation and easy testing? Set up the development environment below.

## Development Setup

**TL;DR:** This gives you auto-compilation so you can write Ink, save, and refresh your browser to see changes instantly.

You can absolutely use this template without any development setup - just edit the files directly. But if you want the "save your Ink file, hit refresh, and see changes instantly" experience, here's how:

### What You'll Get
- Type in your Ink editor → Save → Auto-compilation happens
- Hit `Ctrl+R` in browser → See your changes instantly
- Local web server so you can test everything
- No manual compilation steps

### Prerequisites


- **Linux** (MacOS likely works with minor adaptations - PRs welcome from Mac users!)
- **Git** for downloading this template
- **Python 3** (probably already installed)
- **Task** for building ([quick install here](https://taskfile.dev/installation/))

### Three Commands and You're Done

1. **Get the template:**

   ```bash
   git clone https://github.com/RemyVim/ink-if-html-template
   cd ink-if-html-template
   ```

2. **Set everything up:**

   ```bash
   task setup
   ```

   This will:
   - Download and install inklecate compiler
   - Install file watching tools
   - Set up project structure

3. **Start the magic:**

   ```bash
   task dev
   ```

Now open <http://localhost:8000> and edit `src/main.ink`. Save the file, hit `Ctrl+R` in your browser, and see your changes!

**Tip:** Keep your browser and editor side-by-side for quick save-and-refresh cycles.

Press `Ctrl+C` when you're done writing for the day.

### Available Commands

| Command | Description |
|---------|-------------|
| `task dev` | Start development environment (watch + serve) |
| `task compile` | Compile Ink story to JSON |
| `task serve` | Start web server at <http://localhost:8000> |
| `task watch` | Watch for changes and auto-compile |
| `task build` | Build for production |
| `task clean` | Clean build directory |
| `task setup` | Install development tools |
| `task help` | Show all available commands |

## Customization

### Styling
- Edit `build/style.css` for colors, fonts, layout
- Dark/light themes defined in CSS custom properties

### Content
- Replace story content in `src/main.ink`
- Update `build/modals/` for credits/warnings
- Modify `build/index.html` for title, metadata

### Features
- Save system: Edit `main.js` save/load functions
- Navigation: Modify `build/index.html` top nav
- Modal content: Update `build/modals/` HTML files

## New to Ink?

If you're new to Ink scripting language:
- [Official Ink Tutorial](https://www.inklestudios.com/ink/web-tutorial/)
- [Ink Language Guide](https://github.com/inkle/ink/blob/master/Documentation/WritingWithInk.md)
- [Download Inky Editor](https://github.com/inkle/inky/releases)


## Technical Details

### Dependencies

- **Ink**: Narrative scripting language by Inkle
- **inkjs**: JavaScript runtime for Ink stories
- **inklecate**: Ink compiler (auto-downloaded)
- **Task**: Build automation tool

### Browser Compatibility

- **Modern browsers** (Chrome 60+, Firefox 55+, Safari 11+, Edge 79+)
- **Mobile support** with responsive touch-friendly interface
- **Local storage** for save games (falls back gracefully if disabled)
- **No server required** - works as static files

## Deployment

### Local Build

```bash
task build
```

Outputs production-ready files to `build/` directory.

### Web Deployment

The `build/` directory contains a complete static website that can be deployed anywhere.

Simply upload the contents of `build/` to your web host.

### Deploy Options
- **GitHub Pages**: Push `build/` contents to `gh-pages` branch
- **Netlify**: Drag and drop `build/` folder 
- **itch.io**: Zip `build/` contents and upload as HTML game
- **Any web host**: Upload `build/` contents via FTP

## License

This template is provided as-is under the MIT License. You are free to use, modify, and distribute it for personal or commercial use. See the [LICENSE](LICENSE) file for full details.
