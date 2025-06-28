# Special Tags Guide

Add media, effects, and special functionality to your Ink story using simple tags.

## Story Metadata

Add these tags at the top of your main `.ink` file:

```ink
# title: Your Story Title
# author: Your Name
```

The `title` and `author` both appear in the navigation bar.

## User Interaction Tags

```ink
# USER_INPUT: your_variable
Your placeholder text.
```

Displays a user input form with the specified placeholder text and fills the Ink variable named `your_variable` with text the user inputs.

Note: If you want the placeholder to be blank you must call this tag with a `[]` line afterwards:

```ink
# USER_INPUT: your_variable
[]
```

## Media Tags

### Images

```ink
# IMAGE: assets/forest.jpg
```

Displays an image at the top of the story page.

### Audio

```ink
# AUDIO: assets/sword-clang.mp3
```

Plays a sound effect once.

### Background Music

```ink
# AUDIOLOOP: assets/tavern-music.mp3
```

Loops background music. Use `# AUDIOLOOP: none` to stop.

### Background Images

```ink
# BACKGROUND: assets/castle-backdrop.jpg
```

Sets a background image. Use `# BACKGROUND: none` to remove.

**File Organization:** Put media files in the `build/assets/` folder.

## Notifications

Show messages to players without interrupting story flow:

```ink
# NOTIFICATION: You found a secret passage.
# ACHIEVEMENT: Quest Complete!
# WARNING: Your health is low.
# ERROR: Something went wrong.
```

- `NOTIFICATION`: Info message
- `ACHIEVEMENT`: Success message (stays longer)
- `WARNING`: Warning message  
- `ERROR`: Error message

## Special Pages

Create reference pages outside your main story:

```ink
=== character_sheet ===
# SPECIAL_PAGE: Character Info

: Your Character

**Name:** Alice
**Level:** 5
**Health:** 100/100

-> DONE

=== credits ===
# SPECIAL_PAGE: Credits

: About This Game

Created by Your Name
Music by Composer Name

-> DONE
```

- Pages automatically appear in the navigation bar.
- Use `# SPECIAL_PAGE: Custom Name` to set the display name.
- Always end with `-> DONE`.
- An auto-generated button allows players to return where they left off in the story.

## Styling and Effects

### Custom CSS Classes

```ink
# CLASS: dramatic
This text will have the "dramatic" CSS class applied.
```

Add styling in `build/css/style.css`:

```css
.dramatic {
  color: red;
  font-weight: bold;
  text-shadow: 2px 2px 4px black;
}
```

### Screen Control

```ink
# CLEAR
# RESTART
```

- `CLEAR`: Clears the screen
- `RESTART`: Restarts the entire story

## Tag Usage Tips

**Placement:** Tags affect the paragraph they're attached to:

```ink
# IMAGE: forest.jpg
You enter a dark forest.
```

**Multiple tags:** Combine effects:

```ink
# AUDIO: thunder.mp3
# CLASS: scary
Lightning flashes overhead!
```

**Timing:** Audio and notifications trigger when the text appears.

**File paths:** Relative to the `build/` folder. Use forward slashes on all platforms.

## Quick Reference

| Tag | Purpose | Example |
|-----|---------|---------|
| `# title:` | Story title | `# title: My Adventure` |
| `# author:` | Story author | `# author: Jane Doe` |
| `# IMAGE:` | Show image | `# IMAGE: assets/map.jpg` |
| `# AUDIO:` | Play sound | `# AUDIO: assets/bell.mp3` |
| `# AUDIOLOOP:` | Loop music | `# AUDIOLOOP: assets/song.mp3` |
| `# BACKGROUND:` | Set backdrop | `# BACKGROUND: assets/sky.jpg` |
| `# NOTIFICATION:` | Info message | `# NOTIFICATION: Found item!` |
| `# ACHIEVEMENT:` | Success message | `# ACHIEVEMENT: Level up!` |
| `# SPECIAL_PAGE:` | Reference page | `# SPECIAL_PAGE: Stats` |
| `# CLASS:` | Custom styling | `# CLASS: highlight` |
| `# CLEAR` | Clear screen | `# CLEAR` |
| `# RESTART` | Restart story | `# RESTART` |

Need help with text formatting? Check out [doc/text-formatting.md](text-formatting.md).
