// Simple token-based markdown processor
//
// IMPORTANT: We use % for markdown escaping to avoid conflicts with Ink's reserved characters:
// Ink reserved: \ | * + - > < = ~ { } [ ] ( ) : # @ & ! ^ /
// Our markdown escape character: % (safe because Ink doesn't use it)
//
class MarkdownProcessor {
  static process(text) {
    // If line starts with %, remove it and skip all markdown processing
    if (text.trim().startsWith("%")) {
      return text.trim().substring(1);
    }

    // Handle markdown escaping with pipe character first
    text = this.handleMarkdownEscaping(text);

    // Process block-level elements BEFORE tokenization
    text = text
      // Headers
      .replace(/^::: (.*$)/gm, "<h3>$1</h3>")
      .replace(/^:: (.*$)/gm, "<h2>$1</h2>")
      .replace(/^: (.*$)/gm, "<h1>$1</h1>")
      // Block quotes using >>
      .replace(/^>> (.+)$/gm, "<blockquote>$1</blockquote>")
      // Bullet points using >
      .replace(/^> (.+)$/gm, "<li>$1</li>")
      // Wrap consecutive list items in <ul>
      .replace(/(<li>.*?<\/li>(?:\s*<li>.*?<\/li>)*)/gs, "<ul>$1</ul>");

    // Now tokenize and process inline elements
    const tokens = this.tokenize(text);

    let result = "";
    for (const token of tokens) {
      if (token.type === "code") {
        result += `<code>${token.content}</code>`;
      } else if (token.type === "text") {
        result += this.processTextMarkdown(token.content);
      }
    }

    return result;
  }

  static handleMarkdownEscaping(text) {
    // Use percent character (%) to escape markdown characters
    // %* becomes literal *, %_ becomes literal _, %` becomes literal `, etc.
    return text
      .replace(/%\*/g, "&#42;") // %* -> literal *
      .replace(/%_/g, "&#95;") // %_ -> literal _
      .replace(/%`/g, "&#96;") // %` -> literal `
      .replace(/%:/g, "&#58;") // %: -> literal :
      .replace(/%\[/g, "&#91;") // %[ -> literal [
      .replace(/%\]/g, "&#93;") // %] -> literal ]
      .replace(/%\(/g, "&#40;") // %( -> literal (
      .replace(/%\)/g, "&#41;") // %) -> literal )
      .replace(/%%/g, "&#37;"); // %% -> literal %
  }

  static tokenize(text) {
    const tokens = [];
    let current = "";
    let i = 0;

    while (i < text.length) {
      // Look for code blocks
      if (text[i] === "`") {
        // Save any accumulated text
        if (current) {
          tokens.push({ type: "text", content: current });
          current = "";
        }

        // Find the closing backtick
        i++; // skip opening backtick
        let codeContent = "";
        while (i < text.length && text[i] !== "`") {
          codeContent += text[i];
          i++;
        }

        tokens.push({ type: "code", content: codeContent });
        i++; // skip closing backtick
      } else {
        current += text[i];
        i++;
      }
    }

    // Add any remaining text
    if (current) {
      tokens.push({ type: "text", content: current });
    }

    return tokens;
  }

  static processTextMarkdown(text) {
    return (
      text
        // Bold + Italic: ___text___
        .replace(/___([^_\n]+?)___/g, "<strong><em>$1</em></strong>")
        // Bold: __text__
        .replace(/__([^_\n]+?)__/g, "<strong>$1</strong>")
        // Italic: _text_
        .replace(/(?<!_)_([^_\n]+?)_(?!_)/g, "<em>$1</em>")
        // Custom inline styles
        .replace(/\[(.*?)\]\((\w+)\)/g, '<span class="inline-$2">$1</span>')
        // Line breaks
        .replace(/  $/gm, "<br>")
    );
  }
}
