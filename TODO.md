# Feature Development TODO

This document tracks all planned features for the Ink Story Template.
Features are organized by feature domain.

## Table of Contents

1. [Core Features](#core-features)
   - [Save & Load System](#save--load-system)
   - [Story Navigation](#story-navigation)
2. [User Input](#user-input)
   - [Choices](#choices)
   - [Input Fields](#input-fields)
3. [Text](#text)
   - [Formatting](#formatting)
   - [Interactive Text](#interactive-text)
   - [Text Effects](#text-effects)
4. [Media](#media)
   - [Images](#images)
   - [Audio](#audio)
5. [Pages & Layout](#pages--layout)
   - [Special Pages](#special-pages)
   - [UI Components](#ui-components)
6. [Reader Engagement](#reader-engagement)
   - [Notifications & Achievements](#notifications--achievements)
   - [Reading Session](#reading-session)
   - [Chapter System](#chapter-system)
   - [Character & World Reference](#character--world-reference)
   - [Footnotes & Commentary](#footnotes--commentary)
   - [Personal Reader Tools](#personal-reader-tools)
   - [Stats & Progress Display](#stats--progress-display)
7. [Appearance](#appearance)
   - [Visual Customization](#visual-customization)
   - [Visual Effects](#visual-effects)
8. [Accessibility](#accessibility)
   - [Visual Accessibility](#visual-accessibility)
   - [Screen Reader Support](#screen-reader-support)
   - [Keyboard Navigation](#keyboard-navigation)
9. [Author Tools](#author-tools)
   - [Utility Functions](#utility-functions)
   - [Content & Sensitivity](#content--sensitivity)
   - [Playthrough Analytics](#playthrough-analytics)
10. [Dev Tools](#dev-tools)
    - [Debug Panel](#debug-panel)
    - [Validation](#validation)
    - [Automated Testing](#automated-testing)
    - [Error Management](#error-management)
11. [Documentation](#documentation)
12. [Fixes Needed](#fixes-needed)

---

## Core Features

### Save & Load System

- [x] 5 save slots
- [x] Autosave slot (saves on each choice)
- [x] LocalStorage persistence
- [x] Export save to JSON file
- [x] Import save from JSON file
- [x] Delete individual saves
- [x] Keyboard shortcut (Ctrl+S) to open save menu
- [x] Keyboard shortcut (Esc) to close save menu
- [x] Keyboard shortcut (Ctrl+R) to restart story
- [ ] Configurable names/descriptions for saves
- [ ] Auto-load prompt on story start (if save exists)
- [ ] URL-shareable save states (encoded in URL)

### Story Navigation

- [x] Restart button
- [x] Clickable title to restart story
- [ ] Breadcrumb trail of visited passages
- [ ] Story map visualization (for authors/debug)

---

## User Input

### Choices

- [ ] Keyboard choice selection (1-9 keys)
- [ ] Number hints next to choices (toggleable)
- [ ] Tone icons next to choices (toggleable, tag-based)
- [ ] Skill check tagging on choices (toggleable, tag-based)
- [ ] Confirmation dialogs for major choices (custom messages)
- [ ] Timed choices (auto-select after X seconds)
- [ ] Weighted random choice selection

### Input Fields

- [x] User input fields (`# USER_INPUT: varname` or `# INPUT: varname`)
- [x] Populate Ink variables with user text
- [x] Placeholder text in input fields
- [ ] Number input with validation (`# INPUT_NUMBER: var min max`)
- [ ] Allow blank input option
- [ ] Input character limit
- [ ] Input validation patterns
- [ ] Dropdown select input (`# SELECT: var option1 option2 option3`)
- [ ] Checkbox input
- [ ] Radio button groups
- [ ] Slider input for numeric values

---

## Text

### Formatting

- [x] Bold text (`__bold__`)
- [x] Italic text (`_italic_`)
- [x] Bold and italic (`___bold italic___`)
- [x] Inline code (`` `code` ``)
- [ ] Code blocks on multiple paragraphs
- [x] Headers (`:`, `::`, `:::`)
- [x] Bullet points (`>`)
- [x] Block quotes (`>>`)
- [ ] Block quotes on multiple paragraphs
- [x] Horizontal separators (`[---]`)
- [x] External links (`[text](url)`)
- [x] Custom inline styles (`[text](highlight)`, `[text](important)`, `[text](quiet)`)
- [x] Escape markdown with `%` character

### Interactive Text

Twine-style interactive text elements.

- [ ] Click to reveal
- [ ] Click to append (add text after click)
- [ ] Click to replace (swap text on click)
- [ ] Cycling links (click to cycle through options)
- [ ] Hover to reveal (show on mouseover)
- [ ] One-time reveal (disappears after showing)

### Text Effects

- [ ] Delayed text display (on timer)
- [ ] Text decay (on timer)
- [ ] Text transitions (fade/slide in)
- [ ] Typewriter text effect
- [ ] Text speed control (if typewriter or transitions)
- [ ] Glitch/corruption text effect
- [ ] Whisper text (faint, grows on hover)

---

## Media

### Images

- [x] Image display (`# IMAGE: path`)
- [x] Background images (`# BACKGROUND: path`)
- [ ] Image alignment (`# IMAGE: path left/right/center`)
- [ ] Text wrapping around images
- [ ] Image captions
- [ ] Clickable/zoomable images
- [ ] Image galleries

### Audio

- [x] Sound effects (`# AUDIO: path`)
- [x] Looping background music (`# AUDIOLOOP: path`)
- [x] Audio on/off toggle in settings
- [ ] Volume control slider in settings
- [ ] Audio crossfades between tracks (configurable duration)
- [ ] Layered ambient audio (multiple tracks)
- [ ] Per-track volume control
- [ ] Audio ducking (lower music during sound effects)

---

## Pages & Layout

### Special Pages

- [x] Special page system (`# SPECIAL_PAGE` tag)
- [x] Return to story from special pages
- [x] Named special pages (`# SPECIAL_PAGE: Name`)
- [x] Dynamic special page detection
- [x] Navigation menu for special pages
- [x] Ordered special pages menu (`# PAGE_MENU:` tag)
- [ ] Tabs for organizing special page content
- [ ] Collapsible sections / accordion UI
- [ ] Header passage (appears on every page)
- [ ] Footer passage (appears on every page)

### UI Components

- [x] Modal system (save/settings dialogs)
- [x] Confirmation dialogs for restart/delete saves
- [x] Responsive design (mobile, tablet, desktop)
- [ ] Page break / Continue button (`# PAGE_BREAK: Button Text`)
- [ ] Progress bars for stats display
- [ ] Modal popups for info boxes
- [ ] Tooltips (hover for more info)
- [ ] Toast notifications positioning options
- [ ] Customizable UI layout via tags
- [ ] Sidebar option (alternative to top nav)

---

## Reader Engagement

### Notifications & Achievements

#### Notifications

- [x] Notification system
- [x] Auto-dismiss timing
- [x] Multiple notification types with styling
- [x] Info notifications (`# NOTIFICATION: text`)
- [x] Achievement notifications (`# ACHIEVEMENT: text`)
- [x] Warning notifications (`# WARNING: text`)
- [x] Error notifications (`# ERROR: text`)

#### Achievement System

ChoiceScript-style persistent achievements.

- [ ] Persistent achievements (across playthroughs)
- [ ] Achievement definitions in Ink (`# ACHIEVEMENT_DEF: id | title | desc | points`)
- [ ] Hidden/secret achievements
- [ ] Achievement points system (1000 total)
- [ ] Achievements page/panel
- [ ] Check if achievement earned (`# IF_ACHIEVED: id`)
- [ ] Achievement progress tracking

### Reading Session

- [ ] Estimated reading time display (toggleable)
- [ ] Reading session duration tracking (toggleable)
- [ ] "Take a break" gentle reminder (after X minutes, optional, toggleable)
- [ ] Estimated reading progress percentage

### Chapter System

- [ ] Chapter markers (`# CHAPTER: 3: The Descent`)
- [ ] Chapter title cards
- [ ] "Chapter X of Y" display
- [ ] Jump-to-chapter menu (visited chapters only)
- [ ] Progress within chapter indicator

### Character & World Reference

#### Glossary

- [ ] Define terms: `# GLOSSARY: term: Definition`
- [ ] Terms become hoverable with tooltip in story text

#### Character Codex

- [ ] Define characters: `# CHARACTER: id: Name | Description | first_met`
- [ ] Names become hoverable with tooltip in story text

### Footnotes & Commentary

- [ ] Footnotes system (`# FOOTNOTE: text`)
- [ ] Author margin notes (`# MARGIN: text`)
- [ ] "Director's commentary" toggle mode

### Personal Reader Tools

- [ ] Reader annotations / notes system
  - Highlight text and add personal notes
  - Persists across sessions
  - Exportable
- [ ] Share a quote feature
  - Select text → generate shareable image/text with title/author credit
- [ ] Export playthrough as PDF/ePub (author configurable)

### Stats & Progress Display

ChoiceScript-style stat displays.

- [ ] Percent stat bars (`# STAT_BAR: variable 0 100`)
- [ ] Opposed pair bars (`# OPPOSED: var1 Label1 | var2 Label2`)
- [ ] Stat bar labels and custom colors

---

## Appearance

### Visual Customization

- [x] Theme switcher (light/dark/auto)
- [x] Font family selection (serif, sans, dyslexic-friendly)
- [x] Text size adjustment
- [x] Line height adjustment
- [ ] Reading width adjustment (narrow/medium/wide)
- [ ] Paragraph spacing control
- [ ] Settings import/export
- [ ] Per-story settings persistence
- [ ] Configurable settings (tag-based, disable setting, on/off defaults)

### Visual Effects

- [x] Animation toggle in settings
- [x] `prefers-reduced-motion` CSS support

---

## Accessibility

### Visual Accessibility

- [x] Font size controls
- [x] Line height controls
- [x] Dyslexia-friendly font option (OpenDyslexic)
- [ ] Color contrast verification (4.5:1 for text)
- [ ] Touch target size minimum (44x44px)
- [ ] High contrast mode toggle
- [ ] `prefers-contrast` CSS support
- [ ] Color blind mode options (protanopia, deuteranopia, tritanopia)
- [ ] Text spacing override support (WCAG 1.4.12)

### Screen Reader Support

- [ ] ARIA landmarks (`role="navigation"`, `role="main"`)
- [ ] ARIA live regions for dynamic content (`aria-live="polite"`)
- [ ] Semantic choice markup (`role="listbox"`, `role="option"`)
- [ ] Modal accessibility (`role="dialog"`, `aria-modal="true"`)
- [ ] Focus trapping in modals
- [ ] Return focus on modal close
- [ ] Icon accessibility (`aria-hidden="true"` + `.sr-only` labels)
- [ ] Skip link ("Skip to story content")
- [ ] ARIA announcer for errors and notifications
- [ ] Loading state announcements (`aria-busy`)
- [ ] Reading progress announcements

### Keyboard Navigation

- [ ] Visible focus indicators (`:focus-visible`)
- [ ] Logical tab order audit
- [ ] Keyboard shortcuts reference panel

---

## Author Tools

### Utility Functions

#### String Functions

- [x] Basic: `CAPITALIZE`, `UPPERCASE`, `LOWERCASE`, `TRIM`, `LENGTH`, `CONTAINS`, `STARTS_WITH`, `ENDS_WITH`, `REPLACE`, `REPLACE_ALL`
- [ ] `PLURAL(word, count)` - Returns pluralized word
- [ ] `PLURAL_COUNT(count, singular, plural)` - "1 apple" / "3 apples"
- [ ] `A_OR_AN(word)` - Returns "a" or "an" appropriately
- [ ] `ORDINAL(number)` - Returns "1st", "2nd", "3rd", etc.
- [ ] `LIST_AND(items)` - "apples, oranges, and bananas"
- [ ] `LIST_OR(items)` - "apples, oranges, or bananas"
- [ ] Auto pronoun system (+ change pronouns mid-story)

#### Math Functions

- [x] Basic: `CLAMP`, `ROUND`, `ABS`, `PERCENT`
- [x] Fairmath: `FAIRADD`, `FAIRSUB` (ChoiceScript-style)
- [ ] `CHECK(stat, difficulty)` - Skill check helper
- [ ] `OPPOSED(stat1, stat2)` - Opposed check helper
- [ ] `DICE(notation)` - Parse "2d6+3" style dice notation

#### Time Functions

- [x] `NOW`, `SECONDS_SINCE`, `MINUTES_SINCE`, `TIME_SINCE`
- [x] `FORMAT_DATE`, `FORMAT_TIME`, `FORMAT_DATETIME`, `OFFSET_DATE`
- [ ] Real-world time awareness (time of day, day of week)
- [ ] Real-time wait mechanics (come back in X hours)

### Content & Sensitivity

- [ ] Content warning definitions (`# CONTENT_WARNING_DEF: id | label | description`)
- [ ] Mark sensitive passages (`# CONTENT_WARNING: id`)
- [ ] Reader preference settings (warn / skip / show)
- [ ] Warning dialog before sensitive content
- [ ] Auto-summarize option (skip graphic details)
- [ ] Content warning presets (violence, death, etc.)

### Playthrough Analytics

Optional system for authors to understand how players experience their stories. Opt-in for authors and readers.

#### Data Collection

- [ ] Optional system to share playthrough stats with author
- [ ] Choice history collector
- [ ] Visit counts extraction
- [ ] Final variables snapshot

#### Sharing Methods

- [ ] `# SHARE_METHOD:` global tag to configure share method
- [ ] `# SHARE` choice tag handling
- [ ] Clipboard sharing
- [ ] Email sharing (mailto) support
- [ ] Google Form support
- [ ] Human-readable data formatting

#### Author Analytics Dashboard

Tool (local, offline) for authors to analyse playthrough stats shared by readers.

- [ ] Input reader shared playthrough stats
- [ ] Playthroughs count tracking
- [ ] Chapter completion rates
- [ ] Popular/unpopular paths visualization (aggregated)
- [ ] Drop-off point identification (aggregated)
- [ ] Choice distribution statistics

---

## Dev Tools

### Debug Panel

- [ ] DEBUG tag activation system (`# DEBUG`)
- [ ] Debug floating toggle button
- [ ] Debug collapsible side panel
- [ ] Current location display (knot/stitch path)
- [ ] Variable list with real-time updates
- [ ] Variable editing (strings, numbers, booleans)
- [ ] Variable editing for LISTs
- [ ] Pin/hide variables with localStorage
- [ ] Jump-to-knot searchable dropdown
- [ ] Integration of validation warnings in debug panel

### Validation

- [ ] Asset validation (check if files exist)
- [ ] Console warnings for missing assets
- [ ] Tag linting (catch malformed/unknown tags)

### Automated Testing

- [ ] Browser compatibility testing
- [ ] Mobile testing (tooltips, back button, navigation)
- [ ] Performance testing with large stories
- [ ] Accessibility audit (automated)
- [ ] Save/load testing with all new features
- [ ] Visual regression testing

### Error Management

- [x] Graceful error recovery
- [x] Error logging system
- [x] User-friendly error messages
- [x] Console error tracking
- [ ] Error recovery suggestions

---

## Documentation

- [x] Public demo
- [x] Main README
- [x] Changelog
- [x] TODO features list (this one!)
- [x] Quick start guide
- [x] Text formatting guide
- [x] Special tags reference
- [x] Utility functions reference

---
