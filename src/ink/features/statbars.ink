=== statbars_demo ===
: Stat Bars

Stat bars display your story variables as visual progress bars — perfect for character sheets, relationships, and any numeric stats.

:: Basic Stat Bar

`\# STATBAR: health`

# STATBAR: health

[---]

:: Custom Display Name

`\# STATBAR: health "Hit Points"`

# STATBAR: health "Hit Points"

[---]

:: Clamped Value

By default, stat bars show the real value even if it goes below 0 or above max. This can help you as an author to see the true value of your variables. Add `clamp` to keep it in range. Try decreasing health below 0 to see the difference!

`\# STATBAR: health "Hit Points (Clamped)" clamp`

# STATBAR: health "Hit Points (Clamped)" clamp

[---]

:: Custom Range

Not all stats use 0–100. Set your own min and max:

`\# STATBAR: mana 0 50 "Magical Energy"`

# STATBAR: mana 0 50 "Magical Energy"

[---]

:: Opposed Stat Bar

Two labels create an opposed bar showing both ends of a spectrum. The values show how much you have of each side:

`\# STATBAR: bravery "Brave" "Cowardly"`

# STATBAR: bravery "Brave" "Cowardly"

[---]

-> statbars_submenu

= only_statbars

:: Statbars

# STATBAR: health "Hit Points"

# STATBAR: health "Hit Points (Clamped)" clamp

# STATBAR: mana 0 50 "Magical Energy"

# STATBAR: bravery "Brave" "Cowardly"

-> statbars_submenu

= statbars_submenu

+ [Increase health (+20)]
  ~ health = health + 20
  -> only_statbars
+ [Decrease health (-20)]
  ~ health = health - 20
  -> only_statbars
+ [Increase mana (+5)]
  ~ mana = mana + 5
  -> only_statbars
+ [Decrease mana (-5)]
  ~ mana = mana - 5
  -> only_statbars
+ [Become braver (+15)]
  ~ bravery = bravery + 15
  -> only_statbars
+ [Become more cowardly (-15)]
  ~ bravery = bravery - 15
  -> only_statbars
+ [Back to feature menu] -> feature_menu
