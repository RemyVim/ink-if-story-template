---
layout: default
title: Notifications
description: >-
  Show alerts, achievements, warnings, and info messages to readers within your
  Ink story.
---
# Notifications

Show messages to players without interrupting the story flow. Notifications appear briefly in the corner and fade away automatically.

```ink
# NOTIFICATION: You found a secret passage.
# ACHIEVEMENT: Quest Complete!
# WARNING: Your health is low.
# ERROR: Something went wrong.
```

## When to Use Each Type

| Type | Use For | Duration | Aliases |
|------|---------|----------|---------|
| `NOTIFICATION` | General info, discoveries, hints | Short | `NOTIFY`, `MESSAGE`, `INFO` |
| `ACHIEVEMENT` | Milestones, unlocks, successes | Longer (more celebratory) | `SUCCESS` |
| `WARNING` | Low resources, danger ahead, caution | Short | `WARN` |
| `ERROR` | Something went wrong (rare in stories) | Short | `ERR` |

All types are purely visual: they don't affect gameplay. (Yet.)

Achievements might be linked to an actual achievement system in the future.
