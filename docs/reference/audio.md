---
layout: default
title: Audio
description: Add sound effects and background music to your Ink interactive fiction story.
---
# Audio

Add sound effects and background music to enhance your story's atmosphere.

## Sound Effects

Play a sound once when the text appears:

```ink
# AUDIO: assets/sword-clang.mp3
```

**Aliases:** `# SOUND:`, `# SOUND_EFFECT:`, `# SFX:`

Great for: door creaks, footsteps, notifications, dramatic moments.

## Background Audio

Loop music continuously:

```ink
# AUDIOLOOP: assets/tavern-music.mp3
```

**Aliases:** `# AUDIO_LOOP`, `# MUSIC:`, `# BACKGROUND_MUSIC:`, `# BGM:`

To stop the music:

```ink
# AUDIOLOOP: none
```

You can also use `stop` instead of `none`.

## Tips

- **Supported formats:** MP3 works everywhere. OGG and WAV also work in most browsers.
- **File location:** Put audio files in `assets/`. (Not required, all paths are relative to the template's base directory, but it keeps everything organized!)
- **Reader control:** Players can mute all audio in the Settings menu.

---

**Questions?** [Open an issue](https://github.com/RemyVim/ink-if-story-template/issues) on GitHub.
