---
layout: default
title: Troubleshooting
description: >-
  Fix common problems with the Ink Story Template: story not loading, images not
  showing, saves not working, itch.io upload issues, and browser errors.
---
# Troubleshooting

Solutions to common problems. If your issue isn't here, [open an issue on GitHub](https://github.com/RemyVim/ink-if-story-template/issues) or use the [bug report form](https://forms.gle/a6HKbMZ7AhXV8kGu9).

For general questions, see the [FAQ](faq.md).

{% include toc-closed.html %}

---

## Story Won't Load

### "Story Loading Error" appears

The template shows this error screen when it can't load or parse your story. The error message usually tells you what's wrong.

**"story.json not found"**

- The file must be named exactly `story.json` (not `Story.json`, `story.jason` or `story.JSON`)
- It must be in the root template folder, same level as `index.html`
- Make sure you exported from Inky, not just saved the `.ink` file

**"Failed to load story" or JSON parse errors**

- Re-export from Inky: File > Export to JSON
- Check Inky for errors first: if Inky shows red text, fix those before exporting
- Open `story.json` in a text editor and check it's not empty or truncated

### Blank page / nothing appears

This is different from the error screen—you see nothing at all.

**Check the browser console.** Right-click > Inspect > Console tab. Red error messages will point to the problem.

**Common causes:**

1. **You're opening `index.html` directly.** Double-clicking the file won't work. Browsers block local files for security. Upload to a host or use a [local server](guides/local-testing.md).

2. **Missing template files.** Make sure `js/template.min.js` and `css/template.min.css` exist and aren't empty.

3. **Modified `index.html` incorrectly.** If you edited the HTML file, you may have broken script or link tags.

### Story loads but looks wrong (no styling)

The CSS file isn't loading.

- Check that `css/template.min.css` exists and is not empty
- Check the browser console for 404 errors (Right-click > Inspect > Network tab)
- If you moved files around, paths in `index.html` might be broken

---

## Inky / Export Problems

### Inky shows errors and won't export

Red text in Inky's console panel (bottom right) means syntax errors. Common mistakes:

- **Missing `-> END` or `-> DONE`**: every path needs to terminate
- **Forgetting to indent after choices**: text after `*` or `+` must be indented
- **Mismatched brackets**: every `{` needs a `}`
- **Referencing knots that don't exist**: check spelling of `-> knotName` diverts
- **Using `//` in URLs**: Ink treats `//` as comments, omit `https://` from links

Fix all errors (red) before exporting. Warnings (orange) usually won't prevent export.

### "Export to JSON" is grayed out

Your story has errors. Check Inky's console panel and fix them.

### Exported JSON is huge / tiny

- **Huge (several MB):** Normal for long stories. Ink's JSON is verbose.
- **Tiny (under 1KB):** Something's wrong. Your story is empty or Inky exported an error state. Check for errors.

---

## Tags Not Working

### Images, audio, or formatting don't appear / appear literally as # TAG

Tags are processed by the template, not Ink—you won't see effects in Inky's preview.

- Run your story in a browser to see tags in action. See [local testing](guides/local-testing.md) for ways to preview your story in your browser.
- Make sure the tag exists and is not misspelled:
  - Check the [Quick Reference](quick-reference.md) for a list of all supported tags
  - Tone indicator tags must be defined before use with `# TONE: tagname icon`
- Check the console (Right-click > Inspect > Console) for warnings about invalid tags

### Tag syntax reminders

- Tags are case-insensitive: `# IMAGE:`, `# image:`, `# Image:` all work
- Tags are space-insensitive: `# IMAGE:`, `#IMAGE:`, `#IMAGE :` all work
- File paths are relative to the template folder
- Use forward slashes on all platforms: `assets/image.png`

### "Unknown tag" warning in console

- Check spelling—the console should suggest similar valid tags
- For custom CSS classes, use `# CLASS: yourclass`
- For tone indicators, define them first: `# TONE: tagname icon`

---

## Images Not Showing

Tags are processed by the template, not Ink—you won't see images in Inky's preview. See [local testing](guides/local-testing.md) for options to preview in your browser.

### Image appears broken / missing

1. **Check the filename exactly.** Case matters on most servers: `Image.jpg` ≠ `image.jpg`

2. **Check the file location.** Images typically go in `assets/`:

   ```ink
   # IMAGE: assets/myimage.jpg
   ```

