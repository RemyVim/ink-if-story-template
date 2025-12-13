=== choices_demo ===
: Choice Customization

This template gives you control over how choices appear to readers.

:: Choice Numbering

By default, choices show keyboard hints (1, 2, 3...) on devices with keyboards. You can control this with:

`\# CHOICE_NUMBERS: auto` — Show on keyboard devices only (default)
`\# CHOICE_NUMBERS: on` — Always show
`\# CHOICE_NUMBERS: off` — Never show

__Note:__ Players can override this in the Settings menu.

:: Display Disabled Choices

You can mark a choice as disabled with the `\# UNCLICKABLE` tag:

`\+ \# UNCLICKABLE [You're not brave enough...]`

:: Tone Indicators

Tone indicators are small icons that appear before choices, hinting at the tone or consequence of a choice.

To enable them, add these tags at the top of your main `.ink` file:

> `\# TONE_INDICATORS: on` - if you want them on by default (readers can opt-out in Settings)
> `\# TONE_INDICATORS: off` - if you want them enabled but invisible by default (readers can opt-in in Settings)

Then define the tag and icon pairs you want to use in your choices. You can use emoji or material icon names.

> `\# TONE: flirty 🔥`
> `\# TONE: shy 💜`
> `\# TONE: danger warning`

Accessibility note: Tone indicator labels are read aloud by screen readers. Choose descriptive names like "warning", "flirty", "serious" rather than abstract icon names like "star_border".

Then tag your choices like this:

`+ [Lean in closer \# flirty]`
`+ \#shy [Look away nervously]`
`+ Keep your distance \# danger`

Note that following Ink's syntax, tags are only recognized if placed before or inside the brackets \[\].

You can add multiple tags to a single choice, but only the first icon will display on the left. The rest of the icons display after the choice text.

To make all tone icons appear after the choice text, add this tag to the beginning of your story:

> `\# TONE_TRAILING`

A mysterious stranger conveniently materializes for this demo. Your move.

-> tone_indicator_menu

= tone_indicator_menu

+ [Wink and smile # flirty]
  Bold move! They smile back.
  -> choices_submenu
+ [Look away nervously # shy]
  You feel your cheeks flush. They definitely noticed.
  -> choices_submenu
+ [Crack a joke # bold # flirty # danger # sarcasm]
  They laugh — you're on a roll.
  -> choices_submenu
+ [Keep your distance # danger]
  Better safe than sorry.
  -> choices_submenu
+ # UNCLICKABLE [You're not brave enough to say anything... (Locked choice)]
  Sometimes silence speaks loudest. (You should not have gotten here... If you see this, please submit a bug report!)
  -> choices_submenu
+ [You're not brave enough to walk away either... (Locked choice) # DISABLED]
  Sometimes silence speaks loudest. (You should not have gotten here... If you see this, please submit a bug report!)
  -> choices_submenu
+ [Return to choice customization] 
  -> choices_demo
+ [Return to feature menu] 
  -> feature_menu

= choices_submenu

Try toggling tone indicators off in the __Settings__ menu above — the icons will disappear in real-time!

You can also try turning choice numbering on and off in the __Settings__ menu.

-> tone_indicator_menu

-> DONE
