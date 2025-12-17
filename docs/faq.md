---
layout: default
title: FAQ
description: >-
  Frequently asked questions about the Ink Story Template: how to publish Ink
  games, accessibility features, customization, and licensing for web-based
  interactive fiction.
---
# Frequently Asked Questions

Quick answers to common questions. For error messages and technical problems, see [Troubleshooting](troubleshooting.md).

{% include toc-closed.html %}

---

## The Basics

### What is this template?

A ready-to-use web player for [Ink](https://www.inklestudios.com/ink/) stories—choice-based, text-focused interactive fiction in the style of Choice of Games titles or classic Twine stories. Text, choices, maybe some images and audio.

You write your story in Ink, export it to JSON, drop the JSON into this template, and upload to any web host. The template handles displaying text, rendering choices, saving progress, settings, accessibility, and so on.

It's not designed for visual novels (character sprites, dialogue boxes), parser IF (text commands like "go north"), or heavily graphical games with custom UI. If those are what you're after, look into [Ren'Py](https://www.renpy.org/), [Inform](https://ganelson.github.io/inform-website/), or a game engine like [Unity](https://unity.com/).

### And what exactly *is* Ink?

[Ink](https://www.inklestudios.com/ink/) is a scripting language for interactive storytelling. You write your story in Ink, and it handles all the branching, variables, and logic.

Ink is the narrative engine. It doesn't handle how the story looks, how saves work, or anything visual. It's designed to plug into something else: a game engine, a web template, whatever. That's where this web template comes in.

### Do I need to know how to code?

No. You need to learn Ink's syntax, but it's closer to writing with annotations than programming. It uses symbols like `*` for choices, `===` for sections, `->` for navigation and `{}` for conditions. See the [official Ink beginner's tutorial](https://www.inklestudios.com/ink/web-tutorial/).

This template handles all the web stuff through Ink tags—add images with `# IMAGE: photo.jpg`, play sounds with `# AUDIO: door.mp3`, and so on. No HTML, CSS, or JavaScript required.

That said, if you *do* know CSS or JavaScript, you can customize extensively through `custom.css` and `custom.js`.

### Is this an official Inkle product?

No. This is an independent project. [Inkle](https://www.inklestudios.com/) created the Ink language. [inkjs](https://github.com/y-lohse/inkjs), a community-made runtime, makes browser playback possible. This template's interface, save system, and features are separate work.

### Is this free? Can I sell games made with it?

Yes and yes. Both Ink and this template are [MIT licensed](https://github.com/RemyVim/ink-if-story-template/blob/main/LICENSE). Use it for free, modify it, sell games made with it—no attribution required (though appreciated). Your story content remains entirely yours.

### How do I get started?

Write your story in **[Inky](https://github.com/inkle/inky/releases)**, the official Ink editor (free, works offline, available for Windows/Mac/Linux). When you're ready to publish, export to JSON and drop it in the template folder.

That's the whole workflow. See the [Quick Start](quickstart.md) for the short version, or the [Beginner's Guide](guides/beginner-guide.md) for a thorough walkthrough with screenshots.

### Can I preview my story before publishing?

Yes:

- **In Inky**: the right panel shows a live preview as you write (though you won't see template features like images or stat bars)
- **In browser**: see [Local Testing](guides/local-testing.md) for options
- **On itch.io**: publish in Draft mode—only you can see it until you make it public

---

## Features

### What can this template do?

The highlights:

- **Save system** with 5 slots, autosave, and file export/import
- **Text formatting**: bold, italics, headers, lists, links
- **Images and audio** via simple tags
- **Special pages** for character sheets, maps, credits
- **Stat bars** for RPG-style games
- **Reader settings**: themes, fonts, text size
- **Accessibility**: screen reader support, keyboard navigation, dyslexia-friendly font
- **Mobile-friendly** responsive design

See the [Quick Reference](quick-reference.md) for everything.

### What *can't* it do?

Some things that aren't supported (by design or not yet):

- **Multiplayer**: single-player only
- **Server features**: no accounts, cloud saves, or leaderboards
- **Complex animations**: no sprite layering, transitions, or animation systems
- **Video embedding**: audio yes, video no (for now)
- **Back/undo button**: by design, see [Why There's No Back Button](devlog/why-no-back-button.md)

If you need these, consider a game engine like Unity instead of a web template.

### Does the template support [specific feature]?

Check the [Quick Reference](quick-reference.md) for a complete list of supported tags and features.

If something you need isn't listed, [open an issue on GitHub](https://github.com/RemyVim/ink-if-story-template/issues) or fill out the [feature request form](https://forms.gle/JgiFt4tNYaDFB8R59)—it might be on the roadmap or easy to add.

### Can I change the appearance?

Yes, at several levels:

1. **Reader settings**: readers can choose light/dark theme, fonts, and text size
2. **Author defaults**: set the default theme with `# THEME: dark`
3. **Custom CSS**: edit `custom.css` for colors, fonts, spacing, anything
4. **Custom JS**: edit `custom.js` to add your own functionality

For most people, `custom.css` is enough. See [Styling](reference/styling.md) for details.

### Do features I don't use clutter the interface?

No. The template shows/hides elements based on what your story uses. For example, audio controls only appear if you use audio. You don't need to disable anything manually.

### How long can my story be?

As long as you want. There's no hard limit enforced by the template.

Ink's JSON format is verbose, so even modest stories produce surprisingly large files—that's normal and not a problem for performance. The template loads the story into memory when the page opens, so in theory a truly massive story might load slowly on older devices, but I haven't found the ceiling yet.

If you're writing something epic and want to be sure, test on the lowest-spec device you expect readers to use. And if you do hit a limit, [let me know](https://github.com/RemyVim/ink-if-story-template/issues)—I'd love to hear about it and see what I can do to improve performance.

### Does using lots of images or audio affect performance?

Images and audio are loaded on demand, not all at once, so they won't slow down the initial story load. However, very large image files (several MB each) can cause noticeable delays when they appear. Keep images web-optimized—under 500KB each is a good rule of thumb.

### Can I write stories in languages other than English?

Yes. The template displays whatever text you write in Ink, so any language works.

The interface text (button labels like "Save" and "Settings") is currently in English only. Support for translating the interface is on the [roadmap](https://github.com/RemyVim/ink-if-story-template/blob/main/TODO.md).

The `FORMAT_DATE` and `FORMAT_TIME` functions support locale strings (like "fr-FR", "ja-JP", "de-DE") for localized date formatting.

### Does the template support right-to-left (RTL) languages like Arabic or Hebrew?

Not currently. The CSS assumes left-to-right text flow. It's on the [roadmap](https://github.com/RemyVim/ink-if-story-template/blob/main/TODO.md), but if this is something you need, open an issue—knowing there's demand helps prioritize it.

---

## Accessibility

### Can people play my story with a screen reader?

Yes. The template has been tested with NVDA (Windows) and VoiceOver (Mac), with attention to things like keyboard navigation, focus management, and making sure choices, tone indicators, stat bars and more are announced properly.

If you use assistive technology and encounter any issues, or find counter-intuitive defaults, please report them through [github issues](https://github.com/RemyVim/ink-if-story-template/issues) or the [bug report form](https://forms.gle/a6HKbMZ7AhXV8kGu9).

### Can readers adjust text size and fonts?

Yes. The Settings menu includes options for text size, line height, font family (Serif, Sans-serif, Monospace, or OpenDyslexic, a dyslexia-friendly font).

These settings persist in the browser across sessions.

### Can readers switch between light and dark mode?

Yes. By default, the template follows readers' system preference. Authors can set a default theme with `# THEME: dark` or `# THEME: light`. Readers can choose Light, Dark, or Auto in Settings.

### What about readers who are sensitive to motion?

The template respects the `prefers-reduced-motion` system setting automatically. There's also an "Enable Animations" toggle in Settings > Accessibility for readers who want to disable animations manually.

### Is there a high contrast mode?

Not yet. The default themes meet WCAG 4.5:1 contrast ratios for text, but a dedicated high contrast mode and prefers-contrast support are on the [roadmap](https://github.com/RemyVim/ink-if-story-template/blob/main/TODO.md).

---

## Publishing

### Where can I publish?

Anywhere that hosts static files:

- **[itch.io](https://itch.io)**: most popular for IF, free, built-in browser embedding
- **[Neocities](https://neocities.org)**: free static hosting
- **GitHub Pages**: free, good if you're already on GitHub
- **Netlify / Vercel**: free tiers, more developer-oriented
- **Your own server**: just upload the files

The template is just HTML, CSS, JavaScript, and your JSON. No server-side code required.

### How do I update my story after publishing?

1. Make changes to your `.ink` file
2. Export to JSON again
3. Replace the old JSON with the new one
4. Re-upload to your host

On itch.io, upload a new zip and replace the old one. On Neocities, drag and drop the updated file.

**Note on saves:** Reader saves may break across major story changes. If you rename knots or restructure significantly, old saves might not work. Small text fixes are usually fine.

### What if the template itself gets updated?

Updates are optional. Your published story keeps working because you have your own copy of the files.

If you want new features:

1. Download the new version of the template
2. Copy your `story.json`, `custom.css`, `custom.js`, and `assets/` folder into it
3. Re-upload

Check the [changelog](https://github.com/RemyVim/ink-if-story-template/blob/main/CHANGELOG.md) for what's new.

### Can I collaborate with someone on a story?

A few options:

- **Simple:** share the `.ink` file via email, Dropbox, or Google Drive
- **Split files:** use Ink's `INCLUDE` feature so different people work on different parts
- **Version control:** use Git/GitHub for proper collaboration

---

## Common Concerns

### Do readers need to install anything?

No. The story runs in their browser. They click a link and play. Any modern browser on any device works.

### Can I see analytics about how people play?

Not currently. The template doesn't collect any data—readers' choices stay on their devices.

This is on the [roadmap](https://github.com/RemyVim/ink-if-story-template/blob/main/TODO.md) as a double opt-in feature: authors would enable it, and readers would choose to share. Nothing automatic or behind-the-scenes.

### Can readers cheat by reading the JSON file?

Technically, yes. The JSON contains your entire story. A determined reader could open it and search for text.

In practice, this rarely matters:

1. **The JSON is nearly unreadable.** It's machine-optimized—thousands of lines of nested arrays and cryptic markers. It looks [like this](https://raw.githubusercontent.com/RemyVim/ink-if-story-template/refs/heads/main/build/story.json) if you're curious. Finding specific content is tedious.

2. **Anyone determined to cheat will cheat.** They could also click randomly, find a walkthrough, or read someone's playthrough.

3. **IF isn't about hidden information.** The value is the experience, not secrets. Knowing a choice leads somewhere doesn't replicate making that choice.

4. **Books have the same "problem."** You can flip to the last page of a mystery. Most people don't. They know it takes the fun out of it.

If hidden information truly matters (puzzle games, ARGs), client-side web might not be the right format.

---

## Compatibility

### Does this work on mobile?

Yes. The template is fully responsive and tested on phones and tablets. Touch targets are sized for fingers, text scales appropriately, and the layout adapts to portrait and landscape.

### Does this work offline?

Once loaded, mostly yes. The story runs entirely in the browser with no server calls, and saves are stored locally. However, the initial page load requires an internet connection unless you distribute it as a downloadable file.

### What browsers are supported?

All modern browsers: Chrome, Firefox, Safari, Edge. The template uses standard JavaScript (ES6+) and CSS supported by any browser updated in the last several years.

Internet Explorer is not supported.

### Can I use this with Unity / Godot / Unreal?

No. This template is specifically for web publishing. For game engines, use their dedicated Ink integrations:

- **Unity**: [ink-unity-integration](https://github.com/inkle/ink-unity-integration) (official)
- **Godot**: [godot-ink](https://github.com/paulloz/godot-ink)
- **Unreal**: [UnrealInk](https://github.com/DavidColson/UnrealInk)

The good news: your Ink story works with all of them. Write once, publish to web *and* game engines. The `.ink` source and compiled JSON are the same either way.

---

## Getting Help

- **Technical problems?** Check [Troubleshooting](troubleshooting.md)
- **Feature questions?** Browse the [Quick Reference](quick-reference.md)
- **Learning Ink?** See Inkle's [Writing with Ink](https://github.com/inkle/ink/blob/master/Documentation/WritingWithInk.md)
- **Still stuck?** [Open an issue](https://github.com/RemyVim/ink-if-story-template/issues) or use the [feedback form](https://forms.gle/a6HKbMZ7AhXV8kGu9)
