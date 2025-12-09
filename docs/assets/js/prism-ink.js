/**
 * Prism.js language definition for inkle's Ink
 * https://github.com/inkle/ink
 *
 * Based on the official TextMate grammar:
 * https://github.com/inkle/ink-tmlanguage
 *
 * @author Remy Vim
 * @license MIT
 */

(function (Prism) {
  // // Ink identifier pattern (simplified - the full grammar supports many Unicode ranges)
  // var identifier = /[a-zA-Z_][a-zA-Z0-9_]*/;
  // var identifierPath = /[a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*/;

  Prism.languages.ink = {
    // ============================================
    // COMMENTS
    // ============================================
    comment: [
      {
        // Block comments /* */
        pattern: /\/\*[\s\S]*?\*\//,
        greedy: true,
      },
      {
        // Line comments //
        pattern: /\/\/.*/,
        greedy: true,
      },
    ],

    // ============================================
    // TODO MARKERS
    // ============================================
    todo: {
      pattern: /^[ \t]*TODO\b.*/m,
      alias: "important",
      inside: {
        keyword: /^[ \t]*TODO/,
      },
    },

    // ============================================
    // KNOTS: === knot_name === or === function name() ===
    // ============================================
    knot: {
      pattern: /^[ \t]*={2,}.*$/m,
      inside: {
        "function-definition": {
          pattern: /(\bfunction\s+)[a-zA-Z_][a-zA-Z0-9_]*/,
          lookbehind: true,
          alias: "function",
        },
        keyword: /\bfunction\b/,
        "knot-name": {
          pattern: /(?<=={2,}\s*)[a-zA-Z_][a-zA-Z0-9_]*/,
          alias: "class-name",
        },
        punctuation: /={2,}/,
        parameters: {
          pattern: /\([^)]*\)/,
          inside: {
            keyword: /\bref\b/,
            variable: /[a-zA-Z_][a-zA-Z0-9_]*/,
            punctuation: /[(),]/,
          },
        },
      },
    },

    // ============================================
    // STITCHES: = stitch_name
    // ============================================
    stitch: {
      pattern: /^[ \t]*=(?!=)[^=\n].*$/m,
      inside: {
        "stitch-name": {
          pattern: /(?<==\s*)[a-zA-Z_][a-zA-Z0-9_]*/,
          alias: "function",
        },
        punctuation: /=/,
        parameters: {
          pattern: /\([^)]*\)/,
          inside: {
            keyword: /\bref\b/,
            variable: /[a-zA-Z_][a-zA-Z0-9_]*/,
            punctuation: /[(),]/,
          },
        },
      },
    },

    // ============================================
    // TAGS: # tag or # TAG: value
    // ============================================
    tag: {
      pattern: /(?<!\\)#[^\n#]*/,
      alias: "attr-name",
    },

    // ============================================
    // INCLUDE statements
    // ============================================
    include: {
      pattern: /^[ \t]*INCLUDE\b.*/m,
      inside: {
        keyword: /^[ \t]*INCLUDE/,
        string: {
          pattern: /\S.*/,
          alias: "filepath",
        },
      },
    },

    // ============================================
    // DECLARATIONS: VAR, CONST, LIST, EXTERNAL
    // ============================================
    declaration: {
      pattern: /^[ \t]*(?:VAR|CONST|LIST|EXTERNAL)\b.*/m,
      inside: {
        keyword: /^[ \t]*(?:VAR|CONST|LIST|EXTERNAL)\b/,
        function: /[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\()/,
        constant: {
          pattern: /(?<=CONST\s+)[a-zA-Z_][a-zA-Z0-9_]*/,
          alias: "constant",
        },
        variable: /(?<=(?:VAR|LIST)\s+)[a-zA-Z_][a-zA-Z0-9_]*/,
        string: /"(?:[^"\\]|\\.)*"/,
        number: /\b\d+(?:\.\d+)?\b/,
        boolean: /\b(?:true|false)\b/,
        operator: /[=(),]/,
        "list-item": {
          pattern: /(?<=\()[^)]+(?=\))/,
          inside: {
            variable: /[a-zA-Z_][a-zA-Z0-9_]*/,
            punctuation: /,/,
          },
        },
      },
    },

    // ============================================
    // LOGIC LINES: ~ expression
    // ============================================
    logic: {
      pattern: /^[ \t]*~.*/m,
      inside: {
        "logic-symbol": {
          pattern: /^[ \t]*~/,
          alias: "keyword",
        },
        keyword: /\b(?:return|temp|not|and|or|mod|has|hasnt)\b/,
        builtin:
          /\b(?:LIST_COUNT|LIST_MIN|LIST_MAX|LIST_ALL|LIST_INVERT|LIST_RANDOM|CHOICE_COUNT|TURNS_SINCE|TURNS|LIST_RANGE|POW|FLOOR|CEILING|INT|FLOAT|RANDOM)\b/,
        string: /"(?:[^"\\]|\\.)*"/,
        number: /\b\d+(?:\.\d+)?\b/,
        boolean: /\b(?:true|false)\b/,
        function: /[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\()/,
        divert: {
          pattern:
            /->[\s]*[a-zA-Z_][a-zA-Z0-9_.]*|<-[\s]*[a-zA-Z_][a-zA-Z0-9_.]*/,
          inside: {
            operator: /->|<-/,
            target: {
              pattern: /[a-zA-Z_][a-zA-Z0-9_.]*/,
              alias: "function",
            },
          },
        },
        operator: /\+\+|--|&&|\|\||[+\-*/%=<>!]=?|[?^]/,
        variable: /[a-zA-Z_][a-zA-Z0-9_]*/,
        punctuation: /[(),]/,
      },
    },

    // ============================================
    // CHOICES: * or + at start of line
    // ============================================
    choice: {
      pattern: /^[ \t]*[*+]+.*/m,
      inside: {
        "choice-bullet": {
          pattern: /^[ \t]*[*+]+/,
          alias: "keyword",
        },
        label: {
          pattern: /\([\s]*[a-zA-Z_][a-zA-Z0-9_]*[\s]*\)/,
          alias: "variable",
        },
        condition: {
          pattern: /\{[^}]+\}/,
          inside: {
            builtin:
              /\b(?:LIST_COUNT|LIST_MIN|LIST_MAX|TURNS_SINCE|CHOICE_COUNT)\b/,
            keyword: /\b(?:not|and|or|has|hasnt)\b/,
            function: /[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\()/,
            variable: /[a-zA-Z_][a-zA-Z0-9_.]*/,
            operator: /&&|\|\||[<>=!]=?|[?]/,
            number: /\b\d+(?:\.\d+)?\b/,
            boolean: /\b(?:true|false)\b/,
            punctuation: /[{}(),]/,
          },
        },
        suppression: {
          pattern: /\[[^\]]*\]/,
          inside: {
            bracket: {
              pattern: /[\[\]]/,
              alias: "keyword",
            },
          },
        },
        divert: {
          pattern: /->[\s]*[a-zA-Z_][a-zA-Z0-9_.]*/,
          inside: {
            operator: /->/,
            builtin: /\b(?:END|DONE)\b/,
            target: {
              pattern: /[a-zA-Z_][a-zA-Z0-9_.]*/,
              alias: "function",
            },
          },
        },
        "inline-logic": {
          pattern: /\{[^}]*\}/,
          inside: {
            variable: /[a-zA-Z_][a-zA-Z0-9_]*/,
            punctuation: /[{}|:]/,
          },
        },
        tag: {
          pattern: /#\s*\w+/,
          alias: "attr-name",
        },
      },
    },

    // ============================================
    // GATHERS: - at start of line (not followed by >)
    // ============================================
    gather: {
      pattern: /^[ \t]*-+(?!>).*/m,
      inside: {
        "gather-mark": {
          pattern: /^[ \t]*-+/,
          alias: "keyword",
        },
        label: {
          pattern: /\([\s]*[a-zA-Z_][a-zA-Z0-9_]*[\s]*\)/,
          alias: "variable",
        },
        divert: {
          pattern: /->[\s]*[a-zA-Z_][a-zA-Z0-9_.]*/,
          inside: {
            operator: /->/,
            builtin: /\b(?:END|DONE)\b/,
            target: {
              pattern: /[a-zA-Z_][a-zA-Z0-9_.]*/,
              alias: "function",
            },
          },
        },
      },
    },

    // ============================================
    // DIVERTS: -> target, <- thread, ->->
    // ============================================
    divert: {
      pattern: /(?:->->|->|<-)[\s]*(?:[a-zA-Z_][a-zA-Z0-9_.]*)?/,
      inside: {
        "tunnel-return": {
          pattern: /->->/,
          alias: "keyword",
        },
        operator: /->|<-/,
        builtin: /\b(?:END|DONE)\b/,
        "knot-target": {
          pattern: /[a-zA-Z_][a-zA-Z0-9_]*(?=\.)/,
          alias: "class-name",
        },
        "stitch-target": {
          pattern: /(?<=\.)[a-zA-Z_][a-zA-Z0-9_]*/,
          alias: "function",
        },
        target: {
          pattern: /[a-zA-Z_][a-zA-Z0-9_]*/,
          alias: "function",
        },
        punctuation: /\./,
      },
    },

    // ============================================
    // GLUE: <>
    // ============================================
    glue: {
      pattern: /<>/,
      alias: "keyword",
    },

    // ============================================
    // INLINE LOGIC/ALTERNATIVES: { ... }
    // ============================================
    "inline-logic": {
      pattern: /\{[^{}]*\}/,
      inside: {
        keyword: /\b(?:not|and|or|else|has|hasnt)\b/,
        builtin:
          /\b(?:LIST_COUNT|LIST_MIN|LIST_MAX|TURNS_SINCE|CHOICE_COUNT)\b/,
        "sequence-type": {
          pattern: /(?<=\{)[\s]*[~&!$]/,
          alias: "keyword",
        },
        function: /[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\()/,
        divert: {
          pattern: /->[\s]*[a-zA-Z_][a-zA-Z0-9_.]*/,
          inside: {
            operator: /->/,
            target: {
              pattern: /[a-zA-Z_][a-zA-Z0-9_.]*/,
              alias: "function",
            },
          },
        },
        variable: /[a-zA-Z_][a-zA-Z0-9_.]*/,
        operator: /&&|\|\||[<>=!?:]=?/,
        string: /"(?:[^"\\]|\\.)*"/,
        number: /\b\d+(?:\.\d+)?\b/,
        boolean: /\b(?:true|false)\b/,
        punctuation: /[{}|():,]/,
      },
    },

    // ============================================
    // PRIMITIVES (catch-all for remaining content)
    // ============================================
    string: {
      pattern: /"(?:[^"\\]|\\.)*"/,
      greedy: true,
    },

    number: /\b\d+(?:\.\d+)?\b/,

    boolean: /\b(?:true|false)\b/,

    builtin:
      /\b(?:LIST_COUNT|LIST_MIN|LIST_MAX|LIST_ALL|LIST_INVERT|LIST_RANDOM|CHOICE_COUNT|TURNS_SINCE|TURNS|LIST_RANGE|POW|FLOOR|CEILING|INT|FLOAT|RANDOM)\b/,

    keyword: /\b(?:not|and|or|mod|has|hasnt|return|temp|ref)\b/,

    operator: /->|<-|&&|\|\||[+\-*/%=<>!?^]=?/,
  };

  // Aliases
  Prism.languages.inkle = Prism.languages.ink;
})(Prism);
