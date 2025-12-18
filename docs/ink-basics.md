---
layout: default
title: Ink Basics
description: >-
  Quick primer on the Ink scripting language: knots, diverts, choices, 
  variables, lists, conditionals, functions, and tunnels.
---
# Ink Basics

Quick primer on core concepts in the Ink scripting language. This covers just enough to get started.

For the complete language documentation, see the official [Writing with Ink](https://github.com/inkle/ink/blob/master/Documentation/WritingWithInk.md) guide.

{% include toc-opened.html %}

## Knots and diverts

Stories are divided into **knots** (sections). You move between them with **diverts** (arrows):

```ink
=== start ===                   // knot
You wake up in a strange room.
-> look_around                  // divert to look_around knot

=== look_around ===
The room is small and dusty.
-> END                          // end of story
```

## Stitches

**Stitches** are sub-sections within knots:

```ink
=== tavern ===              // knot
= entrance                  // stitch
You push open the door.
-> bar

= bar                       // stitch
The bartender nods at you.
```

You can navigate to a stitch within a knot from anywhere in your story with `-> knot.stitch` (e.g. `-> tavern.bar`).

## Choices

`*` choices disappear after being picked. `+` choices stay:

```ink
+ This always appears (repeatable choice)
* This disappears after you pick it
```

Brackets separate choice text from text printed after choice selection:

```ink
* Bare text repeats after clicking
* [Bracketed text doesn't repeat]
* [Choice text]Text printed after
```

Text before the bracket appears in both:

```ink
* I [open the door]stride into the room
// choice: "I open the door"
// prints: "I stride into the room"
```

## Gathers

A gather (`-`) collects the flow after choices and continues the story:

```ink
What do you do?

* [Run]
  You sprint away.
* [Hide]
  You duck behind a crate.
- Either way, you hear footsteps approaching.
```

## Glue

Glue (`<>`) prevents line breaks between content:

```ink
I need to think about this...
<>... but not for too long.
// prints: "I need to think about this...... but not for too long."
```

Useful after diverts or conditionals that would otherwise create unwanted line breaks.

## Variables

Store information that can change throughout the story:

```ink
VAR gold = 10                   // numbers
VAR player_name = "Unknown"     // strings (text)
VAR has_key = false             // booleans (true/false)

// modify
~ gold = gold + 5       // or shorter: ~ gold += 5
~ player_name = "Alex"
~ has_key = true

// check (see conditionals below)
{has_key: You have the key.}
{gold >= 100: You are rich!}

// print value
Your name is {player_name}.
```

Store temporary information that is only needed inside a knot or stitch:

```ink
~ temp damage = RANDOM(5, 15)
```

## Lists

Group related values together:

```ink
LIST Items = sword, key, potion
VAR inventory = ()              // empty list variable

~ inventory += key              // add
~ inventory -= key              // remove
{inventory has key: ...}        // check if present
{inventory hasnt key: ...}      // check if absent
```

Lists can also represent states or stages:

```ink
LIST Mood = calm, nervous, angry
VAR player_mood = calm

~ player_mood = angry
{player_mood == angry: You're fuming.}
```

## Conditionals

Show or hide content based on conditions:

```ink
{has_key: You could unlock the door.}
{gold > 20: You can afford the room.}

* {has_key} [Unlock door]  // choice only shows if has_key is true
```

With true and false variants:

```ink
{has_key: You have the key.|The door is locked.}
{gold > 20: You can afford it.|It's too expensive.}
```

For multiple conditions, use a block:

```ink
{
  - gold >= 100:
    "A wealthy customer!"
  - gold >= 50:
    "Welcome, friend."
  - else:
    The merchant ignores you.
}
```

## Operators

Symbols for comparing and combining values. Ink also provides some word alternatives for readability.

**Comparison** (use in conditions):

| Symbol | Meaning                  | Example              |
|--------|--------------------------|----------------------|
| `==`   | equals                   | `{gold == 100}`      |
| `!=`   | not equals               | `{name != "Alex"}`   |
| `>`    | greater than             | `{gold > 50}`        |
| `<`    | less than                | `{health < 20}`      |
| `>=`   | greater than or equal to | `{strength >= 12}`   |
| `<=`   | less than or equal to    | `{timer <= 0}`       |

**Logic** (combine multiple conditions):

| Symbol | Word      | Meaning             | Example                         |
|--------|-----------|---------------------|---------------------------------|
| `&&`   | `and`     | both must be true   | `{has_key and has_map}`         |
| `||`   | `or`      | either can be true  | `{is_brave or is_foolish}`      |
| `!`    | `not`     | inverts the check   | `{not is_locked}`               |

**Lists** (check list contents):

| Symbol | Word     | Meaning              | Example                      |
|--------|----------|----------------------|------------------------------|
| `?`    | `has`    | contains value       | `{inventory has sword}`      |
| `!?`   | `hasnt`  | doesn't contain      | `{inventory hasnt key}`      |

Use whichever form you find more readable.

```ink
// These are equivalent:
{inventory ? sword && status !? poisoned}
{inventory has sword and status hasnt poisoned}
```

**Math**:

| Symbol | Meaning              | Example                              |
|--------|----------------------|--------------------------------------|
| `+`    | add                  | `~ gold = gold + 10`                 |
| `-`    | subtract             | `~ health = health - 5`              |
| `*`    | multiply             | `~ damage = strength * 2`            |
| `/`    | divide               | `~ half = total / 2`                 |
| `%` or `mod` | remainder      | `{turn % 2 == 0}` (every other turn) |
| `++`   | increase by 1        | `~ count++`                          |
| `--`   | decrease by 1        | `~ count--`                          |

**Shorthand assignment**:

```ink
~ gold += 10    // same as: gold = gold + 10
~ gold -= 5     // same as: gold = gold - 5
```

## Sequences

Vary text based on visit count or randomness:

```ink
// In order: first, second, third, then sticks on last
{First time.|Second time.|Third time and onwards.}

// Random each time
The wind {~howls|whispers|falls silent}.

// Cycle through all, then repeat
You draw: {&Ace|King|Queen|Jack}.
```

## Functions

Reusable logic that can be called from anywhere:

```ink
VAR health = 90
VAR max_health = 100

You have {health} health.
~ heal(30)
After healing: {health} health.
-> END

=== function heal(amount) ===
// heal and cap at max_health
~ health = MIN(health + amount, max_health)
```

Functions can also output text:

```ink
-> greet

=== greet ===
{describe_mood("happy")}
-> END

=== function describe_mood(mood) ===
{
    - mood == "happy": You feel cheerful.
    - mood == "sad": You feel down.
    - else: You feel neutral.
}
```

Note: Functions can't contain any diverts or choices.

## Tunnels

Divert to a knot and return when it's done. Unlike functions, tunnels can contain choices:

```ink
-> main

=== main ===
You're at camp.
-> place_order -> 
Back at camp with your drink.
-> END

=== place_order ===
"What'll it be?"
* [Coffee]
  "Coming right up."
* [Tea]
  "Good choice."
- ->->
```

The `-> knot ->` syntax means "go there, then come back." The `->->` means "return to wherever you came from."

## Tags

Tags attach metadata to lines. The template uses these to trigger features:

```ink
This line has a tag. # SOME_TAG
You can have multiple. # TAG_ONE # TAG_TWO

* [Choice with a tag] # CLEAR
```

Tags don't appear in the story text—they're instructions for the template.

See [Quick Reference](quick-reference.md) for all available template tags.

## INCLUDE

Split your story across multiple files with `INCLUDE`:

```ink
INCLUDE variables.ink
INCLUDE functions.ink
INCLUDE chapter1.ink
INCLUDE chapter2.ink
```

All included files are merged together—variables and functions defined in one file are available everywhere. Include each file once in your `main.ink` and they can all reference each other.

---

## Next Steps

- [Building Blocks](building-blocks.md): Copy-paste systems for character creation, skill checks, inventories, and more
- [Quick Reference](quick-reference.md): All template tags and features at a glance
- [Writing with Ink](https://github.com/inkle/ink/blob/master/Documentation/WritingWithInk.md): The complete official Ink documentation
