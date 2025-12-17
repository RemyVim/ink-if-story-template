---
layout: default
title: Ink Story Template
---
# Ink Story Template

A free, open-source web player for [Ink](https://www.inklestudios.com/ink/) interactive fiction. Write your story in Ink, export to JSON, drop it in, publish anywhere. No coding required.

{% include hero-buttons.html %}

---

## What This Is

Ink is a scripting language for interactive fiction. It handles story logic—branching, variables, conditions—but it doesn't handle presentation. When you compile an Ink story, you get a JSON file. To play that in a browser, you need something to interpret the JSON and display it.

This template does that. It provides:

- A reader interface (text display, choices, menus)
- A save system (5 slots, autosave, file export/import)
- Reader settings (themes, fonts, text size)
- Accessibility features (screen reader support, keyboard navigation)
- Author tools (images, audio, stat bars, special pages, notifications)

You control everything through Ink tags in your story file:

```ink
# TITLE: The Mysterious Manor
# AUTHOR: Your Name

# IMAGE: manor-entrance.jpg
# AUDIO: thunder.mp3

The manor looms before you, lightning illuminating its crumbling spires.

* [Knock on the door]
  # ACHIEVEMENT: No turning back now
  Your knuckles rap against ancient wood...
```

No HTML, CSS, or JavaScript required—although you can customize with `custom.css` and `custom.js` if you want.

---

## How It Works

1. Write your story in Ink (using [Inky](https://github.com/inkle/inky/releases) or any text editor)
2. Export to JSON (In Inky: File > Export to JSON)
3. Replace `story.json` in the template folder with yours
4. Upload the folder to any static host

No build tools, no command line, no dependencies.

{% include workflow-diagram.html %}

---

## Features

| For Readers | For Authors |
|-------------|-------------|
| Save/load with 5 slots, autosave, file export | Text formatting: bold, italic, headers, lists, links |
| Light and dark themes | Images and background images |
| Adjustable text size, line height, and fonts | Sound effects and looping music |
| Dyslexia-friendly font option (OpenDyslexic) | Stat bars for RPG-style stories |
| Keyboard navigation | Special pages: character sheets, maps, credits |
| Screen reader support | Notifications and achievements |
| Works on desktop, tablet, and mobile | Utility functions: string manipulation, math, time/date |

See the [Quick Reference](quick-reference.md) for the complete list, or browse the [Template Reference](reference/metadata.md) for detailed documentation.

---

## Get Started

**New to Ink?**
Start with the [Beginner's Guide](guides/beginner-guide.md). It covers installing Inky, writing your first story, and publishing to itch.io, with screenshots throughout.

**Already know Ink?**
The [Quick Start](quickstart.md) gets you from JSON to published in a few minutes.

**Just need a reference?**
The [Quick Reference](quick-reference.md) lists every tag, function, and feature.

**Have questions?**
Check the [FAQ](faq.md) or [Troubleshooting](troubleshooting.md).

---

<!-- TODO: Add migration guides later
## Coming From Other Tools?

- [Coming from Twine (SugarCube)](guides/coming-from-sugarcube.md)
- [Coming from ChoiceScript](guides/coming-from-choicescript.md)

---
-->

## License

[MIT licensed](https://github.com/RemyVim/ink-if-story-template/blob/main/LICENSE). Use it for free, modify it, sell games made with it. No attribution required.

Open source. [View on GitHub](https://github.com/RemyVim/ink-if-story-template)

---

## Help & Feedback

- [FAQ](faq.md) for common questions answered
- [Troubleshooting](troubleshooting.md) for solutions to common problems
- [Open an issue](https://github.com/RemyVim/ink-if-story-template/issues) for bug reports and feature requests
- [Bug Report Form](https://forms.gle/a6HKbMZ7AhXV8kGu9) / [Feature Request Form](https://forms.gle/JgiFt4tNYaDFB8R59) if you prefer forms
