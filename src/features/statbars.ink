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

:: Custom Range

`\# STATBAR: mana 0 50 "Magical Energy"`

# STATBAR: mana 0 50 "Magical Energy"

[---]

:: Opposed Stat Bar

Two labels create an opposed bar (like ChoiceScript):

`\# STATBAR: bravery "Cowardly" "Brave"`

# STATBAR: bravery "Cowardly" "Brave"

[---]

-> statbars_submenu

= only_statbars

:: Statbars

# STATBAR: health

[---]

# STATBAR: health "Hit Points"

[---]

# STATBAR: mana 0 50 "Magical Energy"

[---]

# STATBAR: bravery "Cowardly" "Brave"

-> statbars_submenu

= statbars_submenu

+ [Increase health (+20)]
  ~ health = health + 20
  -> only_statbars
+ [Decrease health (-20)]
  ~ health = health - 20
  -> only_statbars
+ [Become braver (+15)]
  ~ bravery = bravery + 15
  -> only_statbars
+ [Become more cowardly (-15)]
  ~ bravery = bravery - 15
  -> only_statbars
+ [Back to feature menu] -> feature_menu
