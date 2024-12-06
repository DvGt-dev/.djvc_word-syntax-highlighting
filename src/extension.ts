import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "djvc" is now active!');

  // Garder uniquement la commande de base
  const disposable = vscode.commands.registerCommand("djvc.helloWorld", () => {
    vscode.window.showInformationMessage("Hello World from .djvc ext!");
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
