=== tags_demo ===
VAR input = ""

: Ink Tags

The template includes special tags for enhanced functionality:

:: Visual Enhancement

> `\# CLASS: classname` - Add custom CSS classes
> `\# BACKGROUND: image.jpg` - Set background images

:: Images

> `\# IMAGE: image.jpg` - Adds an image to the top of the page

:: Audio Support  
> `\# AUDIO: sound.mp3` - Play sound effects
> `\# AUDIOLOOP: music.mp3` - Loop background music

:: System Commands
> `\# CLEAR` - Clear the screen
> `\# RESTART` - Restart the story

:: Professional Polish
The template automatically handles:
> Proper whitespace management
> Semantic HTML for accessibility
> Clean, readable output

-> tags_submenu

= tags_submenu

+ [Ask for user input] -> user_input
+ [Add background image] -> change_background
+ [Remove background image] -> remove_background
+ [Ring a bell] -> play_sound
+ [Ring a bell in a loop] -> play_sound_loop
+ [Stop the ringing!] -> stop_sound_loop
+ [Add image to next page] -> add_image
+ [Back to feature menu] -> feature_menu

= user_input
You can ask players for input that will then be stored in a variable of your choice. For this, use the special tag:

`\# USER_INPUT: your_variable_name`
Followed on a new line by `[]` to create an anchor to avoid Ink consuming the next line.

Write anything you want here:

# USER_INPUT: input
[]

You wrote: "{input}".

-> tags_submenu

= change_background
# BACKGROUND: assets/background.jpg
: Ink Tags
Called `\# BACKGROUND: assets/background.jpg`

-> tags_submenu

= remove_background
# BACKGROUND: none
: Ink Tags
Called `\# BACKGROUND: none`

-> tags_submenu

= play_sound
# AUDIO: assets/notification-bell.mp3
: Ink Tags
Called `\# AUDIO: assets/notification-bell.mp3`

-> tags_submenu

= play_sound_loop
# AUDIOLOOP: assets/notification-bell.mp3
: Ink Tags
Called `\# AUDIOLOOP: assets/notification-bell.mp3`

-> tags_submenu

= stop_sound_loop
# AUDIOLOOP: none
: Ink Tags
Called `\# AUDIOLOOP: none`

-> tags_submenu

= add_image
# IMAGE: assets/background.jpg
: Ink Tags
Called `\# IMAGE: assets/background.jpg`

-> tags_submenu
