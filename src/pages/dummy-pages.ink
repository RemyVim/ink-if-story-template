=== sheet ===
# SPECIAL_PAGE: Character Stats
: Character Stats

Your current stats...

__Hero Name:__ "{hero_name}" 
__Hero Level:__ {character_level}

__Skills Known:__
{LIST_COUNT(skills) > 0:
  {skills ? combat: ⚔️ Combat}
  {skills ? magic: ✨ Magic}
  {skills ? stealth: 🥷 Stealth}
  {skills ? diplomacy: 💬 Diplomacy}
- else:
  No skills learned yet.
}

Total skills mastered: {LIST_COUNT(skills)}

-> DONE

=== relationships ===
# SPECIAL_PAGE: Relationships
: Character Relationships

__Friendship with your Companion:__ {friend_relationship} points

{
- friend_relationship >= 80:
  💝 Best Friends Forever - An unbreakable bond!
- friend_relationship >= 60:
  😊 Close Friends - They trust you deeply.
- friend_relationship >= 40:
  🙂 Friends - A solid friendship.
- friend_relationship >= 20:
  😐 Acquaintances - Still getting to know each other.
- else:
  😔 Strained - Your relationship needs work.
}

-> DONE

=== inventory_page ===
# SPECIAL_PAGE: Inventory
: Character Inventory

In your bag, you have:

{LIST_COUNT(inventory) > 0:
  {inventory ? torch: 🔦 Torch - Lights the way}
  {inventory ? lantern: 🏮 Lantern - A steady light source}
  {inventory ? sword: ⚔️ Magic Sword - Glows with power}
  {inventory ? shield: 🛡️ Shield - Sturdy protection}
  {inventory ? potion: 🧪 Potion - Mysterious liquid}
- else:
  Your inventory is empty!
}

__Items carried:__ {LIST_COUNT(inventory)} / 5

-> DONE