3. **Check the file format.** Supported: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`

4. **Check the browser console** for 404 errors showing the exact path being requested. (Right-click > Inspect > Network)

### Image shows locally but not online

File paths are case-sensitive on web servers but not on Windows. If your file is `MyImage.JPG` but your tag says `# IMAGE: assets/myimage.jpg`, it works locally but breaks online.

**Fix:** Rename files to lowercase and match exactly in your Ink tags.

Make sure you use forward slashes in the tag file path.

### Image is too big / too small

Use the size parameter:

```ink
# IMAGE: assets/photo.jpg 50%
# IMAGE: assets/icon.png 100px
```

See [Images reference](reference/images.md) for all options.

### Background image persists after restart

This is expected—background images persist across restarts. Use `# BACKGROUND: none` to remove it explicitly.

---

## Audio Not Playing

Tags are processed by the template, not Ink—you won't hear audio in Inky's preview. See [local testing](guides/local-testing.md) for options to preview in your browser.

### No sound at all

1. **Check the Settings menu**: is audio enabled?

2. **Browser autoplay policies**: browsers block audio until the user interacts with the page. Audio works after the first click/choice.

3. **Check the file exists**: same troubleshooting as images.

4. **Check the format**: use `.mp3` for maximum compatibility.

5. **Check the browser console** for audio errors. (Right-click > Inspect > Console)

### Audio loops unexpectedly (or doesn't loop)

- `# AUDIO: file.mp3`: plays once
- `# AUDIOLOOP: file.mp3`: loops continuously

To stop looping audio: `# AUDIOLOOP: none`

See [Audio reference](reference/audio.md).

### Audio plays locally but not online

File paths are case-sensitive on web servers but not on Windows. If your file is `MyAudio.MP3` but your tag says `# AUDIO: assets/myaudio.mp3`, it works locally but breaks online.

**Fix:** Rename files to lowercase and match exactly in your Ink tags.

Make sure you use forward slashes in the tag file path.

---

## Saves Not Working

### Saves disappear between sessions

Saves use the browser's localStorage. They can be lost if:

1. **Reader clears browser data**
2. **Private/incognito mode**: localStorage is wiped when the window closes
3. **URL changed**: localStorage is tied to the exact domain/path
4. **Storage is full**: rare, but possible

Encourage readers to use **Export Save** for important progress.

### "Save appears corrupted" error

The save data doesn't match the expected format. Causes:

1. **Story structure changed significantly**: renamed knots, changed variables
2. **Browser storage corruption**: rare

**For readers:** Start a new game, or try importing a previously exported save file.

**For authors:** Warn readers that old saves might not work after major updates.

### Save slots show wrong story title

Each save stores the title at save time. If you changed `# TITLE:`, old saves show the old title. They still work—it's just cosmetic.

---

## Functions Not Working

Functions added by the template are processed by the template, not Ink—you won't see their effects in Inky's preview.

See the list of supported [functions](reference/functions.md).

See [local testing](guides/local-testing.md) for options to preview in your browser.

### "Missing function binding" error

- Declare the function with `EXTERNAL` at the top of your `.ink` file
- Spelling must match exactly (functions are case-sensitive and use uppercase)
- Make sure `template.min.js` loads before your story runs

### Function returns unexpected value

- `REPLACE` only replaces the first occurrence: use `REPLACE_ALL` for all
- `PERCENT` returns a rounded integer, not a decimal
- Time functions return Unix timestamps: use `FORMAT_DATE` to display them

### Date showing wrong format

Pass a valid locale string: `"en-US"`, `"fr-FR"`, etc. Invalid locales fall back to `"en-US"`. Check the console for warnings (Right-click > Inspect > Console).

---

## Stat Bars Not Showing

Tags are processed by the template, not Ink—you won't see stat bars in Inky's preview. See [local testing](guides/local-testing.md) for options to preview in your browser.

- The variable must be declared with `VAR` before using it
- Variable names are case-sensitive
- Check the console for warnings (Right-click > Inspect > Console).

---

## Special Pages Not Appearing

Special pages are processed by the template, not Ink—you won't see them in Inky's preview. See [local testing](guides/local-testing.md) for options to preview in your browser.

### Page not in menu

- Tag must be on the line immediately after the knot: `# SPECIAL_PAGE` or `# SPECIAL_PAGE: Name`
- Always end special pages with `-> DONE`

### Wrong order in menu

- Default order is alphabetical by display name
- Use `# PAGE_MENU: knot1, knot2, knot3` for custom order
- Use `,,` to add separators

