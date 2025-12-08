import { errorManager, ERROR_SOURCES } from "./error-manager.js";

const log = errorManager.forSource(ERROR_SOURCES.MARKDOWN);

/**
 * Converts custom markdown-like syntax to HTML.
 * Supports headings, bold, italic, links, inline classes, code blocks,
 * blockquotes, lists, horizontal rules, and escape sequences.
 * All methods are static.
 */
class MarkdownProcessor {
  /**
   * Regex patterns for markdown conversion, organized by processing stage.
   * - escape: Convert %x escape sequences to HTML entities
   * - block: Convert block-level elements (headings, hr, blockquotes, lists)
   * - inline: Convert inline formatting (bold, italic, links, line breaks)
   * @type {{escape: Array, block: Array, inline: Array}}
   */
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
      [
        /\[(.*?)\]\(([^)]+)\)/g,
        (match, text, target) => {
          return MarkdownProcessor.processLinkOrClass(text, target);
        },
      ],
      [/  $/gm, "<br>"],
    ],
  };

  /**
   * Converts markdown-like syntax to HTML.
   * Lines starting with % skip all processing (raw output).
   * @param {string} text - Text to process
   * @returns {string} HTML string
   */
  static process(text) {
    if (!text || typeof text !== "string") return "";

    if (text.trim().startsWith("%")) {
      return text.trim().substring(1);
    }

    try {
      for (const [pattern, replacement] of this.patterns.escape) {
        text = text.replace(pattern, replacement);
      }

      for (const [pattern, replacement] of this.patterns.block) {
        text = text.replace(pattern, replacement);
      }

      text = text.replace(
        /(<li>.*?<\/li>(?:\s*<li>.*?<\/li>)*)/gs,
        "<ul>$1</ul>"
      );

      text = this.processInlineWithCodeBlocks(text);

      return text;
    } catch (error) {
      log.warning("Markdown processing failed", error);
      return text;
    }
  }

  /**
   * Processes inline markdown while protecting code blocks from transformation.
   * @param {string} text - Text to process
   * @returns {string} Processed HTML string
   * @private
   */
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

  /**
   * Splits text into tokens, separating code blocks from regular text.
   * @param {string} text - Text to tokenize
   * @returns {Array<{type: 'code'|'text', content: string}>} Array of tokens
   * @private
   */
  static tokenize(text) {
    const tokens = [];
    let current = "";
    let i = 0;

    while (i < text.length) {
      if (text[i] === "`") {
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

    if (current) {
      tokens.push({ type: "text", content: current });
    }

    return tokens;
  }

  /**
   * Applies inline markdown patterns (bold, italic, links, etc.) to text.
   * @param {string} text - Text to process (should not contain code blocks)
   * @returns {string} Processed HTML string
   * @private
   */
  static processInlineMarkdown(text) {
    try {
      for (const [pattern, replacement] of this.patterns.inline) {
        text = text.replace(pattern, replacement);
      }
      return text;
    } catch (error) {
      log.warning("Inline markdown processing failed", error);
      return text;
    }
  }

  /**
   * Processes [text](target) syntax, converting to either a link or styled span.
   *
   * If target looks like a URL (http://, domain.com, /path, #anchor, mailto:, tel:):
   * - Creates an `<a>` tag
   * - Adds https:// to bare domains (e.g., "example.com" → "https://example.com")
   * - External links get target="_blank", rel="noopener noreferrer", and SR text
   * - Internal links (starting with / or #) open in same tab
   *
   * If target is not a URL (e.g., "highlight", "warning"):
   * - Creates a `<span class="inline-{target}">` for custom styling
   *
   * @param {string} text - The link/span text content
   * @param {string} target - URL or class name
   * @returns {string} HTML string for either an anchor or span element
   */
  static processLinkOrClass(text, target) {
    if (this.isURL(target)) {
      let href = target;
      if (
        /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(target) ||
        /^www\./i.test(target)
      ) {
        href = "https://" + target;
      }

      const isExternal = this.isExternalURL(href);
      const externalAttr = isExternal
        ? ' target="_blank" rel="noopener noreferrer"'
        : "";
      const srText = isExternal // For screen readers, invisible
        ? '<span class="sr-only"> (opens in new tab)</span>'
        : "";
      return `<a href="${href}"${externalAttr}>${text}${srText}</a>`;
    } else {
      return `<span class="inline-${target}">${text}</span>`;
    }
  }

  /**
   * Checks if a string looks like a URL (http, mailto, tel, relative paths, domains).
   * @param {string} str - String to check
   * @returns {boolean} True if string appears to be a URL
   * @private
   */
  static isURL(str) {
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
   * Checks if a URL points to an external site (should open in new tab).
   * Internal URLs start with / or #. Mailto and tel links are treated as external.
   * @param {string} href - URL to check
   * @returns {boolean} True if URL is external
   * @private
   */
  static isExternalURL(url) {
    try {
      if (url.startsWith("/") || url.startsWith("#")) {
        return false;
      }

      if (url.startsWith("//")) {
        url = "https:" + url;
      }

      if (
        /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(url) ||
        /^www\./i.test(url)
      ) {
        url = "https://" + url;
      }

      const urlObj = new URL(url, window.location.origin);
      return urlObj.hostname !== window.location.hostname;
    } catch {
      return true;
    }
  }

  /**
   * Returns diagnostic information about the processor's configuration.
   * @returns {{patternCount: {escape: number, block: number, inline: number}, supportsLinks: boolean, supportsInlineClasses: boolean, timestamp: string}}
   */
  static getStats() {
    return {
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
