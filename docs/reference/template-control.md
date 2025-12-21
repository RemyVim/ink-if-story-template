---
layout: default
title: Template Control
description: >-
  Control the template from your Ink story: debug logging, clear screen,
  restart, and more.
---
# Template Control

Control the template directly from your Ink story. Clear the screen, restart the story and debug your variables.

{% include toc-closed.html %}

## Quick Reference

### Display control

| Tag/Function | Effect | Aliases |
|-----|--------|---------|
| `# CLEAR` | Clears all text from the screen | — |
| `# RESTART` | Restarts the story from the beginning | `RESET`, `NEW_GAME` |
| `RESTART()` | Restart story (with confirmation) | Tag above |
| `OPEN_SAVES()` | Open the save/load menu | - |
| `OPEN_SETTINGS()` | Open the settings menu | - |
| `OPEN_PAGE(knotName)` | Open a special page by knot name | - |

### Debug Functions

| Function | Description | Output |
|----------|-------------|--------|
| `DEBUG_LOG(message)` | Print to browser console | `[INK DEBUG] message` |
| `DEBUG_WARN(message)` | Print warning to console | `[INK WARNING] message` |

## Display Control

### CLEAR

<!-- TODO: Update once this is fixed and continuous display is reimplemented -->

Removes all text from the screen. Useful for scene transitions or dramatic moments.

```ink
* [The world fades to black...]
    # CLEAR

- You wake up somewhere new.
```

### RESTART

Triggers a story restart with confirmation dialog. The reader will be asked to confirm before losing progress.

Using the tag:

```ink
* [Start over from the beginning]
  # RESTART
```

**Aliases:** `# RESET`, `# NEW_GAME`

Using the function (Same behavior as the `# RESTART` tag, but as a function).

```ink
EXTERNAL RESTART()

+ [Start a new game]
  ~ RESTART()
```

## Opening Menus

Open the template's built-in menus from your story.

### OPEN_SAVES

Opens the save/load menu. Useful for "point of no return" moments.

```ink
EXTERNAL OPEN_SAVES()

This choice cannot be undone.

+ [Save first]
  ~ OPEN_SAVES()
  -> continue_story
+ [I'm ready]
  -> point_of_no_return
```

### OPEN_SETTINGS

Opens the settings menu. Useful for accessibility reminders.

```ink
EXTERNAL OPEN_SETTINGS()

The next section contains audio.

+ [Adjust audio settings]
  ~ OPEN_SETTINGS()
  -> audio_scene
+ [Continue]
  -> audio_scene
```

## Opening Special Pages

Navigate to special pages programmatically from your story.

### Usage

Pass the **knot name** (not the display name):

```ink
EXTERNAL OPEN_PAGE(knotName)

=== inventory ===
# SPECIAL_PAGE: Your Inventory
...
-> DONE

=== some_scene ===
Before entering the dungeon, you should check your supplies.

+ [Check inventory]
  ~ OPEN_PAGE("inventory")
+ [Enter the dungeon]
  -> dungeon_entrance
```

### Dynamic Pages

Since it's a function, you can use variables:

```ink
VAR current_hint_page = ""

=== chapter_1 ===
~ current_hint_page = "hints_ch1"
...

=== show_hint ===
~ OPEN_PAGE(current_hint_page)
```

### Error Handling

If the page doesn't exist, a warning is logged to the browser console (F12 > Console) and nothing happens. The story continues normally.

## Debug Functions

Print messages to your browser's developer console (F12 > Console tab). Useful for tracking story flow and inspecting variable values during development.

### Setup

Declare the functions at the top of your main `.ink` file:

```ink
EXTERNAL DEBUG_LOG(message)
EXTERNAL DEBUG_WARN(message)
```

### Basic Usage

```ink
~ DEBUG_LOG("Player entered the forest")
~ DEBUG_WARN("This path is not fully written yet")
```

### Inspecting Variables

Combine with Ink's string interpolation to log variable values:

```ink
VAR health = 75
VAR player_name = "Alex"

~ DEBUG_LOG("Player name: {player_name}")
~ DEBUG_LOG("Current health: {health}")
~ DEBUG_WARN("Health is getting low: {health}")
```

## Tips

- Tags and debug functions are processed by the template, not Ink—you won't see effects in Inky's preview. See [local testing](../guides/local-testing.md).
- Debug output only appears in the browser console—readers won't see it in the story.
- Use `DEBUG_WARN` for issues needing attention (yellow/orange in console).
- Debug functions return `0`, so they won't affect story logic.
- Remove debug calls before publishing, or leave them—they're invisible to readers.

## Troubleshooting

**Tag or function doesn't work in Inky?**

Tags are processed by the template at runtime. Test in browser using [local testing](../guides/local-testing.md).

**Nothing appears in console?**

- Make sure you declared the `EXTERNAL` functions in your Ink file
- Check that your story is running in the browser, not Inky
- Open the browser console: F12 (or Ctrl+Shift+I), then click "Console"
- Make sure your console doesn't have filters suppressing info and warning level logs

**"Missing function binding" error?**

- Spelling must match exactly: `DEBUG_LOG` and `DEBUG_WARN` (all uppercase)
