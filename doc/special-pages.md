# Special Pages

Create reference pages outside your main story:

```ink
=== character_sheet ===
# SPECIAL_PAGE: Character Info

: Your Character

__Name:__ Alice
__Level:__ 5
__Health:__ 100/100

-> DONE

=== inventory ===
# SPECIAL_PAGE

: Your Inventory

> 5 apples
> 1 chainsaw

-> DONE

=== credits ===
# SPECIAL_PAGE

: About This Game

Created by Your Name
Music by Composer Name

-> DONE
```

- Use `# SPECIAL_PAGE` to mark page as reference. (The display name will be automatically derived from the knot name.)
- Use `# SPECIAL_PAGE: Custom Name` to set the display name.
- Always end with `-> DONE`.
- An auto-generated button allows players to return where they left off in the story.

Special pages automatically appear in the navigation menu in alphabetical order (by page name, not by knot name). You can override the order in the menu via another special tag:

```ink
# PAGE_MENU: character_sheet, inventory, relationships,, credits, content_warnings
```

- Use the knot name in the `PAGE_MENU` list.
- `,,` indicates a section separator in the menu.
- Any special pages that are not in the `PAGE_MENU` list are added to their own section below, ordered alphabetically.

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
