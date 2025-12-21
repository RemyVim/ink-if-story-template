=== template_control_demo ===

: Template Control

You can control the template directly in your story with Ink tags and external functions.

:: System Commands

> `\# CLEAR` - Clears all text from the screen
> `\# RESTART` - Restarts the story from the beginning

:: Opening Menus & Pages

You can open the template's menus and special pages directly from your story:

> `~ OPEN_SAVES()` - Opens the save/load menu
> `~ OPEN_SETTINGS()` - Opens the settings menu
> `~ OPEN_PAGE("knot_name")` - Opens a special page by its knot name
> `~ RESTART()` - Restarts the story (with confirmation dialog)

These are useful for guiding readers or creating custom navigation. For example, you could prompt the reader to save before a point of no return, or direct them to check their inventory before a big decision.

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

+ [Call \# RESTART tag]
  # RESTART
  `\# RESTART` tag called.
  -> menu_template_control
+ [Call RESTART\() function]
  ~ RESTART()
  `~ RESTART()` function called.
  -> menu_template_control
+ [Call OPEN_SETTINGS\() function]
  ~ OPEN_SETTINGS()
  `~ OPEN_SETTINGS()` function called.
  -> menu_template_control
+ [Call OPEN_SAVES\() function]
  ~ OPEN_SAVES()
  `~ OPEN_SAVES()` function called.
  -> menu_template_control
+ [Call OPEN_PAGE\("content_warnings") function]
  ~ OPEN_PAGE("content_warnings")
  `~ OPEN_PAGE("content_warnings")` function called.
  -> menu_template_control
+ [Call OPEN_PAGE\("does_not_exist") function]
  ~ OPEN_PAGE("does_not_exist")
  `~ OPEN_PAGE("does_not_exist")` function called.
  -> menu_template_control
+ [Return to feature menu] 
  -> feature_menu
