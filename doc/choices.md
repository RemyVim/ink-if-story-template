# Choices

Customize how choices appear and behave for your readers.

## Keyboard Hints

On devices with keyboards, choices display number hints (1, 2, 3...) so readers can select them by pressing keys. You can control this behavior:

```ink
# CHOICE_NUMBERS: auto
```

| Value | Behavior |
|-------|----------|
| `auto` | Show hints on keyboard devices only (default) |
| `on` | Always show hints |
| `off` | Never show hints |

## Tone Indicators

Show small icons next to choices to hint at their tone or consequences—like whether a response is flirty, aggressive, or risky.

### Setup

Add these tags at the top of your main `.ink` file:

```ink
# TONE_INDICATORS: on
# TONE: flirty 🔥
# TONE: shy 💜
# TONE: bold ⚡
# TONE: danger warning
```

The format is `# TONE: label icon` where:

- **label** is the tag name you'll use on choices
- **icon** is an emoji or a [Material Icon](https://fonts.google.com/icons) name (like `favorite`, `warning`, `star`)

**Accessibility note:** Tone indicator labels are read aloud by screen readers. Choose descriptive names like "warning", "flirty", "serious" rather than abstract icon names like "star_border".

### Tagging Choices

```ink
+ Lean in closer # flirty
```

In choices with brackets, add tone tags **inside or before** the brackets:

```ink
+ [Lean in closer # flirty]
+ #shy [Step back nervously]
+ [Go all in # bold # danger]
```

**Important:** Tags *after* the closing bracket won't work. In Ink, anything after `]` becomes part of the result text (what appears after clicking), not the choice itself. Tags follow the same rule.

```ink
// ✗ Does NOT work (tag applies to result, not choice):
+ [Some choice] #flirty

// ✓ Works (tag before brackets):
+ #flirty [Some choice]

// ✓ Works (tag inside brackets):
+ [Some choice # flirty]
+ [# flirty Some choice]
```

### How Icons Display

By default, the first icon appears before the choice text. Additional icons trail after:

```
🔥 Tell them how you feel ⚡💜
```

To put all icons after the text instead, add this to your story header:

```ink
# TONE_TRAILING
```

### Reader Control

When tone indicators are enabled, readers can toggle them off in the Settings menu if they prefer to choose blind.

| Tag | Effect |
|-----|--------|
| `# TONE_INDICATORS: on` | Enabled and visible by default |
| `# TONE_INDICATORS: off` | Enabled but hidden by default (reader can turn on) |
| `# TONE_TRAILING` | All icons appear after the choice text |

### Example

```ink
# TONE_INDICATORS: on
# TONE: flirty 🔥
# TONE: shy 💜
# TONE: end_romance 💔

=== romance_scene ===
How do you respond?

+ [Lean in and whisper # flirty]
  -> flirty_response
+ [Blush and look away # shy]
  -> shy_response  
+ [We should just be friends # end_romance]
  -> friendship_path
+ [Say nothing]
  -> silent_response
```

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
