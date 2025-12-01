# Special Tags Guide

Add media, effects, and special functionality to your Ink story using simple tags.

## Quick Reference

| Tag | Purpose | Documentation |
|-----|---------|---------|
| `# ACHIEVEMENT:` | Success message | [doc/notifications.md](notifications.md) |
| `# AUDIO:` | Play sound | [doc/audio.md](audio.md) |
| `# AUDIOLOOP:` | Loop music | [doc/audio.md](audio.md) |
| `# AUTHOR:` | Story author | [doc/quickstart.md](quickstart.md) |
| `# BACKGROUND:` | Set backdrop | [doc/images.md](images.md) |
| `# CHOICE_NUMBERS:` | Choice hints | [doc/choices.md](choices.md) |
| `# CLASS:` | Custom styling | [doc/styling.md](styling.md) |
| `# CLEAR` | Clear screen | [doc/styling.md](styling.md) |
| `# IMAGE:` | Show image | [doc/images.md](images.md) |
| `# NOTIFICATION:` | Info message | [doc/notifications.md](notifications.md) |
| `# RESTART` | Restart story | [doc/styling.md](styling.md) |
| `# SPECIAL_PAGE:` | Reference page | [doc/special-pages.md](special-pages.md) |
| `# STATBAR:` | Progress bar | [doc/stat-bars.md](stat-bars.md) |
| `# TITLE:` | Story title | [doc/quickstart.md](quickstart.md) |
| `# TONE:` | Define tone icon | [doc/choices.md](choices.md) |
| `# TONE_INDICATORS:` | Enable tone icons | [doc/choices.md](choices.md) |
| `# TONE_TRAILING` | All tone icons trail after choice text | [doc/choices.md](choices.md) |

## Tag Usage Tips

**Placement:** Tags can affect the paragraph they're attached to:

```ink
# USER_INPUT: your_variable
Your placeholder text.
```

**Multiple tags:** Combine effects:

```ink
# AUDIO: thunder.mp3
# CLASS: scary
Lightning flashes overhead!
```

**Timing:** Audio and notifications trigger when the text appears.

**File paths:** All paths are relative to the `build/` folder. Use forward slashes on all platforms.

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
- Stat bars: [doc/stat-bars.md](stat-bars.md)
- Styling: [doc/styling.md](styling.md)
- Special tags: [doc/special-tags.md](special-tags.md)
- Keyboard shortcuts: [doc/keyboard-shortcuts.md](keyboard-shortcuts.md)

**Still need help?** Check the community resources in the main [README.md](../README.md) or open an issue on the GitHub repository.
