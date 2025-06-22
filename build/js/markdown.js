// markdown.js
class MarkdownProcessor {
  // Cache regex patterns for better performance
  static patterns = {
    escape: [
      [/%\*/g, "&#42;"],
      [/%_/g, "&#95;"],
      [/%`/g, "&#96;"],
      [/%:/g, "&#58;"],
      [/%\[/g, "&#91;"],
      [/%\]/g, "&#93;"],
      [/%\(/g, "&#40;"],
      [/%\)/g, "&#41;"],
      [/%%/g, "&#37;"],
    ],
    block: [
      [/^::: (.*$)/gm, "<h3>$1</h3>"],
      [/^:: (.*$)/gm, "<h2>$1</h2>"],
      [/^: (.*$)/gm, "<h1>$1</h1>"],
      [/^>> (.+)$/gm, "<blockquote>$1</blockquote>"],
      [/^> (.+)$/gm, "<li>$1</li>"],
    ],
    inline: [
      [/___([^_\n]+?)___/g, "<strong><em>$1</em></strong>"],
      [/__([^_\n]+?)__/g, "<strong>$1</strong>"],
      [/(?<!_)_([^_\n]+?)_(?!_)/g, "<em>$1</em>"],
      [/\[(.*?)\]\((\w+)\)/g, '<span class="inline-$2">$1</span>'],
      [/  $/gm, "<br>"],
    ],
  };

  static process(text) {
    if (!text || typeof text !== "string") return "";

    // Skip processing if line starts with %
    if (text.trim().startsWith("%")) {
      return text.trim().substring(1);
    }

    try {
      // Handle markdown escaping first
      for (const [pattern, replacement] of this.patterns.escape) {
        text = text.replace(pattern, replacement);
      }

      // Process block-level elements
      for (const [pattern, replacement] of this.patterns.block) {
        text = text.replace(pattern, replacement);
      }

      // Wrap consecutive list items in <ul>
      text = text.replace(
        /(<li>.*?<\/li>(?:\s*<li>.*?<\/li>)*)/gs,
        "<ul>$1</ul>",
      );

      // Process inline elements (avoiding code blocks)
      text = this.processInlineWithCodeBlocks(text);

      return text;
    } catch (error) {
      window.errorManager.warning(
        "Markdown processing failed",
        error,
        "markdown",
      );
      return text; // Return original text on error
    }
  }

  static processInlineWithCodeBlocks(text) {
    const tokens = this.tokenize(text);
    let result = "";

    for (const token of tokens) {
      if (token.type === "code") {
        result += `<code>${token.content}</code>`;
      } else if (token.type === "text") {
        result += this.processInlineMarkdown(token.content);
      }
    }

    return result;
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

  static processInlineMarkdown(text) {
    try {
      for (const [pattern, replacement] of this.patterns.inline) {
        text = text.replace(pattern, replacement);
      }
      return text;
    } catch (error) {
      window.errorManager.warning(
        "Inline markdown processing failed",
        error,
        "markdown",
      );
      return text;
    }
  }

  /**
   * Test if the processor is working correctly
   * @returns {boolean} True if basic functionality works
   */
  static selfTest() {
    try {
      const testInput = "__bold__ and _italic_ text";
      const result = this.process(testInput);
      return result.includes("<strong>") && result.includes("<em>");
    } catch (error) {
      return false;
    }
  }

  /**
   * Get processor statistics for debugging
   * @returns {Object} Processor statistics
   */
  static getStats() {
    return {
      selfTest: this.selfTest(),
      patternCount: {
        escape: this.patterns.escape.length,
        block: this.patterns.block.length,
        inline: this.patterns.inline.length,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
