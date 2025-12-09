---
layout: default
title: Text Formatting
description: >-
  Bold, italic, headers, lists, and other text formatting options for your Ink
  story.
---
# Text Formatting Guide

Style your story text directly in Ink using markdown-like syntax. The template automatically processes these formatting marks when your story displays.

> **Note:** This formatting is processed by the template, not by Ink itself. You won't see bold, italics, or headers in the Inky editor. They only appear when you run your story in the browser.

## Basic Formatting

### Bold and Italic

```ink
This is __bold text__ with double underscores.
This is _italic text_ with single underscores.
This is ___bold and italic___ with triple underscores.
```

### Headers

Start lines with colons to create headers:

```ink
: Large Header (H2)
:: Medium Header (H3)
::: Small Header (H4)
```

### Lists and Quotes

Start lines with greater-than signs to create bullet lists or block quotes:

```ink
> First bullet point
> Second bullet point
> Third bullet point

>> "This creates a styled block quote for dialogue or emphasis."
```

### Links and Styling

```ink
[Visit Google](google.com)           // External link
[Internal page](/about)              // Internal link

[highlighted text](highlight)        // Yellow highlight
[important note](important)          // Red, bold text
[quiet aside](quiet)                 // Gray, smaller text
[centered](center)                   // Centered text
```

**Note:** Don't include `https://` in URLs since Ink treats `//` as comments.

### Code and Separators

```ink
Use `inline code` for technical terms.

[---]  // Creates a horizontal line
```

### Line Breaks

End a line with two spaces for manual breaks:

```ink
First line.  
Second line immediately below.
```

## Advanced Features

### Custom Inline Styles

Define your own CSS classes and use them:

```ink
[special text](your-custom-class)
```

Add the styling in `css/custom.css`:

```css
.inline-your-custom-class {
  color: purple;
  font-weight: bold;
}
```

For related information on custom classes and themes, see [Styling](styling.md).

### Escaping Characters

Use `%` to display formatting characters literally:

```ink
this %_%_won't be bold%_%_       // Shows: this __won't be bold__
this %`won't be code%`               // Shows: this `won't be code`
%> this won't be a bullet point     // Shows: > this won't be a bullet point
```

Start a line with `%` to disable all formatting:

```ink
% This entire line __won't__ be _processed_ at `all`.
```

## Quick Reference

| Syntax | Result | Example |
|--------|--------|---------|
| `__text__` | **Bold** | `__important__` |
| `_text_` | *Italic* | `_emphasis_` |
| `___text___` | ***Bold italic*** | `___very important___` |
| `` `text` `` | `Code` | `` `variable` `` |
| `: text` | Large header | `: Chapter 1` |
| `:: text` | Medium header | `:: Section A` |
| `::: text` | Small header | `::: Subsection` |
| `> text` | • Bullet point | `> First item` |
| `>> text` | Block quote | `>> "Hello there"` |
| `[text](target)` | Link or style | `[Google](google.com)` |
| `[---]` | Horizontal line | `[---]` |
| `%` | Escape character | `%__not bold%__` |

## Tips

- Test formatting in your browser as you write.
- Keep it simple: too much formatting can distract from your story.
- Use headers to break up long sections.
- Custom styles let you create unique text effects for your story's atmosphere.

---

**Questions?** [Open an issue](https://github.com/RemyVim/ink-if-story-template/issues) on GitHub.
