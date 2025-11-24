=== special_pages_demo ===
: Special Pages System

You can create special pages that live outside the flow of your story's narrative. These could be anything you can imagine, from a simple credits page to a full character stats page.

You can mark any Ink knot with the tag `\# SPECIAL_PAGE`.

This will also automatically add the page to the navigation menu above. The "credits" and "content warnings" pages above were created in this way. 

Special pages do not advance the story and have a built-in "Return to Story" button that allows the player to return exactly where they left off.

Special pages in the menu are ordered alphabetically be default. You can order them via a special tag (using the knot names):


`\#PAGE_MENU:character_sheet,inventory,relationships,,credits,content_warnings`

The double comma is interpreted as a section separator. Any omitted special pages will appear in a new section, ordered alphabetically.

Let's test that special pages properly reflect variable changes. Try modifying these values, then check the special pages in the menu above to see them update in real-time.

-> special_pages_menu

= special_pages_menu

__Current Status:__
Hero Name: "{hero_name}" 
Hero Level: {character_level}
Friendship: {friend_relationship}

+ [Level up your hero! (+1 level)]
  ~ character_level += 1
  ⚔️ Your hero reached level {character_level}!
  → Check the "Character" page in the menu to see your new level.
  -> special_pages_menu

+ [Decrease hero level (-1 level)]
  ~ character_level -= 1
  📉 Your hero dropped to level {character_level}.
  → Check the "Character" page in the menu to confirm the change.
  -> special_pages_menu

+ [Change your hero's name]
  Your hero needs a new identity!
  ++ [Name them "Shadow Walker"]
    ~ hero_name = "Shadow Walker"
    → Your hero is now known as "{hero_name}"! Check the Character page.
    -> special_pages_menu
  ++ [Name them "Dragon Slayer"]
    ~ hero_name = "Dragon Slayer"
    → Your hero is now known as "{hero_name}"! Check the Character page.
    -> special_pages_menu
  ++ [Keep current name]
    -> special_pages_menu

+ [Change your hero's inventory]
  Your hero needs items!
  ++ [Find a magic sword! (add to inventory)]
    ~ inventory += sword
    ⚔️ You found a magic sword!
    → Visit the "Inventory" page to see your updated equipment.
    -> special_pages_menu
  ++ [Loose your magic sword! (remove from inventory)]
    ~ inventory -= sword
    ⚔️ Oh no! You lost your magic sword!
    → Check the "Inventory" page to see what you have left.
    -> special_pages_menu
  ++ [Find a torch (add to inventory)]
    ~ inventory += torch
    🔦 You found a torch.
    → Visit the "Inventory" page to see your updated equipment.
    -> special_pages_menu
  ++ [Lose your torch (remove from inventory)]
    ~ inventory -= torch
    🔦 Your torch burned out.
    → Check the "Inventory" page to see what you have left.
    -> special_pages_menu
  ++ [Find a lantern (add to inventory)]
    ~ inventory += lantern
    🏮 You found a lantern.
    → Visit the "Inventory" page to see your updated equipment.
    -> special_pages_menu
  ++ [Find a shield (add to inventory)]
    ~ inventory += shield
    🛡️ You found a shield.
    → Visit the "Inventory" page to see your updated equipment.
    -> special_pages_menu
  ++ [Drink your potion (remove from inventory)]
    ~ inventory -= potion
    🧪 You drank your potion. Yum.
    → Check the "Inventory" page to see what you have left.
    -> special_pages_menu
  ++ [Keep current items]
    -> special_pages_menu

+ [Change your hero's skills]
  Your hero needs different skills!
  ++ [Gain the combat skill]
    ~ skills += combat
    ⚔️ You learned combat!
    → The "Character" page now shows your new skill.
    -> special_pages_menu
  ++ [Forget the combat skill]
    ~ skills -= combat
    ⚔️ You forgot combat...
    → The "Character" page no longer shows your combat skill.
    -> special_pages_menu
  ++ [Gain the magic skill]
    ~ skills += magic
    ✨ You learned magic!
    → The "Character" page now shows your new skill.
    -> special_pages_menu
  ++ [Forget the magic skill]
    ~ skills -= magic
    ✨ You forgot magic...
    → The "Character" page no longer shows your magic skill.
    -> special_pages_menu
  ++ [Gain the stealth skill]
    ~ skills += stealth
    🥷 You learned stealth!
    → The "Character" page now shows your new skill.
    -> special_pages_menu
  ++ [Forget the stealth skill]
    ~ skills -= stealth
    🥷 You forgot stealth...
    → The "Character" page no longer shows your stealth skill.
    -> special_pages_menu
  ++ [Gain the diplomacy skill]
    ~ skills += diplomacy
    💬 You learned diplomacy!
    → The "Character" page now shows your new skill.
    -> special_pages_menu
  ++ [Forget the diplomacy skill]
    ~ skills -= diplomacy
    💬 You forgot diplomacy...
    → The "Character" page no longer shows your diplomacy skill.
    -> special_pages_menu
  ++ [Keep current skills]
    -> special_pages_menu


+ [Improve friendship (+10 points)]
  ~ friend_relationship += 10
  💝 Your friendship grew to {friend_relationship} points!
  → See the "Relationships" page for your updated bond strength.
  -> special_pages_menu

+ [Damage friendship (-10 points)]
  ~ friend_relationship -= 10
  💔 Your friendship dropped to {friend_relationship} points.
  → Check the "Relationships" page to see the current status.
  -> special_pages_menu

+ [Return to feature menu] 
  -> feature_menu
