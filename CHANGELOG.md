# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## In progress

### Added

- External functions (callable from Ink script):
  - String functions: `UPPERCASE`, `LOWERCASE`, `CAPITALIZE`, `TRIM`, `LENGTH`, `CONTAINS`, `STARTS_WITH`, `ENDS_WITH`, `REPLACE`, `REPLACE_ALL`
  - Math functions: `ROUND`, `CLAMP`, `ABS`, `PERCENT`
  - Fairmath functions: `FAIRADD`, `FAIRSUB`
  - Time functions: `NOW`, `SECONDS_SINCE`, `MINUTES_SINCE`, `TIME_SINCE`, `FORMAT_DATE`, `FORMAT_TIME`, `FORMAT_DATETIME`, `OFFSET_DATE`
- Accessibility:
  - Keyboard shortcuts for choice selection (1-9, A-Z) and page scrolling (arrows, Page Up/Down, Home/End)
  - Keyboard shortcut help reference panel (`ctrl-h` or available through settings)
  - Screen reader support: ARIA landmarks, skip link, modal focus management, live regions for notifications, and accessible choice markup
  - Loading screen and dark mode flash prevention for smoother initial page load
- Ink Tags:
  - `# CHOICE_NUMBERS:` tag to configure choice numbering display (`auto`, `on`, `off`)
  - `# IMAGE:` now supports alignment, width, alt text, and caption options
  - `# TONE:` tag enables tone indicators on choices: define markers with `# TONE: tagname icon` and tag choices with `# tagname`. Players can toggle in Settings.
  - `# STATBAR: variable` tag for visual progress bars with support for custom ranges, labels, opposed pairs, and optional value clamping
- Customization:
  - `custom.js` and `custom.css` files for author customization without modifying core files
- Documentation:
  - Functions documentation page (`doc/functions.md`)
  - Keyboard shortcuts documentation page (`doc/keyboard-shortcuts.md`)

### Changed

- Audio setting in settings menu now only appears if the story contains `# AUDIO` or `# AUDIOLOOP` tags
- Optimized font loading for faster page loads (LCP improved from 16s to 0.6s)
- Monochrome color palette for better accessibility and WCAG AA contrast compliance (accent colors can be added via `custom.css`)
- Inline links now display with underlines for accessibility

### Fixed

- Saves made while viewing a special page now correctly restore to the main story
- Unknown tags now warn in the console (F12) instead of silently becoming CSS classes

### Technical

- Migrated to ES modules with esbuild bundling
- Reorganized repository structure
- Added unit testing (Vitest) and end-to-end testing (Playwright)

## [1.2.2] - 2025-11-24

### Fixed

- Special pages now correctly display the current state of story variables
- Images added with the IMAGE tag now display inline and no longer at the top of the page

## [1.2.1] - 2025-07-23

### Fixed

- Broken navigation menu on iOS

## [1.2.0] - 2025-06-29

### Added

- Navigation top bar now uses material icons
- Navigation menu now has a slide-down panel for special pages
- Special pages in the navigation menu slide-down panel now appear alphabetically but can be ordered manually with an Ink tag

### Fixed

- "Return to Story" button now works after navigating through several special pages in a row
- Prompts for delete save and restart story are now internal to the template and no longer solicit the browser prompt

## [1.1.1] - 2025-06-28

### Fixed

- Clicking on the title to restart does not prompt for confirmation and no longer breaks out of web players like itch.io
- CSS is now more friendly to custom theme overrides

## [1.1.0] - 2025-06-28

### Added

- This changelog to track project changes
- User input field tags to populate story variables with placeholder text

### Fixed

- Fade-in animations now work correctly for story content
- Choice buttons no longer get cropped when scrolling down

## [1.0.0] - 2025-06-26

### Added

- Complete save/load system with 5 slots and import/export functionality
- Text formatting with markdown-like syntax (bold, italic, headers, lists, links)
- Special pages system for character sheets, credits, etc. with dynamic navigation
- Settings panel with theme switcher (light/dark/auto), font options, text sizing
- Audio support for sound effects and looping background music
- Background image support with opacity controls
- Image tag to insert image into page
- Notification system for achievements, warnings, and alerts
- Error management system with graceful recovery
- Modal system for settings and save dialogs
- Responsive design for mobile, tablet, and desktop
- Keyboard shortcuts (Ctrl+S for save, Ctrl+R for restart)
- Clickable title to restart story with confirmation
- Horizontal separators with [---] syntax
- Named special pages with custom display names
- Centered text inline styling
- GitHub Actions workflow for automated itch.io deployment

### Fixed

- Text size settings now affect choice button text
- Audio properly stops when disabled in settings
- Special page return functionality

### Technical

- Vanilla JavaScript implementation (no build tools required)
- Comprehensive error handling and recovery
- Modular code architecture
- Compatible with standard Ink JSON output
