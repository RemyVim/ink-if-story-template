---
layout: default
title: Styling
description: 'Customize colors, fonts, and appearance of your Ink interactive fiction story.'
---
# Styling

Customize your story's appearance with custom CSS classes and theme overrides.

## Where to Put Your Styles

The template includes two CSS files:

| File | Purpose |
|------|---------|
| `css/template.min.css` | Core template styles (minified, don't edit) |
| `css/custom.css` | **Your customizations go here** |

`custom.css` loads after the template styles, so anything you define there overrides the defaults. The file includes commented examples for common customizations like colors and fonts.

## Custom Classes

Apply CSS classes to specific paragraphs using the `CLASS` tag:

```ink
# CLASS: dramatic
The door slammed shut behind you.
```

**Aliases:** `# CSS:`, `# CSS_CLASS:`, `# STYLE:`

This adds the `dramatic` class to that paragraph. Define the style in `css/custom.css`:

```css
.dramatic {
  color: red;
  font-weight: bold;
  text-shadow: 2px 2px 4px black;
}
```

You can apply multiple classes by using multiple tags:

```ink
# CLASS: dramatic
# CLASS: shaky
The world trembled around you.
```

## CSS Variables

The template uses CSS custom properties (variables) for theming. It has a two-tier variable system:

1. **Palette variables** — raw colors (`--palette-gray-200`, `--palette-accent`, etc.)
2. **Semantic variables** — what things look like (`--color-background`, `--color-text-primary`, etc.)

Override these in `css/custom.css`. The file includes all available variables as commented examples.

**Example: Adding an accent color**

The default theme is monochrome. To add color to links and buttons:

```css
:root {
  /* Define your accent palette */
  --palette-accent: #0d9488;
  --palette-accent-light: #5eead4;
  --palette-accent-dark: #115e59;
  
  /* Use dark variant for light theme */
  --color-accent-primary: var(--palette-accent-dark);
  --color-accent-secondary: var(--palette-accent);
}

html.dark body,
body.dark {
  /* Use light variant for dark theme */
  --color-accent-primary: var(--palette-accent-light);
  --color-accent-secondary: var(--palette-accent);
}
```

See `css/custom.css` for a full list of available variables with more examples.

## Accessibility Note

The template's default colors meet WCAG AA contrast standards (4.5:1 ratio for text). When customizing your color scheme, check that your choices maintain good contrast for readers with low vision.

Helpful tools:

- [WAVE Browser Extension](https://wave.webaim.org/extension/) — checks contrast and other accessibility issues directly on your page
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) — test specific color pairs

**Tip:** Test both light and dark themes. A color that works well on a light background may not have enough contrast on dark (and vice versa).

## Screen Commands

These tags control the display:

| Tag | Effect | Aliases |
|-----|--------|---------|
| `# CLEAR` | Clears all text from the screen | — |
| `# RESTART` | Restarts the story from the beginning | `RESET`, `NEW_GAME` |

## Tips

- For inline text styling (bold, italic, highlights), see [Text Formatting](text-formatting.md).
- Changes to `custom.css` take effect immediately on page refresh — no build step needed.

---

**Questions?** [Open an issue](https://github.com/RemyVim/ink-if-story-template/issues) on GitHub.
