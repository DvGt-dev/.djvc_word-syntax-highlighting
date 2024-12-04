// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "djvc" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand("djvc.helloWorld", () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    vscode.window.showInformationMessage("Hello World from .djvc ext!");
  });

  context.subscriptions.push(disposable);

  // Enregistrement de la grammaire pour le langage DJVC
  vscode.languages.setLanguageConfiguration("djvc", {
    comments: {
      lineComment: "//",
      blockComment: ["/*", "*/"],
    },
    brackets: [
      ["{", "}"],
      ["[", "]"],
      ["(", ")"],
    ],
    autoClosingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
    wordPattern:
      /(-?\d*\.\d\w*)|([^\`\~\!\@\#\$\%\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\<\>\/\?\s]+)/g,
    onEnterRules: [
      {
        beforeText: /^(\t|(\ \ ))*\ \*\ .*/,
        action: { indentAction: vscode.IndentAction.None, appendText: "* " },
      },
      {
        beforeText: /^(\t|(\ \ ))*\ \*[^/]*\ .*/,
        action: { indentAction: vscode.IndentAction.None, appendText: "* " },
      },
    ],
  });

  // Register the DJVC syntax highlighting
  vscode.languages.registerDocumentSemanticTokensProvider(
    { language: "djvc", scheme: "file" }, // Ajout de scheme: 'file'
    new DJVCSemanticTokensProvider(),
    legend
  );

  // Remove the color provider registration
  // vscode.languages.registerColorProvider("djvc", new DJVCColorProvider());
}

// Define the legend for the semantic tokens with modifiers
const legend = new vscode.SemanticTokensLegend(
  [
    "punctuation.period.djvc",
    "punctuation.comma.djvc",
    "punctuation.2pts.djvc",
    "punctuation.apostrph.djvc",
    "punctuation.parenthesis.djvc",
    "heading",
    "bold",
    "italic",
    "list",
    "link",
  ],
  ["declaration", "documentation", "markdown"] // Ajout de modifiers
);

// Implement the semantic tokens provider
class DJVCSemanticTokensProvider
  implements vscode.DocumentSemanticTokensProvider
{
  provideDocumentSemanticTokens(
    document: vscode.TextDocument
  ): vscode.ProviderResult<vscode.SemanticTokens> {
    const tokensBuilder = new vscode.SemanticTokensBuilder(legend);
    const text = document.getText();

    // Ajout des patterns Markdown
    const patterns = [
      { type: "heading", regex: /^#{1,6}\s.*$/gm },
      { type: "bold", regex: /\*\*.*?\*\*/g },
      { type: "italic", regex: /\*.*?\*/g },
      { type: "list", regex: /^[\*\-\+]\s.*$/gm },
      { type: "link", regex: /\[.*?\]\(.*?\)/g },
    ];

    patterns.forEach(({ type, regex }) => {
      let match;
      while ((match = regex.exec(text))) {
        const startPos = document.positionAt(match.index);
        tokensBuilder.push(
          startPos.line,
          startPos.character,
          match[0].length,
          legend.tokenTypes.indexOf(type),
          legend.tokenModifiers.indexOf("markdown")
        );
      }
    });

    // Add logic to identify and classify tokens based on the text
    // For example:
    const regex = /(\.|\#|\,|\:|\d)/g;
    let match;
    while ((match = regex.exec(text))) {
      const start = match.index;
      const length = match[0].length;
      let tokenType = "";

      switch (match[0]) {
        case ".":
          tokenType = "punctuation.period.djvc";
          break;
        case ",":
          tokenType = "punctuation.comma.djvc";
          break;
        case "²:":
          tokenType = "punctuation.2pts.djvc";
          break;
        case "#":
          tokenType = "punctuation.apostrph.djvc";
          break;
        case /\d/.test(match[0]) ? match[0] : null:
          tokenType = "punctuation.parenthesis.djvc";
          break;
      }

      tokensBuilder.push(
        document.positionAt(start).line,
        document.positionAt(start).character,
        length,
        legend.tokenTypes.indexOf(tokenType),
        legend.tokenModifiers.indexOf("declaration")
      );
    }

    return tokensBuilder.build();
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
