import { Monaco } from "@monaco-editor/react";

export function setupEditor(monaco: Monaco) {
  monaco.languages.register({ id: "rnl" });

  monaco.languages.setMonarchTokensProvider("rnl", {
    symbols: /[=><!~?:&|+\-*/^%]+/, // common symbols

    escapes:
      /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/, // escape sequences for strings

    tokenizer: {
      root: [
        // Match the 'actions' array (visit, click, type, check)
        [/\b(?:visit|click|type|check if|on)\b/, "action"],

        // Match the 'elementsType' array (button, link, text, image, input)
        [/\b(?:button|link|text|image|input)\b/, "elementType"],

        // Match the 'elementsState' array (is displayed, is hidden)
        [/\b(?:is displayed|is hidden)\b/, "elementState"],

        [/\b(?:with description)\b/, "withDescription"],

        // Match test name
        [/[a-zA-Z][a-zA-Z0-9]*/, "testName"],

        // Match whitespace (spaces, tabs, newlines)
        { include: "@whitespace" },

        // Match brackets
        [/{}/, "@brackets"],

        // Strings (double quotes)
        [/"([^"\\]|\\.)*$/, "string.invalid"], // non-terminated string
        [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],

        // Characters (single quotes)
        [/'[^\\']'/, "string"],
        [/(')(@escapes)(')/, ["string", "string.escape", "string"]],
        [/'/, "string.invalid"],
      ],

      // String tokenizer to match valid strings inside quotes
      string: [
        [/[^\\"]+/, "string"],
        [/@escapes/, "string.escape"],
        [/\\./, "string.escape.invalid"],
        [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }],
      ],

      // Whitespace handling (comments and spaces)
      whitespace: [
        [/[ \t\r\n]+/, "white"],
        // [/\/\*/, "comment", "@comment"],
        // [/\/\/.*$/, "comment"],
      ],
    },
  });

  monaco.languages.setLanguageConfiguration("rnl", {
    autoClosingPairs: [
      { open: "{", close: "}" },
      { open: '"', close: '"' },
    ],
    surroundingPairs: [
      { open: "{", close: "}" },
      { open: '"', close: '"' },
    ],
    brackets: [["{", "}"]],
  });

  monaco.editor.defineTheme("rnl-theme", {
    base: "vs-dark",
    inherit: false,
    rules: [
      { token: "elementState", foreground: "#d16969" },
      { token: "action", foreground: "#FFAD66" },
      { token: "string", foreground: "#D5FF80" },
      { token: "testName", foreground: "#95E6CB" },
      { token: "withDescription", foreground: "#DDA0DD" },
    ],
    colors: {
      "editor.foreground": "#d4d4d4",
    },
  });

  monaco.editor.setTheme("rnl-theme");
}
