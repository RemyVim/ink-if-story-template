---
layout: default
title: Quick Start
description: Get your Ink story published in 5 minutes.
---
# Quick Start

Get your Ink story online in minutes. No programming required.

## What You'll Need

- [Inky](https://github.com/inkle/inky/releases): the Ink editor (free)
- An Ink story (or use the demo story to test)
- The template ([download from itch.io](https://remy-vim.itch.io/ink-template))

## Template Files

When you unzip the template, you'll see these files:

```
ink-story-template/
├── index.html          ← The game page
├── story.json          ← Replace with YOUR story
├── README.txt
├── css/
│   ├── template.min.css
│   └── custom.css      ← Your style tweaks (optional)
├── js/
│   ├── template.min.js
│   └── custom.js       ← Your code tweaks (optional)
└── assets/             ← Put images & audio here
```

## Step 1: Add Your Info

At the top of your main `.ink` file in Inky, add:

```ink
# TITLE: Your Story Title
# AUTHOR: Your Name
```

## Step 2: Export to JSON

In Inky: **File → Export to JSON...**

Save it as `story.json` inside the template folder (replace the existing one).

## Step 3: Publish

### Option A: itch.io

1. Zip the entire template folder
2. Go to [itch.io](https://itch.io) and create an account (free)
3. Dashboard → Create new project
4. Set "Kind of project" to **HTML**
5. Upload your zip file
6. Check "This file will be played in the browser"
7. Save & view page. Done!

### Option B: Neocities

1. Go to [Neocities](https://neocities.org) and create an account (free)
2. In your dashboard, click "Edit Site"
3. Drag and drop all the template files into the file list
4. Visit your site. Done!

### Option C: Literally Any Other Hosting Site

1. Go to your hosting site
2. Upload all the template files
4. Visit your site. Done!

## Next Steps

**Need more help?** See the [Complete Beginner's Guide](guides/beginner-guide.md) withmore detailed instructions and screenshots!

- [Text Formatting](reference/text-formatting.md): bold, italics, headers, lists
- [Images & Audio](reference/images.md): add media to your story
- [All Features](reference/quick-reference.md): see everything the template can do

## Testing Locally (Optional)

Browsers block local files for security reasons, so double-clicking `index.html` won't work. If you want to preview before publishing, see [Local Testing](guides/local-testing.md).
