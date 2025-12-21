---
layout: default
title: Quick Reference
description: >-
  All Ink Story Template features at a glance: tags, text formatting, images,
  audio, stat bars, functions, and keyboard shortcuts.
---
# Quick Reference

Quick reference for all template features. For detailed explanations and examples, follow the links to individual documentation pages.

{% include toc-closed.html %}

## Text Formatting

| Syntax | Result |
|--------|--------|
| `__text__` | **Bold** |
| `_text_` | *Italic* |
| `___text___` | ***Bold italic*** |
| `` `code` `` | `Inline code` |
| `: Header` | H2 header |
| `:: Header` | H3 header |
| `::: Header` | H4 header |
| `> item` | Bullet point |
| `>> text` | Block quote |
| `[text](url)` | Link |
| `[text](class)` | Styled span |
| `[---]` | Horizontal line |
| `%_` | Escape (literal `_`) |

**Built-in style classes:** `highlight` (yellow), `important` (red bold), `quiet` (gray small), `center` (centered)

[Full documentation →](reference/text-formatting.md)

## Special Tags

### Story Metadata

| Tag | Purpose | Reference |
|-----|---------|-----------|
| `# TITLE:` | Story title | [Metadata](reference/metadata.md) |
| `# AUTHOR:` | Story author | [Metadata](reference/metadata.md) |
| `# THEME:` | Default theme (light/dark) | [Metadata](reference/metadata.md) |

### Choices

| Tag | Purpose | Aliases | Reference |
|-----|---------|---------|-----------|
| `# CHOICE_NUMBERS:` | Keyboard hints | `CHOICE_NUMBERING`, `KEYBOARD_HINTS` | [Choices](reference/choices.md) |
| `# TONE:` | Define tone icon | — | [Choices](reference/choices.md) |
| `# TONE_INDICATORS:` | Enable tone icons | `SHOW_TONES` | [Choices](reference/choices.md) |
| `# TONE_TRAILING` | Icons after text | `TRAILING_TONES` | [Choices](reference/choices.md) |
| `# UNCLICKABLE` | Disable choice | `UNCLICKABLE`, `DISABLED`, `DISABLE` | [Choices](reference/choices.md) |

### Content

| Tag | Purpose | Aliases | Reference |
|-----|---------|---------|-----------|
| `# STATBAR:` | Progress bar | `STAT_BAR`, `PROGRESSBAR`, `PROGRESS_BAR` | [Stat Bars](reference/stat-bars.md) |
| `# USER_INPUT:` | Text input | `INPUT`, `PROMPT`, `TEXT_INPUT` | [User Input](reference/user-input.md) |

### Media

| Tag | Purpose | Aliases | Reference |
|-----|---------|---------|-----------|
| `# IMAGE:` | Display image | `IMG`, `PICTURE`, `PIC` | [Images](reference/images.md) |
| `# BACKGROUND:` | Set backdrop | `BG`, `BACKGROUND_IMAGE` | [Images](reference/images.md) |
| `# AUDIO:` | Play sound | `SOUND`, `SFX`, `SOUND_EFFECT` | [Audio](reference/audio.md) |
| `# AUDIOLOOP:` | Loop music | `MUSIC`, `BGM`, `BACKGROUND_MUSIC`, `AUDIO_LOOP` | [Audio](reference/audio.md) |

### Notifications

| Tag | Purpose | Aliases | Reference |
|-----|---------|---------|-----------|
| `# NOTIFICATION:` | Info message | `NOTIFY`, `MESSAGE`, `INFO` | [Notifications](reference/notifications.md) |
| `# ACHIEVEMENT:` | Success message | `SUCCESS` | [Notifications](reference/notifications.md) |
| `# WARNING:` | Warning message | `WARN` | [Notifications](reference/notifications.md) |
| `# ERROR:` | Error message | `ERR` | [Notifications](reference/notifications.md) |

### Pages & Layout

| Tag | Purpose | Aliases | Reference |
|-----|---------|---------|-----------|
| `# SPECIAL_PAGE:` | Reference page | `PAGE` | [Special Pages](reference/special-pages.md) |
| `# PAGE_MENU:` | Menu order | `MENU`, `MENU_ORDER`, `PAGE_ORDER`, `SPECIAL_PAGE_ORDER` | [Special Pages](reference/special-pages.md) |

### Styling

| Tag | Purpose | Aliases | Reference |
|-----|---------|---------|-----------|
| `# CLASS:` | Add CSS class | `CSS`, `CSS_CLASS`, `STYLE` | [Styling](reference/styling.md) |

### Template Control

