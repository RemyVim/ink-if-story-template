# author: Rémy Vim
# title: Ink HTML Template

INCLUDE setup/variables.ink
INCLUDE setup/functions.ink
INCLUDE pages/credits.ink
INCLUDE pages/about.ink
INCLUDE pages/content-warnings.ink
INCLUDE the_end.ink

:: Prologue: Introducing the template

: H1 title
:: H2 title
::: H3 title

Hello, this is a test template.

This will be **bold** and *italic*.

This will be ***bold and italic***.

This will be ***bold and italic***.

\\This will show **bold** and *italic* literally without processing.

\\: Title

Here's how to use markdown in this story:

Make text **bold** like this: \\*\\*bold\\*\\*
Make text *italic* like this: \\*italic\\*
Make text ***bold and italic*** like this: \\*\\*\\*bold and italic\\*\\*\\*

This is `inline *code*`.

+ Start story
  -> second_page
* Choice that leads nowhere
  -> main

=== main ===

Main.

-> the_end

=== second_page ===

This is the second page !!!!

blablablablablabla

-> the_end
