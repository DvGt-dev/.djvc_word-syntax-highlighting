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
    { language: "djvc" },
    new DJVCSemanticTokensProvider(),
    legend
  );

  // Remove the color provider registration |dv_attention
  vscode.languages.registerColorProvider("djvc", new DJVCColorProvider());
}

// Define the legend for the semantic tokens
const legend = new vscode.SemanticTokensLegend(
  [
    "punctuation.period",
    "punctuation.comma",
    "punctuation.2pts",
    "punctuation.apostrph",
    "punctuation.parenthesis",
  ],
  []
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
          tokenType = "punctuation.period";
          break;
        case ",":
          tokenType = "punctuation.comma";
          break;
        case ":":
          tokenType = "punctuation.2pts";
          break;
        case "#":
          tokenType = "punctuation.apostrph";
          break;
        case /\d/.test(match[0]) ? match[0] : null:
          tokenType = "punctuation.parenthesis";
          break;
      }

      tokensBuilder.push(
        document.positionAt(start).line,
        document.positionAt(start).character,
        length,
        legend.tokenTypes.indexOf(tokenType),
        0
      );
    }

    return tokensBuilder.build();
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}

// Remove the color provider implementation
class DJVCColorProvider implements vscode.DocumentColorProvider {
  provideDocumentColors(
    document: vscode.TextDocument
  ): vscode.ProviderResult<vscode.ColorInformation[]> {
    const colors: vscode.ColorInformation[] = [];
    const text = document.getText();

    // Add logic to identify and classify colors based on the text
    // For example:
    const regex = /(\.|\#|\,|\:|\d)/g;
    let match;
    while ((match = regex.exec(text))) {
      const start = match.index;
      const length = match[0].length;
      let color: vscode.Color = new vscode.Color(0, 0, 0, 1); // Default color (black)

      switch (match[0]) {
        case ".":
          color = new vscode.Color(1, 0, 0, 1); // Red
          break;
        case ",":
          color = new vscode.Color(0, 1, 0, 1); // Green
          break;
        case ":":
          color = new vscode.Color(0.85, 0.31, 1, 1); // Purple
          break;
        case "#":
          color = new vscode.Color(0.7, 0.01, 1, 1); // Magenta
          break;
        case /\d/.test(match[0]) ? match[0] : null:
          color = new vscode.Color(0, 0.73, 0.92, 1); // Cyan
          break;
      }

      const range = new vscode.Range(
        document.positionAt(start),
        document.positionAt(start + length)
      );
      colors.push(new vscode.ColorInformation(range, color));
    }

    return colors;
  }

  provideColorPresentations(
    color: vscode.Color,
    context: { document: vscode.TextDocument; range: vscode.Range }
  ): vscode.ProviderResult<vscode.ColorPresentation[]> {
    return [];
  }
}
