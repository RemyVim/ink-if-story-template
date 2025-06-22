=== tags_demo ===
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

+ [Add background image] -> change_background
+ [Remove background image] -> remove_background
+ [Add image to next page] -> add_image
+ [Back to feature menu] -> feature_menu

= change_background
# BACKGROUND: assets/background.jpg
: Ink Tags
Called `\# BACKGROUND: assets/background.jpg`

+ [Add background image] -> change_background
+ [Remove background image] -> remove_background
+ [Add image to next page] -> add_image
+ [Back to feature menu] -> feature_menu

= remove_background
# BACKGROUND: none
: Ink Tags
Called `\# BACKGROUND: none`

+ [Add background image] -> change_background
+ [Remove background image] -> remove_background
+ [Add image to next page] -> add_image
+ [Back to feature menu] -> feature_menu

= add_image
# IMAGE: assets/background.jpg
: Ink Tags
Called `\# IMAGE: assets/background.jpg`

+ [Add background image] -> change_background
+ [Remove background image] -> remove_background
+ [Back to feature menu] -> feature_menu
