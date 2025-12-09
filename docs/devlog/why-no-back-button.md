---
layout: default
title: Why There's No Back Button
description: >-
  On resisting a feature request, respecting the engine, and why choices should
  matter.
---
# Why There's No Back Button

If you've played any interactive fiction, you've wanted to undo a choice. You picked the wrong dialogue option. You missed a branch you wanted to explore. You accidentally got your favorite character killed. The instinct is immediate: where's the back button?

This template doesn't have one. That's not an oversight.

## The Back Button

People ask for back buttons. It's probably the most obvious "missing" feature. Every browser has one. Every text editor has undo. It feels like a basic expectation.

I thought about it seriously. I even started sketching out how it might work. Then I stopped, and here's why.

## How Ink Actually Works

To understand why there's no back button, you need to understand a little about how Ink—the scripting language this template is built for—handles state.

When you're playing an Ink story, the engine keeps track of where you are: which passage you're in, what choices you've made, what variables have changed. All of that gets bundled into a single snapshot—a "state." Ink can serialize that state to a JSON string, and later, load it back. That's how saves work. You're not saving a file path or a bookmark; you're saving *everything* about the story at that exact moment.

One small hickup for the back button though: that saved state is a point in time, not a history. Ink doesn't remember *how* you got there. It knows how many times the player has visited a knot or it they've seen this section or not, but it doesn't track what order the player went through the story. It doesn't keep a stack of previous states you can pop back through. It really just knows *now*.

So to implement a back button, you'd need to do one of two things:

**Option one:** Save the state before every single choice. Maintain a stack of snapshots. When the player hits "back," pop the stack and restore.

This works, technically. But it means storing potentially dozens of full state snapshots per session. It complicates saves—do you save the whole history stack? It uses more memory. It makes the code more fragile. And it creates weird edge cases: how far back can you go? What happens if you go back and make different choices—do you fork the history? Discard the future?

**Option two:** When the player wants to go back, restart the story from the beginning and silently replay all the choices up to the previous decision point.

This could also work, technically. But it's slow for long stories. And if your story uses any randomness at all—shuffled text, random events—replaying might not produce the same results. You could end up in a different state than you were in before.

Neither option is impossible. But both are complicated, and both fight against how Ink is designed to work.

## The Philosophy

Here's where I made a choice of my own.

Ink was designed without a back button. That's not an accident. The creators of Ink built a scripting language where choices are meant to be permanent. You say something, it's said. You open a door, it's open. The story moves forward.

That's not a limitation. That's a design philosophy. Choices matter *because* you can't take them back. The weight of a decision comes from its permanence. If you can just undo anything, choices become experiments instead of commitments. "I wonder what happens if I pick this" instead of "I need to decide what I actually want to do."

I didn't want to fight the engine I built this template for. Ink says forward only. I'm going with that.

## The Alternative

So what do you get instead? A save system. Five manual slots plus autosave. You can save before a big decision, try one path, then load and try another. You can export saves to files and share them. You can import them on another device.

This is intentional. Saving is a deliberate action. You're choosing to bookmark a moment because it matters to you. That's different from a back button, which makes every choice feel provisional—like you're always drafting, never committing.

The autosave helps if you accidentally close the tab or your browser crashes. But it's not an undo stack. It's a safety net.

## How Special Pages Work (A Digression)

There's one place where the template *does* let you step outside the story without losing your place: special pages. These are reference pages—character sheets, inventory, credits—that you can view mid-story and then return exactly where you were.

The trick is sneaky. When you open a special page, the template:

1. Saves your current story state and what's on screen
2. Creates a *temporary copy* of the entire story
3. Loads your current state into that copy (so your character sheet shows current stats, not starting stats)
4. Jumps the temp story to the special page and displays it
5. When you click "Return to Story," it throws away the temp copy and restores the saved state

Your main story never knew you left. You can check your inventory between choices without losing your place.

I mention this because it shows that workarounds *are* possible when they serve the experience. Special pages let you reference information without breaking flow. But a back button would change what choices mean. That's a different thing entirely.

## The Actual Answer

So why is there no back button?

Partly because it's technically awkward. Ink doesn't make it easy, and the workarounds have real costs.

But mostly because I don't think there should be one. Interactive fiction is a genre where choices define the experience. Making those choices reversible changes the genre. It turns a story into a puzzle, where you're optimizing for the "best" outcome instead of living with the consequences of your decisions.

Five save slots and an autosave is plenty. If you want to explore different branches, save first. Make it intentional, not reflexive.

Some choices should stick.

---

If you're building your own Ink template and you *do* want a back button, I'm not going to stop you. The state snapshot approach is probably your best bet—save before each choice, keep a stack, pop on undo. Just know what you're trading away.

And if you're a player who really wants undo in stories built with this template: save often. That's your back button. You just have to mean it.
