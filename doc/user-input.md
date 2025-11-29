# User Input

Let players type their own text (like a character name) and store it in an Ink variable.

## Basic Usage

```ink
VAR player_name = ""

# USER_INPUT: player_name
Enter your name...
```

This displays a text field with "Enter your name..." as placeholder text. When the player submits, their input is stored in `player_name`.

You can then use it anywhere:

```ink
Hello, {player_name}! Welcome to the adventure.
```

## Blank Placeholder

If you want an empty text field with no placeholder:

```ink
# USER_INPUT: player_name
[]
```

## Tips

- The variable must be declared (`VAR`) before using `USER_INPUT`.
- Input is stored as a string. Use `{player_name}` to display it.

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
