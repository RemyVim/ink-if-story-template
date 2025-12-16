---
layout: default
title: Compiling Ink to JSON
description: >-
  How to export your Ink story to JSON using Inky, inklecate, or the command
  line. Required step before publishing with the template.
---
# Compiling Ink to JSON

The web template doesn't read `.ink` files directly. You need to **compile** (or "export") your story to JSON first.

{% include toc-opened.html %}

## Why compile?

Your `.ink` file is written for humans—it's easy to read and edit. But browsers and other programs don't understand Ink syntax. Compiling translates your story into JSON (JavaScript Object Notation), a well-known and clearly labeled format browsers can work with easily.

It's like turning a manuscript into a published book. The content is the same; it's just in a format readers can access.

## Why this is actually helpful

Compiling isn't just a format conversion—it's also a safety check. The compiler analyzes your entire story and warns you about problems:

- Dead ends (paths that don't lead anywhere)
- Missing knots (links to sections that don't exist)
- Syntax errors (forgotten brackets, typos in divert targets, etc.)

If there's a problem, you'll see an error instead of a broken story. Better to catch these issues now than have a player hit a dead end or a syntax error in your story.

---

## Compiling with Inky

[Inky](https://github.com/inkle/inky/releases) is the official Ink editor. If you're following the [Beginner's Guide](beginner-guide.md), this is what you're using.

1. Open your `.ink` file in Inky
2. Click **File > Export to JSON...**
3. Save as `story.json` in your template folder

That's it. Inky uses the official compiler under the hood.

> **Tip:** You don't have to write in Inky to use it for exporting. You can write in any text editor you like, then open your project in Inky just to export.

<!-- TODO: Investigate Catmint (https://elliotherriman.itch.io/catmint) as another GUI option. It auto-compiles .ink files and doubles as a local server. May have compatibility issues with newer Ink versions—needs testing. -->

---

## Command Line Options

The following options use the command line (or "terminal"). If you've never used it before, stick with Inky above—it does the same thing. But if you're comfortable with the terminal, or curious to learn, these options give you more flexibility.

### > inklecate

[inklecate](https://github.com/inkle/ink/releases) is the official command-line compiler—the same one Inky uses under the hood.

**Installing inklecate:**

1. Download from the [Ink releases page](https://github.com/inkle/ink/releases):
   - **Windows:** `inklecate_windows.zip`
   - **Mac:** `inklecate_mac.zip`
   - **Linux:** `inklecate_linux.zip`
2. Unzip the file somewhere you'll remember

Here you have two options. Run it directly, or add it to your PATH to run it from anywhere on your system.

**Run it directly**

You can run inklecate from wherever you unzipped it:

```bash
/path/to/inklecate -o story.json main.ink
```

This compiles `main.ink` (and any files it `INCLUDE`s) and outputs `story.json`. It also shows you if there are any errors in your Ink.

**Add to your PATH (recommended)**

Adding inklecate to your PATH lets you run it from anywhere without typing the full path:

```bash
inklecate -o story.json main.ink
```

**On Windows:**

1. Unzip to a permanent location (e.g., `C:\tools\inklecate\`)
2. Search for "Environment Variables" in the Start menu
3. Click "Environment Variables"
4. Under "User variables", find "Path" and click Edit
5. Click "New" and add the folder path (e.g., `C:\tools\inklecate`)
6. Click OK, restart your terminal

**On Mac/Linux:**

```bash
sudo mv inklecate /usr/local/bin/
chmod +x /usr/local/bin/inklecate
```

### > inkjs

If you have Node.js installed, you can compile without installing anything else:

```bash
npx inkjs -o story.json story.ink
```

This uses [inkjs](https://github.com/y-lohse/inkjs), a JavaScript port of the Ink compiler.

---

## Workflows for Ink Compilation

### VS Code Shortcuts

If you're using VS Code, you can set up a keyboard shortcut to compile with one keypress—using either inklecate or inkjs.

1. In VS Code, press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type "Tasks: Configure Task" and select it
3. Select "Create tasks.json file from template"
4. Select "Others"
5. Replace the contents with one of the following:

**Using inklecate:**

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Compile Ink",
      "type": "shell",
      "command": "inklecate",
      "args": ["-o", "story.json", "main.ink"],
      "group": {
        "kind": "build",
        "isDefault": true
      }
    }
  ]
}
```

**Using inkjs:**

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Compile Ink",
      "type": "shell",
      "command": "npx",
      "args": ["inkjs", "-o", "story.json", "main.ink"],
      "group": {
        "kind": "build",
        "isDefault": true
      }
    }
  ]
}
```

Now press `Ctrl+Shift+B` to compile. Adjust the paths in `args` if your files are in different locations.

See the [Intermediary Guide](intermediary-guide.md) for a fuller VS Code setup including syntax highlighting, live preview, and multi-file project organization.

### Automated Compilation

The [Advanced Guide](advanced-guide.md) covers setting up automatic compilation as part of your publishing workflow. Every time you create a release, your story compiles and deploys automatically.

---

**Questions?** [Open an issue](https://github.com/RemyVim/ink-if-story-template/issues) on GitHub.
