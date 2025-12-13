---
layout: default
title: Special Pages
description: >-
  Create separate pages for character sheets, codex entries, and reference
  material in your Ink story.
---
# Special Pages

Create reference pages outside your main story by adding a tag below a knot:

```ink
=== character_sheet ===
# SPECIAL_PAGE: Character Info
```

**Aliases:** `# PAGE:`

Knots marked in this way live outside the main story flow but can still access and display story variables.

## Examples

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

- Use `# SPECIAL_PAGE` to mark a knot as a reference page. (The display name will be automatically derived from the knot name.)
- Use `# SPECIAL_PAGE: Custom Name` to set the display name manually.
- Always end with `-> DONE`.
- An auto-generated button allows players to return where they left off in the story.

## Special Page Menu Order

Special pages automatically appear in the navigation menu in alphabetical order (by page name, not by knot name). You can override the order in the menu via another special tag which you can add to the top of your main `.ink` file:

```ink
# PAGE_MENU: character_sheet, inventory, relationships,, credits, content_warnings
```

**Aliases:** `# MENU:`, `# MENU_ORDER:`, `# PAGE_ORDER:`, `# SPECIAL_PAGE_ORDER:`

- Use the knot name in the `PAGE_MENU` list.
- `,,` indicates a section separator in the menu.
- Any special pages that are not in the `PAGE_MENU` list are added to their own section below, ordered alphabetically.

---

**Questions?** [Open an issue](https://github.com/RemyVim/ink-if-story-template/issues) on GitHub.
