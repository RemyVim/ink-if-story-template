import { MarkdownProcessor } from "../src/js/markdown-processor.js";

describe("MarkdownProcessor", () => {
  beforeAll(() => {
    window.errorManager = {
      error: vi.fn(),
      warning: vi.fn(),
      critical: vi.fn(),
    };
  });

  afterAll(() => {
    delete window.errorManager;
  });

  describe("bold and italic", () => {
    test("converts __text__ to bold", () => {
      expect(MarkdownProcessor.process("__bold__")).toBe(
        "<strong>bold</strong>",
      );
    });

    test("converts _text_ to italic", () => {
      expect(MarkdownProcessor.process("_italic_")).toBe("<em>italic</em>");
    });

    test("converts ___text___ to bold italic", () => {
      expect(MarkdownProcessor.process("___both___")).toBe(
        "<strong><em>both</em></strong>",
      );
    });

    test("handles multiple formatting in one line", () => {
      const result = MarkdownProcessor.process("__bold__ and _italic_");
      expect(result).toContain("<strong>bold</strong>");
      expect(result).toContain("<em>italic</em>");
    });

    test("handles multiple words inside formatting", () => {
      expect(MarkdownProcessor.process("__multiple words here__")).toBe(
        "<strong>multiple words here</strong>",
      );
    });

    test("converts mid-word emphasis", () => {
      const result = MarkdownProcessor.process("un_effing_believable");
      expect(result).toBe("un<em>effing</em>believable");
    });

    test("snake_case gets converted (use backticks or %_ to escape)", () => {
      const result = MarkdownProcessor.process("my_variable_name");
      expect(result).toBe("my<em>variable</em>name");
    });

    test("snake_case in backticks is protected", () => {
      const result = MarkdownProcessor.process("`my_variable_name`");
      expect(result).toBe("<code>my_variable_name</code>");
    });

    test("does not match formatting across newlines", () => {
      const result = MarkdownProcessor.process("__bold\ntext__");
      expect(result).not.toContain("<strong>");
    });

    test("handles consecutive bold sections", () => {
      const result = MarkdownProcessor.process("__one__ __two__");
      expect(result).toBe("<strong>one</strong> <strong>two</strong>");
    });

    test("handles consecutive bold sections without spaces", () => {
      const result = MarkdownProcessor.process("__one____two__");
      expect(result).toBe("<strong>one</strong><strong>two</strong>");
    });

    test("handles consecutive bold and italic sections without spaces", () => {
      const result = MarkdownProcessor.process("__one___two_");
      expect(result).toBe("<strong>one</strong><em>two</em>");
    });

    test("leaves unclosed formatting unchanged", () => {
      expect(MarkdownProcessor.process("__not closed")).toBe("__not closed");
    });

    test("handles formatting at start of text", () => {
      expect(MarkdownProcessor.process("__bold__ rest")).toBe(
        "<strong>bold</strong> rest",
      );
    });

    test("handles formatting at end of text", () => {
      expect(MarkdownProcessor.process("start __bold__")).toBe(
        "start <strong>bold</strong>",
      );
    });

    test("handles punctuation after formatting", () => {
      expect(MarkdownProcessor.process("__bold__!")).toBe(
        "<strong>bold</strong>!",
      );
      expect(MarkdownProcessor.process("_italic_.")).toBe("<em>italic</em>.");
    });

    test("converts spaces to bold and italics", () => {
      expect(MarkdownProcessor.process("__ __")).toBe("<strong> </strong>");
      expect(MarkdownProcessor.process("_ _")).toBe("<em> </em>");
    });

    test("empty formatting markers unchanged", () => {
      expect(MarkdownProcessor.process("____")).toBe("____");
      expect(MarkdownProcessor.process("__")).toBe("__");
    });

    test("underscore-only strings unchanged", () => {
      expect(MarkdownProcessor.process("___")).toBe("___");
      expect(MarkdownProcessor.process("_________")).toBe("_________");
    });
  });

  describe("headers", () => {
    test("converts : to h2", () => {
      expect(MarkdownProcessor.process(": Header")).toBe("<h2>Header</h2>");
    });

    test("converts :: to h3", () => {
      expect(MarkdownProcessor.process(":: Header")).toBe("<h3>Header</h3>");
    });

    test("converts ::: to h4", () => {
      expect(MarkdownProcessor.process("::: Header")).toBe("<h4>Header</h4>");
    });

    test("four or more colons not converted (only h2-h4 supported)", () => {
      expect(MarkdownProcessor.process(":::: Header")).toBe(":::: Header");
      expect(MarkdownProcessor.process("::::: Header")).toBe("::::: Header");
    });

    test("requires space after colons", () => {
      expect(MarkdownProcessor.process(":Header")).toBe(":Header");
      expect(MarkdownProcessor.process("::Header")).toBe("::Header");
    });

    test("only matches at start of line", () => {
      expect(MarkdownProcessor.process("text : Header")).toBe("text : Header");
      expect(MarkdownProcessor.process("say: hello")).toBe("say: hello");
    });

    test("handles header in multiline text", () => {
      const result = MarkdownProcessor.process("intro\n: Title\nmore text");
      expect(result).toContain("<h2>Title</h2>");
      expect(result).toContain("intro");
      expect(result).toContain("more text");
    });

    test("does not convert time format", () => {
      expect(MarkdownProcessor.process("Meet at 10:30")).toBe("Meet at 10:30");
    });

    test("does not convert URLs", () => {
      const result = MarkdownProcessor.process("https://example.com");
      expect(result).not.toContain("<h2>");
    });

    test("handles empty header content", () => {
      expect(MarkdownProcessor.process(": ")).toBe("<h2></h2>");
      expect(MarkdownProcessor.process(":")).toBe(":");
    });

    test("preserves formatting in header text", () => {
      const result = MarkdownProcessor.process(": __Bold__ Header");
      expect(result).toContain("<h2>");
      expect(result).toContain("<strong>Bold</strong>");
      expect(result).toContain("<h2><strong>Bold</strong> Header</h2>");
    });
  });

  describe("lists and quotes", () => {
    test("converts > to list item", () => {
      expect(MarkdownProcessor.process("> Item")).toBe(
        "<ul><li>Item</li></ul>",
      );
    });

    test("converts >> to blockquote", () => {
      expect(MarkdownProcessor.process(">> Quote")).toBe(
        "<blockquote>Quote</blockquote>",
      );
    });

    test("wraps consecutive list items in ul", () => {
      const result = MarkdownProcessor.process("> One\n> Two");
      expect(result).toContain("<ul>");
      expect(result).toContain("<li>One</li>");
      expect(result).toContain("<li>Two</li>");
      expect(result).toContain("</ul>");
    });

    test("requires space after > or >>", () => {
      expect(MarkdownProcessor.process(">Item")).toBe(">Item");
      expect(MarkdownProcessor.process(">>Quote")).toBe(">>Quote");
    });

    test("only matches at start of line", () => {
      expect(MarkdownProcessor.process("text > more")).toBe("text > more");
      expect(MarkdownProcessor.process("a > b")).toBe("a > b");
    });

    test("does not convert comparison operators", () => {
      expect(MarkdownProcessor.process("x > 5")).toBe("x > 5");
      expect(MarkdownProcessor.process("if score >> 100")).toBe(
        "if score >> 100",
      );
    });

    test("triple >>> not converted", () => {
      expect(MarkdownProcessor.process(">>> text")).toBe(">>> text");
    });

    test("handles formatting inside list items", () => {
      const result = MarkdownProcessor.process("> __bold__ item");
      expect(result).toContain("<li>");
      expect(result).toContain("<strong>bold</strong>");
      expect(result).toContain("<li><strong>bold</strong> item</li>");
    });

    test("handles formatting inside blockquotes", () => {
      const result = MarkdownProcessor.process(">> _italic_ quote");
      expect(result).toContain("<blockquote>");
      expect(result).toContain("<em>italic</em>");
      expect(result).toContain(
        "<blockquote><em>italic</em> quote</blockquote>",
      );
    });

    test("separate lists not merged", () => {
      const result = MarkdownProcessor.process("> One\n\ntext\n\n> Two");
      expect(result).toContain("<ul><li>One</li></ul>");
      expect(result).toContain("text");
      expect(result).toContain("<ul><li>Two</li></ul>");
    });
  });

  describe("horizontal rule", () => {
    test("converts [---] to hr", () => {
      expect(MarkdownProcessor.process("[---]")).toBe("<hr>");
    });

    test("converts [------] to hr", () => {
      expect(MarkdownProcessor.process("[------]")).toBe("<hr>");
    });

    test("requires minimum 3 dashes", () => {
      expect(MarkdownProcessor.process("[--]")).toBe("[--]");
      expect(MarkdownProcessor.process("[-]")).toBe("[-]");
    });

    test("only matches at start of line", () => {
      expect(MarkdownProcessor.process("text [---]")).toBe("text [---]");
    });

    test("must be alone on line", () => {
      expect(MarkdownProcessor.process("[---] text")).toBe("[---] text");
    });

    test("no spaces inside brackets", () => {
      expect(MarkdownProcessor.process("[ --- ]")).toBe("[ --- ]");
    });

    test("works in multiline text", () => {
      const result = MarkdownProcessor.process("above\n[---]\nbelow");
      expect(result).toContain("above");
      expect(result).toContain("<hr>");
      expect(result).toContain("below");
    });
  });

  describe("inline code", () => {
    test("converts `code` to code element", () => {
      expect(MarkdownProcessor.process("`code`")).toBe("<code>code</code>");
    });

    test("does not process markdown inside code", () => {
      const result = MarkdownProcessor.process("`__not bold__`");
      expect(result).toBe("<code>__not bold__</code>");
      expect(result).not.toContain("<strong>");
    });

    test("handles multiple inline code in one line", () => {
      const result = MarkdownProcessor.process("`one` and `two`");
      expect(result).toBe("<code>one</code> and <code>two</code>");
    });

    test("handles code at start of text", () => {
      expect(MarkdownProcessor.process("`code` rest")).toBe(
        "<code>code</code> rest",
      );
    });

    test("handles code at end of text", () => {
      expect(MarkdownProcessor.process("start `code`")).toBe(
        "start <code>code</code>",
      );
    });

    test("handles empty inline code", () => {
      expect(MarkdownProcessor.process("``")).toBe("<code></code>");
      expect(MarkdownProcessor.process("` `")).toBe("<code> </code>");
    });

    test("handles unclosed backtick", () => {
      const result = MarkdownProcessor.process("`unclosed");
      expect(result).toContain("<code>");
      expect(result).toContain("<code>unclosed</code>");
    });

    test("preserves special characters in code", () => {
      expect(MarkdownProcessor.process("`<div>`")).toBe("<code><div></code>");
      expect(MarkdownProcessor.process("`a > b`")).toBe("<code>a > b</code>");
    });

    test("protects URLs in code", () => {
      const result = MarkdownProcessor.process("`https://example.com`");
      expect(result).toBe("<code>https://example.com</code>");
      expect(result).not.toContain("<a ");
    });
  });

  describe("escape sequences", () => {
    test("escapes %_ to literal underscore", () => {
      expect(MarkdownProcessor.process("text %_ more")).toContain("&#95;");
    });

    test("escapes %` to literal backtick", () => {
      expect(MarkdownProcessor.process("text %` more")).toContain("&#96;");
    });

    test("escapes %: to literal colon", () => {
      expect(MarkdownProcessor.process("text %: more")).toContain("&#58;");
    });

    test("escapes %[ to literal open bracket", () => {
      expect(MarkdownProcessor.process("text %[ more")).toContain("&#91;");
    });

    test("escapes %] to literal close bracket", () => {
      expect(MarkdownProcessor.process("text %] more")).toContain("&#93;");
    });

    test("escapes %( to literal open paren", () => {
      expect(MarkdownProcessor.process("text %( more")).toContain("&#40;");
    });

    test("escapes %) to literal close paren", () => {
      expect(MarkdownProcessor.process("text %) more")).toContain("&#41;");
    });

    test("escapes %% to literal percent", () => {
      expect(MarkdownProcessor.process("text %% more")).toContain("&#37;");
    });

    test("escape prevents underscore formatting", () => {
      const result = MarkdownProcessor.process("text %_not italic%_");
      expect(result).not.toContain("<em>");
      expect(result).toContain("&#95;");
    });

    test("escape prevents link/class syntax", () => {
      const result = MarkdownProcessor.process("%[text%](target)");
      expect(result).not.toContain("<a ");
      expect(result).not.toContain("<span");
    });

    test("escape prevents header syntax", () => {
      const result = MarkdownProcessor.process("%: Not a header");
      expect(result).not.toContain("<h2>");
    });

    test("multiple escapes in one line", () => {
      const result = MarkdownProcessor.process("text %_ and %` and %%");
      expect(result).toContain("&#95;");
      expect(result).toContain("&#96;");
      expect(result).toContain("&#37;");
    });

    test("% followed by unknown char unchanged", () => {
      expect(MarkdownProcessor.process("100% complete")).toBe("100% complete");
      expect(MarkdownProcessor.process("text %x more")).toBe("text %x more");
    });

    test("skips all processing when line starts with %", () => {
      expect(MarkdownProcessor.process("% __not bold__")).toBe(" __not bold__");
    });

    test("skip processing ignores leading whitespace", () => {
      expect(MarkdownProcessor.process("  % __not bold__")).toBe(
        " __not bold__",
      );
    });
  });

  describe("edge cases", () => {
    test("returns empty string for null", () => {
      expect(MarkdownProcessor.process(null)).toBe("");
    });

    test("returns empty string for undefined", () => {
      expect(MarkdownProcessor.process(undefined)).toBe("");
    });

    test("returns empty string for empty string", () => {
      expect(MarkdownProcessor.process("")).toBe("");
    });

    test("returns original for plain text", () => {
      expect(MarkdownProcessor.process("plain text")).toBe("plain text");
    });

    test("returns empty string for non-string types", () => {
      expect(MarkdownProcessor.process(123)).toBe("");
      expect(MarkdownProcessor.process({})).toBe("");
      expect(MarkdownProcessor.process([])).toBe("");
    });

    test("trailing double space converts to br", () => {
      expect(MarkdownProcessor.process("line one  ")).toBe("line one<br>");
    });

    test("handles whitespace-only input", () => {
      // Two trailing spaces become <br>
      expect(MarkdownProcessor.process(" ")).toBe(" ");
      expect(MarkdownProcessor.process("  ")).toBe("<br>");
      expect(MarkdownProcessor.process("   ")).toBe(" <br>");
      expect(MarkdownProcessor.process("    ")).toBe("  <br>");
    });

    test("handles mixed formatting in one line", () => {
      const result = MarkdownProcessor.process(
        "__bold__ and _italic_ and `code`",
      );
      expect(result).toContain("<strong>bold</strong>");
      expect(result).toContain("<em>italic</em>");
      expect(result).toContain("<code>code</code>");
    });
  });

  describe("isURL", () => {
    test("recognizes http:// URLs", () => {
      expect(MarkdownProcessor.isURL("http://example.com")).toBe(true);
    });

    test("recognizes https:// URLs", () => {
      expect(MarkdownProcessor.isURL("https://example.com")).toBe(true);
    });

    test("recognizes domain names", () => {
      expect(MarkdownProcessor.isURL("example.com")).toBe(true);
      expect(MarkdownProcessor.isURL("example.com/path")).toBe(true);
    });

    test("recognizes www URLs", () => {
      expect(MarkdownProcessor.isURL("www.example.com")).toBe(true);
    });

    test("recognizes mailto links", () => {
      expect(MarkdownProcessor.isURL("mailto:test@example.com")).toBe(true);
    });

    test("recognizes tel links", () => {
      expect(MarkdownProcessor.isURL("tel:+1234567890")).toBe(true);
    });

    test("recognizes anchor links", () => {
      expect(MarkdownProcessor.isURL("#section")).toBe(true);
    });

    test("recognizes relative URLs", () => {
      expect(MarkdownProcessor.isURL("/page")).toBe(true);
    });

    test("recognizes protocol-relative URLs", () => {
      expect(MarkdownProcessor.isURL("//example.com")).toBe(true);
    });

    test("rejects plain words", () => {
      expect(MarkdownProcessor.isURL("highlight")).toBe(false);
      expect(MarkdownProcessor.isURL("important")).toBe(false);
    });

    test("recognizes subdomains", () => {
      expect(MarkdownProcessor.isURL("sub.example.com")).toBe(true);
      expect(MarkdownProcessor.isURL("deep.sub.example.com")).toBe(true);
    });

    test("recognizes URLs with query strings", () => {
      expect(MarkdownProcessor.isURL("example.com/page?id=1")).toBe(true);
    });

    test("rejects single words without TLD", () => {
      expect(MarkdownProcessor.isURL("localhost")).toBe(false);
      expect(MarkdownProcessor.isURL("mysite")).toBe(false);
    });

    test("rejects numbers", () => {
      expect(MarkdownProcessor.isURL("12345")).toBe(false);
    });

    test("rejects empty string", () => {
      expect(MarkdownProcessor.isURL("")).toBe(false);
    });
  });

  describe("isExternalURL", () => {
    test("returns false for relative URLs", () => {
      expect(MarkdownProcessor.isExternalURL("/page")).toBe(false);
    });

    test("returns false for anchor links", () => {
      expect(MarkdownProcessor.isExternalURL("#section")).toBe(false);
    });

    test("returns true for external domains", () => {
      expect(MarkdownProcessor.isExternalURL("https://google.com")).toBe(true);
    });

    test("handles protocol-relative URLs", () => {
      // Protocol-relative URLs starting with // are caught by the "/" check
      // and treated as relative/internal
      expect(MarkdownProcessor.isExternalURL("//external.com")).toBe(false);
    });

    test("handles bare domain names", () => {
      expect(MarkdownProcessor.isExternalURL("example.com")).toBe(true);
    });
    test("returns true for mailto links", () => {
      expect(MarkdownProcessor.isExternalURL("mailto:test@example.com")).toBe(
        true,
      );
    });

    test("returns true for tel links", () => {
      expect(MarkdownProcessor.isExternalURL("tel:+1234567890")).toBe(true);
    });

    test("returns true for invalid/unparseable URLs", () => {
      // Falls back to true (external) when parsing fails
      expect(MarkdownProcessor.isExternalURL("not:a:valid:url:format")).toBe(
        true,
      );
    });
  });

  describe("processLinkOrClass", () => {
    test("creates link for URL targets", () => {
      const result = MarkdownProcessor.processLinkOrClass(
        "Click",
        "https://example.com",
      );
      expect(result).toContain('<a href="https://example.com"');
      expect(result).toContain("Click");
    });

    test("adds https to bare domains", () => {
      const result = MarkdownProcessor.processLinkOrClass(
        "Click",
        "example.com",
      );
      expect(result).toContain('href="https://example.com"');
    });

    test("adds https to www domains", () => {
      const result = MarkdownProcessor.processLinkOrClass(
        "Click",
        "www.example.com",
      );
      expect(result).toContain('href="https://www.example.com"');
    });

    test("adds external link attributes", () => {
      const result = MarkdownProcessor.processLinkOrClass(
        "Click",
        "https://external.com",
      );
      expect(result).toContain('target="_blank"');
      expect(result).toContain('rel="noopener noreferrer"');
    });

    test("adds screen reader text for external links", () => {
      const result = MarkdownProcessor.processLinkOrClass(
        "Click",
        "https://external.com",
      );
      expect(result).toContain("opens in new tab");
    });

    test("handles anchor links", () => {
      const result = MarkdownProcessor.processLinkOrClass("Jump", "#section");
      expect(result).toContain('href="#section"');
      expect(result).not.toContain('target="_blank"');
    });

    test("relative URLs not marked external", () => {
      const result = MarkdownProcessor.processLinkOrClass("Page", "/about");
      expect(result).toContain('href="/about"');
      expect(result).not.toContain('target="_blank"');
      expect(result).not.toContain("opens in new tab");
    });

    test("empty text in link", () => {
      const result = MarkdownProcessor.processLinkOrClass(
        "",
        "https://example.com",
      );
      expect(result).toContain('href="https://example.com"');
      expect(result).toContain("></a>"); // empty anchor text
    });

    test("single word treated as class name", () => {
      const result = MarkdownProcessor.processLinkOrClass("Page", "about");
      expect(result).toBe('<span class="inline-about">Page</span>');
    });

    test("mailto links are external", () => {
      const result = MarkdownProcessor.processLinkOrClass(
        "Email",
        "mailto:test@example.com",
      );
      expect(result).toContain('href="mailto:test@example.com"');
      expect(result).toContain('target="_blank"');
    });

    test("tel links are external", () => {
      const result = MarkdownProcessor.processLinkOrClass(
        "Call",
        "tel:+1234567890",
      );
      expect(result).toContain('href="tel:+1234567890"');
      expect(result).toContain('target="_blank"');
    });

    test("empty target treated as class name", () => {
      const result = MarkdownProcessor.processLinkOrClass("text", "");
      expect(result).toBe('<span class="inline-">text</span>');
    });

    test("empty text in class", () => {
      const result = MarkdownProcessor.processLinkOrClass("", "highlight");
      expect(result).toBe('<span class="inline-highlight"></span>');
    });

    test("creates span for class targets", () => {
      const result = MarkdownProcessor.processLinkOrClass("text", "highlight");
      expect(result).toBe('<span class="inline-highlight">text</span>');
    });

    test("class names with dashes", () => {
      const result = MarkdownProcessor.processLinkOrClass(
        "text",
        "my-custom-class",
      );
      expect(result).toBe('<span class="inline-my-custom-class">text</span>');
    });
  });

  describe("tokenize", () => {
    test("returns single text token for plain text", () => {
      const tokens = MarkdownProcessor.tokenize("hello");
      expect(tokens).toEqual([{ type: "text", content: "hello" }]);
    });

    test("extracts code blocks", () => {
      const tokens = MarkdownProcessor.tokenize("before `code` after");
      expect(tokens).toEqual([
        { type: "text", content: "before " },
        { type: "code", content: "code" },
        { type: "text", content: " after" },
      ]);
    });

    test("handles multiple code blocks", () => {
      const tokens = MarkdownProcessor.tokenize("`one` and `two`");
      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toEqual({ type: "code", content: "one" });
      expect(tokens[1]).toEqual({ type: "text", content: " and " });
      expect(tokens[2]).toEqual({ type: "code", content: "two" });
    });

    test("handles empty code block", () => {
      const tokens = MarkdownProcessor.tokenize("``");
      expect(tokens).toEqual([{ type: "code", content: "" }]);
    });

    test("handles unclosed code block", () => {
      const tokens = MarkdownProcessor.tokenize("before `unclosed");
      expect(tokens).toHaveLength(2);
      expect(tokens[1].type).toBe("code");
    });

    test("handles empty string", () => {
      const tokens = MarkdownProcessor.tokenize("");
      expect(tokens).toEqual([]);
    });

    test("handles code only (no text)", () => {
      const tokens = MarkdownProcessor.tokenize("`code`");
      expect(tokens).toEqual([{ type: "code", content: "code" }]);
    });

    test("handles consecutive code blocks", () => {
      const tokens = MarkdownProcessor.tokenize("`one``two`");
      expect(tokens).toEqual([
        { type: "code", content: "one" },
        { type: "code", content: "two" },
      ]);
    });
  });

  describe("links in process", () => {
    test("converts [text](url) to link", () => {
      const result = MarkdownProcessor.process("[Google](google.com)");
      expect(result).toContain('<a href="https://google.com"');
      expect(result).toContain("Google");
    });

    test("converts [text](class) to styled span", () => {
      const result = MarkdownProcessor.process("[important](important)");
      expect(result).toContain('<span class="inline-important">');
    });

    test("handles internal links", () => {
      const result = MarkdownProcessor.process("[page](/about)");
      expect(result).toContain('href="/about"');
      expect(result).not.toContain('target="_blank"');
    });

    test("multiple links in one line", () => {
      const result = MarkdownProcessor.process(
        "[One](example.com) and [Two](other.com)",
      );
      expect(result).toContain('href="https://example.com"');
      expect(result).toContain('href="https://other.com"');
    });

    test("link with surrounding text", () => {
      const result = MarkdownProcessor.process("Click [here](example.com) now");
      expect(result).toBe(
        'Click <a href="https://example.com" target="_blank" rel="noopener noreferrer">here<span class="sr-only"> (opens in new tab)</span></a> now',
      );
    });

    test("link inside bold text", () => {
      const result = MarkdownProcessor.process("__[bold link](example.com)__");
      expect(result).toContain("<strong>");
      expect(result).toContain("<a href");
    });

    test("escaped brackets prevent link", () => {
      const result = MarkdownProcessor.process(
        "This is %[not a link%](target)",
      );
      expect(result).not.toContain("<a ");
      expect(result).not.toContain("<span class");
      expect(result).toContain("&#91;not a link&#93;(target)");
    });

    test("link mixed with other formatting", () => {
      const result = MarkdownProcessor.process(
        "__bold__ [link](example.com) _italic_",
      );
      expect(result).toContain("<strong>bold</strong>");
      expect(result).toContain("<a href");
      expect(result).toContain("<em>italic</em>");
    });
  });
});
