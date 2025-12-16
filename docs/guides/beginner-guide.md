---
layout: default
title: Beginner's Guide
description: >-
  Publish your first Ink interactive fiction game with the Ink Story Template.
  Step-by-step tutorial from installing Inky to live on itch.io. No coding
  required.
---
# A Complete Beginner's Guide

This guide will walk you through publishing your first interactive fiction story using **[Ink](https://www.inklestudios.com/ink/)** and the **[Ink Story Template](https://remy-vim.itch.io/ink-template)**. No programming experience required.

By the end, you'll have a playable game hosted on [itch.io](https://itch.io/) that you can share with anyone.

**Time required:** About 30-60 minutes to set up your first story.

{% include toc-opened.html %}

---

## What We're Building

Interactive fiction (IF) is a genre of games where the player reads a story and makes choices that affect what happens next. Think "Choose Your Own Adventure" books, but on a screen.

We'll use **Ink**, a scripting language created by Inkle (the studio behind *80 Days* and *Heaven's Vault*). Ink is designed specifically for interactive fiction—it's powerful enough for professional games but simple enough to learn in an afternoon.

The **Ink Story Template** takes your Ink story and wraps it in a polished web interface with saves, themes, accessibility features, and more. You write the story and the template handles everything else.

---

## Step 1: Install Inky

**Inky** is the official editor for Ink. It's where you'll write your story.

