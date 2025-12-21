=== template_control_demo ===

: Template Control

You can control the template directly in your story with Ink tags and external functions.

:: System Commands

> `\# CLEAR` - Clears all text from the screen
> `\# RESTART` - Restarts the story from the beginning

:: Debug Logging

You can print information to your browser's console (F12 > console tab) with:

> `~ DEBUG_LOG("A custom log message")`
> `~ DEBUG_WARN("A custom warning message")`

~ DEBUG_LOG("A custom log message")
~ DEBUG_WARN("A custom warning message")

Check your console now to see it in action! Look for:
> `[INK DEBUG] A custom log message`
> `[INK WARNING] A custom warning message`

You can also print the current values of Ink variables with these:
> `~ DEBUG_LOG("Hero name is \{hero_name\}")`
~ DEBUG_LOG("Hero name is {hero_name}")

Which can be useful for debugging parts of your story.

-> menu_template_control

= menu_template_control

+ [Restart]
  # RESTART
  `\# RESTART` tag called.
  -> menu_template_control
+ [Return to feature menu] 
  -> feature_menu
