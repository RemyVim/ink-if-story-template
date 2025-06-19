// Markdown processing utilities
class MarkdownProcessor {
  static process(text) {
    // If line starts with backslash, remove it and skip all markdown processing
    if (text.trim().startsWith("\\")) {
      return text.trim().substring(1);
    }

    return (
      text
        // Bold: **text** or __text__ (but not if preceded by \)
        .replace(/(?<!\\)\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/(?<!\\)__(.*?)__/g, "<strong>$1</strong>")
        // Italic: *text* or _text_ (but not if preceded by \)
        .replace(/(?<!\\)\*(.*?)\*/g, "<em>$1</em>")
        .replace(/(?<!\\)_(.*?)_/g, "<em>$1</em>")
        // Headers: :: Text (but not if preceded by \)
        .replace(/^(?<!\\)::: (.*$)/gm, "<h3>$1</h3>")
        .replace(/^(?<!\\):: (.*$)/gm, "<h2>$1</h2>")
        .replace(/^(?<!\\): (.*$)/gm, "<h1>$1</h1>")
        // Inline code: `code` (but not if preceded by \)
        .replace(/(?<!\\)`(.*?)`/g, "<code>$1</code>")
        // Custom inline styles: [text](style) (but not if preceded by \)
        .replace(
          /(?<!\\)\[(.*?)\]\((\w+)\)/g,
          '<span class="inline-$2">$1</span>',
        )
        // Line breaks: Double spaces at end of line
        .replace(/  $/gm, "<br>")
        // Clean up the escape backslashes (remove \ before markdown symbols)
        .replace(/\\(\*\*|\*|__|_|`|:::|::|:|\[)/g, "$1")
    );
  }
}
