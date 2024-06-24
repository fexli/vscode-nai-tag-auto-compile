import * as vscode from 'vscode';
import {loadTags, unloadTags, autoCompileProvider} from './autoCompile';
import {unloadDecorations, highlightProvider} from './highlight';

export function activate(context: vscode.ExtensionContext) {
  // tags autocompiler setti¬ng
  loadTags();
  context.subscriptions.push(autoCompileProvider);

  // highlight setting
  context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(highlightProvider));
  context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(highlightProvider));
  highlightProvider();
}

// This method is called when your extension is deactivated
export function deactivate() {
  unloadTags();
  unloadDecorations();
}
