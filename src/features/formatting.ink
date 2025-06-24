=== formatting_demo ===
: Text Formatting Made Simple

This template uses a markdown-adjacent system. Here's what you can do __without__ touching a single HTML tag:

:: Basic Text Styling

Make text __bold__ with double underscores: `__bold__`

Make text _italic_ with single underscores: `_italic_`

Combine them: ___bold and italic___ with `___text___`

Add `inline code` with backticks: %`inline code%`

:: Headers Work With Colons
Use colons at the start of lines for headers:

> `: Header 2` creates the largest header
> `:: Header 3` creates a medium header  
> `::: Header 4` creates the smallest header

[---]

: Header 2
:: Header 3
::: Header 4

[---]

:: Separators

You can mark a separator line (like just above) with `[---]`.

:: Lists Are Easy
Use `>` at the start of lines for bullet points:

> First bullet point
> Second bullet point
> Third bullet point
> And so on...

:: Block Quotes
Use `>>` for block quotes and emphasis:

>> "This template makes interactive fiction look professional without any web development knowledge required."

You can quote dialogue, important notes, or emphasis text this way.


:: Custom Inline Styles
The template also supports custom styling with brackets:

`[highlighted text](highlight)` becomes: [highlighted text](highlight)

`[important note](important)` becomes: [important note](important)

`[quiet aside](quiet)` becomes: [quiet aside](quiet)

:: Links

`[link text](example.com)` becomes: [link text](example.com)
`[link text](example.com/page.html)` becomes: [link text](example.com/page.html)

:: Line Breaks
End a line with two spaces for a manual line break.  
Like this!

:: Escaping Characters
Need to show markdown characters literally? Use the ` % ` character right before:

`%%_%%_this won't be bold%%_%%_` becomes: %_%_this won't be bold%_%_


`%%`this won't be code%%`` becomes: %`this won't be code%`

`%> this won't be a bullet point` becomes: > this won't be a bullet point

You can also simply start a line with a ` % ` character and markdown processing will be disabled for the entire line.

-> feature_menu
