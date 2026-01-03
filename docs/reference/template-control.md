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
| `# AUTOCLEAR:` | Clear screen on each choice (`on`/`off`) | `AUTO_CLEAR` |
| `# CLEAR` | Clear screen once (one-time) | — |
| `# MAX_HISTORY:` | Limit saved history size (saves optimization) | `HISTORY_LIMIT` |
| `# RESTART` | Restart story from beginning | `RESET`, `NEW_GAME` |
| `RESTART()` | Restart story (shows confirmation) | — |
| `OPEN_SAVES()` | Open save/load menu | — |
| `OPEN_SETTINGS()` | Open settings menu | — |
| `OPEN_PAGE(knotName)` | Open a special page | — |

### Debug Functions

| Function | Description | Output |
|----------|-------------|--------|
| `DEBUG_LOG(message)` | Print to browser console | `[INK DEBUG] message` |
| `DEBUG_WARN(message)` | Print warning to console | `[INK WARNING] message` |

## Display Control

### Display Modes

By default, the template uses **continuous display**: when the reader makes a choice, old content stays on screen and new content appears below—just like Inky's preview panel and web export.

You can switch to **auto-clear mode** where the screen clears with each choice, or mix both modes throughout your story.

### AUTOCLEAR

Controls how content behaves when the reader makes a choice.

```ink
# AUTOCLEAR: on
// Screen clears on every choice from now on (until turned off)

# AUTOCLEAR: off  
// Back to continuous display (default)
```

**Alias:** `# AUTO_CLEAR:`

The setting persists until changed. Use this to switch modes mid-story. For example, auto-clear during fast-paced action, continuous display during dialogue-heavy scenes.

### CLEAR

Clears all text from the screen once, without changing the display mode. (Although it is only really useful in continuous display mode.)

```ink
The world begins to fade...

* [Close your eyes]
    # CLEAR
    You wake up somewhere new.
```

Use `# CLEAR` for scene transitions, chapter breaks, dramatic pauses, "meanwhile, elsewhere..." moments, etc.

### MAX_HISTORY

In continuous display mode, the template saves your display history so it can restore exactly what the reader was seeing when they load a save. This works great for most stories.

If you notice your save files are unusually large or slow to load (for very long stories with lots of content accumulation), you can use `# MAX_HISTORY:` as a **global tag** to limit how many content elements are kept in saves:

```ink
# TITLE: My Epic Saga
# AUTHOR: Jane Smith
# MAX_HISTORY: 200
```

**Alias:** `# HISTORY_LIMIT:`

When the limit is reached, the oldest content is dropped from saved history. This only affects saves—the reader still sees all content on screen until they make a choice or the screen is cleared.

**Note:** Most stories don't need this tag. Only add it if you're experiencing performance issues with saves.

### RESTART

Restarts the story from the beginning. Shows a confirmation dialog so readers don't lose progress accidentally.

Using the tag:

```ink
* [Start over from the beginning]
  # RESTART
```

**Aliases:** `# RESET`, `# NEW_GAME`

Using the function:

```ink
EXTERNAL RESTART()

+ [Start a new game]
  ~ RESTART()
```

Both behave identically, use whichever fits your story's style.

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
