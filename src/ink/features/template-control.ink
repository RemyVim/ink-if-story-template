=== template_control_demo ===

: Template Control

You can control the template directly in your story with Ink tags and external functions.

:: Display Modes

By default, the template uses __continuous display__ — content stays on screen and new content appears below, just like Inky's preview. This demo uses auto-clear mode to keep things tidy, but you can control this in your own stories:

> `\# AUTOCLEAR: on` - Screen clears on each choice
> `\# AUTOCLEAR: off` - Content accumulates (template default)
> `\# CLEAR` - Clear the screen once, right now

:: System Commands

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

What would you like to try?

+ [Display modes demo] -> display_modes_intro
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


= display_modes_intro

:: Display Modes Demo

This demo uses `\# AUTOCLEAR: on` to keep things tidy. But the template's actual default is __continuous display__: content accumulates like in Inky.

Let's see the difference.

+ [Show me continuous display] -> continuous_demo_start
// + [Show me the CLEAR tag] -> clear_demo_start
+ [Back] -> menu_template_control


= continuous_demo_start
# AUTOCLEAR: off
# CLEAR

:: Continuous Display

Called `\# AUTOCLEAR: off`.

You're now in continuous mode. This is the template's default behavior.

+ [Pick any option]
    This text appeared *below* the previous content.
    + + [Keep going]
        More content! Everything stays on screen.
        + + + [And more...]
            You can scroll up to re-read earlier text. Great for stories where context matters.

            + + + + [Show me the CLEAR tag] -> clear_demo_start
            + + + + [Got it! Back to auto-clear] -> autoclear_demo_start
            + + + + [Back to menu]
                # AUTOCLEAR: on
                -> menu_template_control

+ [Back to menu]
    # AUTOCLEAR: on
    -> menu_template_control


= autoclear_demo_start
# AUTOCLEAR: on
# CLEAR

:: Auto-Clear Mode

Called `\# AUTOCLEAR: on`.

You're now in auto-clear mode. The screen clears with each choice.

+ [Pick any option]
    See? The previous content is gone.
    + + [Keep going]
        Each choice starts fresh. Good for scene-based stories.
        + + + [Try the CLEAR tag] -> clear_demo_start
        + + + [Back to continuous mode] -> continuous_demo_start
        + + + [Back to menu] -> menu_template_control


= clear_demo_start

:: The CLEAR Tag

The `\# CLEAR` tag clears the screen once, without changing the display mode.

This text will disappear when you click below...

+ [Clear the screen]
    # CLEAR
    Called `\# CLEAR`.

    The screen just cleared!
    
    Unlike `\# AUTOCLEAR: on`, this was a one-time clear. Your current mode (auto-clear or continuous) is unchanged.
    
    Use `\# CLEAR` for:
    > Scene transitions
    > Chapter breaks
    > Dramatic pauses
    > "Meanwhile..." moments
    
    + + [Try auto-clear mode] -> autoclear_demo_start
    + + [Try continuous mode] -> continuous_demo_start
    + + [Back to menu] -> menu_template_control

+ [Back to menu] -> menu_template_control