See [Special Pages reference](reference/special-pages.md).

---

## Choices Issues

### Tone indicator showing wrong icon

- Define tones at the top of your file: `# TONE: tagname icon`
- For Material Icons: `# TONE: danger warning`
- For emoji: `# TONE: flirty 🔥`

### Tone tag not applying to choice

Tags must be inside or before the brackets:

```ink
// ✓ Works
+ [Some choice # flirty]
+ # flirty [Some choice]

// ✗ Doesn't work (tag applies to result text, but since it's
// no longer a choice at that point, it won't appear at all)
+ [Some choice] # flirty
```

### Choice number hints not showing

- Check Settings > Choice Number Hints
- If you set `# CHOICE_NUMBERS: off`, hints are disabled
- Hints auto-hide on touch devices by default

---

## Keyboard Shortcuts Not Working

- Check Settings > Enable Keyboard Shortcuts
- Shortcuts are disabled when typing in input fields
- Shortcuts are disabled when modals are open
- Shortcuts are automatically disabled on mobile

---

## Styling Problems

### `custom.css` changes don't appear

1. **Hard refresh**: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
2. **Check file location**: `custom.css` should be in `css/`
3. **Check syntax**: validate at [jigsaw.w3.org/css-validator](https://jigsaw.w3.org/css-validator/)
4. **Check specificity**: try adding `!important` temporarily to test if your styles are being overridden

### Dark/light mode doesn't change after customizing

The template has separate variables for each theme. If you only customized one, the other might not change. See [Styling reference](reference/styling.md).

---

## Mobile Problems

### Text is tiny on mobile

Check that `index.html` has the viewport meta tag:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

### Can't scroll on mobile

Check for `overflow: hidden` in your `custom.css`.

---

## Local Testing Issues

### Double-clicking `index.html` doesn't work

Browsers block local files for security. You need a local server to preview on your computer: see [Local Testing](guides/local-testing.md).

### Changes don't appear after editing

- Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
- Make sure you re-exported to JSON after modifying your `.ink` file
- Check you're editing the correct file

---

## Browser Console Errors

This template will show error and warning information in the browser's console. Check it with Right-click > Inspect > Console (or F12 > Console).

### "inkjs is not defined" or "Story is not defined"

JavaScript files aren't loading. Check that `js/template.min.js` exists and the browser console's Network tab for failed requests (Right-click > Inspect > Network).

### "Cannot read property 'X' of undefined"

Usually means the story didn't load correctly. Check for earlier errors in the console and fix those first.

### CORS errors

"Blocked by CORS policy" means you're testing locally by opening `index.html` directly. Use [a local server](guides/local-testing.md) instead.

---

## itch.io Problems

### "No compatible uploads were found"

You didn't check "This file will be played in the browser."

1. Go to your project > Edit
2. Find your uploaded zip
3. Check "This file will be played in the browser"
4. Save

### Game shows but is tiny / has scroll bars

Configure embed settings:

1. Edit your project on itch.io
2. Scroll to "Embed options"
3. Set dimensions (800×600 is reasonable)
4. Check "Mobile friendly"
5. Save and test

Alternatively for the best experience, tick the full screen option in the Embed options.

### Game loads but shows the demo story

You didn't replace `story.json` before zipping.

1. Delete the existing `story.json` in your template folder
2. Copy YOUR exported `story.json` into the folder
3. Re-zip and upload

### Zip file structure is wrong

itch.io needs `index.html` at the root of the zip, not inside a subfolder.

**Wrong:**

```
my-game.zip
└── my-game/
    ├── index.html
    └── ...
```

**Right:**

```
my-game.zip
├── index.html
├── story.json
└── ...
```

**Fix:** Open your folder, select all the files *inside*, then zip those. Don't zip the folder itself.

---

## Still Stuck?

1. **Check the browser console.** Right-click > Inspect > Console. (Or F12 > Console.) Errors usually point to the problem.

2. **Test with the demo story.** Download a fresh template and test without modifications. If the demo works, the problem is in your story or customizations.

3. **Search existing issues.** [GitHub Issues](https://github.com/RemyVim/ink-if-story-template/issues?q=is%3Aissue)

4. **File a bug report**: [Open an issue on GitHub](https://github.com/RemyVim/ink-if-story-template/issues) or use the [bug report form](https://forms.gle/a6HKbMZ7AhXV8kGu9)
