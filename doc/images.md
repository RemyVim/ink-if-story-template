# Images

Display images inline with your story text, or set a background image for atmosphere.

## Inline Images

The `IMAGE` tag displays an inline image wherever the tag is placed:

```ink
# IMAGE: assets/forest.jpg
# IMAGE: assets/portrait.png left 40%
# IMAGE: assets/map.png "Map of the kingdom"
# IMAGE: assets/diagram.png center caption "Figure 1: System overview"
```

Optional parameters are:

| Option | Values | Description |
|--------|--------|-------------|
| alignment | `left`, `right`, `center` | Image position. Left/right wraps text around the image. Defaults to `center`. |
| width | `%`, `px`, `em`, `rem`, `vw` | Image width. Defaults to natural size (max 100% of text area). |
| `"alt text"` | Any text in quotes | Describes the image for screen readers (accessibility). |
| `caption` | Keyword | Displays the alt text as a visible caption below the image. |

The parameters for this tag are all optional and placement-agnostic: you can put them in any order you want.

**Examples:**

- `# IMAGE: map.jpg` — Centered, natural size
- `# IMAGE: portrait.png left 40%` — Floated left at 40% width
- `# IMAGE: hero.png "A hero on a cliff"` — With alt text for screen readers
- `# IMAGE: diagram.png caption "System diagram"` — With visible caption

## Background Images

```ink
# BACKGROUND: assets/castle-backdrop.jpg
```

Sets a background image. Use `# BACKGROUND: none` to remove.

## Tips

- **Supported formats:** JPG, PNG, GIF, WebP. Use JPG for photos, PNG for graphics with transparency.
- **File location:** Put image files in `build/assets/`. (Not required, all paths are relative to the build directory, but it keeps everything organized!)

---

Need help with something else? Check out the rest of the docs:

- Quick start: [doc/quickstart.md](quickstart.md)
- Text formatting: [doc/text-formatting.md](text-formatting.md)
- Choices: [doc/choices.md](choices.md)
- Images: [doc/images.md](images.md)
- Audio: [doc/audio.md](audio.md)
- User Input: [doc/user-input.md](user-input.md)
- Notifications: [doc/notifications.md](notifications.md)
- Special pages: [doc/special-pages.md](special-pages.md)
- Ink functions: [doc/functions.md](functions.md)
- Styling: [doc/styling.md](styling.md)
- Special tags: [doc/special-tags.md](special-tags.md)
- Keyboard shortcuts: [doc/keyboard-shortcuts.md](keyboard-shortcuts.md)

**Still need help?** Check the community resources in the main [README.md](../README.md) or open an issue on the GitHub repository.