| Tag/Frunction | Purpose | Aliases | Reference |
|-----|---------|---------|-----------|
| `# CLEAR` | Clear screen | — | [Template Control](reference/template-control.md) |
| `# RESTART` | Restart story | `RESET`, `NEW_GAME` | [Template Control](reference/template-control.md) |
| `RESTART()` | Restart story (with confirmation) | Tag above |  [Template Control](reference/template-control.md) |
| `OPEN_SAVES()` | Open the save/load menu | - | [Template Control](reference/template-control.md) |
| `OPEN_SETTINGS()` | Open the settings menu | - | [Template Control](reference/template-control.md) |
| `OPEN_PAGE(knotName)` | Open a special page by knot name | - | [Template Control](reference/template-control.md) |

### Debug

| Tag/Function | Purpose | Aliases | Reference |
|-----|---------|---------|-----------|
| `DEBUG_LOG()` | Console log | — | [Template Control](reference/template-control.md) |
| `DEBUG_WARN()` | Console warning | — | [Template Control](reference/template-control.md) |

### Tag Tips

* These tags are processed by the template, not by Ink itself. You won't see any effect in the Inky editor. They only work when you run your story in the browser.

* Tags are case-insensitive. `# IMAGE:`, `# Image:`, `# image:` and even `# ImAgE` are all equivalent.

* Combine effects on the same line:

```ink
# AUDIO: thunder.mp3
# CLASS: scary
Lightning flashes overhead!
```

* Audio and notifications trigger when the text appears.

* All file paths are relative to the template folder. Use forward slashes on all platforms.

## Functions

Declare once at the top of your `.ink` file with `EXTERNAL`, then use anywhere.

### String

| Function | Example |
|----------|---------|
| `UPPERCASE(str)` | `"hello"` → `"HELLO"` |
| `LOWERCASE(str)` | `"HELLO"` → `"hello"` |
| `CAPITALIZE(str)` | `"john"` → `"John"` |
| `TRIM(str)` | `"  hi  "` → `"hi"` |
| `LENGTH(str)` | `"hello"` → `5` |
| `CONTAINS(str, search)` | `"hello", "ell"` → `true` |
| `STARTS_WITH(str, search)` | `"hello", "he"` → `true` |
| `ENDS_WITH(str, search)` | `"hello", "lo"` → `true` |
| `REPLACE(str, old, new)` | `"hello", "l", "L"` → `"heLlo"` |
| `REPLACE_ALL(str, old, new)` | `"hello", "l", "L"` → `"heLLo"` |

### Math

| Function | Example |
|----------|---------|
| `ROUND(x)` | `3.7` → `4` |
| `CLAMP(x, min, max)` | `150, 0, 100` → `100` |
| `ABS(x)` | `-5` → `5` |
| `PERCENT(value, total)` | `25, 200` → `13` |

### Fairmath

| Function | Description |
|----------|-------------|
| `FAIRADD(stat, percent)` | Add with diminishing returns near 100 |
| `FAIRSUB(stat, percent)` | Subtract with diminishing returns near 0 |

### Time

| Function | Example |
|----------|---------|
| `NOW()` | Current Unix timestamp |
| `SECONDS_SINCE(start)` | Seconds elapsed |
| `MINUTES_SINCE(start)` | Minutes elapsed |
| `TIME_SINCE(start)` | `"5 minutes"` |
| `FORMAT_DATE(ts, locale)` | `"November 26, 2025"` |
| `FORMAT_TIME(ts, locale)` | `"3:45 PM"` |
| `FORMAT_DATETIME(ts, locale)` | `"November 26, 2025, 3:45 PM"` |
| `OFFSET_DATE(ts, y, mo, d, h, mi)` | Add/subtract from timestamp |

[Full documentation →](reference/functions.md)

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1` - `9` | Select choice 1-9 |
| `A` - `Z` | Select choice 10+ |
| `↑` / `↓` | Scroll (small) |
| `Page Up` / `Page Down` | Scroll (large) |
| `Home` / `End` | Jump to top/bottom |
| `Ctrl+S` | Save menu |
| `Ctrl+R` | Restart story |
| `Ctrl+,` | Settings |
| `Ctrl+H` | Keyboard help |
| `Esc` | Close menu |

On Mac, use `Cmd` instead of `Ctrl`.

[Full documentation →](reference/keyboard-shortcuts.md)

## Reader Settings

These are controlled by readers in the Settings menu:

* **Theme:** Light, dark, or auto (system preference)
* **Font:** Serif, sans-serif, monospace, or dyslexia-friendly
* **Text size:** Small, medium, large, extra-large
* **Line height:** Tight, normal, loose
* **Autosave:** On/off
* **Animations:** On/off
* **Keyboard shortcuts:** On/off
* **Tone indicators:** On/off (if your story uses them)
* **Choice number hints:** Auto, on, or off