1. Go to the [Inky releases page](https://github.com/inkle/inky/releases)
2. Download the version for your system:
   - **Windows:** `Inky_windows_64.zip` (or `Inky_windows_32.zip` for older 32-bit computers)
   - **Mac:** `Inky.dmg`
   - **Linux:** `Inky_linux.zip`
![Inky releases page with Windows download highlighted]({{ '/assets/images/beginner-guide/inky-release-downloads.png' | relative_url }})

3. Unzip the downloaded file (Windows, Linux), or double click to install (Mac)
4. Open the folder and run **Inky** (you may have to authorize it to run, and if you're on Linux you might have to give it permissions to run with `chmod +x Inky`)

When Inky opens, you'll see a split screen: your script on the left, a preview of your story on the right.

![Inky interface with default new file]({{ 'assets/images/beginner-guide/inky-startup-default.png' | relative_url }})

> **Why Inky?** You could write Ink in any text editor, but Inky gives you a live preview as you type. You'll see exactly how your story plays, which makes writing and testing much faster. If you're already comfortable with VS Code, check out the [Intermediary Guide](intermediary-guide.md) for an alternative setup.

---

## Step 2: Write a Simple Story

Let's create a tiny story to make sure everything works. You can replace it with your real story later.

Delete any text in the editor and type this:

```ink
# TITLE: Cat Got my Ink
# AUTHOR: Your Name

Your cat is sitting on your keyboard. Again.

She looks up at you with an expression of pure innocence, as if she hasn't just deleted three paragraphs of your interactive fiction novel.

* [Gently lift the cat]
  You carefully scoop her up. She purrs, victorious.
  There are now seventeen extra 'g's in your document.
  -> END

* [Offer a treat as distraction]
  You shake the treat bag. Her ears perk up instantly.
  She leaps off the keyboard... Stepping on Ctrl+S on her way down.
  At least your work is saved.
  -> END
```

As you type, the right panel shows your story. Try clicking the choices to play through it.

![Inky with the sample story, showing preview panel]({{ 'assets/images/beginner-guide/inky-custom-story.png' | relative_url }})

> **Note:** Inky displays the `# TITLE` and `# AUTHOR` tags in its preview panel. Don't worry—tags are only visible in the editor, not in your final story. The template reads them behind the scenes to set up the header.

### Understanding the Syntax

Let's break down what you just wrote:

**Tags** start with `#` and give the template information:

```ink
# TITLE: Cat Got my Ink
# AUTHOR: Your Name
```

These set your story's title and author name, which appear in the template's header.

**Regular text** becomes story content:

```ink
Your cat is sitting on your keyboard. Again.
```

**Choices** start with `*`:

```ink
* [Gently lift the cat]
  You carefully scoop her up. She purrs, victorious.
```

The indented text below is what appears when the player picks that option.

The `[brackets]` are optional but useful: text inside brackets disappears after the player clicks, while text outside brackets gets repeated as part of the story. For example:

```ink
* "Hello," you say.
```

After clicking, the story would show: `"Hello," you say.` followed by whatever comes next. This lets choices flow naturally into the narrative. For now, using brackets is a safe default—you can experiment with this later.

**`-> END`** marks where the story stops. Every path needs to end somewhere.

> **Learning more:** This is just the basics. Ink can do much more—variables, conditional text, loops, and complex branching. Once you're comfortable with the template, check out Inkle's [Writing with Ink](https://github.com/inkle/ink/blob/master/Documentation/WritingWithInk.md) guide.

---

## Step 3: Save Your Project

Quick! Let's save the Inky project file before your cat gets to touch your keyboard.

1. Click **`File > Save Project`**
2. Create a folder for your story (e.g., `CatGotMyInk`)
3. Save the file as `main.ink`

![Inky interface with save project menu option highlighted]({{ 'assets/images/beginner-guide/inky-menu-save-project.png' | relative_url }})

Your `.ink` file is your source code. You'll edit this whenever you want to change your story.

---

## Step 4: Download the Template

Now let's get the template that will turn your story into a playable web game.

1. Go to the [template download page on itch.io](https://remy-vim.itch.io/ink-template)
2. Click **Download**
3. Unzip the downloaded file

![itch.io Ink Story Template page with download button]({{ 'assets/images/beginner-guide/ink-story-template-download.png' | relative_url }})

You'll see a folder structure like this:

```
ink-template-download/
├── index.html
├── story.json        ← We'll replace this
├── README.txt
├── css/
│   ├── template.min.css
│   └── custom.css
├── js/
│   ├── template.min.js
│   └── custom.js
└── assets/
```

The template comes with a demo story. We're going to replace it with yours.

---

## Step 5: Export to JSON

The web template doesn't read `.ink` files directly. We need to go back to Inky and **export** (or "compile") the story to a format called JSON.

### What's happening here?

Your `.ink` file is written for humans—it's easy to read and edit. But browsers don't understand Ink syntax. The export process translates your story into JSON (JavaScript Object Notation), which is a simple format that browsers can read and understand easily.

Think of it like turning a physical book into an e-book. The story is the same; it's just in a format that the browser can understand.

### Why this is actually helpful

The export step isn't just a format conversion—it's also a safety check. Inky analyzes your entire story and warns you about problems, like:

- Dead ends (paths that don't lead anywhere)
- Missing knots (links to sections that don't exist)
- Various syntax errors (forgotten bracket, etc.)

If there's a problem, Inky will show an error instead of exporting. This means your readers will never hit a broken path that you missed during testing. Better to catch these issues now than have a player email you saying "the story just stopped!"

### Exporting to JSON

Let's export:

1. In Inky, click **`File > Export to JSON...`**
2. Navigate to your story folder
3. Save it as `story.json`

![Inky interface with export to JSON menu option highlighted]({{ 'assets/images/beginner-guide/inky-menu-export-json.png' | relative_url }})

You now have two files in your project folder:

- `main.ink`: your editable source (for you)
- `story.json`: the compiled story (for the template)

> **Important:** Always keep your `.ink` file safe. If you lose it, you'd have to recreate your story from scratch—the JSON file isn't meant to be edited by hand.

---

## Step 6: Add Your Story to the Template

This is the key step: putting your story into the template.

1. Rename the template folder from `ink-template-download` to anything you want (e.g., `cat-got-my-ink`), and move it to your project folder with the `.ink` files. (This keeps everything in one place.)
2. Find the `story.json` you exported from Inky
3. Copy it
4. Paste it into the template folder, **replacing** the existing `story.json`

![File explorer showing copy/paste, with "Replace" dialog]({{ 'assets/images/beginner-guide/replace-json-dialog.png' | relative_url }})

That's it. Your story is now in the template.

---

## Step 7: Publish to itch.io

[itch.io](https://itch.io) is a popular platform for indie games, including interactive fiction. It's free to use and your game will be playable directly in the browser.

### Create an itch.io Account

1. Go to [itch.io](https://itch.io)
2. Click **Register** in the top right
3. Fill in your details and create an account
4. Don't forget to verify your email: itch.io won't let you upload files until you click the confirmation link they send.

> **Note:** During registration, select "I'm interested in distributing content on itch.io" to get a creator account. If you already have a regular account, you can convert it to a creator account in your settings.

### Create Your Game Page

1. Click your profile icon > **`Dashboard`**
2. Click **Create new project**
![Dashboard with "Create new project" button]({{ 'assets/images/beginner-guide/itchio-create-project-main.png' | relative_url }})
3. Fill in the details:

- **Title:** Your story's name
- **Kind of project:** Select **HTML**

![Project creation form with HTML selected]({{ 'assets/images/beginner-guide/itchio-create-project-form-top.png' | relative_url }})

> **Note:** New projects start in "Draft" mode by default—your game won't be publicly visible until you change the visibility to "Public". This lets you test everything before going live.

![Project creation form element with Visibility & Access]({{ 'assets/images/beginner-guide/itchio-create-project-visibility.png' | relative_url }})

### Upload Your Files

1. First, **zip your template folder**:
   - Select all files in the template folder (the one where you copied your `story.json` file)
   - Right-click > **`Send to > Compressed (zipped) folder`** (Windows)
   - Or right-click > **`Compress`** (Mac)
2. In the itch.io project page, scroll to **Uploads**
3. Click **Upload files** and select your zip file
4. **Important:** Check the box that says **"This file will be played in the browser"**
![Upload section with checkbox highlighted]({{ 'assets/images/beginner-guide/itchio-create-project-upload-files.png' | relative_url }})
5. Under **Embed Options**, make sure to tell itch.io to "Click to launch in fullscreen" and under Frame Option, tick the Mobile Friendly box. (Portrait looks best for this template but feel free to experiment with landscape orientation)
![Upload section with embed options settings]({{ 'assets/images/beginner-guide/itchio-create-project-embed-options.png' | relative_url }})

### Save and View

1. Scroll down and click **Save & view page**
2. Your game is now live! (In draft mode for now, but you can view the page.)
3. Click view page and then the **Run game** button to play your story.

![Published game page]({{ 'assets/images/beginner-guide/cat-got-my-ink-live.png' | relative_url }})

When you're ready to make the page public, go edit the project on itch.io to set the visibility to public and share the URL with the world!

---

## Step 8: Making Changes

Made a typo? Want to add more content? Here's how to update your published story:

1. Open your `main.ink` file in Inky
2. Make your changes
3. **`File > Export to JSON`** (replace the old `story.json`)
4. Copy the new `story.json` to your template folder
5. Re-zip the template folder
6. On itch.io, go to your project > **`Edit`**
7. Delete the old upload and upload the new zip
8. Save

It sounds like a lot of steps, but after your second or third update, it becomes muscle memory—under a minute.

> **Getting tired of re-uploading to test changes?** Once you're making frequent edits, previewing on your own computer saves a lot of time. See the [Local Testing](local-testing.md) guide—the easiest option takes about a minute to set up.

---

## Next Steps

Congratulations! You've published your first interactive fiction game. Here's where to go from here:

**Improve Your Story**

- **Add images and audio:** See [Images](../reference/images.md) and [Audio](../reference/audio.md)
- **Format your text:** Learn [bold, italics, headers, and more](../reference/text-formatting.md)
- **Create reference pages:** Add a [character sheet or credits page](../reference/special-pages.md)
- **Track stats:** Use [stat bars](../reference/stat-bars.md) for RPG-style stories

**Learn More Ink**

- [Writing with Ink](https://github.com/inkle/ink/blob/master/Documentation/WritingWithInk.md): the official guide
- [Ink Patreon](https://www.patreon.com/inkle): advanced tutorials and community

**Level Up Your Workflow**

- [Local Testing](local-testing.md): ways to preview your story on your local computer
- [Intermediary Guide](intermediary-guide.md): speed up your workflow with instant preview and multi-file projects
- [Advanced Guide](advanced-guide.md): never lose work, automate your publishing

---

## Tips & Troubleshooting

**The preview in Inky shows an error**

Check your syntax. Common mistakes:

- Missing `-> END` at the end of a path
- Forgetting to indent text after a choice
- Mismatched brackets

**My story doesn't appear in the template**

- Make sure you exported to JSON, not just saved the .ink file
- Make sure you replaced `story.json` in the template folder
- Make sure the file is named exactly `story.json`

**itch.io says "No game to run"**

- Check that you selected "This file will be played in the browser"
- Make sure your zip contains `index.html` at the root level (not inside another folder)

**Something else is broken**
[Open an issue](https://github.com/RemyVim/ink-if-story-template/issues) and describe what's happening. Include any error messages you see.

---

**Questions?** [Open an issue](https://github.com/RemyVim/ink-if-story-template/issues) on GitHub.
