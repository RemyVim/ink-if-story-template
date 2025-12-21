=== styling_demo ===
: Styling & Visual Customization

The `\# CLASS:` tag lets you apply custom CSS classes to any paragraph. Define your styles in `css/custom.css`, then use them in your story.

:: Custom Classes in Action

Here's normal text for comparison.

`\# CLASS: dramatic`
# CLASS: dramatic
This text uses the "dramatic" class — bold and attention-grabbing!

`\# CLASS: whisper`
# CLASS: whisper
This uses "whisper" — perfect for inner thoughts or quiet moments...


`\# CLASS: glowing`
# CLASS: glowing
And this one glows with the "glowing" class.

`\# CLASS: old-paper`
# CLASS: old-paper
The "old-paper" class is great for letters, journal entries, or ancient texts that need to stand apart from regular narration.

And now this paragraph is back to normal.

:: Combining Multiple Classes

You can stack multiple classes on the same paragraph:

`\# CLASS: dramatic`
`\# CLASS: old-paper`
# CSS: dramatic
# CSS: old-paper
This combines both "dramatic" and "old-paper" for extra emphasis.

:: How to Use

In your Ink file, add the tag:
>> `\# CLASS: dramatic`
Immediately followed by the text where it should be applied:
>> `The door slammed shut.`


In `css/custom.css`:
> `.dramatic \{ color: red; font-weight: bold; \}`

Aliases: `\# CSS:`, `\# CSS_CLASS:` and `\# STYLE:` work the same way.

__Note:__ The class only applies to the immediately following paragraph. For multiple styled paragraphs, add the tag before each one. To style all paragraphs globally, override the `p` element in `css/custom.css` instead.

 -> feature_menu
