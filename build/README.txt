================================================================================
                         INK STORY TEMPLATE - QUICK START
================================================================================

Get your Ink story online in minutes. No programming required.


WHAT YOU'LL NEED
--------------------------------------------------------------------------------

- Inky: the Ink editor (free)
  Official site:  https://www.inklestudios.com/ink/
  Download:       https://github.com/inkle/inky/releases

- An Ink story (or use the demo story.json to test)


TEMPLATE FILES
--------------------------------------------------------------------------------

Here's what you downloaded:

    ink-story-template/
    ├── index.html            <-- The game page
    ├── story.json            <-- Replace with YOUR story
    ├── README.txt            <-- You are here!
    ├── css/
    │   ├── template.min.css
    │   └── custom.css        <-- Your style tweaks (optional)
    ├── js/
    │   ├── template.min.js
    │   └── custom.js         <-- Your code tweaks (optional)
    └── assets/               <-- Put images & audio here


STEP 1: ADD YOUR INFO
--------------------------------------------------------------------------------

At the top of your main .ink file in Inky, add:

    # TITLE: Your Story Title
    # AUTHOR: Your Name


STEP 2: EXPORT TO JSON
--------------------------------------------------------------------------------

In Inky: File -> Export to JSON...

Save it as "story.json" inside this template folder (replace the existing one).


STEP 3: PUBLISH
--------------------------------------------------------------------------------

OPTION A: itch.io

    1. Zip this entire template folder
    2. Go to https://itch.io and create an account (free)
    3. Dashboard -> Create new project
    4. Set "Kind of project" to HTML
    5. Upload your zip file
    6. Check "This file will be played in the browser"
    7. Save & view page. Done!

OPTION B: Neocities

    1. Go to https://neocities.org and create an account (free)
    2. In your dashboard, click "Edit Site"
    3. Drag and drop all the template files into the file list
    4. Visit your site. Done!

OPTION C: Any Other Hosting Site

    1. Go to your hosting site
    2. Upload all the template files
    3. Visit your site. Done!


TESTING LOCALLY
--------------------------------------------------------------------------------

Browsers block local files for security reasons, so double-clicking index.html
won't work. To preview locally, you need a simple server:

VS Code: Install the "Live Server" extension, then right-click index.html and
select "Open with Live Server".

Command line (Python is built into Mac/Linux):

    cd /path/to/this/folder
    python3 -m http.server 8000

Then open http://localhost:8000 in your browser.


NEXT STEPS
--------------------------------------------------------------------------------

Full documentation: https://remyvim.github.io/ink-if-story-template/

- Text Formatting: bold, italics, headers, lists
- Images & Audio: add media to your story
- Special Pages: character sheets, maps, credits
- Stat Bars: RPG-style progress bars
- Functions: string manipulation, math, time
- And more!


NEED HELP?
--------------------------------------------------------------------------------

- Documentation: https://remyvim.github.io/ink-if-story-template/
- Report issues: https://github.com/RemyVim/ink-if-story-template/issues
- Ink documentation: https://github.com/inkle/ink/blob/master/Documentation/WritingWithInk.md

================================================================================
