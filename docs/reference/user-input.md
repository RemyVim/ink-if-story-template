---
layout: default
title: User Input
description: >-
  Add text input fields to collect player names and other input in your Ink
  story.
---
# User Input

Let players type their own text (like a character name) and store it in an Ink variable.

## Basic Usage

```ink
VAR player_name = ""

# USER_INPUT: player_name "Enter your name"
```

**Aliases:** `# INPUT:`, `# PROMPT:`, `# TEXT_INPUT:`

This displays a text field. When the player submits (by pressing Enter or clicking Submit), their input is stored in `player_name`.

You can then use it anywhere as a regular variable:

```ink
Hello, {player_name}! Welcome to the adventure.
```

## Without Placeholder

If you omit the placeholder text, it defaults to "Type your answer here...":

```ink
# USER_INPUT: player_name
```

## Tips

- The variable must be declared (`VAR`) before using `USER_INPUT`.
- Input is stored as a string. Use `{player_name}` to display it.
- Maximum input length is 100 characters.
- The input field auto-focuses when it appears.
