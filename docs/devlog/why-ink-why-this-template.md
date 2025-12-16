---
layout: default
title: Why Ink (and Why This Template)?
description: >-
  On choosing Ink over Twine, the joy of JSON, and building a web template that
  didn't exist.
---
# Why Ink (and Why This Template)?

There are a lot of interactive fiction tools out there. Twine is everywhere. Choicescript has a whole library of published games. So why build a web template for Ink, a language most people associate with Unity games?

Because Ink is wonderful, and it deserves better web tooling.

## The Gap

When I started looking for ways to publish Ink stories on the web, I found... not much. In terms of ready-to-use templates, anyway. There are some gems out there—notably [inkjs](https://github.com/y-lohse/inkjs), the JavaScript port that makes running Ink in a browser possible at all. And some web tools for developers who want to build their own thing. But nothing like the ecosystem Twine has—dozens of templates, formats, tutorials, communities centered on web publishing for non-technical writers.

Ink writers who wanted polished web output mostly had two options: learn web development, or give up and use something else.

That seemed like a shame. Because I'd tried other tools—Choicescript, various Twine formats—and Ink was the one that got out of my way.

## The Best Tools Disappear

I have this belief about tools: the best ones are the ones you stop noticing. A good keyboard disappears under your fingers. You don't think about it; you think about what you're typing. But the moment a key starts sticking? Suddenly that's all you can focus on. You're not writing anymore: you're fighting the keyboard. That's when you either get it fixed, or throw it out. (The keyboard, not the writing!)

Ink is like that. Here's a simple passage:

```ink
You knock on the door. No answer.

* [Knock again]
  Your knuckles are starting to hurt.
* [Try the handle]
  It's unlocked. Of course it is.
* [Leave]
  Some doors aren't meant to be opened.
```

That's it. Text is text. Choices are lines starting with `*`. The syntax is minimal enough that it disappears while you're writing. You're not wrestling with tags or brackets or code blocks—you're just telling a story with some decision points.

And here's the thing that really got me: when you write in Ink, you're writing *and* coding at the same time. There's no separate pass where you go back and wire everything up. You write a choice, it's already a choice. You add an arrow `->` or a knot `===` and it's already connected. It's like the annotations you'd scribble in a Word document while planning—except those annotations actually work.

Editing your writing is taxing enough... You shouldn't have to do another whole pass just for the programming.

This might sound odd coming from someone who writes code for a living, but: when I'm writing, I want to *write*. I don't want to context-switch into programmer brain to figure out why my conditional isn't firing. Ink lets me stay in the story.

## The Joy of JSON

The other thing I love about Ink: it compiles.

When you export your story, Ink doesn't just bundle up your source files. It parses them, checks them, and compiles them into a structured JSON file. And here's the *really* great thing: if your Ink is broken, the JSON simply won't exist. It's not a warning you can ignore. It's a wall. The compiler cannot produce valid JSON from invalid Ink, so you find out something's wrong immediately—not three months later when a player messages you about a dead end.

And from a developer perspective? JSON is a gift. It's structured data—meaning the computer knows what's what. This is a knot name. This is a choice. This is a variable. Plain text is just a wall of characters; a program has to guess what anything means. Structured data comes pre-labeled.

That makes introspection easy. Just the other day I added code that scans the story file for audio tags and only shows the autio panel in the settings it it's actually needed. Took maybe twenty minutes. That kind of thing is trivial when your story is data with a clear structure, not just a pile of text the program has to squint and evaluate character by character.

## Why I Built This

I wanted a home for my own IF stories and I wanted to use Ink. I also just wanted to learn web development.

I write interactive fiction too, that's how I found Ink in the first place. I had stories I was working on and nowhere good to put them. Building this template killed two birds: I'd learn a new domain, and I'd end up with something I actually needed.

My background is in network infrastructure. I'd never actually built anything for the web. Different world, same fundamentals—still just zeroes and ones underneath—but a whole new set of tools and languages and patterns to learn.

Building this template was my excuse to dig in. I wanted a real project with real goals, not just JavaScript tutorials. Something I hope it might be useful to someone other than me when I finish: a template that writers can pick up and use without fighting the tools. Something that—in the spirit of Ink itself—just gets out of the way.

Ink already has a strong community. It's been around for years. It's battle-tested. Free and open source. The missing piece was always web publishing. Ink is well established in Unity, but almost invisible in browser-based CYOA-type interactive fiction.

I'd like to help change that, even a little.

---

If you've been curious about Ink but put off by the web tooling situation, maybe [give this template a try](https://remy-vim.itch.io/ink-template). And if you're already an Ink writer with your own setup, I'd love to hear how you do it!
