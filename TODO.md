# Feature Development TODO

## Save & Load System

- [x] 5 save slots
- [x] Autosave slot (auto-saves on each choice)
- [x] LocalStorage persistence
- [x] Export save to JSON file
- [x] Import save from JSON file
- [x] Delete individual saves
- [x] Keyboard shortcut (Ctrl+S) to open save menu
- [x] Keyboard shortcut (Esc) to close save menu
- [x] Keyboard shortcut (Ctrl+R) to restart story
- [ ] Configurable names/descriptions for saves (with tags)

## Text Formatting

- [x] Bold text (`__bold__`)
- [x] Italic text (`_italic_`)
- [x] Bold and italic (`___bold italic___`)
- [x] Inline code (`` `code` ``)
- [x] Headers (`:`, `::`, `:::`)
- [x] Bullet points (`>`)
- [x] Block quotes (`>>`)
- [x] Horizontal separators (`[---]`)
- [x] External links (`[text](url)`)
- [x] Custom inline styles (`[text](highlight)`, `[text](important)`, `[text](quiet)`)
- [x] Escape markdown with `%` character
- [ ] Cycling links
- [ ] Click to reveal
- [ ] Click to append

## Media & Assets

### Images

- [x] Image display (`# IMAGE: path`)
- [x] Background images (`# BACKGROUND: path`)

### Audio

- [x] Sound effects (`# AUDIO: path`)
- [x] Looping background music (`# AUDIOLOOP: path`)
- [x] Audio controls in settings
- [ ] Volume setting
- [ ] Audio crossfades between tracks
- [ ] Configurable crossfade duration

## Special Pages

- [x] Special page system (`# SPECIAL_PAGE` tag)
- [x] Return to story from special pages
- [x] Named special pages (`# SPECIAL_PAGE: Name`)
- [x] Dynamic special page detection
- [x] Navigation menu for special pages
- [x] Ordered special pages menu (`# PAGE_MENU:` tag)
- [ ] Tabs for organizing special page content (alternative to menu)
- [ ] Collapsible sections / accordion UI

## User Interface

- [x] Modal system (save/settings dialogs)
- [x] Confirmation dialogs for restart/delete saves
- [x] Responsive design (mobile, tablet, desktop)
- [ ] Progress bars for stats display
- [ ] Modal popups for info boxes
- [ ] Tooltips/glossary

### Settings

- [ ] Configurable settings (tag-based, disable setting, on/off defaults)
- [x] Theme switcher (light/dark/auto)
- [x] Font family selection (serif, sans, dyslexic-friendly)
- [x] Text size adjustment
- [x] Line height adjustment
- [x] Animation toggle
- [x] Audio toggle

### Accessibility

- [x] Font size controls
- [x] Line height controls
- [x] Dyslexia-friendly font option
- [x] Animation toggle
- [ ] Estimated reading time on start screen

### Choices

- [ ] Keyboard choice selection (1-9 keys)
- [ ] Number hints next to choices (optional)
- [ ] Tone icons next to choices (optional, tag-based)
- [ ] Timed choices (auto-select after X seconds)
- [ ] Weighted random choice selection
- [ ] Confirmation dialogs for major choices (custom messages)

### Story history & navigation

- [x] Restart button
- [x] Clickable title to restart story
- [ ] Back button (5-state undo history)
- [ ] Text history log (full read-only transcript)
- [ ] Hybrid navigation (recent = undoable, old = read-only)

### Visual Effects

- [ ] Delayed text display (on timer)
- [ ] Text transitions (fade/slide in)
- [ ] Typewriter text effect (with toggle)
- [ ] Text speed control (if typewriter or transitions)

### Notifications

- [x] Notification system
- [x] Auto-dismiss timing
- [x] Multiple notification types with styling
- [x] Info notifications (`# NOTIFICATION: text`)
- [x] Achievement notifications (`# ACHIEVEMENT: text`)
- [x] Warning notifications (`# WARNING: text`)
- [x] Error notifications (`# ERROR: text`)

## Error Management

- [x] Graceful error recovery
- [x] Error logging system
- [x] User-friendly error messages
- [x] Console error tracking
- [ ] Tag linting (catch malformed/unknown tags)

## Automated Testing

- [ ] Browser compatibility testing
- [ ] Mobile testing (tooltips, back button, navigation)
- [ ] Performance testing with large stories
- [ ] Accessibility audit
- [ ] Save/load testing with all new features

## Utility Functions

### User Input

- [x] User input fields (`# USER_INPUT: varname` or `# INPUT: varname`)
- [x] Populate Ink variables with user text
- [x] Placeholder text in input fields

### String functions

- [x] Basic string functions: `CAPITALIZE`, `UPPERCASE`, `LOWERCASE`, `TRIM`, `LENGTH`, `CONTAINS`
- [x] More string functions: `STARTS_WITH`, `ENDS_WITH`, `REPLACE`, `REPLACE_ALL`
- [ ] Language functions: `PLURAL`, `PLURAL_COUNT`, `A_OR_AN`, `ORDINAL`
- [ ] List formatting: `LIST_AND`, `LIST_OR`
- [ ] Auto pronoun system (+ change pronouns mid-story)

### Math functions

- [x] Basic math functions: `CLAMP`, `ROUND`, `ABS`, `PERCENT`
- [x] Fairmath functions: `FAIRADD`, `FAIRSUB` (ChoiceScript-style)
- [ ] Time functions: `TIMESTAMP`, `TIME_SINCE`
- [ ] Stat check functions: `CHECK`, `OPPOSED`

## Development Tools

### Debug

- [ ] Asset validation (check if files exist)
- [ ] Console warnings for missing assets
- [ ] DEBUG tag activation system
- [ ] Debug floating toggle button
- [ ] Debug collapsible side panel
- [ ] Current location display (knot/stitch path)
- [ ] Variable list with real-time updates
- [ ] Variable editing (strings, numbers, booleans)
- [ ] Variable editing for LISTs
- [ ] Pin/hide variables with localStorage
- [ ] Jump-to-knot searchable dropdown
- [ ] Integration of validation warnings in debug panel

### Playthrough Analytics

- [ ] Optional system to share playthrough stats with author
- [ ] Choice history collector
- [ ] Visit counts extraction
- [ ] Final variables snapshot
- [ ] `# SHARE_METHOD:` global tag to configure share method
- [ ] `# SHARE` choice tag handling
- [ ] Clipboard sharing
- [ ] Email sharing (mailto) support
- [ ] Google Form support
- [ ] Human-readable data formatting

## Documentation

- [x] Public demo
- [x] Main README
- [x] Changelog
- [x] TODO features list (this one!)
- [x] Quick start guide
- [x] Text formatting guide
- [x] Special tags reference
- [x] Utility functions reference
- [ ] Keyboard shortcuts reference
- [ ] Debug inspector usage guide
- [ ] Interactive text examples
- [ ] Stats sharing setup guide

---

## Fixes Needed

- [ ] Saving on a special page breaks save

---

Last updated: 2025-11-25
