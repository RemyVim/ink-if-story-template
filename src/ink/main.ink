# AUTHOR: Rémy Vim
# TITLE: Ink Story Template
# PAGE_MENU: sheet, inventory_page, relationships ,,credits,content_warnings
# THEME: light

# TONE_INDICATORS: on
# TONE: flirty local_fire_department
# TONE: shy favorite  
# TONE: bold star
# TONE: sarcasm 😏
# TONE: danger warning

INCLUDE setup/variables.ink
INCLUDE pages/credits.ink
INCLUDE pages/content-warnings.ink
INCLUDE pages/dummy-pages.ink
INCLUDE features/choices.ink
INCLUDE features/ink_tags.ink
INCLUDE features/formatting.ink
INCLUDE features/functions.ink
INCLUDE features/getting_started.ink
INCLUDE features/notifications.ink
INCLUDE features/saves.ink
INCLUDE features/settings.ink
INCLUDE features/special_pages.ink
INCLUDE features/statbars.ink

// Include functions provided by the template
EXTERNAL UPPERCASE(string)
EXTERNAL LOWERCASE(string)
EXTERNAL CAPITALIZE(string)
EXTERNAL TRIM(string)
EXTERNAL LENGTH(string)
EXTERNAL CONTAINS(string, search)
EXTERNAL STARTS_WITH(string, search)
EXTERNAL ENDS_WITH(string, search)
EXTERNAL REPLACE(string, search, replacement)
EXTERNAL REPLACE_ALL(string, search, replacement)
EXTERNAL ROUND(value)
EXTERNAL CLAMP(value, min, max)
EXTERNAL ABS(value)
EXTERNAL PERCENT(value, total)
EXTERNAL FAIRADD(stat, percent)
EXTERNAL FAIRSUB(stat, percent)
EXTERNAL NOW()
EXTERNAL SECONDS_SINCE(start)
EXTERNAL MINUTES_SINCE(start)
EXTERNAL TIME_SINCE(start)
EXTERNAL FORMAT_DATE(timestamp, locale)
EXTERNAL FORMAT_TIME(timestamp, locale)
EXTERNAL FORMAT_DATETIME(timestamp, locale)
EXTERNAL OFFSET_DATE(timestamp, years, months, days, hours, minutes)

: Template Feature Demo

~ session_start = NOW()

Welcome, storyteller!

So you're thinking about using [Ink](www.inklestudios.com/ink/) for your interactive fiction? Excellent choice. And you've found this template to go with it? Even better.

Here's what this template adds to your Ink stories:

> Complete save/load system with file import/export
> Easy text formatting using a markdown-esque system
> Reader-friendly theme and accessibility features
> Special reference pages (character sheets, maps, etc.)
> Easy image, audio, and background additions
> Looks great on phones, tablets, and computers
> Graceful error recovery when things go wrong

Ready to see how easy this is? Every feature you're about to experience will often take less than a line in your Ink script.

-> feature_menu

=== feature_menu ===

What would you like to explore in more detail?

+ [Save & Load] -> saves_demo  
+ [Settings] -> settings_demo  
+ [Text Formatting] -> formatting_demo
+ [Choice Customization] -> choices_demo
+ [Special Pages] -> special_pages_demo
+ [Ink Tags (Media & User Input)] -> tags_demo
+ [Notifications] -> notifications_demo  
+ [Functions] -> functions  
+ [Stat Bars] -> statbars_demo
+ [Getting Started] -> getting_started

