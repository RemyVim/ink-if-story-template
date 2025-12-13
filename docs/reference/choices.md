---
layout: default
title: Choices
description: >-
  Customize how choices appear in your Ink story—tone indicators, numbering, and
  disabled options.
---
# Choices

Customize how choices appear and behave for your readers.

## Keyboard Hints

On devices with keyboards, choices display number hints (1, 2, 3...) so readers can select them by pressing keys. You can control this behavior:

```ink
# CHOICE_NUMBERS: auto
```

**Aliases**: `# CHOICE_NUMBERS`, `# CHOICE_NUMBERING`, `# KEYBOARD_HINTS`

| Value | Behavior |
|-------|----------|
| `auto` | Show hints on keyboard devices only (default) |
| `on` | Always show hints (regardless of device type) |
| `off` | Never show hints |

**Tip:** Readers can override this setting in the Settings menu under "Accessibility" → "Choice Number Hints". If you're testing and don't see the expected behavior, click "Reset to Defaults" in the Settings menu. This will restore your `# CHOICE_NUMBERS:` tag setting as the active preference.

## Tone Indicators

Show small icons next to choices to hint at their tone or consequences—like whether a response is flirty, aggressive, or risky.

### Setup

Add this tag to the top of your main `.ink` file to enable tone indicators globally (readers can override this in settings):

```ink
# TONE_INDICATORS: on
```

**Aliases:** `# SHOW_TONES`

| Value | Behavior |
|-------|----------|
| `on` | Tone indicators enabled by default, readers can opt-out in settings |
| `off` | Tone indicators enabled but readers have to opt-in in settings |

Then at the top of your main `.ink` file, define your custom choice tags and associated icons:

```ink
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

To force all icons to appear after the text instead, add this to your story header:

```ink
# TONE_TRAILING
```

**Aliases:** `# TRAILING_TONES`

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

## Disabled Choices

Show a choice that readers can see but can't select. Useful for showing locked options or requirements not yet met.

```ink
+ [Enter the castle # UNCLICKABLE]
+ [Take the forest path]
```

The disabled choice appears greyed out and can't be clicked.

**Aliases:** `# UNCLICKABLE`, `# DISABLED`, `# DISABLE`

**Tip:** Combine with conditional text to explain why:

```ink
+ {has_key} [Enter the castle]
+ {not has_key} [Enter the castle (need key) # DISABLED]
```

---

**Questions?** [Open an issue](https://github.com/RemyVim/ink-if-story-template/issues) on GitHub.
