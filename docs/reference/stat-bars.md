---
layout: default
title: Stat Bars
description: >-
  Display visual progress bars for health, skills, relationships, or any Ink
  variable.
---
# Stat Bars

Display numeric variables as visual progress bars—perfect for health, relationships, skills, or any stat you want players to see at a glance.

## Basic Usage

```ink
VAR health = 75

# STATBAR: health
```

**Aliases:** `# STAT_BAR:`, `# PROGRESSBAR:`, `# PROGRESS_BAR:`

This displays a progress bar showing the current value of `health`. By default, the bar assumes a range of 0–100 and uses the variable name as the label.

## Custom Display Name

Add a quoted string to set a friendlier label:

```ink
# STATBAR: health "Hit Points"
```

Displays as "Hit Points" instead of "health".

## Custom Range

Specify min and max values when your stat doesn't use 0–100:

```ink
VAR mana = 20

# STATBAR: mana 0 50 "Magical Energy"
```

The format is `# STATBAR: variable min max "Label"`.

## Opposed Stat Bars

For stats that represent a spectrum between two extremes (like ChoiceScript's opposed pairs), use two labels:

```ink
VAR bravery = 65

# STATBAR: bravery "Brave" "Cowardly"
```

This creates a bar with "Brave" on the left and "Cowardly" on the right. The display shows both values (e.g., "65/35") so players can see where they fall on the spectrum.

You can combine this with custom ranges:

```ink
# STATBAR: morality -100 100 "Evil" "Good"
```

## Value Clamping

By default, stat bars display the actual variable value, even if it goes below the minimum or above the maximum. This is useful during development to spot logic errors.

For a polished release, add `clamp` to keep displayed values within range—regardless whether the true value overflows:

```ink
# STATBAR: health clamp
# STATBAR: health 0 100 "HP" clamp
# STATBAR: bravery "Brave" "Cowardly" clamp
```

**Note:** The visual bar always stays within bounds (it won't overflow or go negative). Clamping only affects the displayed number.

## Using on Special Pages

Stat bars work great on special pages for character sheets:

```ink
=== character_sheet ===
# SPECIAL_PAGE: Character

: Your Stats

# STATBAR: health "Health"
# STATBAR: mana 0 50 "Mana"
# STATBAR: reputation "Hated" "Beloved"

-> DONE
```

You can display multiple stat bars in a row; they'll each appear on their own line.

## Quick Reference

| Syntax | Result |
|--------|--------|
| `# STATBAR: var` | Basic bar (0–100, variable name as label) |
| `# STATBAR: var "Label"` | Custom display name |
| `# STATBAR: var 0 50` | Custom range (0–50) |
| `# STATBAR: var 0 50 "Label"` | Custom range with label |
| `# STATBAR: var "Left" "Right"` | Opposed bar with two labels |
| `# STATBAR: var 0 100 "Left" "Right"` | Opposed bar with custom range |
| `# STATBAR: var clamp` | Clamp displayed value to range |

Note: Parameters can appear in any order after the variable name. If specifying a range, the first number found becomes min, the second becomes max.

## Tips

* **Variable must exist:** Declare your variable with `VAR` before using it in a stat bar.
* **Updates automatically:** When you revisit a passage with a stat bar, it shows the current value.
* **Combine with text:** Add context around your stat bars with regular Ink text.
* **Accessibility:** Stat bars include ARIA attributes so screen readers announce values properly.

## Example: RPG Character Sheet

```ink
VAR health = 80
VAR mana = 25
VAR strength = 60
VAR reputation = 45

=== stats_page ===
# SPECIAL_PAGE: Stats

: Character Stats

:: Combat

# STATBAR: health "Health" clamp
# STATBAR: mana 0 50 "Mana" clamp
# STATBAR: strength "Strength" clamp

:: Social

# STATBAR: reputation "Feared" "Respected"

-> DONE
```
