---
layout: default
title: Images
description: >-
  Display inline images and background images in your Ink interactive fiction
  story.
---
# Images

Display images inline with your story text, or set a background image for atmosphere.

> **Note:** Images are processed by the template, not by Ink itself. You won't see images in the Inky editor preview pane. They only appear when you run your story in the browser.

## Inline Images

The `IMAGE` tag displays an inline image wherever the tag is placed:

```ink
# IMAGE: assets/forest.jpg
# IMAGE: assets/portrait.png left 40%
# IMAGE: assets/map.png "Map of the kingdom"
# IMAGE: assets/diagram.png center caption "Figure 1: System overview"
```

**Aliases:** `# IMG:`, `# PICTURE:`, `# PIC:`

Optional parameters are:

| Option | Values | Description |
|--------|--------|-------------|
| alignment | `left`, `right`, `center` | Image position. Left/right wraps text around the image. Defaults to `center`. |
| width | `%`, `px`, `em`, `rem`, `vw` | Image width. Defaults to natural size (max 100% of text area). |
| `"alt text"` | Any text in quotes | Describes the image for screen readers (accessibility). |
| `caption` | Keyword | Displays the alt text as a visible caption below the image. |

The parameters for this tag are all optional and placement-agnostic: you can put them in any order you want.

**Examples:**

- `# IMAGE: map.jpg`: Centered, natural size
- `# IMAGE: portrait.png left 40%`: Floated left at 40% width
- `# IMAGE: hero.png "A hero on a cliff"`: With alt text for screen readers
- `# IMAGE: diagram.png caption "System diagram"`: With visible caption

## Background Images

```ink
# BACKGROUND: assets/castle-backdrop.jpg
```

**Aliases:** `# BG:`, `# BACKGROUND_IMAGE:`

Sets a background image. Use `# BACKGROUND: none` to remove.

## Tips

- **Supported formats:** JPG, PNG, GIF, WebP. Use JPG for photos, PNG for graphics with transparency.
- **File location:** Put image files in `assets/`. (Not required, all paths are relative to the template's directory, but it keeps everything organized!)
