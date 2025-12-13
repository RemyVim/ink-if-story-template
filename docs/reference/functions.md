---
layout: default
title: Functions
description: >-
  Built-in string, math, fairmath, and time functions for Ink interactive
  fiction.
---
# Functions

Use functions in your Ink story to manipulate strings, perform math, create balanced stat systems and keep track of time! This guide covers both Ink's built-in functions and the extras this template adds.

## Table of Contents

- [Quick Reference](#quick-reference)
  - [Ink Built-in Functions](#ink-built-in-functions)
  - [Template Functions](#template-functions)
- [Setup](#setup)
- [Examples](#examples)
- [Using Fairmath](#using-fairmath)
- [Using Time Functions](#using-time-functions)
  - [Locale Support](#locale-support)
  - [OFFSET_DATE Parameters](#offset_date-parameters)
- [Tips](#tips)
- [Troubleshooting](#troubleshooting)

## Quick Reference

### Ink Built-in Functions

These work out of the box, no setup required.

| Function | Description | Example |
|----------|-------------|---------|
| `RANDOM(min, max)` | Random integer (inclusive) | `RANDOM(1, 6)` |
| `FLOOR(x)` | Round down | `FLOOR(3.7)` → 3 |
| `CEILING(x)` | Round up | `CEILING(3.2)` → 4 |
| `INT(x)` | Truncate to integer | `INT(3.9)` → 3 |
| `FLOAT(x)` | Convert to decimal | `FLOAT(3)` → 3.0 |
| `POW(x, y)` | x to the power of y | `POW(2, 3)` → 8 |
| `MIN(a, b)` | Smaller of two values | `MIN(5, 3)` → 3 |
| `MAX(a, b)` | Larger of two values | `MAX(5, 3)` → 5 |
| `TURNS()` | Choices made so far | `TURNS()` |
| `CHOICE_COUNT()` | Current available choices | `CHOICE_COUNT()` |
| `SEED_RANDOM(x)` | Seed the RNG | `SEED_RANDOM(42)` |
| `TURNS_SINCE(-> knot)` | Turns since visiting knot | `TURNS_SINCE(-> intro)` |
| `READ_COUNT(-> knot)` | Times knot was visited | `READ_COUNT(-> shop)` |

**List functions:** `LIST_COUNT()`, `LIST_MIN()`, `LIST_MAX()`, `LIST_ALL()`, `LIST_INVERT()`, `LIST_RANDOM()`, `LIST_RANGE()`, `LIST_VALUE()`

See the [official Ink documentation](https://github.com/inkle/ink/blob/master/Documentation/WritingWithInk.md), it explains some of these (especially LIST functions).

### Template Functions

These require declaring `EXTERNAL` functions in your Ink file (see setup below).

#### String Functions

| Function | Description | Example |
|----------|-------------|---------|
| `UPPERCASE(str)` | Convert to uppercase | `UPPERCASE("hello")` → "HELLO" |
| `LOWERCASE(str)` | Convert to lowercase | `LOWERCASE("HELLO")` → "hello" |
| `CAPITALIZE(str)` | Capitalize first letter | `CAPITALIZE("john")` → "John" |
| `TRIM(str)` | Remove leading/trailing spaces | `TRIM("  hi  ")` → "hi" |
| `LENGTH(str)` | Character count | `LENGTH("hello")` → 5 |
| `CONTAINS(str, search)` | Check if contains substring | `CONTAINS("hello", "ell")` → true |
| `STARTS_WITH(str, search)` | Check string start | `STARTS_WITH("hello", "he")` → true |
| `ENDS_WITH(str, search)` | Check string end | `ENDS_WITH("hello", "lo")` → true |
| `REPLACE(str, old, new)` | Replace first occurrence | `REPLACE("hello", "l", "L")` → "heLlo" |
| `REPLACE_ALL(str, old, new)` | Replace all occurrences | `REPLACE_ALL("hello", "l", "L")` → "heLLo" |

#### Math Functions

| Function | Description | Example |
|----------|-------------|---------|
| `ROUND(x)` | Round to nearest integer | `ROUND(3.5)` → 4 |
| `CLAMP(x, min, max)` | Constrain value to range | `CLAMP(150, 0, 100)` → 100 |
| `ABS(x)` | Absolute value | `ABS(-5)` → 5 |
| `PERCENT(value, total)` | Calculate percentage | `PERCENT(25, 200)` → 13 |

#### Fairmath Functions

| Function | Description | Example |
|----------|-------------|---------|
| `FAIRADD(stat, percent)` | Add with diminishing returns | `FAIRADD(80, 20)` → 84 |
| `FAIRSUB(stat, percent)` | Subtract with diminishing returns | `FAIRSUB(20, 20)` → 16 |

#### Time Functions

| Function | Description | Example |
|----------|-------------|---------|
| `NOW()` | Current Unix timestamp (seconds) | `NOW()` → 1732645200 |
| `SECONDS_SINCE(start)` | Seconds elapsed since timestamp | `SECONDS_SINCE(start)` → 45 |
| `MINUTES_SINCE(start)` | Minutes elapsed since timestamp | `MINUTES_SINCE(start)` → 5 |
| `TIME_SINCE(start)` | Human-readable elapsed time | `TIME_SINCE(start)` → "5 minutes" |
| `FORMAT_DATE(ts, locale)` | Format timestamp as date | `FORMAT_DATE(ts, "en-US")` → "November 26, 2025" |
| `FORMAT_TIME(ts, locale)` | Format timestamp as time | `FORMAT_TIME(ts, "en-US")` → "3:45 PM" |
| `FORMAT_DATETIME(ts, locale)` | Format timestamp as date and time | `FORMAT_DATETIME(ts, "en-US")` → "November 26, 2025, 3:45 PM" |
| `OFFSET_DATE(ts, y, mo, d, h, mi)` | Add/subtract from timestamp | `OFFSET_DATE(ts, -5, 0, 0, 0, 0)` → 5 years ago |

## Setup

To use template functions, add `EXTERNAL` declarations at the top of your main `.ink` file. These declarations only need to be added once per story to be used anywhere in the story. Only include the functions you actually use:

```ink
// String functions
EXTERNAL UPPERCASE(str)
EXTERNAL LOWERCASE(str)
EXTERNAL CAPITALIZE(str)
EXTERNAL TRIM(str)
EXTERNAL LENGTH(str)
EXTERNAL CONTAINS(str, search)
EXTERNAL STARTS_WITH(str, search)
EXTERNAL ENDS_WITH(str, search)
EXTERNAL REPLACE(str, old, new)
EXTERNAL REPLACE_ALL(str, old, new)

// Math functions
EXTERNAL ROUND(x)
EXTERNAL CLAMP(x, min, max)
EXTERNAL ABS(x)
EXTERNAL PERCENT(value, total)

// Fairmath functions
EXTERNAL FAIRADD(stat, percent)
EXTERNAL FAIRSUB(stat, percent)

// Time functions
EXTERNAL NOW()
EXTERNAL SECONDS_SINCE(start)
EXTERNAL MINUTES_SINCE(start)
EXTERNAL TIME_SINCE(start)
EXTERNAL FORMAT_DATE(timestamp, locale)
EXTERNAL FORMAT_TIME(timestamp, locale)
EXTERNAL FORMAT_DATETIME(timestamp, locale)
EXTERNAL OFFSET_DATE(timestamp, years, months, days, hours, minutes)
```

## Examples

### Working with Player Names

```ink
EXTERNAL TRIM(str)
EXTERNAL CAPITALIZE(str)

VAR raw_input = "  jane    "
VAR player_name = ""

~ player_name = TRIM(raw_input)
Hello, {CAPITALIZE(player_name)}!
```

Output: `Hello, Jane!`

### Clamping Stats

```ink
EXTERNAL CLAMP(x, min, max)

VAR health = 150
VAR max_health = 100

Your health is {CLAMP(health, 0, max_health)}.
```

Output: `Your health is 100.`

### Progress Percentage

```ink
EXTERNAL PERCENT(value, total)

VAR quests_done = 7
VAR total_quests = 20

You've completed {PERCENT(quests_done, total_quests)}% of all quests.
```

Output: `You've completed 35% of all quests.`

### Conditional Text with String Functions

```ink
EXTERNAL CONTAINS(str, search)
EXTERNAL ENDS_WITH(str, search)

VAR player_name = "john smith"

{CONTAINS(player_name, "smith"): You must be one of the Smith family!}
{ENDS_WITH(player_name, "son"): A Scandinavian name, perhaps?}
```

### Using Built-in Random

No external declaration needed:

```ink
VAR dice_roll = 0
~ dice_roll = RANDOM(1, 6)

You rolled a {dice_roll}!

{dice_roll == 6: Critical hit!}
{dice_roll == 1: Critical miss!}
```

## Using Fairmath

Fairmath (popularized by ChoiceScript) creates balanced stat progression. Instead of flat changes, stats become harder to move the closer they get to extremes.

**FAIRADD** gives you a percentage of your *remaining headroom* (distance to 100):

- At 50: `FAIRADD(50, 20)` → 50 + (50 × 0.20) = **60**
- At 80: `FAIRADD(80, 20)` → 80 + (20 × 0.20) = **84**
- At 95: `FAIRADD(95, 20)` → 95 + (5 × 0.20) = **96**

**FAIRSUB** takes a percentage of your *current value*:

- At 50: `FAIRSUB(50, 20)` → 50 - (50 × 0.20) = **40**
- At 20: `FAIRSUB(20, 20)` → 20 - (20 × 0.20) = **16**
- At 5: `FAIRSUB(5, 20)` → 5 - (5 × 0.20) = **4**

Results are automatically clamped between 0 and 100.

### Fairmath Example

```ink
EXTERNAL FAIRADD(stat, percent)
EXTERNAL FAIRSUB(stat, percent)

VAR reputation = 50

=== tavern ===
The innkeeper eyes you cautiously.

+ [Help with the dishes]
  ~ reputation = FAIRADD(reputation, 15)
  She smiles warmly. "Thank you, traveler."
  -> tavern

+ [Steal from the tip jar]
  ~ reputation = FAIRSUB(reputation, 20)
  You pocket a few coins when no one's looking.
  -> tavern

+ [Leave]
  -> END
```

### Session Tracking

```ink
EXTERNAL NOW()
EXTERNAL TIME_SINCE(start)

VAR session_start = 0
~ session_start = NOW()

// Later in your story...
You've been playing for {TIME_SINCE(session_start)}.
```

Output: `You've been playing for 12 minutes.`

### Real-Time Narrative

```ink
EXTERNAL NOW()
EXTERNAL FORMAT_DATE(timestamp, locale)
EXTERNAL FORMAT_TIME(timestamp, locale)

VAR LOCALE = "en-US"

{FORMAT_DATE(NOW(), LOCALE)} - Dear diary...

The clock on the wall reads {FORMAT_TIME(NOW(), LOCALE)}.
```

### Flashbacks with Date Math

Use `OFFSET_DATE` to calculate dates relative to now. Parameters are: timestamp, years, months, days, hours, minutes.

```ink
EXTERNAL NOW()
EXTERNAL FORMAT_DATE(timestamp, locale)
EXTERNAL OFFSET_DATE(timestamp, years, months, days, hours, minutes)

VAR LOCALE = "en-US"
VAR flashback_date = 0
~ flashback_date = OFFSET_DATE(NOW(), -5, 0, 0, 0, 0)

The incident happened on {FORMAT_DATE(flashback_date, LOCALE)}.
```

Output: `The incident happened on November 26, 2020.`

### Time-Based Gameplay

```ink
EXTERNAL NOW()
EXTERNAL MINUTES_SINCE(start)

VAR quest_started = 0
~ quest_started = NOW()

// Later, check if player took too long
{MINUTES_SINCE(quest_started) > 30:
    The merchant has closed up shop for the day.
- else:
    The merchant waves you over.
}
```

## Using Time Functions

Time functions give your Ink story real-world time awareness. Ink has no native concept of real time, so these bridge that gap.

**Note:** Timestamps are stored in seconds (Unix timestamp format), not milliseconds.

### Locale Support

The `FORMAT_*` functions require a locale parameter. You can find a list of locales at [simplelocalize.io](https://simplelocalize.io/data/locales/).

| Locale | Date Output | Time Output |
|--------|-------------|-------------|
| `"en-US"` | November 26, 2025 | 3:45 PM |
| `"en-GB"` | 26 November 2025 | 15:45 |
| `"fr-FR"` | 26 novembre 2025 | 15:45 |
| `"de-DE"` | 26. November 2025 | 15:45 |
| `"ja-JP"` | 2025年11月26日 | 15:45 |

**Tip:** Define a `LOCALE` variable once and reuse it throughout your story:

```ink
VAR LOCALE = "en-US"

Today is {FORMAT_DATE(NOW(), LOCALE)}.
The time is {FORMAT_TIME(NOW(), LOCALE)}.
```

### OFFSET_DATE Parameters

`OFFSET_DATE(timestamp, years, months, days, hours, minutes)`

Use negative numbers to go back in time:

```ink
// 5 years ago
~ past = OFFSET_DATE(NOW(), -5, 0, 0, 0, 0)

// 2 years, 3 months, 15 days ago
~ past = OFFSET_DATE(NOW(), -2, -3, -15, 0, 0)

// 1 week from now
~ future = OFFSET_DATE(NOW(), 0, 0, 7, 0, 0)

// 6 hours from now
~ later = OFFSET_DATE(NOW(), 0, 0, 0, 6, 0)
```

## Tips

- You can't use logic inside string literals. Use `~ variable = FUNCTION(x)` instead of `VAR variable = "{FUNCTION(x)}"`
- You can chain functions: `{UPPERCASE(TRIM(player_input))}` works as expected
- Test in browser! Functions execute at runtime, so test in your actual story

## Troubleshooting

**"Missing function binding" error?**

- Check that you declared the `EXTERNAL` function in your Ink file
- Make sure `ink-functions.js` is loaded before `story-manager.js` in your `index.html` file

**Function returns unexpected value?**

- `REPLACE` only replaces the first occurrence, use `REPLACE_ALL` for all
- `PERCENT` returns an integer (rounded), not a decimal

**Date showing wrong format?**

- Make sure you're passing a valid locale string (e.g., "en-US", "fr-FR")
- Invalid locales will fall back to "en-US" (check browser console for warnings)
