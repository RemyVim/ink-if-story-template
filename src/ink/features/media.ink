=== media_demo ===
VAR input = ""

: Media

The template includes ways to add media into a passage or special page.

:: Images

Background images:

> `\# BACKGROUND: image.jpg` - Set a background image
> `\# BACKGROUND: none` - Remove a background image

__Note:__ if you set a background image, it will stay unless replaced or removed, even if the story is restarted.

Inline images:

> `\# IMAGE: image.jpg` — Inline image (centered, natural size)
> `\# IMAGE: image.jpg left` — Float left, text wraps around
> `\# IMAGE: image.jpg right 50px` — Float right at 50px width
> `\# IMAGE: image.jpg "Description"` — Alt text for screen readers
> `\# IMAGE: image.jpg caption "Description"` — Shows alt text as visible caption

Alignment defaults to centered.
Width defaults to the image's natural size, capped at 100% of the text area.
Alt text improves accessibility for screen reader users.

:: Audio Support  
> `\# AUDIO: sound.mp3` - Play sound effects
> `\# AUDIOLOOP: music.mp3` - Loop background music

-> media_submenu

= media_submenu

+ [View inline image display] -> add_image_inline
+ [Add background image] -> change_background
+ [Remove background image] -> remove_background
+ [Ring a bell] -> play_sound
+ [Ring a bell in a loop] -> play_sound_loop
+ [Stop the ringing!] -> stop_sound_loop
+ [Back to feature menu] -> feature_menu

= change_background
# BACKGROUND: assets/background.jpg
: Ink Tags
Called `\# BACKGROUND: assets/background.jpg`

-> media_submenu

= remove_background
# BACKGROUND: none
: Ink Tags
Called `\# BACKGROUND: none`

-> media_submenu

= play_sound
# AUDIO: assets/notification-bell.mp3
: Ink Tags
Called `\# AUDIO: assets/notification-bell.mp3`

-> media_submenu

= play_sound_loop
# AUDIOLOOP: assets/notification-bell.mp3
: Ink Tags
Called `\# AUDIOLOOP: assets/notification-bell.mp3`

-> media_submenu

= stop_sound_loop
# AUDIOLOOP: none
: Ink Tags
Called `\# AUDIOLOOP: none`

-> media_submenu

= add_image_inline
: Ink Tags

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc tincidunt scelerisque odio, non luctus turpis volutpat in. Vestibulum dapibus dapibus quam, ac posuere mauris bibendum quis. 

Calling `\# IMAGE: assets/background.jpg`

# IMAGE: assets/background.jpg

Sed lorem ligula, elementum blandit tempus id, faucibus ac odio. Etiam at molestie dui, non lobortis nulla. Proin auctor enim a nibh rhoncus, eu lacinia nibh commodo.

Calling `\# IMAGE: assets/background.jpg 50%%

# IMAGE: assets/background.jpg 50%

Calling `\# IMAGE: assets/background.jpg left 15%%

# IMAGE: assets/background.jpg left 15%
Cras pretium metus nec nulla varius rhoncus. Duis maximus lorem eget mauris fringilla porttitor. Quisque quam nibh, molestie ac nulla et, porttitor feugiat mi. Praesent viverra feugiat elementum. Quisque id scelerisque est.

Calling `\# IMAGE: assets/background.jpg right 250px caption "Flowers!"`

# IMAGE: assets/background.jpg right 250px caption "Flowers!"

In hac habitasse platea dictumst. Aliquam erat volutpat. Praesent nec nisi vel mauris feugiat tincidunt et eget dui. Suspendisse at mauris a nulla porta malesuada. Aliquam vitae eros lacinia, gravida tellus in, porttitor libero. Cras molestie diam et facilisis aliquam. Aliquam a porttitor lectus. Maecenas nulla dui, posuere vel ligula sit amet, condimentum ornare lorem. Nunc lacinia nunc sit amet nisl pretium molestie. 

Calling `\# IMAGE: assets/background.jpg center 50vw "Flowers!"`

Note: Caption should not show because we didn't put the caption keyword in the tag. "Flowers!" will be used as alt text only (for screen readers).

# IMAGE: assets/background.jpg center 50vw "Flowers!"

-> media_submenu
