---
layout: default
title: Story Metadata
description: 'Set your story''s title, author, and default theme.'
---
# Story Metadata

Configure your story's basic information with global tags at the top of your main `.ink` file.

## Title and Author

```ink
# TITLE: The Mysterious Manor
# AUTHOR: Jane Smith
```

These are displayed in the template's header. While not strictly required, your story will look incomplete without them.

## Default Theme

```ink
# THEME: dark
```

| Value | Effect |
|-------|--------|
| `light` | Light background, dark text |
| `dark` | Dark background, light text |
| *(omit tag)* | Follow reader's system preference |

The theme tag sets the *default* appearance. Readers can always override this in the Settings menu, and their preference is saved for future visits.

**Tip:** If you want your story to respect the reader's system preference (light/dark mode), simply don't include the `# THEME:` tag.
