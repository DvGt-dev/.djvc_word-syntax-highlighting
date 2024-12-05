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

  // Ajouter la gestion du thème actif
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("workbench.colorTheme")) {
        const config = vscode.workspace.getConfiguration();
        const currentTheme = config.get("workbench.colorTheme");

        // Recharger la coloration syntaxique
        vscode.commands.executeCommand("workbench.action.reloadWindow");
      }
    })
  );

  // Register the DJVC syntax highlighting
  vscode.languages.registerDocumentSemanticTokensProvider(
    { language: "djvc", scheme: "file" }, // Ajout de scheme: 'file'
    new DJVCSemanticTokensProvider(),
    legend
  );

  // Remove the color provider registration
  // vscode.languages.registerColorProvider("djvc", new DJVCColorProvider());

  /*
  // Force l'application des couleurs customisées
  const forceCustomColors = () => {
    const config = vscode.workspace.getConfiguration();
    config.update(
      "editor.semanticTokenColorCustomizations",
      {
        "[*]": {
          // Pour tous les thèmes
          rules: {
            punctuation_period: { foreground: "#FF0000", bold: true },
            punctuation_comma: { foreground: "#00FF00", bold: true },
            punctuation_colon: { foreground: "#d94eff" },
            punctuation_hash: { foreground: "#b301ff" },
            punctuation_digit: { foreground: "#00b9ec" },
          },
        },
      },
      vscode.ConfigurationTarget.Global
    );

    config.update(
      "editor.tokenColorCustomizations",
      {
        "[*]": {
          textMateRules: [
            {
              scope: ["source.djvc"],
              settings: { foreground: "#FFFFFF" },
            },
            {
              scope: ["punctuation.period.djvc"],
              settings: { foreground: "#FF0000", fontStyle: "bold" },
            },
            {
              scope: ["punctuation.comma.djvc"],
              settings: { foreground: "#00FF00", fontStyle: "bold" },
            },
            {
              scope: ["punctuation.2pts.djvc"],
              settings: { foreground: "#d94eff", fontStyle: "bold" },
            },
            {
              scope: ["punctuation.apostrph.djvc"],
              settings: { foreground: "#b301ff", fontStyle: "bold" },
            },
            {
              scope: ["punctuation.parenthesis.djvc"],
              settings: { foreground: "#00b9ec", fontStyle: "bold" },
            },
          ],
        },
      },
      vscode.ConfigurationTarget.Global
    );
  };

  // Appliquer les couleurs au démarrage et lors des changements de th��me
  forceCustomColors();
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("workbench.colorTheme")) {
        forceCustomColors();
      }
    })
  );
  */
}

// Update the legend to include the correct token types
const legend = new vscode.SemanticTokensLegend(
  [
    "punctuation.period.djvc",
    "punctuation.comma.djvc",
    "punctuation.2pts.djvc",
    "punctuation.apostrph.djvc",
    "punctuation.parenthesis.djvc",
    "markup.heading.djvc",
    "markup.bold.djvc",
    "markup.italic.djvc",
    "markup.list.djvc",
    "markup.link.djvc",
    "entity.name.uppercase.djvc",
    "punctuation.definition.heading.djvc",
    "entity.name.section.djvc",
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

    // Update patterns to match custom scopes
    const patterns = [
      { type: "markup.heading.djvc", regex: /^#{1,6}\s.*$/gm },
      { type: "markup.bold.djvc", regex: /\*\*.*?\*\*/g },
      { type: "markup.italic.djvc", regex: /\*.*?\*/g },
      { type: "markup.list.djvc", regex: /^[\*\-\+]\s.*$/gm },
      { type: "markup.link.djvc", regex: /\[.*?\]\(.*?\)/g },
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
          0 // No modifiers
        );
      }
    });

    // Add matching for uppercase words
    const uppercasePattern = /\b[A-Z]+\b/g;
    let match;
    while ((match = uppercasePattern.exec(text))) {
      const startPos = document.positionAt(match.index);
      tokensBuilder.push(
        startPos.line,
        startPos.character,
        match[0].length,
        legend.tokenTypes.indexOf("entity.name.uppercase.djvc"),
        0 // No modifiers
      );
    }

    // Add logic to identify and classify tokens based on the text
    // For example:
    const regex = /(\.|\#|\,|\:|\d)/g;
    let matchItem;
    while ((matchItem = regex.exec(text))) {
      const start = matchItem.index;
      const length = matchItem[0].length;
      let tokenType = "";

      switch (matchItem[0]) {
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
        case /\d/.test(matchItem[0]) ? matchItem[0] : null:
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
