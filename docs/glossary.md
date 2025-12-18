---
layout: default
title: Glossary
description: >-
  Definitions of interactive fiction terms, Ink terminology, and template
  features. What's a knot? What's a weave? Find out here.
---
# Glossary

Quick definitions for terms you'll encounter in Ink, interactive fiction, and this template.

---

[A](#a) · [B](#b) · [C](#c) · [D](#d) · [E](#e) · [F](#f) · [G](#g) · [H](#h) · [I](#i) · [J](#j) · [K](#k) · [L](#l) · [M](#m) · [N](#n) · [O](#o) · [P](#p) · [Q](#q) · [R](#r) · [S](#s) · [T](#t) · [U](#u) · [V](#v) · [W](#w) · [X](#x) · [Y](#y) · [Z](#z)
{: style="text-align: center;"}

---

## A

### Autosave

A save that happens automatically whenever the reader makes a choice. This template creates autosaves so readers can close the browser and pick up where they left off. See also: [save slot](#save-slot).

---

## B

### Branching narrative

A story structure where reader choices lead to different paths, scenes, or outcomes. The branches can reconverge (meet back up) or diverge completely into different endings.

---

## C

### Choice

A selectable option presented to the reader. In Ink, choices are marked with `*` (single-use) or `+` (sticky):

```ink
* [Open the door]
  You step through.
  
+ [Wait]
  You decide to wait a moment longer.
```

The text in brackets is what readers see; text after the bracket is what appears when they select it. See also: [sticky choice](#sticky-choice), [fallback choice](#fallback-choice), [weave](#weave).

### Choice-based

Interactive fiction where the reader selects from presented options rather than typing commands. This template is for choice-based IF. Contrast with [parser](#parser).

### Compile / Compilation

Converting your `.ink` source files into a format the computer can run. In Ink, this means turning `.ink` files into a `.json` file. You compile using [Inky](#inky) (File > Export to JSON) or [inklecate](#inklecate).

### Conditional

Text or choices that only appear when certain conditions are met. In Ink:

```ink
{has_key: You could try the locked door.}
```

Or:

```ink
{
    - has_key: Unlock the door.
    - strength > 50: Kick the door in.
    - else: You can't open this door.
}
```

### CYOA

"Choose Your Own Adventure". A popular term for [choice-based](#choice-based) interactive fiction, named after [the famous book series](https://en.wikipedia.org/wiki/Choose_Your_Own_Adventure).

---

## D

### Divert

An Ink instruction that sends the story to another location. Written as an arrow: `-> knot_name`. Think of it as a "go to" command.

```ink
* [Open the door] -> hallway
* [Turn back] -> entrance
```

### DONE

An Ink command that ends the current flow without ending the story. Used for [special pages](#special-page), [threads](#thread), or waiting for external input.

```ink
=== character_sheet ===
# SPECIAL_PAGE
Your stats and inventory...
-> DONE
```

Contrast with `-> END` (see: [END](#end)).

```ink
-> END   // Story is over, no more content
-> DONE  // This section is done, but story continues
```

---

## E

### END

The conclusion of a story path, marked in Ink with `-> END`:

```ink
=== victory ===
You saved the kingdom. The end.
-> END
```

A story can have multiple endings. See also: [DONE](#done).

### External function

A function defined in JavaScript—or the game engine—that Ink can call. This template provides several built-in external functions for strings, math, and time. You declare them with `EXTERNAL` in your Ink file:

```ink
EXTERNAL UPPERCASE(text)
~ name = UPPERCASE(name)
```

See [Functions reference](reference/functions.md). See also: [function](#function).

---

## F

### Fairmath

A system for percentage-based stat changes where it's harder to reach extremes. Adding 20% to a stat of 80 doesn't give you 100—it gives you 84 (20% of the remaining distance to 100).

- `FAIRADD(stat, percent)`: increases stat, diminishing as it approaches 100
- `FAIRSUB(stat, percent)`: decreases stat, diminishing as it approaches 0

Originally from ChoiceScript. This template provides fairmath as [external functions](reference/functions.md).

### Fallback choice

In Ink, a [choice](#choice) that activates when all other choices have been used or are unavailable:

```ink
+ [Ask about weather] ...
+ [Ask about news] ...
* -> leave  // Fallback: when no other choices remain
```

### Function

A reusable piece of logic that returns a value. Ink supports three kinds:

**Built-in functions** like `RANDOM()`, `TURNS()`, and list operations:

```ink
~ roll = RANDOM(1, 6)
{TURNS() > 10: You've been wandering a while.}
```

**Custom functions** you define in Ink:

```ink
=== function double(x) ===
~ return x * 2

=== somewhere ===
~ result = double(5)  // result is 10
```

**External functions** defined in JavaScript—or the game engine-for advanced operations. See [external function](#external-function).

For reusable story passages (with text and choices) that return to where they were called, see [tunnel](#tunnel).

---

## G

### Gamebook

A style of interactive fiction that often includes game mechanics like stats, inventory, and dice rolls. Think *Fighting Fantasy* or *Lone Wolf* books. This template supports gamebook-style features through [stat bars](#stat-bar), [functions](#function), and [special pages](#special-page).

### Gather

In Ink, a point where multiple choice branches come back together. Marked with a dash:

```ink
* [Go left] You head left.
* [Go right] You head right.
- Either way, you reach the clearing.
```

The line starting with `-` is the gather: both choices lead there.

### Glue

In Ink, a marker (`<>`) that joins text together without a line break:

```ink
I need to tell you<>
{know_secret:, though you probably already know}
<>—it's important.
```

Outputs as one continuous line:

- if `know_secret` is false: "I need to tell you—it's important."
- if `know_secret` is true: "I need to tell you, though you probably already know—it's important."

---

## H

### Hub

A story structure where the reader keeps returning to a central location and choosing what to do next. Common in games with exploration or conversation systems. This template demo's feature menu is a simple hub.

---

## I

### IF

Interactive fiction. Umbrella term for stories where the reader makes choices or inputs commands. Includes [choice-based](#choice-based) and [parser](#parser) games.

### Ink

A scripting language for interactive fiction created by [Inkle](#inkle). Designed for branching narratives with a clean, readable syntax. This is what you write your story in.

→ [Official Ink documentation](https://github.com/inkle/ink/blob/master/Documentation/WritingWithInk.md)

### Inkle

The game studio that created Ink. Known for *80 Days*, *Heaven's Vault*, *Overboard!*, and other narrative-centric games.

→ [inklestudios.com](https://www.inklestudios.com/)

### Inky

The official editor application for writing Ink. Features a live preview pane so you can play your story as you write.

→ [Download Inky](https://github.com/inkle/inky/releases)

### inklecate

The command-line compiler for Ink. Converts `.ink` files to `.json`. Used for automated workflows. Most people use [Inky](#inky) instead.

→ [Download inklecate](https://github.com/inkle/ink/releases)

### inkjs

The JavaScript implementation of the Ink runtime. This is what actually runs your story in the browser. This template includes inkjs—you don't need to set it up yourself.

→ [inkjs on GitHub](https://github.com/y-lohse/inkjs)

---

## J

### JSON

JavaScript Object Notation. A file format that's easy for computers to read. When you export your Ink story, it becomes a `.json` file. You don't need to understand JSON to use Ink—but your browser or game engine needs JSON to understand Ink.

---

## K

### Knot

A major section of an Ink story. Like a chapter or scene. Defined with three equals signs:

```ink
=== tavern ===
The tavern is warm and noisy.

=== forest ===
Trees press in around the narrow path.
```

You navigate to knots with [diverts](#divert): `-> tavern`. See related [stitches](#stitch).

---

## L

### LIST

An Ink data type for managing sets of values. Useful for inventory, status effects, relationship flags, or anything where you need to track multiple on/off states:

```ink
LIST Inventory = sword, key, potion, map
VAR bag = (sword, key)

~ bag += potion      // Add item
~ bag -= key         // Remove item
{bag has sword: ...} // Check item
```

More powerful than simple boolean flags for complex state tracking.

### localStorage

Browser storage that persists between visits. This template uses localStorage for saves and settings. If a reader clears their browser data, localStorage is wiped.

---

## N

### Node

A generic term for a single point in a branching story—a scene, passage, or decision point. In Ink, this would typically be a [knot](#knot) or [stitch](#stitch).

---

## P

### Parser

Interactive fiction where the reader types commands like "LOOK AT KEY" or "GO NORTH." Classic text adventures like *Zork* are parser games. Contrast with [choice-based](#choice-based). This template is for choice-based IF, not parser IF.

### Passage

A term used in Twine for a single node in a story. Ink uses [knots](#knot) and [stitches](#stitch) instead, but the concept is similar.

---

## R

### Runtime

The software that interprets and runs your story. For Ink in browsers, this is [inkjs](#inkjs). The runtime reads your compiled JSON and handles all the story logic—you don't interact with it directly.

---

## S

### Save slot

A named location where the reader can save their progress. This template provides 5 manual save slots plus [autosave](#autosave).

### Special page

A template feature for content that exists outside the normal story flow—character sheets, inventory screens, maps, credits. Readers access them from the navigation menu.

```ink
=== character_sheet ===
# SPECIAL_PAGE: Character
...
```

See [Special Pages reference](reference/special-pages.md).

### Static hosting

Web hosting for files that don't change dynamically. Your Ink story is static—it's just HTML, CSS, JavaScript, and JSON files that don't need a server to process them. Services like itch.io, Neocities, and GitHub Pages provide free static hosting.

### Stat bar

A visual progress bar for displaying variables like health, relationships, or skills:

```ink
# STATBAR: health "Health" 0 100
# STATBAR: reputation "Feared" "Respected"
```

See [Stat Bars reference](reference/stat-bars.md).

### Sticky choice

An Ink [choice](#choice) that remains available after being selected (using `+` instead of `*`):

```ink
+ [Ask about the weather] "Nice day," he says.
+ [Ask about the news] "Nothing new," he shrugs.
* [Leave] -> exit  // This one disappears after use
```

Regular choices (`*`) disappear after being picked. Sticky choices (`+`) stay.

### Stitch

A subsection within an Ink [knot](#knot). Like a scene within a chapter:

```ink
=== tavern ===
= entrance
You push open the heavy door.
-> bar

= bar
The bartender looks up expectantly.
```

Stitches are defined with a single `=`. Navigate to them with a [divert](#divert) `-> knot.stitch` from anywhere in the story (e.g., `-> tavern.bar`).

---

## T

### Tag

Metadata attached to a line of Ink. Tags communicate with the template—they're processed when your story runs, not shown to readers:

```ink
# IMAGE: castle.jpg
# AUDIO: thunder.mp3
The castle loomed ahead.
```

See [Quick Reference](quick-reference.md) for all available tags.

### Thread

An Ink feature for running parallel narrative paths at the same time. Advanced technique—you can build complex stories without ever using threads.

→ [Threads in Ink documentation](https://github.com/inkle/ink/blob/master/Documentation/WritingWithInk.md#2-threads)

### Tone indicator

A template feature that adds small icons to choices to hint at their tone or consequences:

```ink
# TONE: flirty local_fire_department
# TONE: danger warning

* [Wink at them] # flirty
* [Run away] # danger
```

See [Choices reference](reference/choices.md).

### Tunnel

An Ink feature for temporarily diverting to another knot and then returning. Like a function call that continues where you left off:

```ink
-> get_dressed ->
Now you're ready to leave.

=== get_dressed ===
You put on your coat.
->->
```

The `->->` returns to wherever the tunnel was called from. See also: [function](#function).

---

## V

### Variable

A named value that can change during the story. Used to track choices, stats, inventory, and reader input:

```ink
VAR player_name = "Unknown" // Declare variable
VAR gold = 10
VAR has_sword = false

~ gold = gold + 5  // Modify variable
{has_sword: You draw your blade.}  // Check variable
```

See also [LIST](#list).

---

## W

### Weave

Ink's system for managing complex branching through nesting levels, using [choices](#choice) (`*`/`+`) and [gathers](#gather) (`-`). Allows sophisticated flow without explicit diverts. You're using weaves when you indent choices within choices:

```ink
* [Talk to the guard]
  "State your business."
  ** [Lie] "Just passing through."
  ** [Tell truth] "I seek the king."
  -- He nods slowly.
* [Sneak past]
  You slip into the shadows.
- Either way, you're inside now.
```

Understanding weaves deeply is optional—many authors just use knots and simple choices.

→ [Weave in Ink documentation](https://github.com/inkle/ink/blob/master/Documentation/WritingWithInk.md#part-2-weave)

---

## Missing something?

If you encountered a term that isn't here, [open an issue](https://github.com/RemyVim/ink-if-story-template/issues) and suggest an addition.
