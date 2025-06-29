=== special_pages_demo ===
: Special Pages System

You can create special pages that live outside the flow of your story's narrative. These could be anything you can imagine, from a simple credits page to a full character stats page.

You can mark any Ink knot with the tag `\# SPECIAL_PAGE`.

This will also automatically add the page to the navigation menu above. The "credits" and "content warnings" pages above were created in this way. 

Special pages do not advance the story and have a built-in "Return to Story" button that allows the player to return exactly where they left off.

Special pages in the menu are ordered alphabetically be default. You can order them via a special tag (using the knot names):


`\#PAGE_MENU:character_sheet,inventory,relationships,,credits,content_warnings`

The double comma is interpreted as a section separator. Any omitted special pages will appear in a new section, ordered alphabetically.

-> feature_menu

