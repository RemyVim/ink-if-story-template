# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.1.0] - 2025-06-28

### Added

- This changelog to track project changes
- User input fields to populate story variables with placeholder text support

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
