import * as vscode from 'vscode';
import {loadTags, unloadTags, autoCompileProvider} from './autoCompile';
import {unloadDecorations, highlightFullProvider, highlightLineProvider} from './highlight';
import {disposableHover} from "./hover";

export function activate(context: vscode.ExtensionContext) {
  // tags autocompiler setting
  // 加载使用设置：tags.tagsFile
  loadTags();
  context.subscriptions.push(autoCompileProvider);

  // highlight setting
  context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(highlightFullProvider));
  context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(highlightLineProvider));
  highlightFullProvider();

  // hover setting
  context.subscriptions.push(disposableHover);

  // TODO: 检查设置被更新?
}

// This method is called when your extension is deactivated
export function deactivate() {
  unloadTags();
  unloadDecorations();
}
