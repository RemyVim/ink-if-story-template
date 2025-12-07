// markdown.js
import { ErrorManager } from "./error-manager.js";

class MarkdownProcessor {
  static errorSource = ErrorManager.SOURCES.KEYBOARD_HELP;

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
      [/^::: (.*$)/gm, "<h4>$1</h4>"],
      [/^:: (.*$)/gm, "<h3>$1</h3>"],
      [/^: (.*$)/gm, "<h2>$1</h2>"],
      [/^\[---+\]$/gm, "<hr>"],
      [/^>> (.+)$/gm, "<blockquote>$1</blockquote>"],
      [/^> (.+)$/gm, "<li>$1</li>"],
    ],
    inline: [
      [/___([^_\n]+?)___/g, "<strong><em>$1</em></strong>"],
      [/__([^_\n]+?)__/g, "<strong>$1</strong>"],
      [/(?<!_)_([^_\n]+?)_(?!_)/g, "<em>$1</em>"],
      // Smart link/class detection - this will be processed by processInlineMarkdown
      [
        /\[(.*?)\]\(([^)]+)\)/g,
        (match, text, target) => {
          return MarkdownProcessor.processLinkOrClass(text, target);
        },
      ],
      [/  $/gm, "<br>"],
    ],
  };

  static _error(message, error = null) {
    window.errorManager.error(message, error, MarkdownProcessor.errorSource);
  }

  static _warning(message, error = null) {
    window.errorManager.warning(message, error, MarkdownProcessor.errorSource);
  }

  static _critical(message, error = null) {
    window.errorManager.critical(message, error, MarkdownProcessor.errorSource);
  }

  /**
   * Process [text](target) - detect if target is URL or class name
   */
  static processLinkOrClass(text, target) {
    // Check if target looks like a URL
    if (this.isURL(target)) {
      // Add protocol if missing for domain-like URLs
      let href = target;
      if (
        /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(target) ||
        /^www\./i.test(target)
      ) {
        href = "https://" + target;
      }

      // Determine if external link (for styling/behavior)
      const isExternal = this.isExternalURL(href);
      const externalAttr = isExternal
        ? ' target="_blank" rel="noopener noreferrer"'
        : "";
      const srText = isExternal // For screen readers, invisible
        ? '<span class="sr-only"> (opens in new tab)</span>'
        : "";
      return `<a href="${href}"${externalAttr}>${text}${srText}</a>`;
    } else {
      // Treat as class name for inline styling
      return `<span class="inline-${target}">${text}</span>`;
    }
  }
  /**
   * Check if a string looks like a URL
   */
  static isURL(str) {
    // Check for common URL patterns
    const urlPatterns = [
      /^https?:\/\//i, // http:// or https://
      /^\/\//i, // Protocol-relative URLs
      /^mailto:/i, // Email links
      /^tel:/i, // Phone links
      /^#/, // Hash/anchor links
      /^\//, // Relative URLs starting with /
      /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/, // Domain names like example.com or example.com/path
      /^www\./i, // URLs starting with www.
    ];

    return urlPatterns.some((pattern) => pattern.test(str));
  }

  /**
   * Check if URL is external (different domain)
   */
  static isExternalURL(url) {
    try {
      // Handle relative URLs
      if (url.startsWith("/") || url.startsWith("#")) {
        return false;
      }

      // Handle protocol-relative URLs
      if (url.startsWith("//")) {
        url = "https:" + url;
      }

      // Add protocol if missing for domain-like URLs
      if (
        /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(url) ||
        /^www\./i.test(url)
      ) {
        url = "https://" + url;
      }

      const urlObj = new URL(url, window.location.origin);
      return urlObj.hostname !== window.location.hostname;
    } catch (error) {
      // If URL parsing fails, assume it's external to be safe
      return true;
    }
  }

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
      MarkdownProcessor._warning("Markdown processing failed", error);
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
      MarkdownProcessor._warning("Inline markdown processing failed", error);
      return text;
    }
  }

  /**
   * Test if the processor is working correctly
   * @returns {boolean} True if basic functionality works
   */
  static selfTest() {
    try {
      const testCases = [
        {
          input: "__bold__ and _italic_ text",
          shouldContain: ["<strong>", "<em>"],
        },
        {
          input: "[Visit Google](google.com)",
          shouldContain: ['<a href="https://google.com"', 'target="_blank"'],
        },
        {
          input: "[Visit Site](example.com/page.html)",
          shouldContain: ['<a href="https://example.com/page.html"'],
        },
        {
          input: "[Highlighted](highlight)",
          shouldContain: ['<span class="inline-highlight"'],
        },
        { input: "[Internal link](/page)", shouldContain: ['<a href="/page"'] },
        { input: "[Anchor](#section)", shouldContain: ['<a href="#section"'] },
        {
          input: "[WWW Site](www.example.com)",
          shouldContain: ['<a href="https://www.example.com"'],
        },
      ];

      return testCases.every((test) => {
        const result = this.process(test.input);
        return test.shouldContain.every((substring) =>
          result.includes(substring),
        );
      });
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
      supportsLinks: true,
      supportsInlineClasses: true,
      timestamp: new Date().toISOString(),
    };
  }
}

export { MarkdownProcessor };
