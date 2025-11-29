# Styling

Apply custom CSS classes to paragraphs for visual effects.

## Custom Classes

```ink
# CLASS: dramatic
The door slammed shut behind you.
```

This adds the `dramatic` class to that paragraph. Define the style in `build/css/style.css`:

```css
.dramatic {
  color: red;
  font-weight: bold;
  text-shadow: 2px 2px 4px black;
}
```

## Screen Commands

These tags control the display (not styling, but related):

| Tag | Effect |
|-----|--------|
| `# CLEAR` | Clears all text from the screen |
| `# RESTART` | Restarts the story from the beginning |

## Tips

- You can apply multiple classes: `# CLASS: dramatic` on one line, `# CLASS: shaky` on another.
- For inline text styling (bold, italic, highlights), see [text-formatting.md](text-formatting.md).

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
